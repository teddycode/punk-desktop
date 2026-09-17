/**
 * 跨链区 · JSON-RPC 客户端（支持批量请求）
 *
 * 为什么不用 ethers 的 JsonRpcProvider：
 *   本项目 ethers 为 vendored 5.7.2-interest.2，未包含 batchMaxCount/batchStallTime，
 *   而跨链页面存在大量同构读取（按页取 taskInfo、按事件取区块时间），批量可显著降低往返。
 *
 * 已实测的目标 RPC 能力（Geth v1.13.12，chainId 20260902）：
 *   - 批量 JSON-RPC：500 条 / 93ms，正常返回数组
 *   - eth_getLogs：限定 address 时全量区间（0..latest）70ms 完成，无区间上限
 *   - eth_getLogs：不限 address 会返回 7 万+ 条并耗时 21s → 必须限定 address/topic
 *   - eth_getRawTransactionByHash / eth_getBlockByNumber / eth_feeHistory / eth_getProof：均可用
 */

export interface RpcLog {
  address: string
  topics: string[]
  data: string
  blockNumber: string
  blockHash: string
  transactionHash: string
  logIndex: string
  removed?: boolean
}

export interface RpcBlock {
  number: string
  hash: string
  parentHash: string
  timestamp: string
  transactions: Array<string | { hash: string }>
  gasLimit: string
  gasUsed: string
  baseFeePerGas?: string
}

export interface RpcReceipt {
  transactionHash: string
  blockNumber: string
  blockHash: string
  status: string
  from: string
  to: string | null
  gasUsed: string
  contractAddress: string | null
  logs: RpcLog[]
}

export interface RpcCall {
  method: string
  params?: any[]
}

export class RpcError extends Error {
  code: number
  method: string
  data?: any

  constructor(method: string, code: number, message: string, data?: any) {
    super(`[${method}] ${message}`)
    this.name = 'RpcError'
    this.method = method
    this.code = code
    this.data = data
  }
}

export interface JsonRpcClientOptions {
  /** 单个批次的最大请求数（实测 500 可用，默认 200 以留余量） */
  batchMaxCount?: number
  /** 单次请求超时（毫秒），默认 30s；批量按批大小放大 */
  timeoutMs?: number
  /** 并发批次数，默认 2（RPC 为单节点，避免压垮） */
  concurrency?: number
}

interface PendingCall extends RpcCall {
  id: number
  resolve: (v: any) => void
  reject: (e: Error) => void
}

export class JsonRpcClient {
  readonly url: string
  private batchMaxCount: number
  private timeoutMs: number
  private concurrency: number
  private idSeq = 0

  constructor(url: string, options: JsonRpcClientOptions = {}) {
    this.url = url
    this.batchMaxCount = Math.max(1, options.batchMaxCount ?? 200)
    this.timeoutMs = Math.max(1000, options.timeoutMs ?? 30000)
    this.concurrency = Math.max(1, options.concurrency ?? 2)
  }

  /** 单条请求 */
  async request<T = any>(method: string, params: any[] = [], timeoutMs?: number): Promise<T> {
    const id = ++this.idSeq
    const body = { jsonrpc: '2.0', id, method, params }
    const json = await this.post(body, timeoutMs ?? this.timeoutMs)
    return this.unwrap<T>(json, method)
  }

  /**
   * 批量请求，返回顺序与入参一致。
   * 超过 batchMaxCount 时自动分片，并按 concurrency 控制并发。
   */
  async batchRequest<T = any>(calls: RpcCall[], timeoutMs?: number): Promise<T[]> {
    if (!calls.length) return []
    const chunks: RpcCall[][] = []
    for (let i = 0; i < calls.length; i += this.batchMaxCount) {
      chunks.push(calls.slice(i, i + this.batchMaxCount))
    }

    const results: T[][] = new Array(chunks.length)
    let cursor = 0
    const workers = new Array(Math.min(this.concurrency, chunks.length)).fill(0).map(async () => {
      while (cursor < chunks.length) {
        const index = cursor++
        results[index] = await this.runChunk<T>(chunks[index], timeoutMs ?? this.timeoutMs)
      }
    })
    await Promise.all(workers)
    return results.flat()
  }

  private async runChunk<T>(chunk: RpcCall[], timeoutMs: number): Promise<T[]> {
    const payload = chunk.map((call) => ({
      jsonrpc: '2.0',
      id: ++this.idSeq,
      method: call.method,
      params: call.params ?? [],
    }))
    const ids = payload.map((p) => p.id)

    let json: any
    try {
      json = await this.post(payload, timeoutMs)
    } catch (error: any) {
      throw new RpcError(chunk[0]?.method ?? 'batch', -1, error?.message || 'RPC 请求失败')
    }

    if (!Array.isArray(json)) {
      // 某些节点对批量请求只回单个对象
      if (json?.error) throw new RpcError(chunk[0]?.method ?? 'batch', json.error.code, json.error.message, json.error.data)
      const first = chunk[0]
      return [this.unwrap<T>(json, first?.method ?? 'batch')]
    }

    const byId = new Map<number, any>()
    json.forEach((item: any) => byId.set(item.id, item))

    return ids.map((id, i) => {
      const item = byId.get(id)
      const method = chunk[i]?.method ?? 'batch'
      if (!item) throw new RpcError(method, -1, '批量响应缺少该请求的结果')
      return this.unwrap<T>(item, method)
    })
  }

