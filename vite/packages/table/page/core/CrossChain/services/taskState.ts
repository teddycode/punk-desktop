/**
 * 跨链区 · 任务状态机（事件驱动）
 *
 * 为什么以事件为准：
 *   Transport.finishTask 成功后执行 `delete taskList[_taskKey]`，withdrawTask 的
 *   Rejected/Failed 分支同样删除记录。因此已完结任务的 getTaskInfoByKey 返回全零
 *   （label=0、user=0x0），无法据此列表或判定状态。
 *
 * 权威来源：
 *   NewTransportTask  —— 创建（含 user/fee/type/payload）
 *   UpdateTaskState   —— 每次状态流转（newState 为 indexed，可按状态过滤）
 *   ConfirmSourceTx   —— 完成时的源交易确认（与 newState=4 同交易）
 *   TaskReported      —— 事件型验证器上报（当前未注册，接入后自动出现）
 *
 * 时间：TransportTask.time 是 block.number，展示前必须经区块时间换算。
 */

import { ethers } from 'ethers'
import { TaskLabel, TASK_LABEL_TEXT, type NewTransportTaskEvent, type ConfirmSourceTxEvent, type TaskReportedEvent, type UpdateTaskStateEvent } from './abi'
import { getBlockTimestamps, getCreatedEvents, getCreatedEventsByKey, getStateEvents, getStateEventsByKey, getConfirmEvents, getTaskReportedEvents, getTaskInfo, getTaskInfoMany, invalidateMutableCaches } from './chain'
import { getHubClient } from './config'

export interface TaskTimelineNode {
  kind: 'created' | 'accepted' | 'successed' | 'rejected' | 'failed' | 'confirm' | 'reported'
  /** 该节点之后任务处于的 label */
  label: number
  text: string
  blockNumber: number
  timestamp: number | null
  txHash: string
  operator?: string
  evidence?: string
}

export interface TaskRecord {
  key: string
  index: number
  taskType: number
  taskTypeName?: string
  user: string
  fee: string
  payload: string
  /** 创建区块（注意：不是 time 字段，time 会被 acceptTask 覆写） */
  createdAtBlock: number
  createdAt: number | null
  /** 由事件推导的权威状态 */
  label: number
  /** true 表示链上任务记录已删除（已完结），状态完全来自事件 */
  recordDeleted: boolean
  relayer: string
  stake: string
  timeline: TaskTimelineNode[]
  lastBlock: number
}

export interface ScanProgress {
  phase: 'logs' | 'hydrate' | 'time' | 'done'
  message: string
  scannedFrom: number
  scannedTo: number
  found: number
}

export interface ScanResult {
  records: TaskRecord[]
  scannedFrom: number
  scannedTo: number
  latestBlock: number
  /** 本次是否只做了增量扫描 */
  incremental: boolean
}

function labelText(label: number): string {
  return TASK_LABEL_TEXT[label] ?? '未知'
}

function stateNodeKind(newState: number): TaskTimelineNode['kind'] {
  switch (newState) {
    case TaskLabel.Accepted:
      return 'accepted'
    case TaskLabel.Successed:
      return 'successed'
    case TaskLabel.Rejected:
      return 'rejected'
    case TaskLabel.Failed:
      return 'failed'
    default:
      return 'accepted'
  }
}

function sortEvents<T extends { blockNumber: number; logIndex: number }>(events: T[]): T[] {
  return [...events].sort((a, b) => a.blockNumber - b.blockNumber || a.logIndex - b.logIndex)
}

/**
 * 由事件集合推导任务记录（纯函数，便于单测）。
 */
