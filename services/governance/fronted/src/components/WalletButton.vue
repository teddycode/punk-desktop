<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useWallet } from '../composables/useWallet'

const {
  account,
  authorizedAccounts,
  connecting,
  isConnected,
  isPunkChain,
  isLocalhost,
  networkName,
  shortAddress,
  connect,
  disconnect,
  switchAccount,
  refreshAuthorizedAccounts,
  selectAccount,
  switchToPunkChain,
  switchToLocalhost,
  copyAddress
} = useWallet()

const menuOpen = ref(false)
const accountListOpen = ref(false)
const networkListOpen = ref(false)
const rootRef = ref(null)

const networks = computed(() => [
  {
    key: 'punkchain',
    label: 'PunkChain',
    description: 'Chain 20260418',
    isCurrent: isPunkChain.value
  },
  {
    key: 'localhost',
    label: 'Localhost',
    description: 'Chain 31337',
    isCurrent: isLocalhost.value
  }
])

const togglePill = () => {
  if (!isConnected.value) {
    connect()
    return
  }
  menuOpen.value = !menuOpen.value
}

const onCopy = async () => {
  await copyAddress()
  menuOpen.value = false
}

const onSwitch = async () => {
  accountListOpen.value = !accountListOpen.value
  if (accountListOpen.value) networkListOpen.value = false
  await refreshAuthorizedAccounts()
}

const onSelectAccount = async (address) => {
  const switched = await selectAccount(address)
  if (switched) {
    accountListOpen.value = false
    menuOpen.value = false
  }
}

const onManageAccounts = async () => {
  await switchAccount()
  await refreshAuthorizedAccounts()
}

const onToggleNetworks = () => {
  networkListOpen.value = !networkListOpen.value
  if (networkListOpen.value) accountListOpen.value = false
}

const onSelectNetwork = async (networkKey) => {
  if (networkKey === 'punkchain' && isPunkChain.value) return
  if (networkKey === 'localhost' && isLocalhost.value) return

  const switched = networkKey === 'punkchain'
    ? await switchToPunkChain()
    : await switchToLocalhost()

  if (switched) {
    networkListOpen.value = false
    menuOpen.value = false
  }
}

const onDisconnect = () => {
  menuOpen.value = false
  accountListOpen.value = false
  networkListOpen.value = false
  disconnect()
}

const onConnect = async () => {
  await connect()
}

const onDocClick = (e) => {
  if (!menuOpen.value) return
  if (rootRef.value && !rootRef.value.contains(e.target)) {
    menuOpen.value = false
    accountListOpen.value = false
    networkListOpen.value = false
  }
}

const onEsc = (e) => {
  if (e.key === 'Escape') {
    menuOpen.value = false
    accountListOpen.value = false
    networkListOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onEsc)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onEsc)
})
</script>

