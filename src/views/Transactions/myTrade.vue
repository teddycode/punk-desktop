<template>
    <div class="liquidity-wrapper">
        <div class="liquidity-container">
            <h1 class="liquidity-title">添加流动性</h1>
            <div class="liquidity-content-top">
                <!-- Left Section -->
                <div class="liquidity-left">
                    <h2 class="h2-1">选择币对</h2>
                    <div class="token-pair">
                        <label class="token-label tokenA">代币A</label>
                        <div class="select-wrapper">
                            <select v-model="selectedTokenA" class="custom-select">
                                <option class="select-option" v-for="token in tokens" :key="token.value" :value="token.value">{{ token.label }}</option>
                            </select>
                            <i class="fas fa-chevron-down select-icon"></i>
                        </div>
                    </div>
                    <div class="token-pair">
                        <label class="token-label tokenB">代币B</label>
                        <div class="select-wrapper">
                            <select v-model="selectedTokenB" class="custom-select">
                                <option class="select-option" v-for="token in tokens" :key="token.value" :value="token.value">{{ token.label }}</option>
                            </select>
                            <i class="fas fa-chevron-down select-icon"></i>
                        </div>
                    </div>
                </div>
                <!-- Right Section -->
                <div class="liquidity-right">
                    <h2 class="h2-2">添加数额</h2>
                    <div class="token-input">
                        <input type="number" v-model="amountA" id="tokenA" class="custom-input">
                    </div>
                    <div class="token-input">
                        <input type="number" v-model="amountB" id="tokenB" class="custom-input">
                    </div>
                </div>
            </div>
            <div class="divider"></div>
            <div class="liquidity-content-bottom">
                <h2 class="h2-3">选择池信息</h2>
                <div class="pool-info">
                    <label class="fee-label">手续费</label>
                    <div class="select-wrapper fee-wrapper">
                        <select v-model="selectedFee" class="custom-select fee-select">
                            <option class="select-option" v-for="fee in fees" :key="fee">{{ fee }}</option>
                        </select>
                        <i class="fas fa-chevron-down select-icon"></i>
                    </div>
                    <input type="text" v-model="hookAddress" @input="validateHookAddress" class="custom-input hook-address-longer" placeholder="钩子地址">
                </div>
                <p v-if="addressError" class="error-message">无效的地址格式</p>
            </div>
            <addnode-button class="add-liquidity-button">Add</addnode-button>
        </div>
    </div>
</template>

<script>
import addnodeButton from "@/components/buttons/addnodeButton.vue";
export default {
    components:{
        addnodeButton
    },
    data() {
        return {
            tokens: [
                { label: 'ETH', value: 'ETH' },
                { label: 'BTC', value: 'BTC' },
                { label: 'BNB', value: 'BNB' },
                { label: 'ADA', value: 'ADA' },
                { label: 'DOGE', value: 'DOGE' },
                { label: 'XRP', value: 'XRP' },
                { label: 'USDC', value: 'USDC' },
                { label: 'DAI', value: 'DAI' },
                { label: 'token0', value: 'token0'},
                { label: 'token1', value: 'token1'},
            ],
            fees: ["0.04%", "0.2%", "1%"],
            selectedTokenA: '',
            selectedTokenB: '',
            selectedFee: '',
            hookAddress: '',
            amountA: '',
            amountB: '',
            addressError: false
        };
    },
    methods: {
        validateHookAddress() {
            const pattern = /^0x[a-fA-F0-9]{40}$/;
            this.addressError = !this.hookAddress.match(pattern);
        }
    }
}
</script>

<style scoped>
.liquidity-wrapper {
    border-radius: 10px;
    padding: 2%;
    max-width: 90%;
    margin: 40px auto;
    border: 1px solid white;
    background-color: transparent;
}

.liquidity-container {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.liquidity-title {
    color: white;
    font-size: 2rem;
    margin-bottom: 3%;
}

.liquidity-content-top {
    display: flex;
    justify-content: space-between;
    width: 100%;
    gap: 5%;
}

.liquidity-left, .liquidity-right {
    flex: 0.5;
    display: flex;
    flex-direction: column;
    gap: 2%;
    align-items: center; /* Added this to center the elements horizontally */
}

.h2-3 {
    color: white;
    font-size: 1.5rem;
    margin-bottom: 2%;
}
.h2-1 {
    color: white;
    font-size: 1.5rem;
    margin-bottom: 2%;
    text-align: left;
    margin-left: 20%;
}
.h2-2 {
    color: white;
    font-size: 1.5rem;
    margin-bottom: 2%;
    text-align: left;
    margin-left: -10%;
}
.token-pair, .token-input {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 1%;
    margin-bottom: 5%;
}
.custom-select{
    margin-left: 5%;
    box-sizing: border-box; /* Ensures padding and border are included in the total width */
    width: 95%;
    background-color: transparent;
    border: 1px solid white;
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 16px;
    outline: none;
    transition: border-color 0.15s ease-in-out;
}
.custom-input {
    box-sizing: border-box; /* Ensures padding and border are included in the total width */
    width: 90%;
    background-color: transparent;
    border: 1px solid white;
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 16px;
    outline: none;
    transition: border-color 0.15s ease-in-out;
}
.custom-select {
    -webkit-appearance: none; /* Removes default chrome and safari appearance */
    -moz-appearance: none;    /* Removes default Firefox appearance */
    appearance: none;         /* Removes default appearance for rest of the browsers */
    padding-right: 30px;      /* To account for the space taken by the dropdown arrow in select boxes */
    position: relative;
}

.select-icon {
    color: white;
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none; /* This makes sure the icon doesn't interfere with the select functionality */
}
.select-wrapper {
    width: 85%;
    position: relative;
    display: inline-block;
}
.fee-wrapper {
    width: 60%; /* Adjusted width for the fee select wrapper */
    position: relative;
    display: inline-block;
    /*margin-right: 5%;*/
}
.fee-select {
    width: 95%;
}

.hook-address-longer {
    width: 100%;
}

.custom-select:hover, .custom-input:hover {
    border-color: #007bff;
}

.custom-input::placeholder {
    color: rgba(255, 255, 255, 0.7);
}

.select-option {
    color: white;
    background-color: #2D3748;
}

.token-label {
    color: white;
    /*margin-right: 2%;*/
}

.divider {
    width: 80%;
    height: 1px;
    background-color: white;
    margin: 2% 0;
}

.liquidity-content-bottom {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2%;
    width: 100%;
    margin-bottom: 5%;
}

.pool-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 2%;
}

.fee-label {
    color: white;
    width: 12%;
    /*margin-right: 2%;*/
}
.error-message {
    color: red;
    font-size: 12px;
    margin-top: 5px;
    width: 100%;
    text-align: left;
}
.add-liquidity-button{
    margin-bottom: 2%;
}
</style>