export function deriveTaskRecords(input: {
  created: NewTransportTaskEvent[]
  states: UpdateTaskStateEvent[]
  confirms: ConfirmSourceTxEvent[]
  reported: TaskReportedEvent[]
  timestamps: Map<number, number>
  routeNames?: Map<number, string>
  /** 可选：活跃任务的链上字段补充 */
  onChain?: Map<string, { relayer: string; stake: string; label: number; fee: string }>
}): TaskRecord[] {
  const { created, states, confirms, reported, timestamps, routeNames, onChain } = input

  const statesByKey = new Map<string, UpdateTaskStateEvent[]>()
  sortEvents(states).forEach((event) => {
    const list = statesByKey.get(event.key) ?? []
    list.push(event)
    statesByKey.set(event.key, list)
  })

  // ConfirmSourceTx 与 TaskReported 都与 finishTask 同交易，用 txHash 关联
  const confirmsByTx = new Map<string, ConfirmSourceTxEvent>()
  confirms.forEach((event) => confirmsByTx.set(event.txHash, event))
  const reportedByTx = new Map<string, TaskReportedEvent[]>()
  reported.forEach((event) => {
    const list = reportedByTx.get(event.txHashLog) ?? []
    list.push(event)
    reportedByTx.set(event.txHashLog, list)
  })

  return sortEvents(created).map((creation) => {
    const transitions = statesByKey.get(creation.key) ?? []
    const last = transitions[transitions.length - 1]
    // 事件推导出的状态：无流转则为 Created
    let label = last ? last.newState : TaskLabel.Created
    const onChainInfo = onChain?.get(creation.key)
    // 活跃任务若链上仍有记录，以链上 label 为准（防止漏扫描）
    if (onChainInfo && (label === TaskLabel.Created || label === TaskLabel.Accepted)) {
      label = onChainInfo.label
    }

    const timeline: TaskTimelineNode[] = [
      {
        kind: 'created',
        label: TaskLabel.Created,
        text: '任务已创建，等待接单',
        blockNumber: creation.blockNumber,
        timestamp: timestamps.get(creation.blockNumber) ?? null,
        txHash: creation.txHash,
        operator: creation.user,
      },
    ]

    transitions.forEach((transition) => {
      const kind = stateNodeKind(transition.newState)
      const node: TaskTimelineNode = {
        kind,
        label: transition.newState,
        text:
          kind === 'accepted'
            ? transition.oldState === TaskLabel.Accepted
              ? '被新的中继者重接'
              : '已被中继者接单'
            : kind === 'successed'
              ? '证明通过验证，任务完成'
              : kind === 'rejected'
                ? '发起人撤回任务，奖励已退回'
                : '任务失败，已按合约规则处理质押',
        blockNumber: transition.blockNumber,
        timestamp: timestamps.get(transition.blockNumber) ?? null,
        txHash: transition.txHash,
        operator: transition.operator,
      }
      timeline.push(node)

      // 同交易的完成证据
      const confirm = confirmsByTx.get(transition.txHash)
      if (confirm) {
        timeline.push({
          kind: 'confirm',
          label: transition.newState,
          text: '源交易已确认',
          blockNumber: confirm.blockNumber,
          timestamp: timestamps.get(confirm.blockNumber) ?? null,
          txHash: confirm.txHash,
          evidence: `keyTx=${confirm.keyTx}`,
        })
      }
      const reports = reportedByTx.get(transition.txHash)
      reports?.forEach((report) => {
        timeline.push({
          kind: 'reported',
          label: transition.newState,
          text: `验证器已上报（业务类型 ${report.taskTypeName || '未知'}）`,
          blockNumber: report.blockNumber,
          timestamp: timestamps.get(report.blockNumber) ?? null,
          txHash: report.txHashLog,
          evidence: `txHeight=${report.txHeight}`,
        })
      })
    })

    return {
      key: creation.key,
      index: creation.index,
      taskType: creation.taskType,
      taskTypeName: routeNames?.get(creation.taskType),
      user: creation.user,
      fee: onChainInfo?.fee ?? creation.fee,
      payload: creation.payload,
      createdAtBlock: creation.blockNumber,
      createdAt: timestamps.get(creation.blockNumber) ?? null,
      label,
      recordDeleted: !onChainInfo,
      relayer: onChainInfo?.relayer ?? (transitions.find((t) => t.newState === TaskLabel.Accepted)?.operator || ''),
      stake: onChainInfo?.stake ?? '0',
      timeline,
      lastBlock: last ? last.blockNumber : creation.blockNumber,
    }
  })
}

// ————————————————————————— 扫描控制器 —————————————————————————

interface ScanState {
  lastScannedBlock: number
  created: NewTransportTaskEvent[]
  states: UpdateTaskStateEvent[]
  confirms: ConfirmSourceTxEvent[]
  reported: TaskReportedEvent[]
  hydrated: boolean
}

const scanState: ScanState = {
  lastScannedBlock: 0,
  created: [],
  states: [],
  confirms: [],
  reported: [],
  hydrated: false,
}

export function resetScanState(): void {
  scanState.lastScannedBlock = 0
  scanState.created = []
  scanState.states = []
  scanState.confirms = []
  scanState.reported = []
  scanState.hydrated = false
}

export function getScanCursor(): number {
  return scanState.lastScannedBlock
}

