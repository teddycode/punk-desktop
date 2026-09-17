/**
 * 跨链区 · 钱包写操作（全部由用户钱包签名，应用不持有任何私钥）
 *
 * 统一入口的好处：
 *   - 写操作前置校验集中在一处（系统状态、质押资格、任务状态、relayer 身份）
 *   - 链上回滚原因统一翻译为可理解文案
 *   - 页面只负责收集参数与展示结果
 */

import { ethers } from 'ethers'
import { browserWallet } from '@table/services/browserWallet'
import {
  createTask,
  finishTaskWithParams,
  getCurrentWalletAddress,
  getFinalContractAddress,
  getFinalManagerAddress,
  getSigner,
  mapFinishTaskError,
} from '@table/services/crosschain'
import { MAX_TASK_TIME_BLOCKS } from './abi'
import { getTransportWithSigner, managerInterface, transportInterface, getHubClient, resolveHubConfig } from './config'
import { getTaskInfo } from './chain'

export class ActionError extends Error {
  /** 面向用户的下一步建议 */
  hint?: string

  constructor(message: string, hint?: string) {
    super(message)
    this.name = 'ActionError'
    this.hint = hint
  }
}

/**
 * 写操作前置检查：桌面跨链交易需要通过内置浏览器钱包签名。
 * 未启用时给出明确指引，而不是让用户点了之后才看到底层报错。
 */
export function assertWalletReady(): void {
  if (!browserWallet.selected) {
    throw new ActionError(
      '当前未启用跨链签名钱包',
      '请在右上角钱包菜单选择「连接浏览器 MetaMask」，完成后重试。',
    )
  }
  if (!browserWallet.connected) {
    throw new ActionError('钱包未连接', '请在右上角钱包菜单中完成连接。')
  }
}

function normalizeSignerError(error: any): never {
  const code = error?.code
  if (code === 'ACTION_REJECTED' || code === 4001) {
    throw new ActionError('你已取消本次签名')
  }
  const reason = error?.reason || error?.message || '交易失败'
  if (/user rejected|denied transaction/i.test(reason)) {
    throw new ActionError('你已取消本次签名')
  }
  if (/insufficient funds/i.test(reason)) {
    throw new ActionError('账户余额不足以支付奖励与手续费', '请先充值后再试。')
  }
  throw new ActionError(reason)
}

async function withTransport<T>(fn: (contract: ethers.Contract, address: string) => Promise<T>): Promise<T> {
  assertWalletReady()
  const signer = await getSigner()
  const address = await getFinalContractAddress()
  const contract = getTransportWithSigner(signer, address)
  try {
    return await fn(contract, address)
  } catch (error: any) {
    normalizeSignerError(error)
  }
}

// ————————————————————————— 任务 —————————————————————————

export interface CreateTaskActionParams {
  payload: string
  taskType: number
  /** 必须与链上 routes(taskType).name 完全一致 */
  routeName: string
  fee: string
}

export async function createTaskAction(params: CreateTaskActionParams): Promise<string> {
  assertWalletReady()
  try {
    return await createTask(params)
  } catch (error: any) {
    normalizeSignerError(error)
  }
}

export async function acceptTaskAction(taskKey: string): Promise<string> {
  return withTransport(async (contract) => {
    // 前置校验：任务必须仍为待接单
    const info = await getTaskInfo(taskKey).catch(() => null)
    if (!info || !info.user || info.user === ethers.constants.AddressZero) {
      throw new ActionError('任务不存在或链上记录已删除', '该任务可能已完成或被撤回，请刷新列表。')
    }
    if (info.label !== 1) {
      throw new ActionError(`任务当前状态为「${info.label === 2 ? '已接单' : info.label}」，不能接单`, '请刷新列表后选择待接单的任务。')
    }

    const tx = await contract.acceptTask(taskKey)
    const receipt = await tx.wait()
    if (receipt?.status !== 1) throw new ActionError('接单交易失败')
    return tx.hash
  })
}

