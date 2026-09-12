<template>
  <div class="common-layout">
    <a-row class="header-row" type="flex" justify="space-between" align="middle" :wrap="false">
      <a-col flex="0 0 auto">
        <div class="layoutheader_Title">
          <img v-maxImg src="/img/punkos-logo.png" class="header_logo" tatile="磐古OS" />
          <span class="project-name">
            <span class="dynamicText">磐古OS</span>
          </span>
        </div>
      </a-col>
      <a-col flex="1 1 0" style="min-width: 0">
        <template v-if="!isMenu">
          <a-config-provider prefixCls="ant">
            <a-menu mode="horizontal" @select="selectChange" v-model:selectedKeys="selectedKeys">
              <template v-for="(value, index) in munePath" :key="index">
                <template :index="value.name" v-if="value && value.children">
                  <a-sub-menu :key="value.name" :index="value.path" v-if="value && value.children">
                    <template #title>
                      <span class="anticon anticon-desktop">
                        <!--                        <a-icon type="user"></a-icon>-->
                      </span>
                      <span>{{ value?.meta?.title }}</span>
                    </template>
                    <a-menu-item v-for="item in value.children" :key="item.name">
                      <span class="anticon anticon-desktop">
                        <!--                        <a-icon type="user"></a-icon>-->
                      </span>
                      <span>{{ value?.meta?.title }}</span>
                    </a-menu-item>
                  </a-sub-menu>
                </template>
                <template v-else>
                  <!-- 当value.meta.noShow不存在或为false时显示菜单 -->
                  <a-menu-item :key="value.name" v-if="!value.meta?.noShow">
                    <span class="anticon anticon-desktop">
                      <!--                      <a-icon type="user"></a-icon>-->
                    </span>
                    <span>{{ value?.meta?.title }}</span>
                  </a-menu-item>
                </template>
              </template>
            </a-menu>
          </a-config-provider>
        </template>
      </a-col>
      <a-col flex="0 0 auto">
        <div class="header-wallet-area">
          <BorderAvatar style="padding-right: 5px" :avatarSize="48" :avatarUrl="userInfo?.avatar" />
          <div class="layout-header-userBox">
            <a-dropdown>
              <div class="wallet-trigger" tabindex="0" role="button" aria-label="钱包菜单">
                <div v-if="useBrowserWallet" class="browser-wallet-summary">
                  <template v-if="browserWallet.connected">
                    <div class="browser-wallet-top"><span class="connection-dot"></span><span :title="browserWallet.address">{{ browserWallet.address.slice(0, 6) }}…{{ browserWallet.address.slice(-4) }}</span><strong :title="balanceError || balanceFull">{{ headerWalletBalance }}</strong><span aria-hidden="true">⌄</span></div>
                    <div class="browser-wallet-bottom"><span>MetaMask · {{ browserNetworkName }}</span><span :class="{ 'network-warning': Number(browserWallet.chainId) !== punkos.chainId }">{{ browserWallet.pending ? '请在浏览器确认请求' : Number(browserWallet.chainId) !== punkos.chainId ? '需切换到 PunkOS' : '已连接' }}</span></div>
                  </template>
                  <span v-else>浏览器钱包未连接 ⌄</span>
                </div>
                <div v-else-if="isConnected" class="wallet-summary">
                  <span class="wallet-balance">{{ headerWalletBalance }}</span>
                  <w3m-button balance="hide" />
                </div>
                <div class="xt-text" v-else>点击连接钱包</div>
              </div>
              <template #overlay>
                <a-menu>
                  <template v-if="isCrosschain && isWindows">
                    <a-menu-item @click="connectBrowser">连接浏览器 MetaMask</a-menu-item>
                    <a-menu-item v-if="useBrowserWallet" @click="disconnectBrowser">断开浏览器钱包</a-menu-item>
                    <a-menu-item v-if="useBrowserWallet && browserWallet.connected" @click="refreshHeaderWalletBalance">刷新余额</a-menu-item>
                    <a-menu-item v-if="useBrowserWallet && browserWallet.connected && Number(browserWallet.chainId) !== punkos.chainId" @click="switchBrowserNetwork">切换到 PunkOS 网络</a-menu-item>
                  </template>
                  <div v-if="isConnected && !useBrowserWallet">
                    <a-menu-item @click="closeWallet">断开连接</a-menu-item>
                    <a-menu-item @click="changeWallet">切换钱包</a-menu-item>
                    <a-menu-item @click="getWalletInfo">钱包信息</a-menu-item>
                    <a-menu-item @click="getUserInfo">个人信息</a-menu-item>
                    <a-menu-item @click="logOutUser">用户退出</a-menu-item>
                  </div>
                  <div v-else>
                    <a-menu-item @click="connectWallet">连接其他钱包（WalletConnect）</a-menu-item>
                  </div>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useLayoutStore } from '@store/baseSettings';
