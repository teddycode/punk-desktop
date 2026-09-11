import { ref, computed } from 'vue'
import { ethers } from 'ethers'
import { message } from 'ant-design-vue'

const account = ref('')
const authorizedAccounts = ref([])
const connecting = ref(false)
const chainId = ref('')

const PUNKCHAIN_CHAIN_ID = '0x1352642'
const LOCALHOST_CHAIN_ID = '0x7a69'
const MANUAL_DISCONNECT_KEY = 'governance.wallet.manualDisconnect'

const NETWORKS = {
  punkchain: {
    chainId: PUNKCHAIN_CHAIN_ID,
    label: 'PunkChain'
  },
  localhost: {
    chainId: LOCALHOST_CHAIN_ID,
    label: 'Localhost',
    addParams: {
      chainId: LOCALHOST_CHAIN_ID,
      chainName: 'Localhost',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: ['http://127.0.0.1:8545'],
      blockExplorerUrls: []
    }
  }
}

let initialized = false
let listenersBound = false
let connectAttemptId = 0
let cachedEthereumProvider = null

const storage = () => {
  if (typeof window === 'undefined') return null
  return window.localStorage
}

const hasManualDisconnect = () => storage()?.getItem(MANUAL_DISCONNECT_KEY) === '1'
const rememberManualDisconnect = () => storage()?.setItem(MANUAL_DISCONNECT_KEY, '1')
const clearManualDisconnect = () => storage()?.removeItem(MANUAL_DISCONNECT_KEY)

const requestWithTimeout = (requestPromise, timeoutMs, timeoutMessage) => {
  let timeoutId
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => {
      reject(new Error(timeoutMessage))
    }, timeoutMs)
  })

  return Promise.race([requestPromise, timeoutPromise]).finally(() => {
    window.clearTimeout(timeoutId)
  })
}

const getConnectionTimeoutMessage = () => {
  const fileHint = window.location?.protocol === 'file:'
    ? ' If you opened dist/index.html directly, enable MetaMask file URL access or serve the page over localhost.'
    : ''
  return `MetaMask did not respond. Please unlock MetaMask, check whether a popup is hidden, then try again.${fileHint}`
}

const getEthereumProvider = () => {
  if (typeof window === 'undefined') return null
  if (cachedEthereumProvider) return cachedEthereumProvider
  const ethereum = window.ethereum
  if (!ethereum) return null
  if (ethereum.isMetaMask) return ethereum
  return ethereum.providers?.find?.((provider) => provider.isMetaMask) || ethereum
}

const discoverEthereumProvider = async () => {
  if (typeof window === 'undefined') return null
  if (cachedEthereumProvider) return cachedEthereumProvider

  const announcedProviders = []
  if (window.addEventListener && window.dispatchEvent) {
    await new Promise((resolve) => {
      const handler = (event) => {
        if (event?.detail?.provider) {
          announcedProviders.push(event.detail)
        }
      }
      window.addEventListener('eip6963:announceProvider', handler)
      window.dispatchEvent(new Event('eip6963:requestProvider'))
      window.setTimeout(() => {
        window.removeEventListener('eip6963:announceProvider', handler)
        resolve()
      }, 400)
    })
  }

  const metamaskAnnouncement = announcedProviders.find((item) => (
    item.provider?.isMetaMask || item.info?.rdns === 'io.metamask' || /metamask/i.test(item.info?.name || '')
  ))
  if (metamaskAnnouncement?.provider) {
    cachedEthereumProvider = metamaskAnnouncement.provider
    return cachedEthereumProvider
  }

  const provider = getEthereumProvider()
  if (provider) cachedEthereumProvider = provider
  return provider
}

const shortAddress = computed(() => {
  if (!account.value) return ''
  return `${account.value.slice(0, 6)}...${account.value.slice(-4)}`
})

const isConnected = computed(() => Boolean(account.value))

const networkName = computed(() => {
  const id = chainId.value?.toLowerCase()
  if (id === PUNKCHAIN_CHAIN_ID) return 'PunkChain'
  if (id === LOCALHOST_CHAIN_ID) return 'Localhost'
  if (!id) return 'Unknown network'
  return `Chain ${Number.parseInt(id, 16)}`
})

