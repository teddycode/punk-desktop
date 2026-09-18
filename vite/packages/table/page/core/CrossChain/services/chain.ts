/**
 * 跨链区 · 链上数据访问层
 *
 * 设计要点（全部依据实测 RPC 能力与合约行为）：
 *   1. 全部数据来自链上，无本地索引库、无后端服务。
 *   2. 终结任务（Successed/Rejected/Failed）在合约里被 delete，只能由事件推导状态；
 *      因此任务列表与详情统一以事件为权威来源，合约读取仅用于活跃任务字段。
 *   3. eth_getLogs 在限定 address 时可全量区间读取（实测 70ms），
 *      但为兼容其他部署仍实现分片与失败拆分。
 *   4. 同构读取走批量 JSON-RPC（实测 500 条/93ms），显著减少往返。
 */

import { ethers } from 'ethers'
import {
  MANAGER_ABI,
  RELAY_ABI,
  TASK_REPORTED_EVENT,
  TRANSPORT_ABI,
  TRANSPORT_EVENTS,
  type ConfirmSourceTxEvent,
  type NewTransportTaskEvent,
  type RouteInfo,
  type RouteUpdatedEvent,
  type TaskInfo,
  type TaskReportedEvent,
  type UpdateTaskStateEvent,
} from './abi'
import { getHubClient, managerInterface, relayInterface, resolveHubConfig, transportInterface } from './config'
import type { JsonRpcClient, RpcLog } from './rpc'

const transportEventInterface = new ethers.utils.Interface(TRANSPORT_EVENTS)
const reportedEventInterface = new ethers.utils.Interface([TASK_REPORTED_EVENT])
const relayEventInterface = new ethers.utils.Interface(RELAY_ABI)

// ————————————————————————— 缓存 —————————————————————————

/** 日志分片缓存：同一 (address, topic, from, to) 的结果不可变 */
const logCache = new Map<string, RpcLog[]>()
/** 区块时间戳缓存：不可变 */
const blockTimestampCache = new Map<number, number>()
/** 业务类型缓存（会随链上变更而变，带 TTL） */
let routesCache: { at: number; data: RouteInfo[] } | null = null
const ROUTES_TTL_MS = 60_000

export function clearChainCaches(): void {
  logCache.clear()
  blockTimestampCache.clear()
  routesCache = null
}

/** 手动刷新时清掉可变缓存，保留不可变缓存 */
export function invalidateMutableCaches(): void {
  routesCache = null
}

// ————————————————————————— 工具 —————————————————————————

function hexToNumber(hex: string | null | undefined): number {
  if (!hex) return 0
  return parseInt(hex, 16)
}

function toBigNumber(value: any): ethers.BigNumber {
  if (ethers.BigNumber.isBigNumber(value)) return value
  if (typeof value === 'bigint') return ethers.BigNumber.from(value.toString())
  return ethers.BigNumber.from(value ?? 0)
}

/**
 * 分片读取日志；单次失败时二分重试。
 * 默认分片 100000 区块：本链全量约 1.5 万块，通常一片完成；
 * 链变长后仍能按片增量刷新，且不会因单次区间过大被节点拒绝。
 */
async function getLogsSafe(
  client: JsonRpcClient,
  filter: { address: string; topics: Array<string | null> },
  fromBlock: number,
  toBlock: number,
  chunkSize = 100_000,
): Promise<RpcLog[]> {
  if (toBlock < fromBlock) return []
  const results: RpcLog[] = []
  let start = fromBlock
  while (start <= toBlock) {
    const end = Math.min(start + chunkSize - 1, toBlock)
    const key = `${filter.address}|${filter.topics.join(',')}|${start}|${end}`
    const cached = logCache.get(key)
    if (cached) {
      results.push(...cached)
    } else {
      let logs: RpcLog[]
      try {
        logs = await client.getLogs({ ...filter, fromBlock: start, toBlock: end })
      } catch (error) {
        // 区间过大或节点限制时二分重试
        if (end > start) {
          const mid = Math.floor((start + end) / 2)
          const left = await getLogsSafe(client, filter, start, mid, chunkSize)
          const right = await getLogsSafe(client, filter, mid + 1, end, chunkSize)
          logs = [...left, ...right]
        } else {
          throw error
        }
      }
      logCache.set(key, logs)
      results.push(...logs)
    }
    start = end + 1
  }
  return results
}

