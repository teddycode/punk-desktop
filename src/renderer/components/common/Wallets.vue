<template>
  <div class="dropdown-container-wallet">
    <el-dropdown trigger="click" size="small">
      <el-button class="btn btn-moving-gradient btn-moving-gradient--blue" type="primary" @click="buttonClick">
        {{ buttonLabel }}
      </el-button>
      <template #dropdown v-if="userLoggedIn">
        <el-dropdown-menu class="el-dropdown-menu-wallet">
          <el-dropdown-item class="el-dropdown-menu__item" @click="navigateToUserProfile">钱包信息</el-dropdown-item>
          <el-dropdown-item class="el-dropdown-menu__item" @click="toggleWalletSelector">切换钱包</el-dropdown-item>
          <el-dropdown-item class="el-dropdown-menu__item" @click="logout">登出</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
  <transition name="slide">
    <div v-if="showWalletSelector" class="wallet-selector" @click.stop>
      <h3>选择钱包</h3>
      <ul class="wallet-list">
        <li v-for="wallet in wallets" :key="wallet.name" @click="openWalletLink(wallet)"
            :class="{ 'selected-wallet': selectedWallet === wallet, 'hovered-wallet': hoveredWallet === wallet }">
          <img :src="`/images/wallets/${wallet.icon}`" alt="wallet-icon">
          {{ wallet.name }}
        </li>
      </ul>
    </div>
  </transition>
  <div v-if="showWalletSelector" class="overlay" @click="toggleWalletSelector"></div>
  <transition name="slide">
    <div v-if="showUserInfo" class="wallet-selector" @click.stop>
      <div>
        <h4>Connected to MetaMask</h4>
        <div class="info-item">
          <p class="address">
            Address: {{ userAddress }}
            <button class="copy-btn" @click.stop="copyToClipboard('address', userAddress)">
              <font-awesome-icon :icon="addressCopied ? 'check' : 'copy'"
                                 :style="{ color: addressCopied ? 'green' : 'inherit' }"/>
            </button>
          </p>
        </div>
        <div class="info-item">
          <p>Balance: {{ userBalance }} GoerliETH
            <button class="copy-btn" @click.stop="copyToClipboard('balance', userBalance)">
              <font-awesome-icon :icon="balanceCopied ? 'check' : 'copy'"/>
            </button>
          </p>
        </div>
        <div class="navigation-panel">
          <el-button type="text">代币</el-button>
          <el-button type="text">NFTS</el-button>
          <el-button type="text">流动池</el-button>
          <el-button type="text">活动</el-button>
        </div>
        <div class="info-display">
          <!-- 信息展示区域 -->
        </div>
      </div>
    </div>
  </transition>
  <div v-if="showUserInfo" class="overlay" @click="toggleUserInfo"></div>
</template>

<script lang="ts">
import {defineComponent, ref, computed, onMounted} from 'vue';
import {ethers} from 'ethers';
import {library} from '@fortawesome/fontawesome-svg-core';
import {faCheck, faCopy} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import {useUserStore} from "@store/users";

let {ipcRenderer} = window;

library.add(faCheck, faCopy);

