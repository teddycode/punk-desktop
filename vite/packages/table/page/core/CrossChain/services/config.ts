/**
 * 跨链区 · 环境配置与连接探测
 *
 * 目标：
 *   1. 地址与 RPC 只从本地配置解析（deployment.json / 环境变量 / Manager 链上解析），
 *      不再依赖 services/crosschain 后端（原 Bridge.vue 里硬编码的 http://localhost:37100 已废弃）。
 *   2. 目标链（业务执行链）RPC 由用户提供并记忆，切换网络由钱包完成。
 *   3. 提供“链连接状态”与“系统状态”的统一探针。
 */

import { ethers } from 'ethers'
import {
  getFinalContractAddress,
  getFinalManagerAddress,
  getFinalRpcUrl,
} from '@table/services/crosschain'
import { MANAGER_ABI, RELAY_ABI, SystemState, SYSTEM_STATE_TEXT, TRANSPORT_ABI } from './abi'
import { getRpcClient, JsonRpcClient } from './rpc'

export interface TargetChainConfig {
  /** 用户填写的目标链 RPC 地址 */
  rpcUrl: string
  /** 目标链名称（仅用于界面展示） */
  name?: string
  /** 期望的源链名，用于与验证器 EXPECTED_CHAIN 交叉核对 */
  expectedChain?: string
}

const TARGET_CHAIN_STORAGE_KEY = 'punkos-crosschain-target-chain'

let targetChainCache: TargetChainConfig | null = null
let resolvedCache: { rpcUrl: string; managerAddress: string; transportAddress: string } | null = null

/** Hub 侧连接信息（RPC + Manager + Transport） */
export async function resolveHubConfig(force = false): Promise<{
  rpcUrl: string
  managerAddress: string
  transportAddress: string
}> {
  if (!force && resolvedCache) return resolvedCache
  const rpcUrl = await getFinalRpcUrl()
  const managerAddress = await getFinalManagerAddress()
  const transportAddress = await getFinalContractAddress()
  resolvedCache = { rpcUrl, managerAddress, transportAddress }
  return resolvedCache
}

export function resetHubConfig(): void {
  resolvedCache = null
}

export function getHubClient(): Promise<JsonRpcClient> {
  return resolveHubConfig().then((cfg) => getRpcClient(cfg.rpcUrl))
}

/** Transport 合约接口（编码/解码用） */
export const transportInterface = new ethers.utils.Interface(TRANSPORT_ABI)
export const managerInterface = new ethers.utils.Interface(MANAGER_ABI)
export const relayInterface = new ethers.utils.Interface(RELAY_ABI)

// ————————————————— 目标链配置 —————————————————

export function getTargetChain(): TargetChainConfig | null {
  if (targetChainCache) return targetChainCache
  try {
    const raw = localStorage.getItem(TARGET_CHAIN_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.rpcUrl) return null
    targetChainCache = {
      rpcUrl: String(parsed.rpcUrl),
      name: parsed.name ? String(parsed.name) : undefined,
      expectedChain: parsed.expectedChain ? String(parsed.expectedChain) : undefined,
    }
    return targetChainCache
  } catch {
    return null
  }
}

export function setTargetChain(config: TargetChainConfig | null): void {
  targetChainCache = config
  try {
    if (!config?.rpcUrl) {
      localStorage.removeItem(TARGET_CHAIN_STORAGE_KEY)
      return
    }
    localStorage.setItem(TARGET_CHAIN_STORAGE_KEY, JSON.stringify(config))
  } catch {
    /* localStorage 不可用时仅保留内存缓存 */
  }
}

export interface TargetChainProbeResult {
  ok: boolean
  chainId?: number
  blockNumber?: number
  /** 目标链是否支持 eth_getRawTransactionByHash（提交证明必需） */
  supportsRawTransaction: boolean
  error?: string
}

/**
 * 目标链能力探测。
 * 提交证明需要读取目标链原始交易，因此必须确认 eth_getRawTransactionByHash 可用。
 */