/**
 * 扫描全部任务（首次全量，之后增量）。
 * 依赖已实测的 RPC 能力：限定 address 的 eth_getLogs 可全量区间读取，批量 eth_call 可用。
 */
export async function scanTasks(options: {
  force?: boolean
  onProgress?: (progress: ScanProgress) => void
  routeNames?: Map<number, string>
} = {}): Promise<ScanResult> {
  const { force = false, onProgress, routeNames } = options
  if (force) {
    resetScanState()
    invalidateMutableCaches()
  }

  const client = await getHubClient()
  const latestBlock = await client.getBlockNumber()
  const fromBlock = scanState.lastScannedBlock === 0 ? 0 : scanState.lastScannedBlock + 1
  const incremental = scanState.lastScannedBlock !== 0

  if (fromBlock <= latestBlock) {
    onProgress?.({
      phase: 'logs',
      message: incremental ? '增量扫描新区块' : '首次全量扫描事件日志',
      scannedFrom: fromBlock,
      scannedTo: latestBlock,
      found: scanState.created.length,
    })

    const [created, states, confirms, reported] = await Promise.all([
      getCreatedEvents(fromBlock, latestBlock),
      getStateEvents(fromBlock, latestBlock),
      getConfirmEvents(fromBlock, latestBlock),
      getTaskReportedEvents(fromBlock, latestBlock),
    ])
    scanState.created.push(...created)
    scanState.states.push(...states)
    scanState.confirms.push(...confirms)
    scanState.reported.push(...reported)
    scanState.lastScannedBlock = latestBlock
  }

  onProgress?.({
    phase: 'hydrate',
    message: '读取进行中任务的链上字段',
    scannedFrom: fromBlock,
    scannedTo: latestBlock,
    found: scanState.created.length,
  })

  // 事件推导出最新状态，再对仍在进行中的任务补充 relayer/stake
  const preliminary = deriveTaskRecords({
    created: scanState.created,
    states: scanState.states,
    confirms: scanState.confirms,
    reported: scanState.reported,
    timestamps: new Map(),
    routeNames,
  })
  const activeKeys = preliminary
    .filter((record) => record.label === TaskLabel.Created || record.label === TaskLabel.Accepted)
    .map((record) => record.key)

  const onChain = new Map<string, { relayer: string; stake: string; label: number; fee: string }>()
  if (activeKeys.length) {
    const infos = await getTaskInfoMany(activeKeys).catch(() => [])
    infos.forEach((info) => {
      // 记录已删除时返回全零，视为无效
      if (!info.user || info.user === '0x0000000000000000000000000000000000000000') return
      onChain.set(info.key, { relayer: info.relayer, stake: info.stake, label: info.label, fee: info.fee })
    })
  }
  scanState.hydrated = true

  onProgress?.({
    phase: 'time',
    message: '换算区块时间',
    scannedFrom: fromBlock,
    scannedTo: latestBlock,
    found: scanState.created.length,
  })

  const blocks = new Set<number>()
  scanState.created.forEach((event) => blocks.add(event.blockNumber))
  scanState.states.forEach((event) => blocks.add(event.blockNumber))
  scanState.confirms.forEach((event) => blocks.add(event.blockNumber))
  scanState.reported.forEach((event) => blocks.add(event.blockNumber))
  const timestamps = await getBlockTimestamps(Array.from(blocks)).catch(() => new Map<number, number>())

  const records = deriveTaskRecords({
    created: scanState.created,
    states: scanState.states,
    confirms: scanState.confirms,
    reported: scanState.reported,
    timestamps,
    routeNames,
    onChain,
  }).sort((a, b) => b.createdAtBlock - a.createdAtBlock || b.index - a.index)

  onProgress?.({
    phase: 'done',
    message: `扫描完成，共 ${records.length} 个任务`,
    scannedFrom: fromBlock,
    scannedTo: latestBlock,
    found: records.length,
  })

  return { records, scannedFrom: fromBlock, scannedTo: latestBlock, latestBlock, incremental }
}

/**
 * 单个任务详情：不依赖全量扫描，直接按 Key 读取事件与链上字段。
 * 用于深链直接打开（例如从外部粘贴任务 URL）。
 */
