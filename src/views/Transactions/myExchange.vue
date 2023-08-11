<template>
    <div class="transaction">
        <div class="chart-container">
            <!-- 这里可以放置图像或echarts -->
            <div id="chart" style="width: 100%; height: 400px; "></div>
        </div>
        <div class="exchange-panel-transaction">
            <div class="settings">
                <span>滑点：{{ customSlippage }}%</span>
                <el-button @click="dialogVisible = true" >
                        设置
                </el-button>
                <el-dialog v-model="dialogVisible" title="设置" width="20%" >
                    <div>
                        <div class="dialog-row">
                            <span>本地路由</span>
                            <el-switch v-model="localRoute"></el-switch>
                        </div>
                        <el-divider></el-divider>
                        <div class="dialog-row">
                            <span>最大滑点</span>
                            <span>{{ customSlippage }}%</span>
                            <el-button @click="showCustomSlippage = !showCustomSlippage">
                                自定义滑点
                            </el-button>
                        </div>
                        <div v-if="showCustomSlippage" class="dialog-row">
                            <el-radio-group v-model="radio">
                                <el-radio label="自动"></el-radio>
                                <el-radio label="自定义"></el-radio>
                            </el-radio-group>
                            <el-input
                                v-model="customSlippage"
                                :disabled="radio !== '自定义'"
                                @input="onInput"
                            >
                                <template #suffix>
                                    <span class="percentage-symbol">%</span>
                                </template>
                            </el-input>
                        </div>
                    </div>
                </el-dialog>
            </div>
            <h2 class="exchange-title">兑换</h2>
            <!-- Token 1 Selection and Input -->
            <div class="input-section-transaction">
                <div>
                    <label for="token1">From</label>
                </div>
                <div class="input-container">
                    <select v-model="selectedToken1" @change="calculateAmount('token1')" class="custom-select" id="token1">
                        <option class="select-option" v-for="item in tokens" :key="item.value" :value="item.value">{{ item.label }}</option>
                    </select>
                    <input type="number" v-model.trim="tokenAmount1" min="0" @input="calculateAmount('token1')" class="custom-input"/>
                </div>
            </div>

            <div class="input-section-transaction">
                <div>
                    <label for="token2">To</label>
                </div>
                <div class="input-container">
                    <select v-model="selectedToken2" @change="calculateAmount('token2')" class="custom-select" id="token2">
                        <option class="select-option" v-for="item in tokens" :key="item.value" :value="item.value">{{ item.label }}</option>
                    </select>
                    <input type="number" v-model.trim="tokenAmount2" min="0" @input="calculateAmount('token2')" class="custom-input"/>
                </div>
            </div>
            <div class="rate-display">
                <p>{{ rateText }}</p>
                <p v-if="ratesUpdateTime">汇率更新时间：{{ ratesUpdateTime }}</p>
            </div>
            <addnode-button style="width: 150px; height: 50%; margin-bottom: 20px;" @click="exchange()">兑换代币</addnode-button>
        </div>
    </div>
</template>


<script>
// import {Web3} from "web3";
import {Contract, ethers} from "ethers";
import addnodeButton from "@/components/buttons/addnodeButton.vue";
import axios from "axios";
import * as echarts from 'echarts';

