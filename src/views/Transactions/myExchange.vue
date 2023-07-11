<template>
    <div class="transaction">
        <div class="exchange-panel-transaction">
            <div class="settings">
                <span v-if="maxSlippage">{{ maxSlippage }}% 滑点</span> <!-- 显示选择的滑点 -->
                <button class="settings-btn" @click="showSettings = !showSettings">
                    <i class="fas fa-cog"></i> <!-- Font Awesome 齿轮图标 -->
                </button>
                <div class="settings-panel" v-if="showSettings">
                    <label>最大滑点
                        <select v-model="maxSlippage">
                            <option value="0.1">0.1%</option>
                            <option value="0.2">0.2%</option>
                            <option value="0.5">0.5%</option>
                            <option value="1">1%</option>
                            <!-- 可以增加更多的选项 -->
                        </select>
                    </label>
                </div>
            </div>
            <h2>兑换</h2>
            <div class="input-section-transaction">
                <div class="input-container">
                    <select id="token-select-transaction" v-model="selectedToken1" class="token-select" @change="calculateAmount('token1')">
                        <option value="">选择代币</option>
                        <option v-for="token in tokens" :key="token" :value="token">{{ token }}</option>
                    </select>
                    <input type="number" id="token-amount-transaction-1" v-model.trim="tokenAmount1" min="0" class="token-input" @input="calculateAmount('token1')">
                </div>
            </div>
            <div class="input-section-transaction">
                <div class="input-container">
                    <select id="token-select-transaction" v-model="selectedToken2" class="token-select" @change="calculateAmount('token2')">
                        <option value="">选择代币</option>
                        <option v-for="token in tokens" :key="token" :value="token">{{ token }}</option>
                    </select>
                    <input type="number" id="token-amount-transaction-2" v-model.trim="tokenAmount2" min="0" class="token-input" @input="calculateAmount('token2')">
                </div>
            </div>
            <div class="rate-display">
                <p v-if="userLoggedIn">{{ rateText }}</p>
                <p v-if="userLoggedIn&&ratesUpdateTime">汇率更新时间：{{ ratesUpdateTime }}</p>
            </div>

            <button class="wallet-btn-transaction" @click="showWalletSelector = true"  v-if="!this.$store.state.userLoggedIn">连接钱包</button>
            <button class="wallet-btn-transaction" @click="showWalletSelector = true" v-else>查看钱包</button>
            <button class="wallet-btn-transaction" @click="exchange" >兑换代币</button> <!-- 新增兑换按钮 -->
        </div>
        <!-- Insert the similar structure for 'tokens' and 'collections' tabs -->
        <!-- Wallet Selector -->
        <div v-if="showWalletSelector" class="overlay" @click="showWalletSelector = false">
            <myWallet></myWallet>
        </div>

    </div>
</template>

<script>
import {Web3} from "web3";
import myWallet from "@/components/myWallet.vue";