import { walletStore } from '@store/wallet';
import { arbitrum, mainnet, punkos, sepolia } from '@store/chains';
import { useRouter } from 'vue-router';
import {
  useDisconnect,
  useWeb3Modal,
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from '@punkos/ethers5/vue';
import { useUserStore } from '@store/users';
import { EyeOutlined } from '@ant-design/icons-vue';
import BorderAvatar from '@components/avatar/BorderAvatar.vue';
import { appStore } from '@store';
import { useToast } from 'vue-toastification';
import { ethers } from 'ethers';
import { setCrosschainWalletContext, ensureNetwork } from '@table/services/crosschain';
import { browserWallet, browserWalletProvider, startBrowserWalletSync, openBrowserWallet, disconnectBrowserWallet } from '@table/services/browserWallet';

const toast = useToast();

const layoutStore = useLayoutStore();
const wStore = walletStore();
const aStore = appStore();

const router = useRouter();
const isWindows = navigator.platform === 'Win32';
const isCrosschain = computed(() => router.currentRoute.value.matched.some(route => route.name === 'CrossChainPage'));
const useBrowserWallet = computed(() => isCrosschain.value && browserWallet.selected);
startBrowserWalletSync();
const connectBrowser = async () => {
  try {
    await openBrowserWallet();
    toast.info('请在浏览器连接 MetaMask，并保持钱包页面打开');
  } catch (error: any) { toast.error(error.message || '无法打开浏览器钱包'); }
};
const disconnectBrowser = async () => {
  try { await disconnectBrowserWallet(); } catch (error: any) { toast.error(error.message); }
};
const switchBrowserNetwork = async () => {
  try { toast.info('请在浏览器钱包页确认切换网络'); await ensureNetwork(); await refreshHeaderWalletBalance(); }
  catch (error: any) { toast.error(error.message || '切换网络失败'); }
};
const web3Account = useWeb3ModalAccount();
const web3Provider = useWeb3ModalProvider();
const web3Modal = useWeb3Modal();

setCrosschainWalletContext({
  walletProviderRef: web3Provider,
  walletAccountRef: web3Account,
});

const isMenu = computed(() => layoutStore.isMenu);
const isConnected = computed(() => Boolean(web3Account.isConnected.value));
const userInfo = computed(() => aStore.userInfo);
const headerWalletBalance = ref('0.000 PUNK');
const balanceError = ref('');
const balanceFull = ref('');
const chainsById = {
  [punkos.chainId]: punkos,
  [sepolia.chainId]: sepolia,
  [mainnet.chainId]: mainnet,
  [arbitrum.chainId]: arbitrum,
};
let lastBalanceRequestId = 0;
const browserNetworkName = computed(() => chainsById[Number(browserWallet.chainId)]?.name || `Chain ${Number(browserWallet.chainId)}`);

function formatBalanceDisplay(balance: string, symbol: string) {
  if (balance === '0') {
    return `0.000 ${symbol}`;
  }

  const numericBalance = Number(balance);
  if (!Number.isFinite(numericBalance) || numericBalance <= 0) {
    return `0.000 ${symbol}`;
  }

  const truncated = numericBalance.toString().match(/^-?\d+(?:\.\d{0,3})?/u)?.[0] || '0.000';
  return `${truncated} ${symbol}`;
}

async function refreshHeaderWalletBalance() {
  const requestId = ++lastBalanceRequestId;
  const address = useBrowserWallet.value ? browserWallet.address : web3Account.address.value;
  const chainId = useBrowserWallet.value ? Number(browserWallet.chainId) : web3Account.chainId.value;
  const connected = useBrowserWallet.value ? browserWallet.connected : web3Account.isConnected.value;
  balanceError.value = '';
  balanceFull.value = '';
  if (useBrowserWallet.value) {
    if (!connected || !address || !chainId) { headerWalletBalance.value = '—'; wStore.updateBalance('0'); return; }
    const symbol = chainsById[chainId]?.currency || '原生币';
    headerWalletBalance.value = `读取中…`;
    try {
      const hex = await browserWalletProvider.request({ method: 'eth_getBalance', params: [address, 'latest'] });
      const amount = ethers.utils.formatEther(hex);
      if (requestId !== lastBalanceRequestId || address !== browserWallet.address || chainId !== Number(browserWallet.chainId) || !browserWallet.connected) return;
      balanceFull.value = `${amount} ${symbol}`;
      headerWalletBalance.value = `${Number(amount) > 0 && Number(amount) < 0.0001 ? '<0.0001' : amount.replace(/(\.\d{4})\d+$/, '$1')} ${symbol}`;
      wStore.updateBalance(amount);
    } catch (error: any) {
      if (requestId !== lastBalanceRequestId) return;
      headerWalletBalance.value = '余额读取失败';
      balanceError.value = error.message || '请检查钱包网络后刷新余额';
    }
    return;
  }

  if (!connected || !address || !chainId) {
    headerWalletBalance.value = '0.000 PUNK';
    wStore.updateBalance('0');
    return;
  }

  const chain = chainsById[chainId] || punkos;
  const symbol = chain?.currency || 'PUNK';
  let formattedBalance = '0';

  try {
    const walletProvider = web3Provider.walletProvider.value as any;
    if (walletProvider?.request) {
      const hexBalance = await walletProvider.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      formattedBalance = ethers.utils.formatEther(hexBalance);
    } else {
      throw new Error('wallet provider unavailable');
    }
  } catch (walletError) {
    try {
      const rpcProvider = new ethers.providers.JsonRpcProvider(chain.rpcUrl, {
        chainId: chain.chainId,
        name: chain.name,
      });
      const balance = await rpcProvider.getBalance(address);
      formattedBalance = ethers.utils.formatEther(balance);
    } catch (rpcError) {
      console.warn('Failed to refresh wallet balance', {
        walletError,
        rpcError,
        address,
        chainId,
      });
      formattedBalance = '0';
    }
  }

  if (requestId !== lastBalanceRequestId) {
    return;
  }

  headerWalletBalance.value = formatBalanceDisplay(formattedBalance, symbol);
  wStore.updateBalance(formattedBalance);
}

const munePath = computed(() => {
  const currentRoute = router.currentRoute.value;
  if (currentRoute.matched.length < 2) return [];
  const parentRoute = currentRoute.matched[currentRoute.matched.length - 2];
  return parentRoute ? parentRoute.children : [];
});

console.log('current router:', router.currentRoute.value);
console.log('menu path:', munePath.value);

const direction = computed(() => (layoutStore.direction ? 'rtl' : 'ltr'));

// const visible = ref(false);
// const selectedKeys = ref([]);
// const activeTagView = computed(() => store.activeTagView);
// selectedKeys.value = [activeTagView.value];

const selectChange = item => {
  console.log('切换菜单：', item);
  router.push({ name: item?.key || 'home' });
};

const closeWallet = async () => {
  const key = useDisconnect();
  key.disconnect().then(() => {
    toast.success('钱包已断开连接', null);
  });
};

const connectWallet = async () => {
  if (browserWallet.selected) await disconnectBrowserWallet(true);
  await web3Modal.open({ view: 'Connect' });
};

const changeWallet = () => {
  const key = useDisconnect();
  key.disconnect().then(() => {
    toast.success('钱包已断开连接', null);
    void web3Modal.open({ view: 'Connect' });
  });
  console.log('change wallet');
};

const getUserInfo = () => {
  console.log('get user info');
};

const getWalletInfo = async () => {
  if (!web3Account.isConnected.value) {
    await web3Modal.open({ view: 'Connect' });
    return;
  }

  await web3Modal.open({ view: 'Account' });
};

const logOutUser = () => {
  if (browserWallet.selected) void disconnectBrowserWallet(true);
  useUserStore().setAuthenticated(false);
  window.localStorage.removeItem('token');
  router.push('/');
};

watch(
  [
    () => web3Account.address.value,
    () => web3Account.chainId.value,
    () => web3Account.isConnected.value,
    () => web3Provider.walletProvider.value,
    () => useBrowserWallet.value,
    () => browserWallet.address,
    () => browserWallet.chainId,
    () => browserWallet.connected,
  ],
  () => {
    void refreshHeaderWalletBalance();
  },
  { immediate: true }
);
let balanceTimer: ReturnType<typeof setInterval>;
let afterTransactionTimer: ReturnType<typeof setTimeout>;
const refreshAfterTransaction = () => {
  clearTimeout(afterTransactionTimer);
  afterTransactionTimer = setTimeout(() => void refreshHeaderWalletBalance(), 3000);
};
onMounted(() => {
  balanceTimer = setInterval(() => { if (useBrowserWallet.value && browserWallet.connected && !browserWallet.pending) void refreshHeaderWalletBalance(); }, 30000);
  window.addEventListener('punkos:browser-wallet-transaction', refreshAfterTransaction);
});
onBeforeUnmount(() => { clearInterval(balanceTimer); clearTimeout(afterTransactionTimer); window.removeEventListener('punkos:browser-wallet-transaction', refreshAfterTransaction); });
</script>

<style scoped>
body .a-drawer {
  padding: none;
}

.common-layout :deep(.ant-menu) {
  background: none !important;
  color: #fff;
  line-height: inherit;
}

.common-layout :deep(.ant-menu-horizontal) {
  border: none;
}
</style>

<style scoped lang="less">
.common-layout {
  margin-left: 0;
  width: 100%;
  height: 64px;
  max-height: 64px;
  background: #8080803d;
  color: #fff;
  z-index: 1;
  line-height: normal;
}
.header-row { height: 64px; flex-wrap: nowrap; gap: 16px; }
.header-wallet-area { display: flex; align-items: center; gap: 8px; height: 64px; line-height: normal; }
.wallet-trigger { display: flex; align-items: center; max-height: 52px; border-radius: 12px; cursor: pointer; background: rgba(255,255,255,.06); }
.browser-wallet-summary { box-sizing: border-box; padding: 8px 12px; height: 52px; min-width: 260px; display: flex; flex-direction: column; justify-content: center; gap: 4px; white-space: nowrap; color: #fff; }
.browser-wallet-summary span, .browser-wallet-summary strong { line-height: 18px; }
.browser-wallet-top, .browser-wallet-bottom { display: flex; align-items: center; gap: 10px; line-height: 18px; }
.browser-wallet-top { font-size: 13px; }
.browser-wallet-top strong { margin-left: auto; font-size: 13px; color: #fff; font-variant-numeric: tabular-nums; }
.browser-wallet-bottom { justify-content: space-between; font-size: 11px; }
.browser-wallet-bottom span { color: #b8c7d8; }
.browser-wallet-bottom .network-warning { color: #ffd38a; }
.connection-dot { width: 7px; height: 7px; background: #43d9a3; border-radius: 50%; flex-shrink: 0; }

.layoutheader_Title {
  margin-left: 20px;
  display: flex;
  align-items: center;
  height: 64px;
  overflow: hidden;
}

.a-menu-demo {
  background: none;
  color: #fff !important;
  height: 62px;
  border: none;
  margin: 0 auto;
  justify-content: center;
}

.header_logo {
  height: 50px;
  width: auto;
  margin: 10px;
}

.project-name {
  font-size: 20px;
  cursor: pointer;
  font-family: 'Microsoft YaHei', '微软雅黑';
}

.layout-header-userBox {
  display: flex;
  align-items: center;
  flex-direction: row-reverse;
  padding-right: 10px;

  span {
    color: #fff;
  }
}

.wallet-summary {
  display: flex;
  align-items: center;
  gap: 8px;
}

.wallet-balance {
  color: #20383a;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
}

.layout-header-user {
  display: flex;
  align-items: center;
  flex-direction: row-reverse;
  cursor: pointer;
  padding-left: 12px;
}
</style>