export default {
    components:{
        addnodeButton
    },
    data() {
        return {
            dialogVisible: false,
            localRoute: false,
            maxSlippage: '0.01',
            customSlippage: 0.01,
            showCustomSlippage: false,
            radio: '自动',
            slippages: [
                { label: '0.01%', value: '0.01' },
                { label: '0.1%', value: '0.1' },
                { label: '0.2%', value: '0.2' },
                { label: '0.5%', value: '0.5' },
                { label: '1%', value: '1' }
            ],
            deadline: '',
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
            tokenAddresses : {
                'ETH': '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',  // 这是ETH的伪地址，用于某些合约交互
                'BTC': '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',  // 这是WBTC (Wrapped Bitcoin)的地址，因为BTC原生并不在Ethereum网络上
                'BNB': '0xB8c77482e45F1F44dE1745F52C74426C631bDD52',  // 这是Binance Token在Ethereum上的一个地址，但是它在Binance Smart Chain上也有原生版本
                'ADA': '0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47',  // 请注意，ADA原生在Cardano网络上，这可能是其在Ethereum上的一个版本
                'DOGE': '0x4206931337dc273a630d328dA6441786BfaD668f',  // 这是DogeToken的地址，DOGE原生并不在Ethereum网络上
                'XRP': '0xCed0CE92F4bdC3c2201E255FAF12f05cf8206dA8',  // 请注意，XRP原生在Ripple网络上，这可能是其在Ethereum上的一个版本
                'USDC': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
                'DAI': '0x6B175474E89094C44Da98b954EedeAC495271d0F',
                'token0':'0x01e3C52AA1CdfaE2228A87bf18A408B18041E1A9',
                'token1':'0x3ca6d0aa9a36cdA6869322e52caa0690398589b4',
            },
            selectedToken1: 'ETH',
            selectedToken2: 'USDC',
            swapToken0:'',
            swapToken1:'',
            tokenAmount1: '',
            tokenAmount2: '',
            rate:{},
            ratesTimer: null,
            ratesUpdateTime: null,
            lastModifiedToken: null,
            web3: null,
            provider:null,
            wallet:null,
            myliquidityProviderAddress :  "0xFC633551d65D134b3351814b1dB5628c8201056E",
            MyLiquidityProviderAbi:require('../../../frontend/frontend/abi/MyLiquidityProvider.json').abi,
            MyLiquidityProvider: null,
            hookAddress :  "0x9B6C21702e00fa2320989C5229b11B98F5819E21",
            hookAbi:require('../../../frontend/frontend/abi/LimitOrder.json').abi,
            poolKey: {
                currency0: '',
                currency1: '',
                fee: 60,
                tickSpacing: 60,
                hooks:null ,
            },
            swapParams: {
                zeroForOne: false,
                amountSpecified: 0,
                sqrtPriceLimitX96: ethers.BigNumber.from('7922816251426433759354395033600')
            },
            erc20Abi : require('../../../frontend/frontend/abi/Token0.json').abi,
            token0: null,
            token1: null,
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
        },
        selectedToken1() {
            this.fetchData();
        },
        selectedToken2() {
            this.fetchData();
        }
    },
    created:function() {
        this.fetchRates();
        this.setRatesTimer();
        this.fetchData();
    },
    async beforeMount() {
        if (typeof window.ethereum !== 'undefined') {
            // 使用MetaMask提供的provider
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            try {
                // 请求账户访问
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const signer = provider.getSigner();
                const accounts = await signer.getAddress();
                this.fromAccount = accounts; // 设置第一个账户为默认账户
                this.wallet = signer
                this.MyLiquidityProvider = new ethers.Contract(this.myliquidityProviderAddress,this.MyLiquidityProviderAbi,signer)
                this.poolKey.hooks = this.hookAddress
                this.token0 = new ethers.Contract(this.tokenAddresses.token0,this.erc20Abi,signer)
                this.token1 = new ethers.Contract(this.tokenAddresses.token1,this.erc20Abi,signer)
                console.log("Account Address:", this.fromAccount);
                console.log("Wallet Object:", this.wallet);
                console.log("MyLiquidityProvider Contract:", this.MyLiquidityProvider);
                console.log("poolKey.hooks Contract:", this.poolKey.hooks);
                console.log("token0: " , this.token0)
                console.log("token1: " , this.token1)
            } catch (error) {
                console.error("Error accessing accounts: ", error);
            }
        } else {
            console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
        }
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
        },
        usdValue1() {
            if (this.tokenAmount1 && this.rates[this.selectedToken1]) {
                return (this.tokenAmount1 * this.rates[this.selectedToken1]).toFixed(2);
            }
            return '';
        },
        usdValue2() {
            if (this.tokenAmount2 && this.rates[this.selectedToken2]) {
                return (this.tokenAmount2 * this.rates[this.selectedToken2]).toFixed(2);
            }
            return '';
        }
    },
    methods: {
        async getSlot0(contract, poolKey) {
            let poolId = this.getPoolId(poolKey);

            console.log(`PoolId: ${poolId}`);
            let slot0 = await contract.getSlot0(poolId);
            console.log(`Returned slot0: ${JSON.stringify(slot0)}`);
            return poolId;
        },
        getPoolId(poolKey) {
        return ethers.utils.solidityKeccak256(
        ["bytes"],
        [ethers.utils.defaultAbiCoder.encode(
            ["address", "address", "uint24", "int24", "address"],
            [poolKey.currency0, poolKey.currency1, poolKey.fee, poolKey.tickSpacing, poolKey.hooks]
                )]
            );
        },
        getTokenAddresses(selectedToken1, selectedToken2) {
            // eslint-disable-next-line no-undef
            if (BigInt(this.tokenAddresses[selectedToken1])<BigInt(this.tokenAddresses[selectedToken2])){
            this.swapToken0 = this.tokenAddresses[selectedToken1];
            this.swapToken1 = this.tokenAddresses[selectedToken2];
            this.swapParams.amountSpecified = this.tokenAmount1;
            this.swapParams.zeroForOne = true
        }else {
                this.swapToken1 = this.tokenAddresses[selectedToken1];
                this.swapToken0 = this.tokenAddresses[selectedToken2];
                this.swapParams.amountSpecified = this.tokenAmount1;
            }
            if (!this.swapToken0 || !this.swapToken1) {
                throw new Error('Invalid token selection. Address not found.');
            }
            console.log("token0Address: " + this.swapToken0)
            console.log("token1Address: " + this.swapToken1)
        },
        onInput(value) {
            // Remove non-numeric and non-period characters
            this.customSlippage = value.replace(/[^0-9.]/g, '');
        },
        async fetchRates() {
            let response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin,binancecoin,cardano,dogecoin,ripple,usd-coin,dai&vs_currencies=usd');
            let data = await response.json();
            this.rates = {
                'ETH': data.ethereum.usd,
                'BTC': data.bitcoin.usd,
                'BNB': data.binancecoin.usd,
                'ADA': data.cardano.usd,
                'DOGE': data.dogecoin.usd,
                'XRP': data.ripple.usd,
                'USDC':data['usd-coin'].usd,
                'DAI': data.dai.usd,
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
        async approveERC20(contract, toAddress, amount) {
            // 批准ERC20代币
            let tx = await contract.approve(toAddress, amount);
            // 等待交易被挖矿
            let receipt = await tx.wait();
            console.log(`Transaction hash: ${receipt.transactionHash}`);
        },
        async executeSwap(contract, poolKey, swapParams){
            // Set position parameters
            console.log("begin swap")
            let to0params = {
                tickLower: 840000, // lower price 0.5
                tickUpper: 876600, // upper price 1.5
                liquidityDelta: 0
            }
            await this.approveERC20(this.token0,this.myliquidityProviderAddress,ethers.utils.parseUnits("21000000", 18))
            await this.approveERC20(this.token1,this.myliquidityProviderAddress,ethers.utils.parseUnits("21000000", 18))

            let tx1 = await contract.setPositionParameters(poolKey, to0params);
            await tx1.wait();
            console.log('tx1 finish')
            console.log(swapParams)
            let tx2 = await contract.setSwapParameters(poolKey, swapParams);
            console.log("begin swap1")
            await tx2.wait();
            console.log("Position parameters set successfully");
            // swap
            let tx3 = await contract.executeSwap();
            await tx3.wait();
            console.log("finish swap")
        },
        async exchange() {  // 新增兑换方法
            this.userLoggedIn = this.$store.state.userLoggedIn;
            if (!this.userLoggedIn) {
                alert("您还没有连接钱包！");
            } else if (this.selectedToken1 && this.selectedToken2 && this.tokenAmount1 ) {
                // TODO:这里兑换成功后将交易写入“交易”界面，即能够在交易界面看见该交易
                try {
                    // console.log("begin swap")
                    this.getTokenAddresses(this.selectedToken1,this.selectedToken2)
                    this.poolKey.currency0 = this.swapToken0
                    this.poolKey.currency1 = this.swapToken1
                    console.log('poolkey:' , this.poolKey)
                    console.log('swapParams', this.swapParams)
                    this.executeSwap(this.MyLiquidityProvider,this.poolKey,this.swapParams)
                    alert("兑换成功！");
                } catch (error) {
                    console.error(error);
                }
            } else {
                alert("兑换信息不完整，请完善相关信息");
            }
        },
        async fetchData() {
            const coinMapping = {
                'ETH': 'ethereum',
                'BTC': 'bitcoin',
                'BNB': 'binancecoin',
                'ADA': 'cardano',
                'DOGE': 'dogecoin',
                'XRP': 'ripple',
                'USDC': 'usd-coin',
                'DAI': 'dai'
            };
            let coin1 = coinMapping[this.selectedToken1]
            let coin2 = coinMapping[this.selectedToken2]
            let response1 = await axios.get(`https://api.coingecko.com/api/v3/coins/${coin1}/market_chart`, {
                params: {
                    vs_currency: 'usd',
                    days: 1,
                }
            });

            let response2 = await axios.get(`https://api.coingecko.com/api/v3/coins/${coin2}/market_chart`, {
                params: {
                    vs_currency: 'usd',
                    days: 1,
                }
            });

            let prices1 = response1.data.prices.map(p => p[1]);
            let prices2 = response2.data.prices.map(p => p[1]);
            console.log(`Fetching data for: ${this.selectedToken1} and ${this.selectedToken2}`);
            this.ratioValues = prices1.map((price, index) => {
                return price / prices2[index];
            });

            this.times = response1.data.prices.map(p => {
                const date = new Date(p[0]);
                return `${date.getHours()}:${date.getMinutes()}`;
            });
            //this.calculateYAxisRange();
            this.drawChart();
        },
        drawChart() {
            let currentHour = new Date().getHours();
            let times = [];
            for (let i = 1; i <= 24; i++) {
                let hour = (currentHour - i + 24) % 24;
                times.unshift(hour + ":00");
            }

            let minY = Math.min(...this.ratioValues) * 0.95;
            let maxY = Math.max(...this.ratioValues) * 1.05;

            let chart = echarts.init(document.getElementById('chart'));
            let option = {
                title: {
                    text: `${this.selectedToken1} / ${this.selectedToken2} `,
                    left: 'center',
                    textStyle: {
                        color: '#FFFFFF'
                    }
                },
                grid: {
                    left: '15%',
                    right: '5%',
                    bottom: '15%'
                },
                xAxis: {
                    type: 'category',
                    data: times,  // 使用我们新创建的times数组
                    axisLabel: {
                        rotate: 45,
                        textStyle: {
                            color: '#FFFFFF'
                        }
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#FFFFFF'
                        }
                    },
                },
                yAxis: {
                    type: 'value',
                    min: Math.floor(minY),
                    max: Math.ceil(maxY),
                    axisLine: {
                        lineStyle: {
                            color: '#FFFFFF'
                        }
                    },
                    splitLine: {
                        lineStyle: {
                            type: 'dashed',
                            color: '#CCCCCC'
                        }
                    }
                },
                tooltip: {  // 添加tooltip来在鼠标悬停时显示信息
                    trigger: 'item',
                    formatter: '{b}: {c}'
                },
                series: [{
                    data: this.ratioValues,
                    type: 'scatter',  // 更改为散点图
                    itemStyle: {
                        color: '#0088CC'
                    },
                }],
            };
            chart.setOption(option);
        }
    }
};
</script>