export default {
    components:{
        myWallet
    },
    data() {
        return {
            showSettings: false,
            maxSlippage: '0.01',
            customSlippage: 0,
            deadline: '',
            tokens: ['ETH', 'BTC', 'BNB', 'ADA', 'DOGE', 'XRP','USDC'],
            selectedToken1: '',
            selectedToken2: '',
            tokenAmount1: '',
            tokenAmount2: '',
            //data:'hello,world',
            showWalletSelector: false,
            userLoggedIn:false,
            rate:{},
            ratesTimer: null,
            ratesUpdateTime: null,
            lastModifiedToken: null,
            web3: null,
            contract: null,
            contractAddress: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
            contractABI:[{"inputs":[{"internalType":"address","name":"_factory","type":"address"},{"internalType":"address","name":"_WETH9","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"WETH9","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"bytes","name":"path","type":"bytes"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMinimum","type":"uint256"}],"internalType":"struct ISwapRouter.ExactInputParams","name":"params","type":"tuple"}],"name":"exactInput","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"tokenIn","type":"address"},{"internalType":"address","name":"tokenOut","type":"address"},{"internalType":"uint24","name":"fee","type":"uint24"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMinimum","type":"uint256"},{"internalType":"uint160","name":"sqrtPriceLimitX96","type":"uint160"}],"internalType":"struct ISwapRouter.ExactInputSingleParams","name":"params","type":"tuple"}],"name":"exactInputSingle","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[{"components":[{"internalType":"bytes","name":"path","type":"bytes"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMaximum","type":"uint256"}],"internalType":"struct ISwapRouter.ExactOutputParams","name":"params","type":"tuple"}],"name":"exactOutput","outputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"tokenIn","type":"address"},{"internalType":"address","name":"tokenOut","type":"address"},{"internalType":"uint24","name":"fee","type":"uint24"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMaximum","type":"uint256"},{"internalType":"uint160","name":"sqrtPriceLimitX96","type":"uint160"}],"internalType":"struct ISwapRouter.ExactOutputSingleParams","name":"params","type":"tuple"}],"name":"exactOutputSingle","outputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes[]","name":"data","type":"bytes[]"}],"name":"multicall","outputs":[{"internalType":"bytes[]","name":"results","type":"bytes[]"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"refundETH","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"selfPermit","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"expiry","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"selfPermitAllowed","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"expiry","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"selfPermitAllowedIfNecessary","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"selfPermitIfNecessary","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amountMinimum","type":"uint256"},{"internalType":"address","name":"recipient","type":"address"}],"name":"sweepToken","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amountMinimum","type":"uint256"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"feeBips","type":"uint256"},{"internalType":"address","name":"feeRecipient","type":"address"}],"name":"sweepTokenWithFee","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"int256","name":"amount0Delta","type":"int256"},{"internalType":"int256","name":"amount1Delta","type":"int256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"uniswapV3SwapCallback","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountMinimum","type":"uint256"},{"internalType":"address","name":"recipient","type":"address"}],"name":"unwrapWETH9","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountMinimum","type":"uint256"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"feeBips","type":"uint256"},{"internalType":"address","name":"feeRecipient","type":"address"}],"name":"unwrapWETH9WithFee","outputs":[],"stateMutability":"payable","type":"function"},{"stateMutability":"payable","type":"receive"}],
        };
    },
    watch: {
        rates: function() {
            if (this.lastModifiedToken) {
                this.calculateAmount(this.lastModifiedToken);
            }
        },
        tokenAmount1: function() {
            this.calculateAmount('token1');
        },
        tokenAmount2: function() {
            this.calculateAmount('token2');
        }
    },
    created:function() {
        this.fetchRates();
        this.setRatesTimer();
    },
    beforeMount() {
        this.web3 = new Web3('https://goerli.infura.io/v3/b8feaebcfe234f0c83af0e97c070e5f5');
        this.contract = new this.web3.eth.Contract(this.contractABI, this.contractAddress);
    },
    beforeUnmount: function() {
        // Clear the rates timer if it exists
        if (this.ratesTimer) {
            clearInterval(this.ratesTimer);
        }
    },
    computed: {
        rateText() {
            if (this.selectedToken1 && this.selectedToken2 && this.tokenAmount1 && this.tokenAmount2) {
                return `1 ${this.selectedToken1} = ${this.tokenAmount2 / this.tokenAmount1} ${this.selectedToken2}`;
            } else {
                return '';
            }
        }
    },
    methods: {
        async fetchRates() {
            let response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin,binancecoin,cardano,dogecoin,ripple,usd-coin&vs_currencies=usd');
            let data = await response.json();
            this.rates = {
                'ETH': data.ethereum.usd,
                'BTC': data.bitcoin.usd,
                'BNB': data.binancecoin.usd,
                'ADA': data.cardano.usd,
                'DOGE': data.dogecoin.usd,
                'XRP': data.ripple.usd,
                'USDC':data['usd-coin'].usd,
            };
            // 更新汇率更新时间
            this.ratesUpdateTime = new Date();
        },
        setRatesTimer() {
            this.ratesTimer = setInterval(() => {
                this.fetchRates();
            }, 60 * 1000);  // Update every minute
        },
        calculateAmount(tokenModified) {
            this.lastModifiedToken = tokenModified;
            if(tokenModified === 'token1' && this.selectedToken1 && this.selectedToken2 && this.tokenAmount1) {
                let rate = this.rates[this.selectedToken1] / this.rates[this.selectedToken2];
                this.tokenAmount2 = this.tokenAmount1 * rate;
            }
            else if(tokenModified === 'token2' && this.selectedToken1 && this.selectedToken2 && this.tokenAmount2) {
                let rate = this.rates[this.selectedToken2] / this.rates[this.selectedToken1];
                this.tokenAmount1 = this.tokenAmount2 * rate;
            }
        },
        exchange() {  // 新增兑换方法
            this.userLoggedIn = this.$store.state.userLoggedIn;
            if (!this.userLoggedIn) {
                alert("您还没有连接钱包！");
            } else if(this.selectedToken1&&this.selectedToken2&&this.tokenAmount1&&this.tokenAmount2){
                alert("兑换成功！");
                //console.log(this.userAddress);
                //console.log(this.userBalance);
                // TODO:这里兑换成功后将交易写入“交易”界面，即能够在交易界面看见该交易
                try {

                    const params = {
                        tokenIn: '0x0000000000000000000000000000000000000000', // 需要替换为相应的token地址
                        tokenOut:'0xdAC17F958D2ee523a2206206994597C13D831ec7',
                        fee: 1, // 假设为0.03，实际需要替换为相应的值
                        sqrtPriceLimitX96: 0, // 假设为0，实际需要替换为相应的值
                        amountIn: this.web3.utils.toWei(this.tokenAmount1, 'ether'),// 假设为1 Ether，实际需要替换为相应的值
                        recipient: '0x643AC6aFeFdC7E9E66648262C67247e1166946f9', // 需要替换为相应的地址
                        deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20分钟后的Unix时间戳
                        amountOutMinimum: 0, // 假设为0.1 Ether，实际需要替换为相应的值
                    };
                    this.contract.methods.exactInputSingle(params).call({ from: '0x643AC6aFeFdC7E9E66648262C67247e1166946f9' })
                        .then(result => {
                            console.log('The result is:', result);
                        })
                        .catch(error => {
                            console.error('An error occurred:', error);
                        });
                }catch (error){
                    console.error(error);
                }

            }else {
                alert("兑换信息不完整，请完善相关信息");
            }
        },
    }
};
</script>

<style scoped>
.settings {
    position: absolute;
    right: 10px;
    top: 10px;
}

.settings-btn {
    border: none;
    background: none;
    cursor: pointer;
    font-size: 20px;
}

.settings-panel {
    position: absolute;
    top: 100%;
    right: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 30px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #f9f9f9;
}
.settings-panel input {
    width: 100%;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 5px;
}

.settings-panel label {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.transaction {
    padding: 30px;
}

.exchange-panel-transaction {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    background-color: #F9FAFB;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    width: 500px;  /* increased width */
    margin: 50px auto;
}

.input-section-transaction {
    display: flex;
    align-items: center;
    gap: 5px;
}

.input-section-transaction label {
    margin-right: 5px;
}

.input-container {
    display: flex;
    align-items: center;
}

.token-input {
    padding: 14px;
    border: none;
    border-radius: 10px;
    background-color: #F5F7FA;
    width: 200px;  /* increased width */
    font-size: 16px;
}

.token-select {
    padding: 10px;
    border: 1px solid #34D399;
    border-radius: 5px;
    font-size: 16px;
    background-color: #F5F7FA;
}

.wallet-btn-transaction {
    padding: 10px 20px;
    border: none;
    cursor: pointer;
    background-color: #34D399;
    color: #F9FAFB;
    border-radius: 5px;
    font-size: 16px;
    font-weight: bold;
}

/* Wallet Selector Styles */
.wallet-selector {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    background-color: #fff;
    width: 300px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
    padding: 20px;
    z-index: 10;
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
.logout-btn {
    padding: 10px 20px;
    border: none;
    cursor: pointer;
    background-color: #34D399;  /* I've chosen a red color, feel free to change it */
    color: #F9FAFB;
    border-radius: 5px;
    font-size: 16px;
    font-weight: bold;
    margin-top: 20px;
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
.tokens-table-transaction th,
.tokens-table-transaction td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: center;
}

.tokens-table-transaction th {
    padding-top: 12px;
    padding-bottom: 12px;
    text-align: left;
    background-color: #34D399;
    color: white;
}
.tokens-panel-transaction {
    width: 100vw;
    height: 100vh;
}
.address {
    word-wrap: break-word;
}
.overlay {
    position: fixed; /* Fixed/sticky position */
    z-index: 1; /* Sit on top */
    left: 0;
    top: 0;
    width: 100%; /* Full width */
    height: 100%; /* Full height */
    overflow: auto; /* Enable scroll if needed */
}
</style>