const isPunkChain = computed(() => chainId.value?.toLowerCase() === PUNKCHAIN_CHAIN_ID)
const isLocalhost = computed(() => chainId.value?.toLowerCase() === LOCALHOST_CHAIN_ID)

const normalizeAccounts = (accounts) => (
  (accounts || []).map((item) => ethers.getAddress(item))
)

const setAccounts = (accounts) => {
  if (hasManualDisconnect()) {
    account.value = ''
    authorizedAccounts.value = []
    return
  }
  const normalized = normalizeAccounts(accounts)
  authorizedAccounts.value = normalized
  if (!normalized.length) {
    account.value = ''
    return
  }
  if (!normalized.some((item) => item.toLowerCase() === account.value.toLowerCase())) {
    account.value = normalized[0]
  }
}

const setAccountsFromUserConnect = (accounts) => {
  clearManualDisconnect()
  const normalized = normalizeAccounts(accounts)
  authorizedAccounts.value = normalized
  account.value = normalized.length ? normalized[0] : ''
}

const ensureMetaMask = async () => {
  const provider = await discoverEthereumProvider()
  if (!provider) {
    const fileHint = window.location?.protocol === 'file:'
      ? ' If opening dist/index.html directly, enable MetaMask file URL access or serve it over localhost.'
      : ''
    message.error(`MetaMask not detected. Please open this page in a browser with MetaMask enabled.${fileHint}`)
    return null
  }
  return provider
}

const connect = async () => {
  if (connecting.value) return false
  clearManualDisconnect()
  const ethereum = await ensureMetaMask()
  if (!ethereum) return false
  const attemptId = ++connectAttemptId
  let timedOut = false
  connecting.value = true
  const watchdogId = window.setTimeout(() => {
    if (connectAttemptId !== attemptId) return
    timedOut = true
    connecting.value = false
    message.error(getConnectionTimeoutMessage())
  }, 12000)

  try {
    const permissions = await requestWithTimeout(
      ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }]
      }),
      10000,
      getConnectionTimeoutMessage()
    ).catch(async (err) => {
      if (err?.code === 4001) throw err
      await requestWithTimeout(
        ethereum.request({ method: 'eth_requestAccounts' }),
        10000,
        getConnectionTimeoutMessage()
      )
      return []
    })

    const allowedAccounts = permissions?.[0]?.caveats?.find?.((c) => (
      c.type === 'restrictReturnedAccounts'
    ))?.value
    const accounts = allowedAccounts?.length
      ? allowedAccounts
      : await requestWithTimeout(
          ethereum.request({ method: 'eth_accounts' }),
          4000,
          'Failed to read selected wallet account.'
        )

    if (connectAttemptId !== attemptId || timedOut) return false
    setAccountsFromUserConnect(accounts)
    chainId.value = await requestWithTimeout(
      ethereum.request({ method: 'eth_chainId' }),
      8000,
      'Failed to read wallet network. Please try again.'
    )
    if (connectAttemptId !== attemptId || timedOut) return false
    message.success('Wallet connected')
    return true
  } catch (err) {
    if (connectAttemptId !== attemptId || timedOut) return false
    if (err && err.code === 4001) {
      message.warning('Connection request rejected')
    } else {
      message.error(err?.shortMessage || err?.message || 'Failed to connect wallet')
    }
    return false
  } finally {
    window.clearTimeout(watchdogId)
    if (connectAttemptId === attemptId) {
      connecting.value = false
    }
  }
}

const switchAccount = async () => {
  const ethereum = await ensureMetaMask()
  if (!ethereum) return
  try {
    const result = await ethereum.request({
      method: 'wallet_requestPermissions',
      params: [{ eth_accounts: {} }]
    })
    const allowed = result?.[0]?.caveats?.find?.((c) => c.type === 'restrictReturnedAccounts')?.value
    if (allowed && allowed.length) {
      setAccountsFromUserConnect(allowed)
    } else {
      const refreshed = await ethereum.request({ method: 'eth_accounts' })
      setAccountsFromUserConnect(refreshed)
    }
  } catch (err) {
    if (err && err.code === 4001) return
    message.error(err?.shortMessage || err?.message || 'Failed to switch account')
  }
}

