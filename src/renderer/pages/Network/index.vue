<template>
  <main-background>
    <div class="network-page">
      <div class="network-top-bar">
        <select v-model="selectedNetwork" class="network-blockchain-select">
          <option v-for="network in networks" :key="network" :value="network">{{ network }}</option>
        </select>
        <i class="fas fa-cog"/>
      </div>
      <div class="network-transfer-container">
        <div class="network-input-section">
          <div class="network-input-row">
            <label class="network-title">ID:</label>
            <input v-model="walletAddress" :class="{ 'invalid-input': !isValidAddress }" class="network-address-input"
                   @input="handleAddressInput">
          </div>
        </div>
        <p v-if="!showTransaction">请输入正确的钱包地址！！！</p>
        <div v-if="showTransaction&&walletAddress===address" class="network-balance">
          余额：{{ walletbalance }} GoerliETH
        </div>
        <div v-if="showTransaction&&walletAddress!== address " class="network-balance">不存在该账户！！！
        </div>
      </div>
      <transition name="slide-down">
        <div v-if="showTransaction" class="network-transfer-container">
          <div class="network-button-group">
            <button :class="['network-transfer-btn', { 'active': activeBtn === 'charge' }]" @click="charge">充值
            </button>
            <button :class="['network-transfer-btn', { 'active': activeBtn === 'withdraw' }]" @click="withdraw">提取
            </button>
            <button :class="['network-transfer-btn', { 'active': activeBtn === 'advanced' }]" @click="advanced">高级
            </button>
          </div>
          <div class="network-input-section">
            <div class="network-input-row">
              <label class="network-title">余额:</label>
              <input v-model="balance" class="network-token-input">
            </div>
            <div class="network-input-row">
              <label class="network-title">存款:</label>
              <!-- TODO what`s this-->
              <input v-model="deposit" class="network-token-input">
            </div>
          </div>
          <button class="network-transfer-btn-2">充值</button>
        </div>
      </transition>
    </div>
  </main-background>
</template>

<script lang="ts">
import MainBackground from "@components/common/MainBackground.vue";
import {ref} from "vue";
import {useUserStore} from "@store/users";
import {storeToRefs} from "pinia";

export default {
  components: {
    MainBackground,
  },
  setup() {

    const store = useUserStore();

    let {address} = storeToRefs(store);

    const networks = ref(["Ethereum", "Binance Smart Chain", "Polygon"]);
    const selectedNetwork = ref("Ethereum");
    const walletbalance = ref("");
    const walletAddress = ref("");
    const balance = ref("");
    const showTransaction = ref(false);
    const showFullAddress = ref(false);
    const isValidAddress = ref(false);
    const activeBtn = ref("");

    function truncatedAddress() {
      if (walletAddress.value.length > 6) {
        return (
            walletAddress.value.slice(0, 6) +
            "..." +
            walletAddress.value.slice(-6)
        );
      } else {
        return walletAddress.value;
      }
    }

    function handleAddressInput() {
      isValidAddress.value = checkID(walletAddress.value);
      showTransaction.value = isValidAddress.value;
    }

    function checkID(address: string) {
      if (typeof address !== "string") {
        return false;
      }
      if (address.slice(0, 2) !== "0x") {
        return false;
      }
      if (address.length !== 42) {
        return false;
      }
      // if (address !== store.state.userAddress){
      //     this.NoAccount = true;
      // }
      // myWallet.methods.loadUserData();
      // this.walletAddress = store.state.userAddress;
      walletbalance.value = store.userBalance;
      console.log(walletAddress.value);
      console.log(walletbalance.value);
      return true;
    }

    function charge() {
      activeBtn.value = "charge";
    }

    function withdraw() {
      // Handle withdrawal
      activeBtn.value = "withdraw"; // 设置当前激活的按钮为 "withdraw"
    }

    function advanced() {
      // Handle advanced options
      activeBtn.value = "advanced"; // 设置当前激活的按钮为 "advanced"
    }

    function openSettings() {
      // Handle opening settings
    }

    return {
      networks,
      selectedNetwork,
      walletbalance,
      walletAddress,
      balance,
      showTransaction,
      showFullAddress,
      isValidAddress,
      activeBtn,
      address,
      truncatedAddress,
      handleAddressInput,
      checkID,
      charge,
      withdraw,
      advanced,
      openSettings,
    };
  },
};
</script>

<style scoped>
.network-page {
  margin-top: 30px;
  width: 100%;
  /*min-height: 100vh;*/
}

.network-top-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 20px;
  background-color: transparent;
}

.network-transfer-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #F9FAFB;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  width: 500px;
  margin: 20px auto;
  padding: 30px;
}

.network-input-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-bottom: 10px;
}

.network-input-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  width: 100%;
}

.network-address-input {
  padding: 10px;
  border: 1px solid #34D399;
  border-radius: 5px;
  background-color: #F5F7FA;
  font-size: 16px;
  margin-left: 10px;
  width: 100%;
}

.network-title {
  float: left;
}

.network-blockchain-select {
  padding: 10px;
  border: 1px solid #34D399;
  border-radius: 5px;
  background-color: #F5F7FA;
  font-size: 16px;
  margin-left: 10px;
  margin-right: 20px;
}

.network-wallet-info {
  margin-left: 20px;
}

.network-token-input {
  width: 80%;
  padding: 10px;
  border: 1px solid #34D399;
  border-radius: 5px;
  background-color: #F5F7FA;
  font-size: 16px;
  margin-left: 10px;
}

.network-button-group {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 30px;
  width: 100%;
}

.network-transfer-btn {
  padding: 10px 20px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  margin: 0 10px;
}

.network-transfer-btn-2 {
  padding: 10px 20px;
  border: none;
  cursor: pointer;
  background-color: #34d399;
  color: #F9FAFB;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  margin: 0 10px;
}

.network-transfer-btn.active {
  background-color: #34d399; /* 点击后的背景颜色为湖绿色 */
  color: #f9fafb;
}

.invalid-input {
  border-color: #e53e3e;
}

.slide-down-enter-active {
  transition: all 0.3s ease;
}

.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}

.slide-down-enter, .slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-down-enter-to, .slide-down-leave {
  transform: translateY(0);
  opacity: 1;
}

</style>