function decodeTransportLogs(name: string, logs: RpcLog[]): any[] {
  return logs.map((log) => transportEventInterface.decodeEventLog(name, log.data, log.topics))
}

// ————————————————————————— 业务类型 —————————————————————————

export async function getRoutes(force = false): Promise<RouteInfo[]> {
  if (!force && routesCache && Date.now() - routesCache.at < ROUTES_TTL_MS) {
    return routesCache.data
  }
  const { transportAddress } = await resolveHubConfig()
  const client = await getHubClient()
  const data = transportInterface.encodeFunctionData('getAllRoutes')
  const result = await client.ethCall(transportAddress, data)
  const [ids, names, status, verifiers] = transportInterface.decodeFunctionResult('getAllRoutes', result)

  const routes: RouteInfo[] = ids.map((id: ethers.BigNumber, i: number) => ({
    id: Number(id),
    name: String(names[i] ?? ''),
    isActive: Boolean(status[i]),
    isExist: true,
    verifier: String(verifiers[i]),
  }))
  routesCache = { at: Date.now(), data: routes }
  return routes
}

export async function getRoute(id: number): Promise<RouteInfo | null> {
  const { transportAddress } = await resolveHubConfig()
  const client = await getHubClient()
  const data = transportInterface.encodeFunctionData('routes', [id])
  const result = await client.tryEthCall(transportAddress, data)
  if (!result) return null
  const [name, isActive, isExist, verifier] = transportInterface.decodeFunctionResult('routes', result)
  return { id, name: String(name), isActive: Boolean(isActive), isExist: Boolean(isExist), verifier: String(verifier) }
}

/** 业务类型变更历史（可用于管理页审计；实测本链有 4 条，含验证器多次更换） */
export async function getRouteHistory(fromBlock = 0, toBlock?: number): Promise<RouteUpdatedEvent[]> {
  const { transportAddress } = await resolveHubConfig()
  const client = await getHubClient()
  const latest = toBlock ?? (await client.getBlockNumber())
  const logs = await getLogsSafe(
    client,
    { address: transportAddress, topics: [transportEventInterface.getEventTopic('RouteUpdated')] },
    fromBlock,
    latest,
  )
  return decodeTransportLogs('RouteUpdated', logs).map((d: any, i: number) => ({
    routeId: Number(d.routeId),
    name: String(d.name),
    isActive: Boolean(d.isActive),
    verifier: String(d.verifier),
    blockNumber: hexToNumber(logs[i].blockNumber),
    txHash: logs[i].transactionHash,
    logIndex: hexToNumber(logs[i].logIndex),
  }))
}

// ————————————————————————— 任务读取 —————————————————————————

export async function getTaskNum(): Promise<number> {
  const { transportAddress } = await resolveHubConfig()
  const client = await getHubClient()
  const result = await client.ethCall(transportAddress, transportInterface.encodeFunctionData('taskNum'))
  return Number(BigInt(result))
}

function decodeTaskInfo(key: string, index: number | null, result: string): TaskInfo {
  const [user, fee, taskType, relayer, stake, payload, label, time] = transportInterface.decodeFunctionResult(
    'getTaskInfoByKey',
    result,
  )
  return {
    key,
    index,
    user: String(user),
    fee: toBigNumber(fee).toString(),
    taskType: Number(taskType),
    relayer: String(relayer),
    stake: toBigNumber(stake).toString(),
    payload: String(payload),
    label: Number(label),
    time: Number(time),
  }
}

export async function getTaskInfo(key: string): Promise<TaskInfo> {
  const { transportAddress } = await resolveHubConfig()
  const client = await getHubClient()
  const data = transportInterface.encodeFunctionData('getTaskInfoByKey', [key])
  const result = await client.ethCall(transportAddress, data)
  return decodeTaskInfo(key, null, result)
}

export async function getTaskInfoMany(keys: string[]): Promise<TaskInfo[]> {
  if (!keys.length) return []
  const { transportAddress } = await resolveHubConfig()
  const client = await getHubClient()
  const results = await client.ethCallBatch(
    keys.map((key) => ({
      to: transportAddress,
      data: transportInterface.encodeFunctionData('getTaskInfoByKey', [key]),
    })),
  )
  return results.map((result, i) => decodeTaskInfo(keys[i], null, result))
}