export async function finishTaskAction(params: {
  taskKey: string
  rawTx: string
  leafNode?: string
  proof?: string
  keyShadowBlock?: string
}): Promise<string> {
  assertWalletReady()
  const address = await getCurrentWalletAddress()
  const info = await getTaskInfo(params.taskKey).catch(() => null)
  if (info && info.user !== ethers.constants.AddressZero) {
    if (info.label !== 2) {
      throw new ActionError('任务不是「已接单」状态，无法提交证明', '请刷新任务状态后重试。')
    }
    if (address && info.relayer.toLowerCase() !== address.toLowerCase()) {
      throw new ActionError('当前钱包不是该任务的执行者', `该任务由 ${info.relayer} 接单。`)
    }
  }
  try {
    return await finishTaskWithParams(params)
  } catch (error: any) {
    if (error instanceof ActionError) throw error
    normalizeSignerError(error)
  }
}

/** 发起人撤回（Created 分支为退回奖励；Accepted 超时分支会惩罚中继者质押） */
export async function withdrawTaskAction(taskKey: string): Promise<string> {
  return withTransport(async (contract) => {
    const info = await getTaskInfo(taskKey).catch(() => null)
    if (info && info.user !== ethers.constants.AddressZero) {
      const hub = await getHubClient()
      const currentBlock = await hub.getBlockNumber()
      if (info.label === 1) {
        // 可直接撤回
      } else if (info.label === 2) {
        const age = currentBlock - info.time
        if (age <= MAX_TASK_TIME_BLOCKS) {
          throw new ActionError(
            `任务已被接单且未超时（已过 ${age} 个区块，需超过 ${MAX_TASK_TIME_BLOCKS} 个区块）`,
            '待超时后可取回奖励并使原中继者质押被惩罚。',
          )
        }
      } else {
        throw new ActionError('该任务当前状态不支持撤回', '请刷新任务状态。')
      }
    }
    const tx = await contract.withdrawTask(taskKey)
    const receipt = await tx.wait()
    if (receipt?.status !== 1) throw new ActionError('撤回交易失败')
    return tx.hash
  })
}

/** 中继者超时重接（会惩罚原中继者质押） */
export async function reAcceptTaskAction(taskKey: string): Promise<string> {
  return withTransport(async (contract) => {
    const info = await getTaskInfo(taskKey).catch(() => null)
    if (!info || info.user === ethers.constants.AddressZero) {
      throw new ActionError('任务不存在或链上记录已删除')
    }
    if (info.label !== 2) {
      throw new ActionError('仅「已接单」的任务可以重接')
    }
    const hub = await getHubClient()
    const currentBlock = await hub.getBlockNumber()
    const age = currentBlock - info.time
    if (age <= MAX_TASK_TIME_BLOCKS) {
      throw new ActionError(`任务未超时（已过 ${age} 个区块，需超过 ${MAX_TASK_TIME_BLOCKS} 个区块）`)
    }
    const address = await getCurrentWalletAddress()
    if (address && info.relayer.toLowerCase() === address.toLowerCase()) {
      throw new ActionError('不能重接自己已接单的任务')
    }
    const tx = await contract.reAcceptTask(taskKey)
    const receipt = await tx.wait()
    if (receipt?.status !== 1) throw new ActionError('重接交易失败')
    return tx.hash
  })
}

// ————————————————————————— 质押 —————————————————————————

export async function becomeRelayerAction(amountInEther: string): Promise<string> {
  return withTransport(async (contract) => {
    const value = ethers.utils.parseEther(amountInEther || '0')
    if (value.lte(0)) throw new ActionError('质押金额必须大于 0')
    const tx = await contract.becomeRelayer({ value })
    const receipt = await tx.wait()
    if (receipt?.status !== 1) throw new ActionError('质押交易失败')
    return tx.hash
  })
}

