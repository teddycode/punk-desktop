<template>
  <Background>
    <div class="transaction">
      <!-- <div class="chart-container">
          <div id="chart" style="width: 100%; height: 360px ;margin-top: 20px;margin-bottom: 20px "></div>
      </div> -->
      <div class="exchange-panel-transaction">
        <div class="settings">
          <span>滑点：{{ customSlippage }}%</span>
          <el-button @click="dialogVisible = true">
            设置
          </el-button>
          <el-dialog v-model="dialogVisible" title="设置" width="20%">
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
        <!-- <h2 class="exchange-title">兑换</h2> -->
        <!-- Token 1 Selection and Input -->
        <div class="input-section-transaction">
          <div>
            <label for="token1">From</label>
          </div>
          <div class="input-container">
            <select id="token1" v-model="selectedToken1" class="custom-select" @change="calculateAmount('token1')">
              <option v-for="item in tokens" :key="item.value" :value="item.value" class="select-option">{{
                  item.label
                }}
              </option>
            </select>
            <input v-model.trim="tokenAmount1" class="custom-input" min="0" type="number"
                   @input="calculateAmount('token1')"/>
          </div>
        </div>
        <div class="input-section-transaction">
          <div>
            <label for="token2">To</label>
          </div>
          <div class="input-container">
            <select id="token2" v-model="selectedToken2" class="custom-select" @change="calculateAmount('token2')">
              <option v-for="item in tokens" :key="item.value" :value="item.value" class="select-option">{{
                  item.label
                }}
              </option>
            </select>
            <input v-model.trim="tokenAmount2" class="custom-input" min="0" type="number"
                   @input="calculateAmount('token2')"/>
          </div>
        </div>
        <div class="rate-display">
          <p>{{ rateText }}</p>
          <p v-if="ratesUpdateTime">汇率更新时间：{{ ratesUpdateTime }}</p>
        </div>
        <shape-button style="width: 150px; height: 15%;" @click="exchange()">兑换</shape-button>
      </div>
    </div>
  </Background>
</template>


<script>
// import {Web3} from "web3";
import { ethers } from 'ethers'
import ShapeButton from '@page/core/components/ShapeButton.vue'
import axios from 'axios'
import * as echarts from 'echarts'
import { limitOrderPoolKey } from '@page/core/Exchange/services/address'
import { swap } from '@page/core/Exchange/services/swap'
import { getPoolPrice } from '@page/core/Exchange/services/getprice'
import { useUserStore } from '@store/users'
import Background from '@page/core/components/Background.vue'

