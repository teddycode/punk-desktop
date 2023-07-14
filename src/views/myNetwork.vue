<template>
    <div class="network-page">
        <div class="network-top-bar">
            <select v-model="selectedNetwork" class="network-blockchain-select">
                <option v-for="network in networks" :key="network" :value="network">{{ network }}</option>
            </select>
            <i class="fas fa-cog"></i> <!-- Font Awesome 齿轮图标 -->
        </div>
        <div class="network-transfer-container">
            <div class="network-input-section">
                <div class="network-input-row">
                    <label class="network-title">ID:</label>
                    <input v-model="walletAddress" @input="handleAddressInput" class="network-address-input" :class="{ 'invalid-input': !isValidAddress }">
                </div>
            </div>
            <p v-if="!showTransaction">请输入正确的钱包地址！！！</p>
            <div class="network-balance" v-if="showTransaction&&walletAddress===$store.state.userAddress">余额：{{walletbalance}} GoerliETH</div>
            <div class="network-balance" v-if="showTransaction&&walletAddress!==$store.state.userAddress">不存在该账户！！！</div>
        </div>
        <transition name="slide-down">
            <div v-if="showTransaction" class="network-transfer-container">
                <div class="network-button-group">
                    <button @click="addcash" :class="['network-transfer-btn', { 'active': activeBtn === 'addcash' }]">充值</button>
                    <button @click="withdraw" :class="['network-transfer-btn', { 'active': activeBtn === 'withdraw' }]">提取</button>
                    <button @click="advanced" :class="['network-transfer-btn', { 'active': activeBtn === 'advanced' }]">高级</button>
                </div>
                <div class="network-input-section">
                    <div class="network-input-row">
                        <label class="network-title">余额:</label>
                        <input v-model="balance" class="network-token-input">
                    </div>
                    <div class="network-input-row">
                        <label class="network-title">存款:</label>
                        <input v-model="deposit" class="network-token-input">
                    </div>
                </div>
                <button class="network-transfer-btn-2">充值</button>
            </div>
        </transition>

    </div>

</template>

<script>

import store from "@/store";
export default {
    data() {
        return {
            networks: ['Ethereum', 'Binance Smart Chain', 'Polygon'],
            selectedNetwork: 'Ethereum',
            walletbalance:'',
            walletAddress: '',
            balance: '',
            showTransaction: false,
            showFullAddress: false,
            isValidAddress: false,
            activeBtn: '',
            //NoAccount:false,
        };
    },
    computed: {
        truncatedAddress() {
            if (this.walletAddress.length > 6) {
                return this.walletAddress.slice(0, 6) + '...' + this.walletAddress.slice(-6);
            } else {
                return this.walletAddress;
            }
        },
    },

    methods: {
        handleAddressInput() {
            this.isValidAddress = this.checkID(this.walletAddress);
            this.showTransaction = this.isValidAddress;
        },
        checkID(address) {
            if (typeof address !== 'string') {
                return false;
            }
            if (address.slice(0, 2) !== '0x') {
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
            this.walletbalance = store.state.userBalance;
            console.log(this.walletAddress);
            console.log(this.walletbalance);
            return true;
        },
        addcash() {
            this.activeBtn = 'addcash';
        },
        withdraw() {
            // Handle withdrawal
            this.activeBtn = 'withdraw';  // 设置当前激活的按钮为 "withdraw"
        },
        advanced() {
            // Handle advanced options
            this.activeBtn = 'advanced';  // 设置当前激活的按钮为 "advanced"
        },
        openSettings() {
            // Handle opening settings
        },
    },
};
</script>

<style scoped>
.network-page{
    width: 100%;
    min-height: 100vh;
}
.network-top-bar{
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 20px;
    background-color: #F9FAFB;
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
.network-address-input{
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
    background-color: #34d399;  /* 点击后的背景颜色为湖绿色 */
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
