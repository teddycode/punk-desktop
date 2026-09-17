/**
 * 跨链区 · 验证器能力探测
 *
 * 背景：业务类型（链上路由）会绑定不同验证器，而生产验证器尚未确定。
 * 因此前端不得硬编码“哪个业务需要什么参数”，必须按能力动态决定表单。
 *
 * 探测策略：
 *   1. 无验证器地址 → unknown（业务类型未绑定验证器，合约会走 legacy 路径，当前部署不可用）
 *   2. 验证器地址无代码 → unknown（未部署）
 *   3. 命中“能力提示”（可选配置，仅用于文案）→ 直接返回
 *   4. 链上调用 EXPECTED_CHAIN() 成功且非空 → proof-required，并记录期望链名
 *   5. 调用成功但为空 → unknown
 *   6. 调用失败且错误表明方法不存在 → raw-tx-only（如事件型/免证明型验证器）
 *   7. 其他失败（如调用回滚）→ unknown（保守处理，避免误判为“无需证明”而挡住用户）
 *
 * 注意：unknown 也必须可提交（由链上验证器最终裁决），UI 需允许展开全部参数。
 */

import { VERIFIER_EXPECTED_CHAIN_ABI } from './abi'
import { getHubClient } from './config'
import { ethers } from 'ethers'

export type CapabilityKind = 'proof-required' | 'raw-tx-only' | 'unknown'

export interface VerifierCapability {
  kind: CapabilityKind
  /** 验证器声明的期望源链名（仅 proof-required 且链上可读时存在） */
  expectedChain: string | null
  /** 面向用户的说明 */
  reason: string
  source: 'onchain' | 'hint' | 'default'
}

export interface VerifierHint {
  address: string
  label?: string
  proofRequired?: boolean
  expectedChain?: string
}

const expectedChainInterface = new ethers.utils.Interface(VERIFIER_EXPECTED_CHAIN_ABI)
const hintRegistry = new Map<string, VerifierHint>()
const capabilityCache = new Map<string, VerifierCapability>()

/** 注册能力提示（可选）。仅用于补充文案，不参与阻断判断。 */
export function registerVerifierHint(hint: VerifierHint): void {
  if (!hint?.address) return
  hintRegistry.set(hint.address.toLowerCase(), { ...hint, address: ethers.utils.getAddress(hint.address) })
  capabilityCache.delete(hint.address.toLowerCase())
}

export function clearVerifierHints(): void {
  hintRegistry.clear()
  capabilityCache.clear()
}

export function getVerifierHints(): VerifierHint[] {
  return Array.from(hintRegistry.values())
}

export function clearCapabilityCache(): void {
  capabilityCache.clear()
}

function isMethodNotFound(error: any): boolean {
  const message = String(error?.message || '')
  const data = String(error?.data || '')
  return (
    /method .*not (exist|available|found)/i.test(message) ||
    /does not exist|not available/i.test(message) ||
    /-32601/.test(message + data) ||
    /execution reverted: ?$/i.test(message)
  )
}

function unknownCapability(reason: string): VerifierCapability {
  return { kind: 'unknown', expectedChain: null, reason, source: 'default' }
}

/**
 * 探测验证器能力。结果缓存，手动刷新时调用 clearCapabilityCache()。
 */
export async function probeVerifierCapability(verifierAddress?: string | null): Promise<VerifierCapability> {
  if (!verifierAddress || verifierAddress === ethers.constants.AddressZero) {
    return unknownCapability('该业务类型未绑定验证器，暂不可用')
  }
  if (!ethers.utils.isAddress(verifierAddress)) {
    return unknownCapability('验证器地址格式不正确')
  }

  const normalized = verifierAddress.toLowerCase()
  const cached = capabilityCache.get(normalized)
  if (cached) return cached

  const client = await getHubClient()

  // 2) 是否有代码
  const code = await client.getCode(verifierAddress).catch(() => '0x')
  if (!code || code === '0x') {
    const result = unknownCapability('验证器地址上没有合约代码')
    capabilityCache.set(normalized, result)
    return result
  }

  // 3) 配置提示优先（仅文案来源）
  const hint = hintRegistry.get(normalized)
  if (hint && (hint.proofRequired !== undefined || hint.expectedChain)) {
    const result: VerifierCapability = {
      kind: hint.proofRequired === false ? 'raw-tx-only' : 'proof-required',
      expectedChain: hint.expectedChain ?? null,
      reason: hint.label ? `${hint.label}` : '按配置判断验证要求',
      source: 'hint',
    }
    capabilityCache.set(normalized, result)
    return result
  }

  // 4~6) 链上探测 EXPECTED_CHAIN()
  const data = expectedChainInterface.encodeFunctionData('EXPECTED_CHAIN')
  try {
    const raw = await client.ethCall(verifierAddress, data)
    let expectedChain: string | null = null
    try {
      const [value] = expectedChainInterface.decodeFunctionResult('EXPECTED_CHAIN', raw)
      expectedChain = String(value || '').trim() || null
    } catch {
      expectedChain = null
    }
    if (expectedChain) {
      const result: VerifierCapability = {
        kind: 'proof-required',
        expectedChain,
        reason: `该验证器要求提供链上证明（期望源链：${expectedChain}）`,
        source: 'onchain',
      }
      capabilityCache.set(normalized, result)
      return result
    }
    const result = unknownCapability('验证器未声明期望链，无法判断验证要求')
    capabilityCache.set(normalized, result)
    return result
  } catch (error: any) {
    if (isMethodNotFound(error)) {
      const result: VerifierCapability = {
        kind: 'raw-tx-only',
        expectedChain: null,
        reason: '该验证器未要求提供链上证明，仅需目标链交易',
        source: 'onchain',
      }
      capabilityCache.set(normalized, result)
      return result
    }
    const result = unknownCapability(`无法确定验证要求（${error?.message || '链上调用失败'}）`)
    capabilityCache.set(normalized, result)
    return result
  }
}

export interface CapabilityPresentation {
  kind: CapabilityKind
  badge: string
  description: string
  /** 默认展开的参数 */
  defaultFields: Array<'rawTx' | 'leafNode' | 'proof' | 'keyShadowBlock'>
  /** 是否需要用户提供证明 */
  proofRequired: boolean
  expectedChain: string | null
}

export function describeCapability(capability: VerifierCapability): CapabilityPresentation {
  switch (capability.kind) {
    case 'proof-required':
      return {
        kind: capability.kind,
        badge: '需要证明',
        description: capability.reason,
        defaultFields: ['rawTx', 'proof', 'keyShadowBlock'],
        proofRequired: true,
        expectedChain: capability.expectedChain,
      }
    case 'raw-tx-only':
      return {
        kind: capability.kind,
        badge: '仅需交易',
        description: capability.reason,
        defaultFields: ['rawTx'],
        proofRequired: false,
        expectedChain: null,
      }
    default:
      return {
        kind: 'unknown',
        badge: '验证要求未知',
        description: `${capability.reason}。所有参数均可填写，提交后由链上验证器判定`,
        defaultFields: ['rawTx', 'proof', 'keyShadowBlock'],
        proofRequired: false,
        expectedChain: null,
      }
  }
}