<style scoped>
.exchange-title{
    margin-top: 20px;
    font-size: 2rem;
    font-weight: bold;
    color: white;
}

.settings {
    position: absolute;
    right: 10px;
    top: 10px;
    color: #007bff;
}
.settings > .el-button {
    background-color: #2D3748 !important; /* 深色背景 */
    color: white !important; /* 白色字体 */
    border: 1px solid white !important; /* 添加白色边框 */
    transition: background-color 0.3s; /* 平滑的背景色转换效果 */
    margin-left: 10px;
}

.settings > .el-button:hover {
    background-color: #1A202C !important; /* 当鼠标悬停时的更深的背景色 */
}

.settings-panel input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin-top: 10px;
}

.settings-panel label {
    display: flex;
    flex-direction: column;
    gap: 10px;

}

.transaction {
    display: flex;
    justify-content: space-between;
    gap: 40px;
    padding: 0 30px;  /* 设置左右两侧的间距为40px */
}
.chart-container {
    flex: 1.5;
    background: transparent;  /* 设置为透明背景 */
    height: 400px;
    padding: 20px;
    border-radius: 20px;  /* 设置圆角 */
    margin: 75px auto;
    border: 1px solid white;  /* 临时的边框，方便我们看到这个容器，稍后可以删除 */
}
.custom-input, .custom-select {
    max-width: 80%;
    background-color: transparent; /* Set the background to transparent */
    border: 1px solid white; /* Set the border to white */
    color: white; /* Set the text color to white */
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 16px;
    outline: none;
    transition: border-color 0.15s ease-in-out;
}
.custom-input::placeholder, .custom-select::placeholder {
    color: rgba(255, 255, 255, 0.7); /* Lighter white for placeholders */
}
.custom-input:focus, .custom-select:focus {
    border-color: white; /* White border on focus */
    box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.25); /* White shadow on focus */
}
.select-option{
    color: white;
    background-color: #2D3748;
}
.percentage-symbol {
    padding-left: 5px;
}
.exchange-panel-transaction {
    flex: 1;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    background-color: transparent;
    border-radius: 10px;
    /*box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);*/
    width: 80%;
    margin: 50px auto;
    padding: 20px;
    border: 1px solid white; /* Add a white border */
}

.input-section-transaction {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
      /* 增大上下间距 */
}
.input-container {
    display: flex;
    align-items: center;
    gap: 15px;  /* 设置选择器和输入框之间的间距 */
}
.input-section-transaction label {
    margin-right: 10px;
    color: white;
}

.rate-display p {
    color: white;
}
.dialog-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
}

</style>