export async function withdrawStakeAction(amountInEther: string): Promise<string> {
  return withTransport(async (contract) => {
    const value = ethers.utils.parseEther(amountInEther || '0')
    if (value.lte(0)) throw new ActionError('提取金额必须大于 0')
    const tx = await contract.withdrawStake(value)
    const receipt = await tx.wait()
    if (receipt?.status !== 1) throw new ActionError('提取交易失败')
    return tx.hash
  })
}

// ————————————————————————— 管理 —————————————————————————

/**
 * 注册/更新业务类型。
 * 合约要求经 Manager 的 operateSystemContract 代理调用（需委员会成员身份）。
 */
export async function setCrossChainRouteAction(params: {
  routeId: number
  name: string
  isActive: boolean
  verifier: string
}): Promise<string> {
  const { routeId, name, isActive, verifier } = params
  if (!name?.trim()) throw new ActionError('业务类型名称不能为空')
  if (!ethers.utils.isAddress(verifier)) throw new ActionError('验证器地址格式不正确')

  assertWalletReady()
  const signer = await getSigner()
  const { rpcUrl, transportAddress, managerAddress } = await resolveHubConfig()

  const transportContract = new ethers.Contract(transportAddress, ['function setCrossChainRoute(uint256,string,bool,address)'], signer)
  const managerContract = new ethers.Contract(managerAddress, ['function operateSystemContract(address,bytes)'], signer)

  // 先做静态预检（权限不足会在这里暴露）
  try {
    await managerContract.callStatic.operateSystemContract(
      transportAddress,
      transportContract.interface.encodeFunctionData('setCrossChainRoute', [routeId, name, isActive, verifier]),
    )
  } catch (error: any) {
    const reason = error?.reason || error?.message || ''
    if (/NoManagerAuthority|committee|not authorized/i.test(reason)) {
      throw new ActionError('当前账户不是委员会成员，无法修改业务类型')
    }
    throw new ActionError(mapFinishTaskError(reason) || '静态预检失败')
  }

  try {
    const tx = await managerContract.operateSystemContract(
      transportAddress,
      transportContract.interface.encodeFunctionData('setCrossChainRoute', [routeId, name, isActive, verifier]),
    )
    const receipt = await tx.wait()
    if (receipt?.status !== 1) throw new ActionError('交易失败')
    return tx.hash
  } catch (error: any) {
    normalizeSignerError(error)
  }
}

/** 注册源链（同样经 Manager 代理） */
export async function addSourceChainAction(symbol: string, name: string): Promise<string> {
  if (!symbol?.trim() || !name?.trim()) throw new ActionError('符号与名称均不能为空')

  assertWalletReady()
  const signer = await getSigner()
  const { managerAddress } = await resolveHubConfig()
  const transportContract = new ethers.Contract(
    managerAddress,
    ['function addNewSourceChain(string,string)'],
    signer,
  )
  const managerContract = new ethers.Contract(managerAddress, ['function operateSystemContract(address,bytes)'], signer)

  try {
    // addNewSourceChain 定义在 Manager 合约上，因此代理目标为 Manager 自身
    const tx = await managerContract.operateSystemContract(
      managerAddress,
      transportContract.interface.encodeFunctionData('addNewSourceChain', [symbol.trim(), name.trim()]),
    )
    const receipt = await tx.wait()
    if (receipt?.status !== 1) throw new ActionError('交易失败')
    return tx.hash
  } catch (error: any) {
    normalizeSignerError(error)
  }
}

/** 只读：当前账户是否为委员会成员（用于管理页只读提示） */
export async function isCommitteeMember(address: string): Promise<boolean | null> {
  if (!ethers.utils.isAddress(address)) return null
  const managerAddress = await getFinalManagerAddress()
  const client = await getHubClient()
  const data = managerInterface.encodeFunctionData('committeeMembers', [address])
  const raw = await client.tryEthCall(managerAddress, data)
  if (!raw) return null
  try {
    return Boolean(BigInt(raw))
  } catch {
    return null
  }
}

/** 只读：读取接线用的 Transport 地址（供页面展示） */
export async function getTransportAddress(): Promise<string> {
  return getFinalContractAddress()
}

export { transportInterface }