<template>
  <div class="wallet" ref="rootRef">
    <button
      v-if="!account"
      class="wallet-connect"
      type="button"
      :disabled="connecting"
      @click="onConnect"
    >
      <span class="wallet-connect__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="16" height="16"
          fill="none" stroke="currentColor" stroke-width="1.8"
          stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="6" width="18" height="13" rx="2.5" />
          <path d="M3 9h13a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3" />
          <circle cx="16.5" cy="12.5" r="1.1" fill="currentColor" stroke="none" />
        </svg>
      </span>
      <span>{{ connecting ? 'Connecting...' : 'Connect wallet' }}</span>
    </button>

    <button
      v-else
      class="wallet-pill"
      type="button"
      :aria-expanded="menuOpen"
      aria-haspopup="menu"
      @click.stop="togglePill"
    >
      <span class="wallet-pill__fox" aria-hidden="true">
        <svg viewBox="0 0 32 32" width="20" height="20">
          <rect width="32" height="32" rx="8" fill="#FFE7C2" />
          <path d="M7 9.5l5.5 3.6-1.7-3.9z" fill="#E2761B" />
          <path d="M25 9.5l-5.5 3.6 1.7-3.9z" fill="#E2761B" />
          <path d="M22.6 19.6l-1.6 2.4 3.4 1 1-3.3z" fill="#E4761B" />
          <path d="M7 19.7l1 3.3 3.4-1-1.6-2.4z" fill="#E4761B" />
          <path d="M11.2 15.1l-1 1.5 3.4.15-.12-3.65z" fill="#E4761B" />
          <path d="M20.8 15.1l-2.4-2.05-.08 3.7 3.4-.15z" fill="#E4761B" />
          <path d="M11.4 22l2.05-1-1.77-1.38z" fill="#E4761B" />
          <path d="M18.55 21l2.05 1-.28-2.38z" fill="#E4761B" />
          <path d="M20.6 23l-2.05-1 .16 1.34-.02.57z" fill="#D7C1B3" />
          <path d="M11.4 23l1.91.91-.01-.57.15-1.34z" fill="#D7C1B3" />
          <path d="M13.35 18.4l-1.7-.5 1.2-.55z" fill="#233447" />
          <path d="M18.65 18.4l.5-1.05 1.21.55z" fill="#233447" />
          <path d="M11.4 23l.3-2.4-1.85.05z" fill="#CD6116" />
          <path d="M20.3 20.6l.3 2.4 1.55-2.35z" fill="#CD6116" />
          <path d="M11.65 18.46l.05 1.38 1.85 1.45.3-.21-.42-2.18z" fill="#F6851B" />
          <path d="M18.72 18.9l-.42 2.18.3.21 1.85-1.45.05-1.38z" fill="#F6851B" />
          <path d="M22.04 16.69l-2.88-.84.86 1.32-1.3 2.51 1.7-.02h2.55zM12.83 15.85l-2.88.84-.95 2.97h2.55l1.7.02-1.31-2.51zM18.4 16.75l.18-3.18.83-2.26h-3.7l.83 2.26.18 3.18.07 1.01v2.91h2.5v-2.91z" fill="#F6851B" />
        </svg>
      </span>
      <span class="wallet-pill__addr">{{ shortAddress }}</span>
      <span class="wallet-pill__caret" aria-hidden="true" :class="{ 'is-open': menuOpen }">
        <svg viewBox="0 0 12 8" width="10" height="6">
          <path d="M1 2 L6 6 L11 2" stroke="currentColor" stroke-width="1.7" fill="none"
            stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
    </button>

    <transition name="menu">
      <div v-if="menuOpen && account" class="wallet-menu" role="menu" @click.stop>
        <div class="wallet-menu__head">
          <span class="wallet-menu__fox" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="28" height="28">
              <rect width="32" height="32" rx="9" fill="#FFE7C2" />
              <path d="M7 9.5l5.5 3.6-1.7-3.9z M25 9.5l-5.5 3.6 1.7-3.9z" fill="#E2761B" />
              <path d="M22.04 16.69l-2.88-.84.86 1.32-1.3 2.51 1.7-.02h2.55zM12.83 15.85l-2.88.84-.95 2.97h2.55l1.7.02-1.31-2.51z" fill="#F6851B" />
              <path d="M11.65 18.46l.05 1.38 1.85 1.45.3-.21-.42-2.18z M18.72 18.9l-.42 2.18.3.21 1.85-1.45.05-1.38z" fill="#F6851B" />
            </svg>
          </span>
          <div class="wallet-menu__addr">
            <span class="wallet-menu__label">Connected wallet</span>
            <span class="wallet-menu__value">{{ shortAddress }}</span>
            <span class="wallet-menu__network">{{ networkName }}</span>
          </div>
        </div>
        <div class="wallet-menu__sep" />
        <button class="wallet-menu__item" type="button" role="menuitem" @click="onCopy">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
            stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="11" height="11" rx="2" />
            <path d="M5 15V6a2 2 0 0 1 2-2h9" />
          </svg>
          Copy address
        </button>
        <button class="wallet-menu__item" type="button" role="menuitem" @click="onSwitch">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
            stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 8h13l-3-3" />
            <path d="M20 16H7l3 3" />
          </svg>
          <span>Switch account</span>
          <span class="wallet-menu__badge">{{ authorizedAccounts.length }}</span>
        </button>
        <div v-if="accountListOpen" class="wallet-accounts" role="group" aria-label="Authorized accounts">
          <button
            v-for="item in authorizedAccounts"
            :key="item"
            class="wallet-account"
            type="button"
            :class="{ 'is-active': item.toLowerCase() === account.toLowerCase() }"
            @click="onSelectAccount(item)"
          >
            <span class="wallet-account__dot"></span>
            <span class="wallet-account__text">{{ item.slice(0, 6) }}...{{ item.slice(-4) }}</span>
            <span v-if="item.toLowerCase() === account.toLowerCase()" class="wallet-account__current">Current</span>
          </button>
          <button class="wallet-account wallet-account--manage" type="button" @click="onManageAccounts">
            Manage accounts in MetaMask
          </button>
        </div>
        <button class="wallet-menu__item" type="button" role="menuitem" @click="onToggleNetworks">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
            stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="8" />
            <path d="M4 12h16" />
            <path d="M12 4a12 12 0 0 1 0 16" />
            <path d="M12 4a12 12 0 0 0 0 16" />
          </svg>
          <span>Switch network</span>
          <span class="wallet-menu__badge">{{ networkName }}</span>
        </button>
        <div v-if="networkListOpen" class="wallet-accounts" role="group" aria-label="Available networks">
          <button
            v-for="item in networks"
            :key="item.key"
            class="wallet-account"
            type="button"
            :class="{ 'is-active': item.isCurrent }"
            :disabled="item.isCurrent"
            @click="onSelectNetwork(item.key)"
          >
            <span class="wallet-account__dot"></span>
            <span class="wallet-account__body">
              <span class="wallet-account__text">{{ item.label }}</span>
              <span class="wallet-account__desc">{{ item.description }}</span>
            </span>
            <span v-if="item.isCurrent" class="wallet-account__current">Current</span>
          </button>
        </div>
        <button class="wallet-menu__item wallet-menu__item--danger" type="button" role="menuitem" @click="onDisconnect">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
            stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 12h12l-3-3 m3 3-3 3" />
            <path d="M14 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8" />
          </svg>
          Disconnect
        </button>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.wallet {
  position: relative;
  font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, sans-serif;
}

