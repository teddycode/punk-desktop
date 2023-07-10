<template>
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
                <input type="number" v-model.trim="amountFrom" min="0" class="token-input" placeholder="输入代币数量">
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
                <input type="text" v-model.trim="addressTo" placeholder="输入转入地址" class="address-input">
            </div>
        </div>
        <button class="transfer-btn" @click="transferTokens">跨链转账</button>
    </div>
</template>

<script>
export default {
    data() {
        return {
            selectedBlockchainFrom: '',
            selectedTokenFrom: '',
            amountFrom: '',
            selectedBlockchainTo: '',
            addressTo: '',
            blockchains: ['Ethereum', 'Binance Smart Chain', 'Polygon'],
            tokens: ['ETH', 'BNB', 'MATIC', 'DAI', 'USDT']
        }
    },
    methods: {
        transferTokens() {
            // 在这里执行转账操作的相关代码
            console.log('跨链转账');
        }
    }
}
</script>

<style scoped>
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
.address-input{
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