/** 按索引批量读取（优先用 getTaskInfoByIndex，减少一次 taskIndex 调用） */
export async function getTaskInfosByIndex(indices: number[]): Promise<TaskInfo[]> {
  if (!indices.length) return []
  const { transportAddress } = await resolveHubConfig()
  const client = await getHubClient()
  const results = await client.ethCallBatch(
    indices.map((index) => ({
      to: transportAddress,
      data: transportInterface.encodeFunctionData('getTaskInfoByIndex', [index]),
    })),
  )
  return results.map((result, i) => decodeTaskInfo('', indices[i], result))
}

/** 精确分页：taskNum 给出精确总数，索引区间内批量读取 */
export async function getTasksPaged(
  page: number,
  pageSize: number,
): Promise<{ items: TaskInfo[]; total: number; page: number; pageSize: number }> {
  const total = await getTaskNum()
  const safePage = Math.max(1, page)
  const safeSize = Math.max(1, pageSize)
  const end = total - (safePage - 1) * safeSize // 倒序：最新的在前
  const start = Math.max(0, end - safeSize)
  const indices: number[] = []
  for (let i = end - 1; i >= start; i--) indices.push(i)
  const items = indices.length ? await getTaskInfosByIndex(indices) : []
  return { items, total, page: safePage, pageSize: safeSize }
}

export async function getTxIfCheck(keyTx: string): Promise<boolean> {
  const { transportAddress } = await resolveHubConfig()
  const client = await getHubClient()
  const data = transportInterface.encodeFunctionData('txIfCheck', [keyTx])
  const result = await client.tryEthCall(transportAddress, data)
  if (!result) return false
  return Boolean(BigInt(result))
}

export async function getSystemState(): Promise<number> {
  const { transportAddress } = await resolveHubConfig()
  const client = await getHubClient()
  const result = await client.ethCall(transportAddress, transportInterface.encodeFunctionData('getContractState'))
  return Number(BigInt(result))
}

// ————————————————————————— 事件读取 —————————————————————————

export async function getCreatedEvents(fromBlock = 0, toBlock?: number): Promise<NewTransportTaskEvent[]> {
  const { transportAddress } = await resolveHubConfig()
  const client = await getHubClient()
  const latest = toBlock ?? (await client.getBlockNumber())
  const logs = await getLogsSafe(
    client,
    { address: transportAddress, topics: [transportEventInterface.getEventTopic('NewTransportTask')] },
    fromBlock,
    latest,
  )
  return decodeTransportLogs('NewTransportTask', logs).map((d: any, i: number) => ({
    index: Number(d._index),
    key: String(d._key),
    payload: String(d._payload),
    taskType: Number(d._type),
    user: String(d.user),
    fee: toBigNumber(d.fee).toString(),
    blockNumber: hexToNumber(logs[i].blockNumber),
    txHash: logs[i].transactionHash,
    logIndex: hexToNumber(logs[i].logIndex),
  }))
}

export async function getStateEvents(
  fromBlock = 0,
  toBlock?: number,
  newState?: number,
): Promise<UpdateTaskStateEvent[]> {
  const { transportAddress } = await resolveHubConfig()
  const client = await getHubClient()
  const latest = toBlock ?? (await client.getBlockNumber())
  // newState 为 indexed，可直接按 topic 过滤
  const topics: Array<string | null> = [transportEventInterface.getEventTopic('UpdateTaskState'), null]
  if (newState !== undefined) {
    topics.push(ethers.utils.hexZeroPad(ethers.utils.hexlify(newState), 32))
  }
  const logs = await getLogsSafe(client, { address: transportAddress, topics }, fromBlock, latest)
  return decodeTransportLogs('UpdateTaskState', logs).map((d: any, i: number) => ({
    key: String(d._key),
    oldState: Number(d.oldState),
    newState: Number(d.newState),
    operator: String(d.operator),
    blockNumber: hexToNumber(logs[i].blockNumber),
    txHash: logs[i].transactionHash,
    logIndex: hexToNumber(logs[i].logIndex),
  }))
}