  private async post(body: any, timeoutMs: number): Promise<any> {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null
    const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null
    try {
      const response = await fetch(this.url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller ? controller.signal : undefined,
      })
      if (!response.ok) {
        throw new RpcError('http', response.status, `HTTP ${response.status} ${response.statusText}`)
      }
      return await response.json()
    } finally {
      if (timer) clearTimeout(timer)
    }
  }

  private unwrap<T>(json: any, method: string): T {
    if (json?.error) {
      throw new RpcError(method, json.error.code, json.error.message || 'RPC 错误', json.error.data)
    }
    return json?.result as T
  }

  // ——————————————— 常用方法封装 ———————————————

  getChainId(): Promise<string> {
    return this.request<string>('eth_chainId')
  }

  async getBlockNumber(): Promise<number> {
    return this.hexToNumber(await this.request<string>('eth_blockNumber'))
  }

  getBlock(numberOrTag: number | string, withTransactions = false): Promise<RpcBlock | null> {
    const tag = typeof numberOrTag === 'number' ? this.numberToHex(numberOrTag) : numberOrTag
    return this.request<RpcBlock | null>('eth_getBlockByNumber', [tag, withTransactions])
  }

  getBlocks(numbers: number[], withTransactions = false): Promise<Array<RpcBlock | null>> {
    return this.batchRequest<Array<RpcBlock | null>[number]>(
      numbers.map((n) => ({
        method: 'eth_getBlockByNumber',
        params: [this.numberToHex(n), withTransactions],
      })),
    )
  }

  getTransactionReceipt(hash: string): Promise<RpcReceipt | null> {
    return this.request<RpcReceipt | null>('eth_getTransactionReceipt', [hash])
  }

  getRawTransaction(hash: string): Promise<string | null> {
    return this.request<string | null>('eth_getRawTransactionByHash', [hash])
  }

  getCode(address: string): Promise<string> {
    return this.request<string>('eth_getCode', [address, 'latest'])
  }

  /** eth_call；失败抛 RpcError（调用方据此判断“方法不存在”与“调用回滚”） */
  ethCall(to: string, data: string, block: string | number = 'latest'): Promise<string> {
    const tag = typeof block === 'number' ? this.numberToHex(block) : block
    return this.request<string>('eth_call', [{ to, data }, tag])
  }

  ethCallBatch(calls: Array<{ to: string; data: string }>, block: string | number = 'latest'): Promise<string[]> {
    const tag = typeof block === 'number' ? this.numberToHex(block) : block
    return this.batchRequest<string>(
      calls.map((c) => ({ method: 'eth_call', params: [{ to: c.to, data: c.data }, tag] })),
    )
  }

  /** 只读调用，失败返回 null 而不抛错（用于能力探测） */
  async tryEthCall(to: string, data: string, block: string | number = 'latest'): Promise<string | null> {
    try {
      return await this.ethCall(to, data, block)
    } catch {
      return null
    }
  }

  /**
   * 读取日志。
   * 注意：本 RPC 在不限 address 时单次可返回 7 万条（21s），因此调用方必须传 address 与/或 topics。
   */
  getLogs(filter: {
    address?: string | string[]
    topics?: Array<string | string[] | null>
    fromBlock?: number | string
    toBlock?: number | string
  }): Promise<RpcLog[]> {
    const normalize = (v: number | string | undefined, fallback: string) => {
      if (v === undefined) return fallback
      return typeof v === 'number' ? this.numberToHex(v) : v
    }
    return this.request<RpcLog[]>('eth_getLogs', [
      {
        address: filter.address,
        topics: filter.topics,
        fromBlock: normalize(filter.fromBlock, '0x0'),
        toBlock: normalize(filter.toBlock, 'latest'),
      },
    ])
  }

  getLogsBatch(
    filters: Array<{
      address?: string | string[]
      topics?: Array<string | string[] | null>
      fromBlock?: number | string
      toBlock?: number | string
    }>,
  ): Promise<RpcLog[][]> {
    const normalize = (v: number | string | undefined, fallback: string) => {
      if (v === undefined) return fallback
      return typeof v === 'number' ? this.numberToHex(v) : v
    }
    return this.batchRequest<RpcLog[]>(
      filters.map((filter) => ({
        method: 'eth_getLogs',
        params: [
          {
            address: filter.address,
            topics: filter.topics,
            fromBlock: normalize(filter.fromBlock, '0x0'),
            toBlock: normalize(filter.toBlock, 'latest'),
          },
        ],
      })),
    )
  }

  async getFeeData(): Promise<{ gasPrice: string; maxPriorityFeePerGas: string | null }> {
    const [gasPrice, priority] = await Promise.all([
      this.request<string>('eth_gasPrice').catch(() => null),
      this.request<string>('eth_maxPriorityFeePerGas').catch(() => null),
    ])
    return { gasPrice: gasPrice ?? '0x0', maxPriorityFeePerGas: priority }
  }

  estimateGas(tx: { from?: string; to?: string; value?: string; data?: string }): Promise<string> {
    return this.request<string>('eth_estimateGas', [tx])
  }

  numberToHex(value: number): string {
    return '0x' + value.toString(16)
  }

  hexToNumber(value: string | null | undefined): number {
    if (!value) return 0
    return value.startsWith('0x') ? parseInt(value, 16) : Number(value)
  }
}

/** 按地址缓存客户端实例，避免重复创建 */
const clientCache = new Map<string, JsonRpcClient>()

export function getRpcClient(url: string, options?: JsonRpcClientOptions): JsonRpcClient {
  const key = `${url}::${options?.batchMaxCount ?? ''}::${options?.concurrency ?? ''}`
  let client = clientCache.get(key)
  if (!client) {
    client = new JsonRpcClient(url, options)
    clientCache.set(key, client)
  }
  return client
}

export function resetRpcClients(): void {
  clientCache.clear()
}
