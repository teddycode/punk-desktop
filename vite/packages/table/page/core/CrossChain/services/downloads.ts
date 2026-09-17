/**
 * 跨链区 · 搬运工具与运行包清单
 *
 * 定位：这些文件是提供给用户**自行运行**的外部工具。应用只负责提供下载与说明，
 * 不代运行、不持有私钥、不接触用户的搬运账户。
 *
 * 说明：symbol → 文件的映射属于“文件清单”，不参与业务判断（业务类型与验证器全部来自链上）。
 */

import sepBundleUrl from '../relay-bundles/sep_relay_bundle.zip?url'
import lclBundleUrl from '../relay-bundles/lcl_relay_bundle.zip?url'
import lclNodeBundleUrl from '../node-bundles/lcl_node_bundle.zip?url'
import sscScriptUrl from '../relay-scripts/ssc_relay_runner.py?url'
import btcScriptUrl from '../relay-scripts/btc_relay_runner.py?url'
import btrScriptUrl from '../relay-scripts/btr_relay_runner.py?url'
import ethScriptUrl from '../relay-scripts/eth_relay_runner.py?url'

export interface DownloadItem {
  kind: 'bundle' | 'node' | 'script'
  symbol: string
  fileName: string
  url: string
  label: string
  /** 运行条件说明（转述自各包 README） */
  requirements: string
  /** 启动示例命令 */
  startCommand?: string
}

const PRESETS: DownloadItem[] = [
  {
    kind: 'bundle',
    symbol: 'LCL',
    fileName: 'lcl_relay_bundle.zip',
    url: lclBundleUrl,
    label: '下载 LCL 完整运行包',
    requirements: '需要 Python 3.10 或更高版本；不包含全节点客户端；需自行填写源链 RPC 与搬运账户私钥（在 .env 中）。',
    startCommand: 'python lcl_relay_runner.py --env dev --batch-size 4 --interval 1 --confirmations 2',
  },
  {
    kind: 'bundle',
    symbol: 'SEP',
    fileName: 'sep_relay_bundle.zip',
    url: sepBundleUrl,
    label: '下载 SEP 完整运行包',
    requirements: '需要 Python 3.10 或更高版本；需自行填写源链 RPC 与搬运账户私钥（在 .env 中）。',
    startCommand: 'python sep_relay_runner.py --env dev --confirmations 12',
  },
  {
    kind: 'node',
    symbol: 'LCL',
    fileName: 'lcl_node_bundle.zip',
    url: lclNodeBundleUrl,
    label: '下载 LCL 全节点客户端包',
    requirements: '解压后按 README 安装固定版本 Geth 并同步 LCL；需要能访问指定的内网节点。',
  },
  {
    kind: 'script',
    symbol: 'SSC',
    fileName: 'ssc_relay_runner.py',
    url: sscScriptUrl,
    label: '下载 SSC 搬运脚本',
    requirements: '需要 Python 运行环境与可访问的 SSC 节点 RPC。',
  },
  {
    kind: 'script',
    symbol: 'BTC',
    fileName: 'btc_relay_runner.py',
    url: btcScriptUrl,
    label: '下载 BTC 搬运脚本',
    requirements: '需要 Python 运行环境与可访问的 BTC 节点 RPC。',
  },
  {
    kind: 'script',
    symbol: 'BTR',
    fileName: 'btr_relay_runner.py',
    url: btrScriptUrl,
    label: '下载 BTR 搬运脚本',
    requirements: '需要 Python 运行环境与可访问的 BTR 节点 RPC。',
  },
  {
    kind: 'script',
    symbol: 'ETH',
    fileName: 'eth_relay_runner.py',
    url: ethScriptUrl,
    label: '下载 ETH 搬运脚本',
    requirements: '需要 Python 运行环境与可访问的 ETH 节点 RPC。',
  },
]

export function getDownloads(symbol?: string | null): DownloadItem[] {
  if (!symbol) return PRESETS
  const key = String(symbol).trim().toUpperCase()
  return PRESETS.filter((item) => item.symbol === key)
}

export function hasDownloads(symbol?: string | null): boolean {
  return Boolean(symbol) && getDownloads(symbol).length > 0
}

export function allDownloads(): DownloadItem[] {
  return PRESETS
}

export interface DownloadMeta {
  sizeBytes: number | null
  sha256: string | null
  error?: string
}

/**
 * 读取文件大小，并尝试计算 SHA-256。
 * 注意：SHA-256 依赖 crypto.subtle（仅安全上下文可用）。不可用时返回 null 并给出说明，
 * 界面据此显示“未提供校验”。
 */
export async function inspectDownload(url: string, wantChecksum = false): Promise<DownloadMeta> {
  try {
    const response = await fetch(url)
    if (!response.ok) return { sizeBytes: null, sha256: null, error: `HTTP ${response.status}` }
    const buffer = await response.arrayBuffer()
    let sha256: string | null = null
    if (wantChecksum) {
      const subtle = (globalThis as any)?.crypto?.subtle
      if (subtle?.digest) {
        const digest = await subtle.digest('SHA-256', buffer)
        sha256 = Array.from(new Uint8Array(digest))
          .map((byte) => byte.toString(16).padStart(2, '0'))
          .join('')
      }
    }
    return { sizeBytes: buffer.byteLength, sha256 }
  } catch (error: any) {
    return { sizeBytes: null, sha256: null, error: error?.message || '读取失败' }
  }
}

export function formatSize(bytes?: number | null): string {
  if (!bytes && bytes !== 0) return '未知'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