export async function getConfirmEvents(fromBlock = 0, toBlock?: number): Promise<ConfirmSourceTxEvent[]> {
  const { transportAddress } = await resolveHubConfig()
  const client = await getHubClient()
  const latest = toBlock ?? (await client.getBlockNumber())
  const logs = await getLogsSafe(
    client,
    { address: transportAddress, topics: [transportEventInterface.getEventTopic('ConfirmSourceTx')] },
    fromBlock,
    latest,
  )
  return decodeTransportLogs('ConfirmSourceTx', logs).map((d: any, i: number) => ({
    keyTx: String(d.keyTx),
    keyShadowBlock: String(d.keyShadowBlock),
    confirmParam: Number(d.confirmParam),
    flag: Boolean(d._type),
    blockNumber: hexToNumber(logs[i].blockNumber),
    txHash: logs[i].transactionHash,
    logIndex: hexToNumber(logs[i].logIndex),
  }))
}

/** 事件型验证器上报（当前未注册路由，接入后自动生效） */
export async function getTaskReportedEvents(fromBlock = 0, toBlock?: number): Promise<TaskReportedEvent[]> {
  const { transportAddress } = await resolveHubConfig()
  const client = await getHubClient()
  const latest = toBlock ?? (await client.getBlockNumber())
  const logs = await getLogsSafe(
    client,
    { address: transportAddress, topics: [reportedEventInterface.getEventTopic('TaskReported')] },
    fromBlock,
    latest,
  )
  return logs.map((log) => {
    const d: any = reportedEventInterface.decodeEventLog('TaskReported', log.data, log.topics)
    return {
      txHeight: toBigNumber(d.txHeight).toString(),
      confirmHeight: toBigNumber(d.confirmHeight).toString(),
      txHash: String(d.txHash),
      taskTypeName: String(d.taskTypeName),
      blockNumber: hexToNumber(log.blockNumber),
      txHashLog: log.transactionHash,
      logIndex: hexToNumber(log.logIndex),
    }
  })
}

/** 按任务 Key 精确读取创建事件（_key 为 topics[2]） */
export async function getCreatedEventsByKey(key: string, toBlock?: number): Promise<NewTransportTaskEvent[]> {
  const { transportAddress } = await resolveHubConfig()
  const client = await getHubClient()
  const latest = toBlock ?? (await client.getBlockNumber())
  const logs = await getLogsSafe(
    client,
    {
      address: transportAddress,
      topics: [transportEventInterface.getEventTopic('NewTransportTask'), null, key.toLowerCase()],
    },
    0,
    latest,
  )
  return decodeTransportLogs('NewTransportTask', logs).map((d: any, i: number) => ({
    index: Number(d._index),
    key: String(d._key),
    payload: String(d._payload),
    taskType: Number(d._type),
    user: String(d.user),
    fee: toBigNumber(d.fee).toString(),
    blockNumber: hexToNumber(logs[i].blockNumber),
    txHash: logs[i].transactionHash,
    logIndex: hexToNumber(logs[i].logIndex),
  }))
}

/** 按任务 Key 精确读取状态流转事件（_key 为 topics[1]） */
export async function getStateEventsByKey(key: string, toBlock?: number): Promise<UpdateTaskStateEvent[]> {
  const { transportAddress } = await resolveHubConfig()
  const client = await getHubClient()
  const latest = toBlock ?? (await client.getBlockNumber())
  const logs = await getLogsSafe(
    client,
    { address: transportAddress, topics: [transportEventInterface.getEventTopic('UpdateTaskState'), key.toLowerCase()] },
    0,
    latest,
  )
  return decodeTransportLogs('UpdateTaskState', logs).map((d: any, i: number) => ({
    key: String(d._key),
    oldState: Number(d.oldState),
    newState: Number(d.newState),
    operator: String(d.operator),
    blockNumber: hexToNumber(logs[i].blockNumber),
    txHash: logs[i].transactionHash,
    logIndex: hexToNumber(logs[i].logIndex),
  }))
}

// ————————————————————————— 区块时间 —————————————————————————

/**
 * 批量取区块时间戳。
 * 合约的 time 字段是 block.number（不是时间戳），所有时间展示都必须经过本方法换算。
 */
export async function getBlockTimestamps(blockNumbers: number[]): Promise<Map<number, number>> {
  const unique = Array.from(new Set(blockNumbers.filter((n) => Number.isFinite(n) && n > 0)))
  const missing = unique.filter((n) => !blockTimestampCache.has(n))
  if (missing.length) {
    const client = await getHubClient()
    const blocks = await client.getBlocks(missing)
    blocks.forEach((block, i) => {
      if (block?.timestamp) blockTimestampCache.set(missing[i], hexToNumber(block.timestamp))
    })
  }
  const result = new Map<number, number>()
  unique.forEach((n) => {
    const ts = blockTimestampCache.get(n)
    if (ts !== undefined) result.set(n, ts)
  })
  return result
}

