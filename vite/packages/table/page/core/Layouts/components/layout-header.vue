<template>
  <div class="common-layout">
    <a-row type="flex" justify="space-between" align="middle">
      <a-col :span="4">
        <div class="layoutheader_Title">
          <img v-maxImg src="/img/punkos-logo.png" class="header_logo" tatile="磐古OS" />
          <span class="project-name">
            <span class="dynamicText">磐古OS</span>
          </span>
        </div>
      </a-col>
      <a-col :span="12">
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
      <a-col :span="6" style="margin-right: -10px">
        <div class="flex row-reverse">
          <BorderAvatar style="padding-right: 5px" :avatarSize="48" :avatarUrl="userInfo?.avatar" />
          <div class="layout-header-userBox">
            <a-dropdown>
              <div class="rounded bg-mask">
                <div v-if="isConnected" class="wallet-summary">
                  <span class="wallet-balance">{{ headerWalletBalance }}</span>
                  <w3m-button balance="hide" />
                </div>
                <div class="xt-text" v-else>点击连接钱包</div>
              </div>
              <template #overlay>
                <a-menu>
                  <div v-if="isConnected">
                    <a-menu-item @click="closeWallet">断开连接</a-menu-item>
                    <a-menu-item @click="changeWallet">切换钱包</a-menu-item>
                    <a-menu-item @click="getWalletInfo">钱包信息</a-menu-item>
                    <a-menu-item @click="getUserInfo">个人信息</a-menu-item>
                    <a-menu-item @click="logOutUser">用户退出</a-menu-item>
                  </div>
                  <div v-else>
                    <a-menu-item @click="connectWallet">连接钱包</a-menu-item>
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
import { computed, ref, watch } from 'vue';
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
import { setCrosschainWalletContext } from '@table/services/crosschain';

const toast = useToast();

const layoutStore = useLayoutStore();
const wStore = walletStore();
const aStore = appStore();

const router = useRouter();
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
const chainsById = {
  [punkos.chainId]: punkos,
  [sepolia.chainId]: sepolia,
  [mainnet.chainId]: mainnet,
  [arbitrum.chainId]: arbitrum,
};
let lastBalanceRequestId = 0;

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
  const address = web3Account.address.value;
  const chainId = web3Account.chainId.value;
  const connected = web3Account.isConnected.value;

  if (!connected || !address || !chainId) {
    headerWalletBalance.value = '0.000 PUNK';
    wStore.updateBalance('0');
    return;
  }

  const chain = chainsById[chainId] || punkos;
  const symbol = chain?.currency || 'PUNK';
  const requestId = ++lastBalanceRequestId;
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
  ],
  () => {
    void refreshHeaderWalletBalance();
  },
  { immediate: true }
);
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
  margin-left: -50px;
  width: 110%;
  height: 64px;
  max-height: 64px;
  background: #8080803d;
  color: #fff;
  z-index: 1;
}

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
