<template>
  <Background>
    <div class="transfer">
      <div class="transfer-container">
        <h2>转账</h2>
        <div class="input-section">
          <div class="input-row">
            <label class="title">From:</label>
            <select v-model="selectedBlockchainFrom" class="blockchain-select">
              <option value="">选择区块链</option>
              <option v-for="blockchain in blockchains" :key="blockchain">{{ blockchain }}</option>
            </select>
          </div>
          <div class="input-row">
            <select v-model="selectedTokenFrom" class="token-select">
              <option value="">选择代币</option>
              <option v-for="token in tokens" :key="token">{{ token }}</option>
            </select>
            <input v-model.trim="amountFrom" class="token-input" min="0" placeholder="输入代币数量" type="number" />
          </div>
        </div>
        <div style="height: 30px"></div>
        <!-- 空余部分 -->
        <div class="input-section">
          <div class="input-row">
            <label class="title">To:</label>
            <select v-model="selectedBlockchainTo" class="blockchain-select">
              <option value="">选择区块链</option>
              <option v-for="blockchain in blockchains" :key="blockchain">{{ blockchain }}</option>
            </select>
          </div>
          <div class="input-row">
            <input v-model.trim="ToAccount" class="address-input" placeholder="输入转入地址" type="text" />
          </div>
        </div>
        <button class="transfer-btn" @click="transferTokens">跨链转账</button>
      </div>
    </div>
  </Background>
</template>

<script lang="ts">
import { onBeforeMount, ref } from 'vue';
import Web3 from 'web3';
import { useUserStore } from '@store/users';
import Background from '@page/core/components/Background.vue';

export default {
  components: { Background },
  setup() {
    const store = useUserStore();
    const selectedBlockchainFrom = ref('');
    const selectedTokenFrom = ref('');
    const amountFrom = ref('');
    const selectedBlockchainTo = ref('');
    const ToAccount = ref('');
    const blockchains = ref(['Ethereum', 'GoerliEthereum', 'Binance Smart Chain', 'Polygon']);
    const tokens = ref(['ETH', 'BNB', 'MATIC', 'DAI', 'USDT']);
    const web3 = ref(null);
    const fromAccount = ref('');

    onBeforeMount(async () => {
      if (typeof window.ethereum !== 'undefined') {
        web3.value = new Web3(window.ethereum);
        try {
          // Request account access
          await window.ethereum.enable();
          const accounts = await web3.value.eth.getAccounts();
          fromAccount.value = accounts[0]; // Set the first account as the default account
          console.log(fromAccount.value);
        } catch (error) {
          console.error('Error accessing accounts: ', error);
        }
      } else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
      }
    });

    const transferTokens = async () => {
      // 构造转账记录对象
      const transferRecord = {
        blockchainFrom: selectedBlockchainFrom.value,
        tokenFrom: selectedTokenFrom.value,
        blockchainTo: selectedBlockchainTo.value,
        addressTo: ToAccount.value,
        amountFrom: amountFrom.value,
        date: new Date().toLocaleString(),
      };
      // 将转账记录添加到 Vuex store
      store.addTransferRecord(transferRecord);
      console.log('跨链转账');
      var amountInWei = web3.value.utils.toWei(amountFrom.value, 'ether');
      console.log(amountInWei);
      console.log(fromAccount.value);
      console.log(store.balance);
      try {
        const result = await web3.value.eth.sendTransaction({
          from: fromAccount.value,
          to: ToAccount.value,
          value: amountInWei,
          gas: 470000,
        });
        console.log('Transfer succeeded:', result);
      } catch (error) {
        console.error('Transfer failed:', error);
      }
    };

    return {
      selectedBlockchainFrom,
      selectedTokenFrom,
      amountFrom,
      selectedBlockchainTo,
      ToAccount,
      blockchains,
      tokens,
      web3,
      fromAccount,
      transferTokens,
    };
  },
};
</script>

<style scoped>
.transfer {
  /*min-height: 100vh;*/
}

.transfer-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f9fafb;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  width: 500px;
  margin: 50px auto;
  padding: 30px;
}

.input-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-bottom: 10px;
}

.input-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  width: 100%;
}

.address-input {
  padding: 10px;
  border: 1px solid #34d399;
  border-radius: 5px;
  background-color: #f5f7fa;
  font-size: 16px;
  margin-left: 10px;
  width: 100%;
}

.title {
  width: 60px;
}

.blockchain-select {
  width: 100%;
  padding: 10px;
  border: 1px solid #34d399;
  border-radius: 5px;
  background-color: #f5f7fa;
  font-size: 16px;
  margin-left: 10px;
}

.token-select {
  width: 50%;
  padding: 10px;
  border: 1px solid #34d399;
  border-radius: 5px;
  background-color: #f5f7fa;
  font-size: 16px;
  margin-left: 10px;
}

.token-input {
  width: 50%;
  padding: 10px;
  border: 1px solid #34d399;
  border-radius: 5px;
  background-color: #f5f7fa;
  font-size: 16px;
  margin-left: 10px;
}

.transfer-btn {
  padding: 10px 20px;
  border: none;
  cursor: pointer;
  background-color: #34d399;
  color: #f9fafb;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  margin-top: 20px;
}
</style>