export async function getBlockTimestamp(blockNumber: number): Promise<number | null> {
  const map = await getBlockTimestamps([blockNumber])
  return map.get(blockNumber) ?? null
}

/** 把一个“区块号”格式化为本地时间字符串；失败时返回区块高度描述 */
export async function formatBlockTime(blockNumber: number): Promise<string> {
  if (!blockNumber) return '—'
  const timestamp = await getBlockTimestamp(blockNumber).catch(() => null)
  if (!timestamp) return `区块 #${blockNumber}`
  return new Date(timestamp * 1000).toLocaleString()
}

// ————————————————————————— 源链与 relay —————————————————————————

export interface SourceChainInfo {
  chainId: number
  symbol: string
  name: string
  state: number
  relayAddress: string | null
}

export async function getSourceChains(): Promise<SourceChainInfo[]> {
  // 注意：getSourceChainNum / getSourceChainInfo / contract_chain_index 都在 Manager 合约上，
  // 在 Transport 地址上调用会 revert（已实测）。
  const { managerAddress } = await resolveHubConfig()
  const client = await getHubClient()

  const countHex = await client
    .tryEthCall(managerAddress, managerInterface.encodeFunctionData('getSourceChainNum'))
    .catch(() => null)
  if (!countHex) return []
  const total = Number(BigInt(countHex))
  if (!total) return []

  const infos = await client.ethCallBatch(
    Array.from({ length: total }, (_, i) => ({
      to: managerAddress,
      data: managerInterface.encodeFunctionData('getSourceChainInfo', [i + 1]),
    })),
  )

  const relayCalls = Array.from({ length: total }, (_, i) => ({
    to: managerAddress,
    data: managerInterface.encodeFunctionData('contract_chain_index', [i + 1, 0]),
  }))
  const relayResults = await client.ethCallBatch(relayCalls).catch(() => [] as string[])

  return infos.map((result, i) => {
    const [symbol, name, state] = managerInterface.decodeFunctionResult('getSourceChainInfo', result)
    let relayAddress: string | null = null
    const relayResult = relayResults[i]
    if (relayResult) {
      try {
        const [addr] = managerInterface.decodeFunctionResult('contract_chain_index', relayResult)
        if (addr && addr !== ethers.constants.AddressZero) relayAddress = ethers.utils.getAddress(addr)
      } catch {
        relayAddress = null
      }
    }
    return {
      chainId: i + 1,
      symbol: String(symbol),
      name: String(name),
      state: Number(state),
      relayAddress,
    }
  })
}

export interface RelayParams {
  chainId: number
  address: string
  myStake: string | null
  requireStake: string | null
  contractState: number | null
  topShadowKey: string | null
  maxOpenCommitDelay: string | null
}

/** 读取 relay 参数；某条链的 relay ABI 未确认时返回 null 字段而不是抛错 */
export async function getRelayParams(chainId: number, ownerAddress?: string): Promise<RelayParams | null> {
  const { managerAddress } = await resolveHubConfig()
  const client = await getHubClient()
  const relayResult = await client
    .tryEthCall(managerAddress, managerInterface.encodeFunctionData('contract_chain_index', [chainId, 0]))
    .catch(() => null)
  if (!relayResult) return null
  const [relayAddress] = managerInterface.decodeFunctionResult('contract_chain_index', relayResult)
  if (!relayAddress || relayAddress === ethers.constants.AddressZero) return null

  const call = async (fn: string, params: any[] = [], from?: string) => {
    const data = relayInterface.encodeFunctionData(fn, params)
    const raw = await client.tryEthCall(relayAddress, data, 'latest', from).catch(() => null)
    if (!raw) return null
    try {
      return relayInterface.decodeFunctionResult(fn, raw)[0]
    } catch {
      return null
    }
  }

  const [myStakeRaw, requireStakeRaw, stateRaw, topKeyRaw, delayRaw] = await Promise.all([
    ownerAddress ? call('getMyStake', [], ownerAddress) : Promise.resolve(null),
    call('getRequireStake'),
    call('getContractState'),
    call('getTopKeyFromShadowLedger'),
    call('getMaxOpenCommitDelay'),
  ])

  return {
    chainId,
    address: relayAddress,
    myStake: myStakeRaw === null ? null : toBigNumber(myStakeRaw).toString(),
    requireStake: requireStakeRaw === null ? null : toBigNumber(requireStakeRaw).toString(),
    contractState: stateRaw === null ? null : Number(BigInt(stateRaw)),
    topShadowKey: topKeyRaw === null ? null : String(topKeyRaw),
    maxOpenCommitDelay: delayRaw === null ? null : toBigNumber(delayRaw).toString(),
  }
}

