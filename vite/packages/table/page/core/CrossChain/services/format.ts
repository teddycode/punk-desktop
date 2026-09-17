/**
 * 跨链区 · 展示格式化工具（统一文案与数值口径）
 */

import { ethers } from 'ethers'
import { TASK_LABEL_COLOR, TASK_LABEL_TEXT, TaskLabel } from './abi'

export function formatWei(wei: string | number | undefined | null, symbol = 'PUNK', digits = 4): string {
  if (wei === undefined || wei === null || wei === '') return '—'
  try {
    const value = ethers.utils.formatEther(ethers.BigNumber.from(wei))
    const numeric = Number(value)
    if (numeric === 0) return `0 ${symbol}`
    const fixed = numeric < 0.0001 ? '<0.0001' : numeric.toFixed(digits).replace(/0+$/, '').replace(/\.$/, '')
    return `${fixed} ${symbol}`
  } catch {
    return `— ${symbol}`
  }
}

export function shortenAddress(address?: string | null, head = 6, tail = 4): string {
  if (!address) return '—'
  if (address === ethers.constants.AddressZero) return '零地址'
  if (address.length <= head + tail + 3) return address
  return `${address.slice(0, head)}…${address.slice(-tail)}`
}

export function shortenHash(hash?: string | null): string {
  return shortenAddress(hash, 10, 8)
}

/** 状态标签文案（注意 2 = 已接单，不是“进行中”） */
export function labelText(label: number | undefined): string {
  if (label === undefined || label === null) return '未知'
  return TASK_LABEL_TEXT[label] ?? `未知(${label})`
}

/** 状态标签样式类 */
export function labelClass(label: number | undefined): string {
  const key = label === undefined || label === null ? TaskLabel.Default : label
  return `is-${TASK_LABEL_COLOR[key] ?? 'default'}`
}

/** payload 预览 */
export function payloadPreview(payload?: string | null, maxLength = 26): string {
  if (!payload || payload === '0x') return '空'
  if (payload.length <= maxLength) return payload
  return `${payload.slice(0, maxLength / 2)}…${payload.slice(-6)}`
}

/** payload 字节长度 */
export function payloadBytes(payload?: string | null): number {
  if (!payload || payload === '0x') return 0
  return Math.floor((payload.length - 2) / 2)
}

/** 尝试把 payload 当文本解码（失败返回 null） */
export function tryDecodePayloadText(payload?: string | null): string | null {
  if (!payload || payload === '0x') return null
  try {
    const bytes = ethers.utils.arrayify(payload)
    const text = new TextDecoder().decode(bytes).replace(/\u0000/g, '').trim()
    if (!text) return null
    // 只保留可打印字符，否则视为二进制
    if (!/^[\x20-\x7E\u4e00-\u9fa5\s]*$/.test(text)) return null
    return text
  } catch {
    return null
  }
}

export function formatTimestamp(timestamp?: number | null): string {
  if (!timestamp) return '—'
  const date = new Date(timestamp * 1000)
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export function formatRelative(timestamp?: number | null): string {
  if (!timestamp) return ''
  const diff = Date.now() / 1000 - timestamp
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`
  return `${Math.floor(diff / 86400)} 天前`
}

/** 复制到剪贴板（带降级） */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* 降级 */
  }
  try {
    const input = document.createElement('textarea')
    input.value = text
    input.style.position = 'fixed'
    input.style.opacity = '0'
    document.body.appendChild(input)
    input.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(input)
    return ok
  } catch {
    return false
  }
}

/** 是否是 32 字节 hex */
export function isBytes32(value?: string | null): boolean {
  return Boolean(value && /^0x[0-9a-fA-F]{64}$/.test(value))
}

/** 通用 hex 校验 */
export function isHex(value?: string | null, allowEmpty = false): boolean {
  if (!value) return false
  if (allowEmpty && value === '0x') return true
  return /^0x([0-9a-fA-F]{2})+$/.test(value)
}