.wallet-connect {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  background: #5C46FF;
  color: #FFFFFF;
  font-family: inherit;
  font-weight: 700;
  font-size: 15px;
  border: none;
  border-radius: 14px;
  padding: 14px 22px;
  cursor: pointer;
  box-shadow: 0 6px 18px -10px rgba(92, 70, 255, 0.7);
  transition: background-color 200ms ease, transform 80ms ease, box-shadow 200ms ease;
}
.wallet-connect:hover { background: #4A36F0; }
.wallet-connect:active { transform: translateY(1px); }
.wallet-connect:focus-visible { outline: 2px solid #14233E; outline-offset: 2px; }
.wallet-connect:disabled { opacity: 0.7; cursor: progress; }
.wallet-connect__icon { display: inline-flex; }

.wallet-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 7px 14px 7px 7px;
  background: #FFFFFF;
  color: #14233E;
  font-family: inherit;
  font-weight: 600;
  font-size: 14px;
  border: 1px solid #E5E8EE;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(20, 35, 62, 0.06);
  transition: background-color 200ms ease, border-color 200ms ease, box-shadow 200ms ease;
}
.wallet-pill:hover { background: #F7F8FB; border-color: #D7DCE3; }
.wallet-pill:focus-visible { outline: 2px solid #5C46FF; outline-offset: 2px; }

.wallet-pill__fox {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #FFE7C2;
  overflow: hidden;
  flex: 0 0 auto;
}
.wallet-pill__addr {
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.01em;
}
.wallet-pill__caret {
  display: inline-flex;
  color: #6E7A8C;
  transition: transform 200ms ease;
}
.wallet-pill__caret.is-open { transform: rotate(180deg); }

.wallet-menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 240px;
  background: #FFFFFF;
  border: 1px solid #ECEEF2;
  border-radius: 14px;
  box-shadow:
    0 18px 50px -18px rgba(20, 35, 62, 0.22),
    0 4px 12px rgba(20, 35, 62, 0.06);
  padding: 8px;
  z-index: 30;
}

.wallet-menu__head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 10px 12px;
}
.wallet-menu__fox {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #FFE7C2;
}
.wallet-menu__addr {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.wallet-menu__label {
  font-size: 12px;
  color: #6E7A8C;
  font-weight: 500;
}
.wallet-menu__value {
  font-size: 14px;
  font-weight: 700;
  color: #14233E;
  font-variant-numeric: tabular-nums;
}
.wallet-menu__network {
  font-size: 12px;
  font-weight: 600;
  color: #5C46FF;
}

.wallet-menu__sep {
  height: 1px;
  background: #ECEEF2;
  margin: 4px 6px 6px;
}

.wallet-menu__item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 10px;
  background: transparent;
  border: none;
  border-radius: 10px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  color: #14233E;
  text-align: left;
  cursor: pointer;
  transition: background-color 150ms ease, color 150ms ease;
}
.wallet-menu__item svg {
  flex: 0 0 auto;
}
.wallet-menu__item > span:not(.wallet-menu__badge) {
  min-width: 0;
  flex: 1 1 auto;
  white-space: nowrap;
}
.wallet-menu__item:hover { background: #F4F5F7; }
.wallet-menu__item:focus-visible { outline: 2px solid #5C46FF; outline-offset: -2px; }
.wallet-menu__item:disabled {
  cursor: default;
  opacity: 0.78;
}
.wallet-menu__item:disabled:hover { background: transparent; }
.wallet-menu__badge {
  margin-left: auto;
  padding: 2px 7px;
  border-radius: 999px;
  background: #EEF2FF;
  color: #4F46E5;
  font-size: 11px;
  font-weight: 700;
  flex: 0 0 auto;
  max-width: 116px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.wallet-menu__item--danger { color: #D14343; }
.wallet-menu__item--danger:hover { background: #FDECEC; }

.wallet-accounts {
  margin: 2px 4px 6px 36px;
  padding: 6px;
  background: #F7F8FB;
  border: 1px solid #ECEEF2;
  border-radius: 10px;
}
.wallet-account {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 34px;
  padding: 7px 8px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #14233E;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
}
.wallet-account:hover { background: #FFFFFF; }
.wallet-account.is-active { background: #EEF2FF; color: #4F46E5; }
.wallet-account:disabled {
  cursor: default;
}
.wallet-account:disabled:hover { background: #EEF2FF; }
.wallet-account__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #B8C0CC;
  flex: 0 0 auto;
}
.wallet-account.is-active .wallet-account__dot { background: #4F46E5; }
.wallet-account__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.wallet-account__text { font-variant-numeric: tabular-nums; }
.wallet-account__desc {
  color: #6E7A8C;
  font-size: 11px;
  font-weight: 500;
}
.wallet-account__current {
  margin-left: auto;
  font-size: 11px;
  font-weight: 700;
  color: #4F46E5;
}
.wallet-account--manage {
  justify-content: center;
  margin-top: 4px;
  color: #5C46FF;
  background: #FFFFFF;
}

.menu-enter-active, .menu-leave-active { transition: opacity 150ms ease, transform 150ms ease; }
.menu-enter-from, .menu-leave-to { opacity: 0; transform: translateY(-4px); }

@media (prefers-reduced-motion: reduce) {
  .wallet-pill, .wallet-pill__caret, .wallet-connect, .wallet-menu__item { transition: none; }
}
</style>
