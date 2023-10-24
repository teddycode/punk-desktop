<template>
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
          <input v-model.trim="amountFrom" class="token-input" min="0" placeholder="输入代币数量" type="number">
        </div>
      </div>
      <div style="height: 30px;"></div> <!-- 空余部分 -->
      <div class="input-section">
        <div class="input-row">
          <label class="title">To:</label>
          <select v-model="selectedBlockchainTo" class="blockchain-select">
            <option value="">选择区块链</option>
            <option v-for="blockchain in blockchains" :key="blockchain">{{ blockchain }}</option>
          </select>
        </div>
        <div class="input-row">
          <input v-model.trim="ToAccount" class="address-input" placeholder="输入转入地址" type="text">
        </div>
      </div>
      <button class="transfer-btn" @click="transferTokens">跨链转账</button>
    </div>
  </div>
</template>

<script>
import Web3 from "web3";

export default {
  data() {
    return {
      selectedBlockchainFrom: '',
      selectedTokenFrom: '',
      amountFrom: '',
      selectedBlockchainTo: '',
      ToAccount: '',
      blockchains: ['Ethereum', 'GoerliEthereum', 'Binance Smart Chain', 'Polygon'],
      tokens: ['ETH', 'BNB', 'MATIC', 'DAI', 'USDT'],
      web3: null,
      fromAccount: '',
    }
  },
  async beforeMount() {
    if (typeof window.ethereum !== 'undefined') {
      this.web3 = new Web3(window.ethereum);
      try {
        // Request account access
        await window.ethereum.enable();
        const accounts = await this.web3.eth.getAccounts();
        this.fromAccount = accounts[0]; // Set the first account as the default account
        console.log(this.fromAccount);
      } catch (error) {
        console.error("Error accessing accounts: ", error);
      }
    } else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  },
  methods: {
    async transferTokens() {
      // 构造转账记录对象
      const transferRecord = {
        blockchainFrom: this.selectedBlockchainFrom,
        tokenFrom: this.selectedTokenFrom,
        blockchainTo: this.selectedBlockchainTo,
        addressTo: this.ToAccount,
        amountFrom: this.amountFrom,
        date: new Date().toLocaleString(),
      };
      // 将转账记录添加到 Vuex store
      this.$store.commit('addTransferRecord', transferRecord);
      console.log('跨链转账');
      var amountInWei = this.web3.utils.toWei(this.amountFrom, 'ether');
      console.log(amountInWei);
      console.log(this.fromAccount);
      console.log(this.$store.state.userBalance);
      try {
        const result = await this.web3.eth.sendTransaction({
          from: this.fromAccount,
          to: this.ToAccount,
          value: amountInWei,
          gas: 470000,
        });
        console.log("Transfer succeeded:", result);
      } catch (error) {
        console.error("Transfer failed:", error);
      }
    }
  }
}
</script>


<style scoped>
.transfer {
  /*min-height: 100vh;*/
}

.transfer-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #F9FAFB;
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
  border: 1px solid #34D399;
  border-radius: 5px;
  background-color: #F5F7FA;
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
  border: 1px solid #34D399;
  border-radius: 5px;
  background-color: #F5F7FA;
  font-size: 16px;
  margin-left: 10px;
}

.token-select {
  width: 50%;
  padding: 10px;
  border: 1px solid #34D399;
  border-radius: 5px;
  background-color: #F5F7FA;
  font-size: 16px;
  margin-left: 10px;
}

.token-input {
  width: 50%;
  padding: 10px;
  border: 1px solid #34D399;
  border-radius: 5px;
  background-color: #F5F7FA;
  font-size: 16px;
  margin-left: 10px;
}

.transfer-btn {
  padding: 10px 20px;
  border: none;
  cursor: pointer;
  background-color: #34D399;
  color: #F9FAFB;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  margin-top: 20px;
}
</style>