export default {
  components: {
    Background,
    ShapeButton
  },
  data: function () {
    return {
      store: useUserStore(),
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
        { label: 'token0', value: 'token0' },
        { label: 'token1', value: 'token1' },
      ],
      tokenAddresses: {
        'ETH': '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',  // 这是ETH的伪地址，用于某些合约交互
        'BTC': '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',  // 这是WBTC (Wrapped Bitcoin)的地址，因为BTC原生并不在Ethereum网络上
        'BNB': '0xB8c77482e45F1F44dE1745F52C74426C631bDD52',  // 这是Binance Token在Ethereum上的一个地址，但是它在Binance Smart Chain上也有原生版本
        'ADA': '0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47',  // 请注意，ADA原生在Cardano网络上，这可能是其在Ethereum上的一个版本
        'DOGE': '0x4206931337dc273a630d328dA6441786BfaD668f',  // 这是DogeToken的地址，DOGE原生并不在Ethereum网络上
        'XRP': '0xCed0CE92F4bdC3c2201E255FAF12f05cf8206dA8',  // 请注意，XRP原生在Ripple网络上，这可能是其在Ethereum上的一个版本
        'USDC': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        'DAI': '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        'token0': '0x7C259EAdFaB9DE34aEc1690f9E27f18435493b3b',
        'token1': '0x8161f63d320ee3EF6feD7dFA94923d940b19C8b1',
      },
      selectedToken1: 'ETH',
      selectedToken2: 'USDC',
      swapToken0: '',
      swapToken1: '',
      tokenAmount1: '',
      tokenAmount2: '',
      rate: {},
      ratesTimer: null,
      ratesUpdateTime: null,
      lastModifiedToken: null,
      web3: null,
      provider: null,
      wallet: null,
    }
  },
  watch: {
    rates: function () {
      if (this.lastModifiedToken) {
        this.calculateAmount(this.lastModifiedToken)
      }
    },
    // tokenAmount1: function() {
    //     this.calculateAmount('token1');
    // },
    // tokenAmount2: function() {
    //     this.calculateAmount('token2');
    // },
    selectedToken1() {
      this.fetchData()
    },
    selectedToken2() {
      this.fetchData()
    }
  },
  created: function () {
    this.fetchRates()
    this.setRatesTimer()
    this.fetchData()
  },
  async beforeMount() {
    if (typeof window.ethereum !== 'undefined') {
      // 使用MetaMask提供的provider
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      try {
        // 请求账户访问
        await window.ethereum.request({ method: 'eth_requestAccounts' })
        const signer = provider.getSigner()
        this.fromAccount = await signer.getAddress() // 设置第一个账户为默认账户
        this.wallet = signer
      } catch (error) {
        console.error('Error accessing accounts: ', error)
      }
    } else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  },
  beforeUnmount: function () {
    // Clear the rates timer if it exists
    if (this.ratesTimer) {
      clearInterval(this.ratesTimer)
    }
  },
  computed: {
    rateText() {
      if (this.selectedToken1 && this.selectedToken2 && this.tokenAmount1 && this.tokenAmount2) {
        return `1 ${this.selectedToken1} = ${this.tokenAmount2 / this.tokenAmount1} ${this.selectedToken2}`
      } else {
        return ''
      }
    },
  },
  methods: {
    onInput(value) {
      // Remove non-numeric and non-period characters
      this.customSlippage = value.replace(/[^0-9.]/g, '')
    },
    async fetchRates() {
      try {
        let response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin,binancecoin,cardano,dogecoin,ripple,usd-coin,dai&vs_currencies=usd')
        // TODO 收费api请放到后端处理
        let data = await response.json()
        this.rates = {
          'ETH': data.ethereum.usd,
          'BTC': data.bitcoin.usd,
          'BNB': data.binancecoin.usd,
          'ADA': data.cardano.usd,
          'DOGE': data.dogecoin.usd,
          'XRP': data.ripple.usd,
          'USDC': data['usd-coin'].usd,
          'DAI': data.dai.usd,
        }
        // 更新汇率更新时间
        this.ratesUpdateTime = new Date()
      } catch (err) {
        console.log(err)
      }
    },
    setRatesTimer() {
      this.ratesTimer = setInterval(() => {
        this.fetchRates()
      }, 60 * 1000)  // Update every minute
    },
    async calculateAmount(tokenModified) {
      this.lastModifiedToken = tokenModified
      if (tokenModified === 'token1' && this.selectedToken1 && this.selectedToken2 && this.tokenAmount1) {
        if (this.selectedToken1 === 'token0' && this.selectedToken2 === 'token1') {
          let rate = await getPoolPrice(limitOrderPoolKey)
          rate = Number(rate)
          console.log('rate: ', rate)
          console.log('amount1: ', this.tokenAmount1)
          this.tokenAmount2 = parseFloat((this.tokenAmount1 * rate).toFixed(6))
          console.log('amount2: ', this.tokenAmount2)
        } else if (this.selectedToken1 === 'token1' && this.selectedToken2 === 'token0') {
          let rate = await getPoolPrice(limitOrderPoolKey)
          rate = Number(1 / rate)
          console.log('rate: ', rate)
          console.log('amount1: ', this.tokenAmount1)
          this.tokenAmount2 = parseFloat((this.tokenAmount1 * rate).toFixed(6))
          console.log('amount2: ', this.tokenAmount2)
        } else {
          let rate = this.rates[this.selectedToken1] / this.rates[this.selectedToken2]
          this.tokenAmount2 = parseFloat((this.tokenAmount1 * rate).toFixed(6)) // Round and then parse
          console.log('正常兑换')
        }
      } else if (tokenModified === 'token2' && this.selectedToken1 && this.selectedToken2 && this.tokenAmount2) {
        if (this.selectedToken1 === 'token1' && this.selectedToken2 === 'token0') {
          let rate = await getPoolPrice(limitOrderPoolKey)
          rate = Number(rate)
          this.tokenAmount1 = parseFloat((this.tokenAmount2 * rate).toFixed(6))
        } else if (this.selectedToken1 === 'token0' && this.selectedToken2 === 'token1') {
          let rate = await getPoolPrice(limitOrderPoolKey)
          rate = Number(1 / rate)
          this.tokenAmount1 = parseFloat((this.tokenAmount2 * rate).toFixed(6))
        } else {
          let rate = this.rates[this.selectedToken2] / this.rates[this.selectedToken1]
          this.tokenAmount1 = parseFloat((this.tokenAmount2 * rate).toFixed(6)) // Round and then parse
        }
      }
    },
    async exchange() {
      this.userLoggedIn = store.isLogin
      if (!this.userLoggedIn) {
        alert('您还没有连接钱包！')
      } else if (this.selectedToken1 && this.selectedToken2 && this.tokenAmount1) {
        try {
          try {
            console.log('poolkey', limitOrderPoolKey)
            console.log('fromamonut:', ethers.utils.parseUnits(this.tokenAmount1.toString(), 18))
            if (this.tokenAddresses[this.selectedToken1] > this.tokenAddresses[this.selectedToken2]) {
              await swap(limitOrderPoolKey, ethers.utils.parseUnits(this.tokenAmount1.toString(), 18), false)
            } else {
              await swap(limitOrderPoolKey, ethers.utils.parseUnits(this.tokenAmount1.toString(), 18), true)
            }
          } catch (err) {
            console.log(err)
          }
          console.log('执行了兑换！')
          let price0 = await getPoolPrice(limitOrderPoolKey) //获取最新的市价

          console.log('最新市价：' + price0)
          // 发送price0到后端
          const response = await axios.post('http://localhost:8080/myExchange/myExchange', {
            price0: price0.toString()
          })

          if (response.data.message) {
            alert('兑换成功并成功更新订单状态!')
          } else {
            alert('兑换成功但更新订单状态失败!')
          }
        } catch (error) {
          console.error(error)
          alert('兑换失败！')
        }
      } else {
        alert('兑换信息不完整，请完善相关信息')
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
        'DAI': 'dai',
        'token0': 'token0',
        'token1': 'token1'
      }
      let coin1 = coinMapping[this.selectedToken1]
      let coin2 = coinMapping[this.selectedToken2]
      try {
        let response1 = await axios.get(`https://api.coingecko.com/api/v3/coins/${coin1}/market_chart`, {
          params: {
            vs_currency: 'usd',
            days: 1,
          }
        })

        let response2 = await axios.get(`https://api.coingecko.com/api/v3/coins/${coin2}/market_chart`, {
          params: {
            vs_currency: 'usd',
            days: 1,
          }
        })

        let prices1 = response1.data.prices.map(p => p[1])
        let prices2 = response2.data.prices.map(p => p[1])
        console.log(`Fetching data for: ${this.selectedToken1} and ${this.selectedToken2}`)

        // 计算比值并确保结果总是大于1
        this.ratioValues = prices1.map((price1, index) => {
          const price2 = prices2[index]
          return (price1 >= price2) ? (price1 / price2) : (price2 / price1)
        })
        this.times = response1.data.prices.map(p => {
          const date = new Date(p[0])
          return `${date.getHours()}:${date.getMinutes()}`
        })
        //this.calculateYAxisRange();
        this.drawChart()
      } catch (err) {
        console.log(err)
      }
    },
    drawChart() {
      let currentHour = new Date().getHours()
      let times = []
      for (let i = 1; i <= 24; i++) {
        let hour = (currentHour - i + 24) % 24
        times.unshift(hour + ':00')
      }

      let validRatioValues = this.ratioValues.filter(val => typeof val === 'number' && !isNaN(val))

      let minY = Math.min(...validRatioValues) * 0.999
      let maxY = Math.max(...validRatioValues) * 1.001
      // 修改 minY 和 maxY 的取整方法
      minY = minY > 100 ? Math.floor(minY) : parseFloat(minY.toFixed(2))
      maxY = maxY > 100 ? Math.ceil(maxY) : parseFloat(maxY.toFixed(2))
      // 确保 minY 和 maxY 不相等
      if (minY === maxY) {
        minY -= 0.01
        maxY += 0.01
      }
      let items = []
      for (let i = 1; i < this.ratioValues.length; i++) {
        let startValue = this.ratioValues[i - 1]
        let endValue = this.ratioValues[i]
        let color = endValue < startValue ? 'red' : 'green'
        items.push({
          value: [times[i - 1], startValue, endValue],
          itemStyle: {
            color: color
          }
        })
      }

      // 我们从索引1开始，所以times数组也要相应地减少一个元素
      times.shift()

      let chart = echarts.init(document.getElementById('chart'))
      let option = {
        title: {
          text: `${this.selectedToken1} / ${this.selectedToken2}`,
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
          data: times,
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
          }
        },
        yAxis: {
          type: 'value',
          min: minY,
          max: maxY,
          show: true,  // 确保 y 轴显示
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
        tooltip: {
          trigger: 'axis',
          formatter: function (params) {
            let startValue = params[0].value[1]
            let endValue = params[0].value[2]
            return `${params[0].name}: 从 ${startValue} 到 ${endValue}`
          }
        },
        series: [{
          type: 'custom',
          renderItem: function (params, api) {
            let categoryIndex = api.value(0)
            let start = api.coord([categoryIndex, api.value(1)])
            let end = api.coord([categoryIndex, api.value(2)])
            return {
              type: 'rect',
              shape: {
                x: start[0] - 5,
                y: end[1],
                width: 10,
                height: start[1] - end[1]
              },
              style: api.style()
            }
          },
          data: items
        }]
      }
      chart.setOption(option)
    }
  }
}
</script>

<style scoped>
/* .exchange-title{
    margin-top: 20px;
    font-size: 2rem;
    font-weight: bold;
    color: white;
} */

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
  margin-top: 30px;
  display: flex;
  justify-content: space-between;
  gap: 40px;
  padding: 0 30px; /* 设置左右两侧的间距为40px */
}

.chart-container {
  flex: 1.5;
  background: transparent; /* 设置为透明背景 */
  height: 400px;
  padding: 20px;
  border-radius: 20px; /* 设置圆角 */
  margin: 75px auto;
  border: 1px solid white; /* 临时的边框，方便我们看到这个容器，稍后可以删除 */
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

.select-option {
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
  margin: 1px auto;
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
  gap: 15px; /* 设置选择器和输入框之间的间距 */
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
