/**
 * 跨链区 · 共享状态（模块级 reactive，与 browserWallet 的写法保持一致）
 *
 * 职责：
 *   - 统一的任务扫描与业务类型缓存，避免每个页面各自扫描
 *   - 钱包地址、目标链配置、Hub 连接状态的集中读取
 *   - 写操作成功后的统一刷新入口
 */

import { computed, reactive } from 'vue'
import { getRoutes as fetchRoutes } from './chain'
import { getScanCursor, scanTasks, type ScanProgress, type TaskRecord } from './taskState'
import { getTargetChain, probeHubStatus, setTargetChain, type HubStatus, type TargetChainConfig } from './config'
import { clearCapabilityCache } from './verifier'
import { invalidateMutableCaches } from './chain'
import { browserWallet } from '@table/services/browserWallet'
import { getCurrentWalletAddress } from '@table/services/crosschain'
import { clearChainCaches } from './chain'

export interface CrossChainState {
  records: TaskRecord[]
  scanning: boolean
  scannedOnce: boolean
  lastScanAt: number
  scanError: string
  scanProgress: ScanProgress | null
  routes: Awaited<ReturnType<typeof fetchRoutes>>
  routesLoading: boolean
  routesError: string
  hubStatus: HubStatus | null
  hubLoading: boolean
  walletAddress: string
  walletError: string
  targetChain: TargetChainConfig | null
}

export const crossChainState = reactive<CrossChainState>({
  records: [],
  scanning: false,
  scannedOnce: false,
  lastScanAt: 0,
  scanError: '',
  scanProgress: null,
  routes: [],
  routesLoading: false,
  routesError: '',
  hubStatus: null,
  hubLoading: false,
  walletAddress: '',
  walletError: '',
  targetChain: getTargetChain(),
})

/** 业务类型名称映射（用于任务列表显示 name 而不是 typeId） */
export const routeNameMap = computed(() => {
  const map = new Map<number, string>()
  crossChainState.routes.forEach((route) => map.set(route.id, route.name))
  return map
})

export const activeRoutes = computed(() => crossChainState.routes.filter((route) => route.isActive))
export const inactiveRoutes = computed(() => crossChainState.routes.filter((route) => !route.isActive))

/** 系统是否处于可写状态（合约 onlyWorking 要求 state == 2） */
export const systemWritable = computed(() => crossChainState.hubStatus?.contractState === 2)

export async function loadWalletAddress(force = false): Promise<string> {
  if (!force && crossChainState.walletAddress) return crossChainState.walletAddress
  crossChainState.walletError = ''
  try {
    const address = await getCurrentWalletAddress()
    crossChainState.walletAddress = address || ''
    if (!address) crossChainState.walletError = '未获取到钱包账户，请先连接钱包'
    return crossChainState.walletAddress
  } catch (error: any) {
    crossChainState.walletAddress = browserWallet.address || ''
    crossChainState.walletError = error?.message || '未连接钱包'
    return crossChainState.walletAddress
  }
}

export async function loadRoutes(force = false): Promise<void> {
  crossChainState.routesLoading = true
  crossChainState.routesError = ''
  try {
    crossChainState.routes = await fetchRoutes(force)
  } catch (error: any) {
    crossChainState.routesError = error?.message || '业务类型读取失败'
    crossChainState.routes = []
  } finally {
    crossChainState.routesLoading = false
  }
}

export async function loadHubStatus(): Promise<void> {
  crossChainState.hubLoading = true
  try {
    crossChainState.hubStatus = await probeHubStatus()
  } finally {
    crossChainState.hubLoading = false
  }
}

export async function loadTasks(force = false): Promise<void> {
  if (crossChainState.scanning) return
  crossChainState.scanning = true
  crossChainState.scanError = ''
  try {
    const result = await scanTasks({
      force,
      routeNames: routeNameMap.value,
      onProgress: (progress) => {
        crossChainState.scanProgress = progress
      },
    })
    crossChainState.records = result.records
    crossChainState.scannedOnce = true
    crossChainState.lastScanAt = Date.now()
  } catch (error: any) {
    crossChainState.scanError = error?.message || '任务扫描失败'
  } finally {
    crossChainState.scanning = false
    crossChainState.scanProgress = null
  }
}

/** 首次进入模块时调用；已有数据则不重复扫描 */
export async function ensureLoaded(): Promise<void> {
  const tasks: Array<Promise<unknown>> = []
  if (!crossChainState.routes.length) tasks.push(loadRoutes())
  if (!crossChainState.scannedOnce) tasks.push(loadTasks())
  if (!crossChainState.hubStatus) tasks.push(loadHubStatus())
  if (!crossChainState.walletAddress) tasks.push(loadWalletAddress())
  await Promise.all(tasks)
}

/** 手动刷新：清掉可变缓存后重新扫描 */
export async function refreshAll(): Promise<void> {
  invalidateMutableCaches()
  clearCapabilityCache()
  await Promise.all([loadRoutes(true), loadTasks(true), loadHubStatus(), loadWalletAddress(true)])
}

/** 写操作成功后调用：增量扫描（不清缓存，只扫新区块） */
export async function refreshAfterWrite(): Promise<void> {
  await loadTasks(false)
}

export function updateTargetChain(config: TargetChainConfig | null): void {
  setTargetChain(config)
  crossChainState.targetChain = config
}

export function resetCrossChainStore(): void {
  clearChainCaches()
  clearCapabilityCache()
  crossChainState.records = []
  crossChainState.scannedOnce = false
  crossChainState.scanError = ''
  crossChainState.scanProgress = null
  crossChainState.routes = []
  crossChainState.hubStatus = null
  crossChainState.walletAddress = ''
  crossChainState.walletError = ''
}

export function scanInfoText(): string {
  if (crossChainState.scanning && crossChainState.scanProgress) {
    return crossChainState.scanProgress.message
  }
  if (!crossChainState.scannedOnce) return '尚未扫描'
  const cursor = getScanCursor()
  return cursor ? `已扫描至区块 #${cursor}` : '已扫描'
}
