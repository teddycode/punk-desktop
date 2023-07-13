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
            contractAddress: '0x07A4f63f643fE39261140DF5E613b9469eccEC86',
            contractABI:[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"int24","name":"tickLower","type":"int24"},{"indexed":true,"internalType":"int24","name":"tickUpper","type":"int24"},{"indexed":false,"internalType":"uint128","name":"amount","type":"uint128"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"address","name":"recipient","type":"address"},{"indexed":true,"internalType":"int24","name":"tickLower","type":"int24"},{"indexed":true,"internalType":"int24","name":"tickUpper","type":"int24"},{"indexed":false,"internalType":"uint128","name":"amount0","type":"uint128"},{"indexed":false,"internalType":"uint128","name":"amount1","type":"uint128"}],"name":"Collect","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":true,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"uint128","name":"amount0","type":"uint128"},{"indexed":false,"internalType":"uint128","name":"amount1","type":"uint128"}],"name":"CollectProtocol","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":true,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"paid0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"paid1","type":"uint256"}],"name":"Flash","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint16","name":"observationCardinalityNextOld","type":"uint16"},{"indexed":false,"internalType":"uint16","name":"observationCardinalityNextNew","type":"uint16"}],"name":"IncreaseObservationCardinalityNext","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint160","name":"sqrtPriceX96","type":"uint160"},{"indexed":false,"internalType":"int24","name":"tick","type":"int24"}],"name":"Initialize","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"sender","type":"address"},{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"int24","name":"tickLower","type":"int24"},{"indexed":true,"internalType":"int24","name":"tickUpper","type":"int24"},{"indexed":false,"internalType":"uint128","name":"amount","type":"uint128"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint8","name":"feeProtocol0Old","type":"uint8"},{"indexed":false,"internalType":"uint8","name":"feeProtocol1Old","type":"uint8"},{"indexed":false,"internalType":"uint8","name":"feeProtocol0New","type":"uint8"},{"indexed":false,"internalType":"uint8","name":"feeProtocol1New","type":"uint8"}],"name":"SetFeeProtocol","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":true,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"int256","name":"amount0","type":"int256"},{"indexed":false,"internalType":"int256","name":"amount1","type":"int256"},{"indexed":false,"internalType":"uint160","name":"sqrtPriceX96","type":"uint160"},{"indexed":false,"internalType":"uint128","name":"liquidity","type":"uint128"},{"indexed":false,"internalType":"int24","name":"tick","type":"int24"}],"name":"Swap","type":"event"},{"inputs":[{"internalType":"int24","name":"tickLower","type":"int24"},{"internalType":"int24","name":"tickUpper","type":"int24"},{"internalType":"uint128","name":"amount","type":"uint128"}],"name":"burn","outputs":[{"internalType":"uint256","name":"amount0","type":"uint256"},{"internalType":"uint256","name":"amount1","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"int24","name":"tickLower","type":"int24"},{"internalType":"int24","name":"tickUpper","type":"int24"},{"internalType":"uint128","name":"amount0Requested","type":"uint128"},{"internalType":"uint128","name":"amount1Requested","type":"uint128"}],"name":"collect","outputs":[{"internalType":"uint128","name":"amount0","type":"uint128"},{"internalType":"uint128","name":"amount1","type":"uint128"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint128","name":"amount0Requested","type":"uint128"},{"internalType":"uint128","name":"amount1Requested","type":"uint128"}],"name":"collectProtocol","outputs":[{"internalType":"uint128","name":"amount0","type":"uint128"},{"internalType":"uint128","name":"amount1","type":"uint128"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"fee","outputs":[{"internalType":"uint24","name":"","type":"uint24"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"feeGrowthGlobal0X128","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"feeGrowthGlobal1X128","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount0","type":"uint256"},{"internalType":"uint256","name":"amount1","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"flash","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint16","name":"observationCardinalityNext","type":"uint16"}],"name":"increaseObservationCardinalityNext","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint160","name":"sqrtPriceX96","type":"uint160"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"liquidity","outputs":[{"internalType":"uint128","name":"","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxLiquidityPerTick","outputs":[{"internalType":"uint128","name":"","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"int24","name":"tickLower","type":"int24"},{"internalType":"int24","name":"tickUpper","type":"int24"},{"internalType":"uint128","name":"amount","type":"uint128"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"mint","outputs":[{"internalType":"uint256","name":"amount0","type":"uint256"},{"internalType":"uint256","name":"amount1","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"observations","outputs":[{"internalType":"uint32","name":"blockTimestamp","type":"uint32"},{"internalType":"int56","name":"tickCumulative","type":"int56"},{"internalType":"uint160","name":"secondsPerLiquidityCumulativeX128","type":"uint160"},{"internalType":"bool","name":"initialized","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint32[]","name":"secondsAgos","type":"uint32[]"}],"name":"observe","outputs":[{"internalType":"int56[]","name":"tickCumulatives","type":"int56[]"},{"internalType":"uint160[]","name":"secondsPerLiquidityCumulativeX128s","type":"uint160[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"positions","outputs":[{"internalType":"uint128","name":"liquidity","type":"uint128"},{"internalType":"uint256","name":"feeGrowthInside0LastX128","type":"uint256"},{"internalType":"uint256","name":"feeGrowthInside1LastX128","type":"uint256"},{"internalType":"uint128","name":"tokensOwed0","type":"uint128"},{"internalType":"uint128","name":"tokensOwed1","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"protocolFees","outputs":[{"internalType":"uint128","name":"token0","type":"uint128"},{"internalType":"uint128","name":"token1","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint8","name":"feeProtocol0","type":"uint8"},{"internalType":"uint8","name":"feeProtocol1","type":"uint8"}],"name":"setFeeProtocol","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"slot0","outputs":[{"internalType":"uint160","name":"sqrtPriceX96","type":"uint160"},{"internalType":"int24","name":"tick","type":"int24"},{"internalType":"uint16","name":"observationIndex","type":"uint16"},{"internalType":"uint16","name":"observationCardinality","type":"uint16"},{"internalType":"uint16","name":"observationCardinalityNext","type":"uint16"},{"internalType":"uint8","name":"feeProtocol","type":"uint8"},{"internalType":"bool","name":"unlocked","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"int24","name":"tickLower","type":"int24"},{"internalType":"int24","name":"tickUpper","type":"int24"}],"name":"snapshotCumulativesInside","outputs":[{"internalType":"int56","name":"tickCumulativeInside","type":"int56"},{"internalType":"uint160","name":"secondsPerLiquidityInsideX128","type":"uint160"},{"internalType":"uint32","name":"secondsInside","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"bool","name":"zeroForOne","type":"bool"},{"internalType":"int256","name":"amountSpecified","type":"int256"},{"internalType":"uint160","name":"sqrtPriceLimitX96","type":"uint160"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"swap","outputs":[{"internalType":"int256","name":"amount0","type":"int256"},{"internalType":"int256","name":"amount1","type":"int256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"int16","name":"","type":"int16"}],"name":"tickBitmap","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"tickSpacing","outputs":[{"internalType":"int24","name":"","type":"int24"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"int24","name":"","type":"int24"}],"name":"ticks","outputs":[{"internalType":"uint128","name":"liquidityGross","type":"uint128"},{"internalType":"int128","name":"liquidityNet","type":"int128"},{"internalType":"uint256","name":"feeGrowthOutside0X128","type":"uint256"},{"internalType":"uint256","name":"feeGrowthOutside1X128","type":"uint256"},{"internalType":"int56","name":"tickCumulativeOutside","type":"int56"},{"internalType":"uint160","name":"secondsPerLiquidityOutsideX128","type":"uint160"},{"internalType":"uint32","name":"secondsOutside","type":"uint32"},{"internalType":"bool","name":"initialized","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"token0","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"token1","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}],

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
        //console.log(this.web3);
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
        async exchange() {  // 新增兑换方法
            this.userLoggedIn = this.$store.state.userLoggedIn;
            if (!this.userLoggedIn) {
                alert("您还没有连接钱包！");
            } else if (this.selectedToken1 && this.selectedToken2 && this.tokenAmount1 && this.tokenAmount2) {
                // TODO:这里兑换成功后将交易写入“交易”界面，即能够在交易界面看见该交易
                try {
                    //TODO:调用swap合约

                    alert("兑换成功！");
                } catch (error) {
                    console.error(error);
                }
            } else {
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