/** 影子区块：日志优先（UpdateShadowLedger），拿不到则回退到链表头 */
export async function getShadowBlocks(
  chainId: number,
  limit = 20,
): Promise<{ items: Array<{ keyShadowBlock: string; keyParentShadowBlock: string; blockNumber: number; txHash: string }>; source: 'logs' | 'head' | 'unsupported' }> {
  const { managerAddress } = await resolveHubConfig()
  const client = await getHubClient()
  const relayResult = await client
    .tryEthCall(managerAddress, managerInterface.encodeFunctionData('contract_chain_index', [chainId, 0]))
    .catch(() => null)
  if (!relayResult) return { items: [], source: 'unsupported' }
  const [relayAddress] = managerInterface.decodeFunctionResult('contract_chain_index', relayResult)
  if (!relayAddress || relayAddress === ethers.constants.AddressZero) return { items: [], source: 'unsupported' }

  try {
    const logs = await getLogsSafe(
      client,
      { address: relayAddress, topics: [relayEventInterface.getEventTopic('UpdateShadowLedger')] },
      0,
      await client.getBlockNumber(),
    )
    if (logs.length) {
      const decoded = logs
        .map((log) => {
          const d: any = relayEventInterface.decodeEventLog('UpdateShadowLedger', log.data, log.topics)
          return {
            keyShadowBlock: String(d.keyShadowBlock),
            keyParentShadowBlock: String(d.keyParentShadowBlock),
            blockNumber: hexToNumber(log.blockNumber),
            txHash: log.transactionHash,
          }
        })
        .sort((a, b) => b.blockNumber - a.blockNumber)
      return { items: decoded.slice(0, limit), source: 'logs' }
    }
  } catch {
    /* 回退到链表头 */
  }

  const topKey = await client
    .tryEthCall(relayAddress, relayInterface.encodeFunctionData('getTopKeyFromShadowLedger'))
    .catch(() => null)
  if (!topKey) return { items: [], source: 'unsupported' }
  const [key] = relayInterface.decodeFunctionResult('getTopKeyFromShadowLedger', topKey)
  return {
    items: key && key !== ethers.constants.HashZero ? [{ keyShadowBlock: String(key), keyParentShadowBlock: '', blockNumber: 0, txHash: '' }] : [],
    source: 'head',
  }
}

/** 搬运参与者贡献记录 */
export async function getRelayerContributions(
  chainId: number,
  limit = 50,
): Promise<Array<{ relayer: string; label: number; value: string; keyShadowBlock: string; blockNumber: number; txHash: string }>> {
  const { managerAddress } = await resolveHubConfig()
  const client = await getHubClient()
  const relayResult = await client
    .tryEthCall(managerAddress, managerInterface.encodeFunctionData('contract_chain_index', [chainId, 0]))
    .catch(() => null)
  if (!relayResult) return []
  const [relayAddress] = managerInterface.decodeFunctionResult('contract_chain_index', relayResult)
  if (!relayAddress || relayAddress === ethers.constants.AddressZero) return []

  try {
    const logs = await getLogsSafe(
      client,
      { address: relayAddress, topics: [relayEventInterface.getEventTopic('RecordRelayerContribution')] },
      0,
      await client.getBlockNumber(),
    )
    return logs
      .map((log) => {
        const d: any = relayEventInterface.decodeEventLog('RecordRelayerContribution', log.data, log.topics)
        return {
          keyShadowBlock: String(d.keyShadowBlock),
          relayer: String(d.relayer),
          label: Number(d.label),
          value: toBigNumber(d.value).toString(),
          blockNumber: hexToNumber(log.blockNumber),
          txHash: log.transactionHash,
        }
      })
      .sort((a, b) => b.blockNumber - a.blockNumber)
      .slice(0, limit)
  } catch {
    return []
  }
}