export default defineComponent({
  name: 'Wallets',
  components: {
    FontAwesomeIcon,
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['close', 'walletLogout', 'walletLogin'],
  setup(props, {emit}) {

    const store = useUserStore();

    const showWalletSelector = ref(false);
    const showUserInfo = ref(false);
    const addressCopied = ref(false);
    const balanceCopied = ref(false);
    const wallets = [
      {name: 'Metamask', icon: 'metamask.jpeg', link: 'https://metamask.io'},
      {name: 'imToken', icon: 'imtoken.jpeg', link: 'https://token.im'},
      {name: 'Trust Wallet', icon: 'trustwallet.png', link: 'https://trustwallet.com'},
    ];
    const userAddress = ref('');
    const userBalance = ref('0');
    const userLoggedIn = ref(false);
    const web3 = ref(null);
    const provider = ref(null);

    const buttonLabel = computed(() => {
      if (userLoggedIn.value && userAddress.value) {
        return store.getShortAddress;
      } else {
        return '连接钱包';
      }
    });

    const showAlert = (str: string) => {
      // ipcRenderer.send("show-main-alert", str);
    };

    const buttonClick = () => {
      if (!userLoggedIn.value) {
        toggleWalletSelector();
      }
    };

    const toggleWalletSelector = () => {
      showWalletSelector.value = !showWalletSelector.value;
    };

    const navigateToUserProfile = () => {
      showUserInfo.value = true;
    };

    const toggleUserInfo = () => {
      showUserInfo.value = !showUserInfo.value;
    };

    const loadUserData = async () => {
      console.log('loadUserData!!!');
      const loggedIn = userLoggedIn.value;
      if (loggedIn) {
        console.log('重新登录123');
        userLoggedIn.value = true;
        userAddress.value = store.address;
        userBalance.value = await getBalance(userAddress.value);
      } else {
        const storedAddress = localStorage.getItem('userAddress');
        if (storedAddress) {
          userLoggedIn.value = true;
          userAddress.value = storedAddress;
          console.log('loadUserData:this.userAddress =' + userAddress.value);
          console.log('loadUserData:this.userLoggedIn =' + userLoggedIn.value);
          store.setIsLogin(true);
          store.setAddress(storedAddress);
          userBalance.value = await getBalance(userAddress.value);
          console.log('loadUserData:this.userBalance =' + userBalance.value);
          store.setBalance(userBalance.value);
        }
      }
    };

    const openWalletLink = async (wallet: any) => {
      console.log('openWalletLink1');
      if (wallet.name === 'Metamask') {
        try {
          userLoggedIn.value = true;
          store.setIsLogin(true);
          localStorage.setItem('isLogin', String(store.isLogin));

          const signer = provider.value.getSigner();
          userAddress.value = await signer.getAddress();
          console.log('signer: ', signer);
          localStorage.setItem('address', userAddress.value);
          store.setAddress(userAddress.value);

          userBalance.value = await getBalance(userAddress.value);
          store.setBalance(userBalance.value);

          await loadUserData();
          console.log('openWalletLink2');
          emit('walletLogin');
        } catch (error) {
          console.error(error);
          console.log('openWalletLink3');
        }
      } else {
        console.log('openWalletLink4');
        window.open(wallet.link, '_blank');
      }
      showWalletSelector.value = false;
    };

    const getBalance = async (address: string) => {
      try {
        const network = await provider.value.getNetwork();
        if (network.chainId !== 1337) {
          window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{chainId: '0x539'}],
          }).catch((error) => console.log(error));
        }
        const balance = await provider.value.getBalance(address);
        return ethers.utils.formatEther(balance);
      } catch (error) {
        console.error(error);
      }
    };

    const logout = () => {
      userLoggedIn.value = false;
      userAddress.value = '';
      userBalance.value = '0';
      store.setIsLogin(false);
      store.setAddress('');
      store.setBalance('0');
      localStorage.removeItem('address');
      console.log('logout: ' + userLoggedIn.value);
      emit('walletLogout');
      loadUserData();
    };

    const copyToClipboard = async (field: string, value: string) => {
      await navigator.clipboard.writeText(value);
      addressCopied.value = true;
      setTimeout(() => {
        addressCopied.value = false;
      }, 1000);
    };

    onMounted(() => {
      setTimeout(() => {
        if (typeof window.ethereum !== 'undefined') {
          provider.value = new ethers.providers.Web3Provider(window.ethereum);
          console.log('provider: ', provider.value);
          loadUserData();
        } else {
          showAlert('Metamask is not installed. Please consider installing it: https://metamask.io');
        }
      }, 500);
    });

    return {
      showWalletSelector,
      showUserInfo,
      addressCopied,
      balanceCopied,
      wallets,
      userAddress,
      userBalance,
      userLoggedIn,
      buttonLabel,
      buttonClick,
      toggleWalletSelector,
      navigateToUserProfile,
      toggleUserInfo,
      loadUserData,
      openWalletLink,
      getBalance,
      logout,
      copyToClipboard,
    };
  },
});
</script>

<style scoped>
/* Wallet Selector Styles */
.dropdown-container-wallet {
  top: 20px;
  right: 20px;
  position: absolute;
  margin-right: 10px;
}

.btn {
  font-family: Arial, Helvetica, sans-serif;
  text-transform: uppercase;
}

.btn:hover .btn-slide-show-text1 {
  margin-left: 65px;
}

.btn-moving-gradient {
  height: 35px;
  font-weight: 600;
  color: rgb(255, 255, 255);
  cursor: pointer;
  border: medium none;
  background-size: 300% 100%;
  border-radius: 50px;
}

.btn-moving-gradient:hover {
  transition: all 0.5s ease-in-out 0s;
  background-position: 100% 0px;
}

.btn-moving-gradient--blue {
  background-image: linear-gradient(90deg, rgb(61, 135, 255), rgb(190, 61, 255), rgb(126, 61, 255), rgb(58, 134, 255));
  box-shadow: rgb(190, 61, 255) 0px 4px 15px 0px;
}

.wallet-selector {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background-color: #F9FAFB;
  width: 300px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  z-index: 10;
  border-radius: 15px;
  max-height: 90vh;
  overflow-y: auto;
}

.wallet-selector h3 {
  margin: 0 0 20px;
  font-size: 18px;
}

.wallet-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.hovered-wallet {
  background-color: #f5f5f5;
}

.selected-wallet {
  background-color: #d4d4d4;
}

.wallet-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 10px;
  transition: background-color 0.3s;
}

.wallet-list li:hover,
.wallet-list li.selected-wallet {
  background-color: #d4d4d4;
}


.wallet-list img {
  width: 24px;
  height: 24px;
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes slide-out {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(100%);
  }
}

@keyframes slide-in-info {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes slide-out-info {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-100%);
  }
}

.overlay {
  position: fixed;
  z-index: 5;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.address {
  word-break: break-all;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.copy-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-left: 0.5em;
}

.navigation-panel {
  display: flex;
  justify-content: space-between;
  margin-top: 10px; /* 根据需要调整 */
  margin-right: 50%;
}

.info-display {
  margin-top: 20px; /* 根据需要调整 */
}

.el-dropdown-menu-wallet {
  background-image: linear-gradient(90deg, rgb(61, 135, 255), rgb(190, 61, 255), rgb(126, 61, 255), rgb(58, 134, 255));
  box-shadow: rgb(190, 61, 255) 0px 4px 15px 0px;
  /*background-color: #5ab1ef;*/
}

.el-dropdown-menu-wallet >>> .el-dropdown-menu__item {
  color: white;
}
</style>