export async function probeTargetChain(rpcUrl: string, sampleTxHash?: string): Promise<TargetChainProbeResult> {
  if (!rpcUrl) return { ok: false, supportsRawTransaction: false, error: '未填写 RPC 地址' }
  const client = getRpcClient(rpcUrl, { timeoutMs: 12000 })
  try {
    const [chainIdHex, blockNumber] = await Promise.all([
      client.request<string>('eth_chainId'),
      client.getBlockNumber(),
    ])
    let supportsRawTransaction = false
    if (sampleTxHash) {
      const raw = await client.getRawTransaction(sampleTxHash).catch(() => null)
      supportsRawTransaction = Boolean(raw)
    } else {
      // 无样本交易时用空哈希探测方法是否存在（方法不存在返回 -32601，参数错误返回 -32602）
      try {
        await client.getRawTransaction('0x' + '0'.repeat(64))
        supportsRawTransaction = true
      } catch (error: any) {
        const message = String(error?.message || '')
        supportsRawTransaction = !/method .*not (exist|available)|-32601/i.test(message)
      }
    }
    return { ok: true, chainId: Number(BigInt(chainIdHex)), blockNumber, supportsRawTransaction }
  } catch (error: any) {
    return { ok: false, supportsRawTransaction: false, error: error?.message || '目标链不可达' }
  }
}

// ————————————————— Hub 状态探测 —————————————————

export interface HubStatus {
  ok: boolean
  rpcUrl: string
  chainId?: number
  blockNumber?: number
  contractState?: SystemState
  contractStateText?: string
  managerAddress?: string
  transportAddress?: string
  error?: string
}

export async function probeHubStatus(): Promise<HubStatus> {
  let rpcUrl = ''
  let managerAddress = ''
  let transportAddress = ''
  try {
    const cfg = await resolveHubConfig()
    rpcUrl = cfg.rpcUrl
    managerAddress = cfg.managerAddress
    transportAddress = cfg.transportAddress
  } catch (error: any) {
    return { ok: false, rpcUrl: '', error: error?.message || '地址解析失败' }
  }

  const client = getRpcClient(rpcUrl, { timeoutMs: 12000 })
  try {
    const [chainIdHex, blockNumber, stateHex] = await Promise.all([
      client.request<string>('eth_chainId'),
      client.getBlockNumber(),
      client
        .ethCall(transportAddress, transportInterface.encodeFunctionData('getContractState'))
        .catch(() => null),
    ])
    const contractState = stateHex ? Number(BigInt(stateHex)) : undefined
    return {
      ok: true,
      rpcUrl,
      chainId: Number(BigInt(chainIdHex)),
      blockNumber,
      contractState,
      contractStateText: contractState === undefined ? undefined : SYSTEM_STATE_TEXT[contractState],
      managerAddress,
      transportAddress,
    }
  } catch (error: any) {
    return { ok: false, rpcUrl, managerAddress, transportAddress, error: error?.message || 'RPC 不可达' }
  }
}

/** 解析某条源链的 relay 地址（levelId = 0） */
export async function resolveRelayAddress(chainId: number): Promise<string | null> {
  // contract_chain_index 在 Manager 上（Transport 上调用会 revert）
  const { managerAddress } = await resolveHubConfig()
  const client = await getHubClient()
  const data = managerInterface.encodeFunctionData('contract_chain_index', [chainId, 0])
  const result = await client.tryEthCall(managerAddress, data)
  if (!result) return null
  const [address] = managerInterface.decodeFunctionResult('contract_chain_index', result)
  if (!address || address === ethers.constants.AddressZero) return null
  return ethers.utils.getAddress(address)
}

/** 便捷：拿到带 signer 的 Transport 实例（写操作用） */
export function getTransportWithSigner(signer: ethers.Signer, address: string): ethers.Contract {
  return new ethers.Contract(address, TRANSPORT_ABI, signer)
}

/** 便捷：只读 Transport 实例 */
export async function getReadonlyTransport(): Promise<ethers.Contract> {
  const { rpcUrl, transportAddress } = await resolveHubConfig()
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
  return new ethers.Contract(transportAddress, TRANSPORT_ABI, provider)
}

/** 便捷：只读 relay 实例 */
export async function getReadonlyRelay(chainId: number): Promise<ethers.Contract | null> {
  const relayAddress = await resolveRelayAddress(chainId)
  if (!relayAddress) return null
  const { rpcUrl } = await resolveHubConfig()
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
  return new ethers.Contract(relayAddress, RELAY_ABI, provider)
}