const refreshAuthorizedAccounts = async () => {
  const ethereum = await discoverEthereumProvider()
  if (!ethereum || hasManualDisconnect()) return []
  try {
    const accounts = await ethereum.request({ method: 'eth_accounts' })
    setAccounts(accounts)
    return authorizedAccounts.value
  } catch {
    return authorizedAccounts.value
  }
}

const selectAccount = async (address) => {
  const normalizedAddress = ethers.getAddress(address)
  const exists = authorizedAccounts.value.some((item) => (
    item.toLowerCase() === normalizedAddress.toLowerCase()
  ))
  if (!exists) {
    message.warning('This account is not authorized for the current site. Use Manage accounts first.')
    return false
  }

  clearManualDisconnect()
  account.value = normalizedAddress

  const ethereum = await discoverEthereumProvider()
  if (ethereum) {
    try {
      chainId.value = await ethereum.request({ method: 'eth_chainId' })
    } catch {
      // ignore
    }
  }

  message.success('Wallet account switched')
  return true
}

const switchToNetwork = async (networkKey) => {
  const ethereum = await ensureMetaMask()
  if (!ethereum) return false
  const target = NETWORKS[networkKey]
  if (!target) return false

  if (chainId.value?.toLowerCase() === target.chainId) {
    message.info(`Already on ${target.label}`)
    return true
  }

  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: target.chainId }]
    })
    chainId.value = target.chainId
    message.success(`Switched to ${target.label}`)
    return true
  } catch (err) {
    if (err?.code === 4902) {
      if (target.addParams) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [target.addParams]
          })
          chainId.value = target.chainId
          message.success(`${target.label} network added`)
          return true
        } catch (addErr) {
          if (addErr?.code !== 4001) {
            message.error(addErr?.shortMessage || addErr?.message || `Failed to add ${target.label}`)
          }
          return false
        }
      }

      message.warning(`Please add ${target.label} manually in MetaMask first`)
      return false
    }
    if (err?.code !== 4001) {
      message.error(err?.shortMessage || err?.message || 'Failed to switch network')
    }
    return false
  }
}

const switchToPunkChain = () => switchToNetwork('punkchain')
const switchToLocalhost = () => switchToNetwork('localhost')

const disconnect = () => {
  rememberManualDisconnect()
  connectAttemptId += 1
  account.value = ''
  authorizedAccounts.value = []
  chainId.value = ''
  connecting.value = false
  message.success('Wallet disconnected')
}

const copyAddress = async () => {
  if (!account.value) return
  try {
    await navigator.clipboard.writeText(account.value)
    message.success('Address copied')
  } catch {
    message.error('Copy failed')
  }
}

const getProvider = () => {
  const ethereum = getEthereumProvider()
  if (!ethereum) return null
  return new ethers.BrowserProvider(ethereum)
}

const getSigner = async () => {
  const ethereum = await discoverEthereumProvider()
  if (!ethereum) return null
  const provider = new ethers.BrowserProvider(ethereum)
  return account.value ? provider.getSigner(account.value) : provider.getSigner()
}

const init = async () => {
  if (initialized) return
  initialized = true
  if (hasManualDisconnect()) return
  const ethereum = await discoverEthereumProvider()
  if (!ethereum) return
  try {
    const accounts = await ethereum.request({ method: 'eth_accounts' })
    setAccounts(accounts)
    chainId.value = await ethereum.request({ method: 'eth_chainId' })
  } catch {
    // ignore
  }
  if (!listenersBound) {
    listenersBound = true
    ethereum.on?.('accountsChanged', setAccounts)
    ethereum.on?.('chainChanged', (id) => {
      chainId.value = id
    })
  }
}

export function useWallet() {
  if (!initialized) init()
  return {
    account,
    authorizedAccounts,
    chainId,
    networkName,
    isPunkChain,
    isLocalhost,
    connecting,
    isConnected,
    shortAddress,
    connect,
    disconnect,
    switchAccount,
    refreshAuthorizedAccounts,
    selectAccount,
    switchToPunkChain,
    switchToLocalhost,
    copyAddress,
    getProvider,
    getSigner
  }
}