export async function loadTaskRecord(key: string, routeNames?: Map<number, string>): Promise<TaskRecord | null> {
  const [created, states, confirms, reported, info] = await Promise.all([
    getCreatedEventsByKey(key),
    getStateEventsByKey(key),
    getConfirmEvents().catch(() => []),
    getTaskReportedEvents().catch(() => []),
    getTaskInfo(key).catch(() => null),
  ])

  if (!created.length && !states.length && (!info || info.user === ethers.constants.AddressZero)) {
    return null
  }

  const creation: NewTransportTaskEvent = created[0] ?? {
    index: -1,
    key,
    payload: info?.payload ?? '0x',
    taskType: info?.taskType ?? 0,
    user: info?.user ?? ethers.constants.AddressZero,
    fee: info?.fee ?? '0',
    blockNumber: info?.time ?? 0,
    txHash: '',
    logIndex: 0,
  }

  const onChain =
    info && info.user !== ethers.constants.AddressZero
      ? new Map([[key, { relayer: info.relayer, stake: info.stake, label: info.label, fee: info.fee }]])
      : undefined

  const relevantTx = new Set(states.map((state) => state.txHash))
  const blocks = new Set<number>()
  blocks.add(creation.blockNumber)
  states.forEach((state) => blocks.add(state.blockNumber))
  confirms.filter((item) => relevantTx.has(item.txHash)).forEach((item) => blocks.add(item.blockNumber))
  reported.filter((item) => relevantTx.has(item.txHashLog)).forEach((item) => blocks.add(item.blockNumber))
  const timestamps = await getBlockTimestamps(Array.from(blocks)).catch(() => new Map<number, number>())

  const records = deriveTaskRecords({
    created: [creation],
    states,
    confirms,
    reported,
    timestamps,
    routeNames,
    onChain,
  })
  return records[0] ?? null
}

// ————————————————————————— 过滤与统计 —————————————————————————

export interface TaskFilter {
  address?: string
  /** creator：我发起的；relayer：我接单的；all：全部 */
  role?: 'creator' | 'relayer' | 'all'
  /** 按 label 过滤；不传表示全部 */
  label?: number
  /** 按状态组过滤 */
  stateGroup?: 'active' | 'success' | 'failed'
  taskType?: number
  keyword?: string
}

export function isSameAddress(a?: string | null, b?: string | null): boolean {
  if (!a || !b) return false
  return a.toLowerCase() === b.toLowerCase()
}

export function filterTasks(records: TaskRecord[], filter: TaskFilter = {}): TaskRecord[] {
  const { address, role = 'creator', label, stateGroup, taskType, keyword } = filter
  return records.filter((record) => {
    if (address && role !== 'all') {
      if (role === 'creator' && !isSameAddress(record.user, address)) return false
      if (role === 'relayer' && !isSameAddress(record.relayer, address)) return false
    }
    if (label !== undefined && record.label !== label) return false
    if (stateGroup === 'active' && record.label !== TaskLabel.Created && record.label !== TaskLabel.Accepted) return false
    if (stateGroup === 'success' && record.label !== TaskLabel.Successed) return false
    if (stateGroup === 'failed' && record.label !== TaskLabel.Failed && record.label !== TaskLabel.Rejected) return false
    if (taskType !== undefined && record.taskType !== taskType) return false
    if (keyword) {
      const needle = keyword.trim().toLowerCase()
      if (needle) {
        const haystack = `${record.key} ${record.index} ${record.payload} ${record.taskTypeName ?? ''}`.toLowerCase()
        if (!haystack.includes(needle)) return false
      }
    }
    return true
  })
}

export interface TaskSummary {
  total: number
  active: number
  actionable: number
  success: number
  failed: number
}

/** 待我处理：我发起的待接单/已接单任务 + 我有资格接的待接单任务 */
export function summarizeTasks(records: TaskRecord[], address?: string, canAccept = false): TaskSummary {
  // 未连接钱包时，不要把所有任务当作“我的任务”（否则会误导用户）
  if (!address) {
    return { total: 0, active: 0, actionable: 0, success: 0, failed: 0 }
  }
  const mine = filterTasks(records, { address, role: 'creator' })
  return {
    total: mine.length,
    active: mine.filter((r) => r.label === TaskLabel.Created || r.label === TaskLabel.Accepted).length,
    actionable:
      mine.filter((r) => r.label === TaskLabel.Accepted && isSameAddress(r.relayer, address)).length +
      (canAccept ? records.filter((r) => r.label === TaskLabel.Created).length : 0),
    success: mine.filter((r) => r.label === TaskLabel.Successed).length,
    failed: mine.filter((r) => r.label === TaskLabel.Failed || r.label === TaskLabel.Rejected).length,
  }
}

export { TaskLabel, labelText }
