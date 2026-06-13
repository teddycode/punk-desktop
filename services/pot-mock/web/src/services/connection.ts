export interface ConnectionConfig {
  apiBaseUrl: string
  wsUrl: string
  useMock: boolean
}

const STORAGE_KEY = 'pot-node-connection-config'

export const CONNECTION_CONFIG_EVENT = 'pot-node-connection-change'

const DEFAULT_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const DEFAULT_USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

function normalizeBaseUrl(value?: string) {
  const trimmed = (value || '').trim()
  if (!trimmed) {
    return DEFAULT_API_BASE_URL
  }
  return trimmed.replace(/\/+$/, '') || '/'
}

export function deriveWebSocketUrl(apiBaseUrl?: string) {
  const baseUrl = normalizeBaseUrl(apiBaseUrl)
  const wsUrl = new URL(baseUrl, window.location.origin)
  wsUrl.protocol = wsUrl.protocol === 'https:' ? 'wss:' : 'ws:'
  wsUrl.pathname = `${wsUrl.pathname.replace(/\/$/, '')}/ws`
  wsUrl.search = ''
  wsUrl.hash = ''
  return wsUrl.toString()
}

export function getDefaultConnectionConfig(): ConnectionConfig {
  const apiBaseUrl = normalizeBaseUrl(DEFAULT_API_BASE_URL)
  return {
    apiBaseUrl,
    wsUrl: deriveWebSocketUrl(apiBaseUrl),
    useMock: DEFAULT_USE_MOCK,
  }
}

export function getConnectionConfig(): ConnectionConfig {
  const defaults = getDefaultConnectionConfig()
  const raw = window.localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return defaults
  }

  try {
    const saved = JSON.parse(raw) as Partial<ConnectionConfig>
    const apiBaseUrl = normalizeBaseUrl(saved.apiBaseUrl || defaults.apiBaseUrl)
    return {
      apiBaseUrl,
      wsUrl: saved.wsUrl ? saved.wsUrl.trim() : deriveWebSocketUrl(apiBaseUrl),
      useMock: typeof saved.useMock === 'boolean' ? saved.useMock : defaults.useMock,
    }
  } catch (error) {
    console.warn('[Connection] Failed to parse saved config:', error)
    return defaults
  }
}

export function saveConnectionConfig(config: Partial<ConnectionConfig>) {
  const apiBaseUrl = normalizeBaseUrl(config.apiBaseUrl)
  const nextConfig: ConnectionConfig = {
    apiBaseUrl,
    wsUrl: config.wsUrl ? config.wsUrl.trim() : deriveWebSocketUrl(apiBaseUrl),
    useMock: Boolean(config.useMock),
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextConfig))
  window.dispatchEvent(
    new CustomEvent<ConnectionConfig>(CONNECTION_CONFIG_EVENT, { detail: nextConfig })
  )

  return nextConfig
}

export function resetConnectionConfig() {
  const defaults = getDefaultConnectionConfig()
  window.localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(
    new CustomEvent<ConnectionConfig>(CONNECTION_CONFIG_EVENT, { detail: defaults })
  )
  return defaults
}
