<template>
    <div class="myOrder-page">
        <div class="myOrder-card">
            <h1 class="myOrder-title">My Orders</h1>
            <div class="myOrder-limitOrder">
                <!-- 左边框 -->
                <div class="myOrder-panel">
                    <div class="myOrder-limitOrder-token-pair">
                        <h2 class="token-pair-title">代币对</h2>
                        <div class="myOrder-limitOrder-select-wrapper">
                            <select class="myOrder-limitOrder-custom-select token-select" v-model="selectedToken1">
                                <option class="select-option" v-for="token in tokens" :key="token.value" :value="token.value">
                                    {{ token.label }}
                                </option>
                            </select>
                            <select class="myOrder-limitOrder-custom-select token-select" v-model="selectedToken2">
                                <option class="select-option" v-for="token in tokens" :key="token.value" :value="token.value">
                                    {{ token.label }}
                                </option>
                            </select>
                        </div>
                    </div>
                    <div class="fee-options">
                        <h3 class="fee-title">Fee Rates</h3>
                        <div class="fee-radio-group">
                            <label v-for="fee in fees" :key="fee" class="limitOrder-fee-box" :class="{ 'selected': selectedFee === fee }">
                                <input type="radio" name="fee" :value="fee" v-model="selectedFee" class="limitOrder-hidden-radio"/>
                                {{ fee }}
                            </label>
                        </div>
                    </div>
                    <div class="selected-tokens">{{ selectedToken1 }} -> {{ selectedToken2 }}</div>
                </div>
                <!-- 右边框 -->
                <div class="myOrder-panel">
                    <div class="myOrder-input-section">
                        <label for="amount" class="myOrder-limitOrder-token-label">Amount</label>
                        <div class="input-with-token">
                            <input id="amount" class="myOrder-limitOrder-custom-input" type="text" placeholder="Enter amount"/>
                        </div>
                    </div>
                    <div class="myOrder-input-section">
                        <label for="price" class="myOrder-limitOrder-token-label">Price</label>
                        <div class="input-with-token">
                            <input id="price" v-model="price" class="myOrder-limitOrder-custom-input" type="text" placeholder="Enter price"/>
                            <span class="input-token">{{ selectedToken1 }}/{{ selectedToken2 }}</span>
                        </div>
                    </div>
                    <div class="myOrder-input-section">
                        <label for="filled" class="myOrder-limitOrder-token-label">Filled</label>
                        <div class="input-with-token">
                            <input id="filled" class="myOrder-limitOrder-custom-input" type="text" placeholder="Enter filled amount"/>
                            <span class="input-token">%</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="button-group">
                <addnode-button class="addnode-button" @click="withdraw">withdraw</addnode-button>
                <addnode-button class="addnode-button" @click="kill">cancel</addnode-button>
            </div>
        </div>
    </div>
</template>

<script>
import addnodeButton from "@/components/buttons/addnodeButton.vue";
import {killLimitOrderFrontend} from "@/views/Transactions/function/kill"
import {limitOrderPoolKey} from "@/views/Transactions/function/address";
import {ethers} from "ethers";
export default {
    name: "myOrder",
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
            fees: ["0.04%", "0.1%", "0.2%", "动态"],
            selectedToken1: 'ETH',
            selectedToken2: 'USDC',
            selectedFee: "0.04%",  // 默认选择的费率
            price:'',
            myAddress:'',
        }
    },
    methods:{
        async withdraw(){

        },
        async kill(){
            try {
                if (typeof window.ethereum !== 'undefined') {
                    // 使用MetaMask提供的provider
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    try {
                        // 请求账户访问
                        await window.ethereum.request({ method: 'eth_requestAccounts' });
                        const signer = provider.getSigner();
                        this.myAddress = await signer.getAddress(); // 设置第一个账户为默认账户
                        console.log("address: " , this.myAddress)
                    } catch (error) {
                        console.error("Error accessing accounts: ", error);
                    }
                } else {
                    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
                }
                await killLimitOrderFrontend(this.selectedToken1,this.selectedToken2,this.price,limitOrderPoolKey,this.myAddress)
                alert("取消成功")
            }catch (err){
                console.log(err)
                alert("取消失败")
            }
        }
    }
}
</script>

<style scoped>
.myOrder-page {
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    margin-top: 6%;
}

.myOrder-card {
    width: 90%;
    padding: 20px;
    border-radius: 10px;
    border: 1px solid white;
    margin: 0 auto;
}

.myOrder-title {
    text-align: center;
    font-size: 2rem;
    font-weight: bold;
    color: white;
    margin-bottom: 1em;
}

.myOrder-limitOrder {
    display: flex;
    justify-content: space-between;
    gap: 30px;
    margin-bottom: 5%;
}

.myOrder-panel {
    flex: 1;
    background: transparent;
    padding: 20px;
    border-radius: 20px;
    border: 1px solid white;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.myOrder-input-section {
    margin-bottom: 20px;
}

.myOrder-limitOrder-token-label {
    font-size: 1.5rem;
    display: inline-block;
    margin-right: 10px;
    vertical-align: middle;
}

.input-with-token {
    position: relative;
    width: 100%;
}

.input-token {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1rem;
}

.selected-tokens {
    text-align: center;
    margin-top: 10px;
    font-size: 1.2rem;
}

.myOrder-limitOrder-custom-input, .myOrder-limitOrder-custom-select {
    width: 100%;
    box-sizing: border-box;
    padding: 8px 12px;
    border-radius: 4px;
    border: 1px solid white;
    background-color: transparent;
    color: white;
    font-size: 16px;
    outline: none;
    transition: border-color 0.15s ease-in-out;
}
.myOrder-limitOrder-custom-input{
    padding-right: 120px;
}
.myOrder-limitOrder-custom-input:hover, .myOrder-limitOrder-custom-select:hover {
    border-color: #007bff;
}

.myOrder-limitOrder-custom-input::placeholder {
    color: rgba(255, 255, 255, 0.7);
}

.select-option {
    color: white;
    background-color: #2D3748;
}

.token-pair-title {
    font-size: 1.5rem;
    text-align: center;
    color: white;
    margin-bottom: 10px;
}

.token-select {
    width: 46%;
    display: inline-block;
    margin: 0 2%;
}

.fee-title {
    text-align: center;
    margin-bottom: 10px;
}

.fee-radio-group {
    display: flex;
    justify-content: center;
}

.limitOrder-fee-box {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid white;
    padding: 5px 10px;
    margin-right: 10px;
    border-radius: 5px;
    cursor: pointer;
    transition: border-color 0.3s ease;
    color: white;
    width: 23%;
    text-align: center;
}

.limitOrder-fee-box:last-child {
    margin-right: 0;
}

.limitOrder-fee-box.selected {
    border-color: #007bff;
}

.limitOrder-hidden-radio {
    display: none;
}
.fee-title{
    font-size: 1.5rem;
}

.addnode-button {
    flex: 1; /* 使得两个按钮平均分配空间 */
    padding: 10px 20px;
    cursor: pointer;
    margin: 10px; /* 为第一个按钮增加右边距 */
}
</style>
