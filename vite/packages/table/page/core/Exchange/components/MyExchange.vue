<template>
  <div class="transaction">
    <!-- <div class="chart-container">
          <div id="chart" style="width: 100%; height: 360px ;margin-top: 20px;margin-bottom: 20px "></div>
      </div> -->
    <div class="exchange-panel-transaction">
      <div class="settings">
        <span>滑点：{{ customSlippage }}%</span>
        <a-button @click="dialogVisible = true"> 设置</a-button>
        <a-modal v-model:visible="dialogVisible" title="设置" width="600px">
          <div>
            <div class="dialog-row">
              <span>本地路由</span>
              <a-switch v-model:checked="localRoute"></a-switch>
            </div>
            <a-divider></a-divider>
            <div class="dialog-row">
              <span>最大滑点</span>
              <span>{{ customSlippage }}%</span>
              <a-button @click="showCustomSlippage = !showCustomSlippage"> 自定义滑点</a-button>
            </div>
            <div v-if="showCustomSlippage" class="dialog-row">
              <a-radio-group v-model:value="radio">
                <a-radio value="自动"></a-radio>
                <a-radio value="自定义"></a-radio>
              </a-radio-group>
              <a-input v-model:value="customSlippage" :disabled="radio !== '自定义'" @input="onInput">
                <template #suffix>
                  <span class="percentage-symbol">%</span>
                </template>
              </a-input>
            </div>
          </div>
        </a-modal>
      </div>
      <!-- <h2 class="exchange-title">兑换</h2> -->
      <!-- Token 1 Selection and Input -->
      <div class="input-section-transaction">
        <div style="font-size: 16px">
          <label for="token1">From</label>
        </div>
        <div class="input-container">
          <a-select
            id="token1"
            v-model:value="selectedToken1"
            class="custom-select"
            @change="calculateAmount('token1')"
          >
            <a-select-option v-for="item in tokens" :key="item.value" :value="item.value" class="select-option">
              {{ item.label }}
            </a-select-option>
          </a-select>
          <a-input-number
            v-model.trim="tokenAmount1"
            class="custom-input"
            :min="0"
            :precision="6"
            @change="calculateAmount('token1')"
          />
        </div>
      </div>
      <div class="input-section-transaction">
        <div style="font-size: 16px">
          <label for="token2">To</label>
        </div>
        <div class="input-container">
          <a-select
            id="token2"
            v-model:value="selectedToken2"
            class="custom-select"
            @change="calculateAmount('token2')"
          >
            <a-select-option v-for="item in tokens" :key="item.value" :value="item.value" class="select-option">
              {{ item.label }}
            </a-select-option>
          </a-select>
          <a-input-number
            v-model.trim="tokenAmount2"
            class="custom-input"
            :min="0"
            :precision="6"
            @change="calculateAmount('token2')"
          />
        </div>
      </div>
      <div class="rate-display">
        <p>{{ rateText }}</p>
        <p v-if="ratesUpdateTime">汇率更新时间：{{ ratesUpdateTime }}</p>
      </div>
      <shape-button style="font-size: 16px; text-align: center; width: 100px; height: 40px" @click="exchange()"
        >兑换
      </shape-button>
    </div>
  </div>
</template>

<script>
// import {Web3} from "web3";
import { ethers } from 'ethers';
import ShapeButton from '@page/core/components/ShapeButton.vue';
import axios from 'axios';
import * as echarts from 'echarts';
import { limitOrderPoolKey } from '@page/core/Exchange/services/address';
import { swap } from '@page/core/Exchange/services/swap';
import { getPoolPrice } from '@page/core/Exchange/services/getprice';
import { useUserStore } from '@store/users';

export default {
  components: {
    ShapeButton,
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
        { label: '1%', value: '1' },
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
        ETH: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        BTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        BNB: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52',
        ADA: '0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47',
        DOGE: '0x4206931337dc273a630d328dA6441786BfaD668f',
        XRP: '0xCed0CE92F4bdC3c2201E255FAF12f05cf8206dA8',
        USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        token0: '0x7C259EAdFaB9DE34aEc1690f9E27f18435493b3b',
        token1: '0x8161f63d320ee3EF6feD7dFA94923d940b19C8b1',
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
    };
  },
  watch: {
    rates: function () {
      if (this.lastModifiedToken) {
        this.calculateAmount(this.lastModifiedToken);
      }
    },
    selectedToken1() {
      this.fetchData();
    },
    selectedToken2() {
      this.fetchData();
    },
  },
  created() {
    this.fetchRates();
    this.setRatesTimer();
    this.fetchData();
  },
  async beforeMount() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const signer = provider.getSigner();
        this.fromAccount = await signer.getAddress();
        this.wallet = signer;
      } catch (error) {
        console.error('Error accessing accounts: ', error);
      }
    } else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  },
  beforeUnmount() {
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
  },
  methods: {
    onInput(value) {
      this.customSlippage = value.replace(/[^0-9.]/g, '');
    },
    async fetchRates() {
      try {
        let response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin,binancecoin,cardano,dogecoin,ripple,usd-coin,dai&vs_currencies=usd',
        );
        let data = await response.json();
        this.rates = {
          ETH: data.ethereum.usd,
          BTC: data.bitcoin.usd,
          BNB: data.binancecoin.usd,
          ADA: data.cardano.usd,
          DOGE: data.dogecoin.usd,
          XRP: data.ripple.usd,
          USDC: data['usd-coin'].usd,
          DAI: data.dai.usd,
        };
        // 更新汇率更新时间
        this.ratesUpdateTime = new Date();
      } catch (err) {
        console.log(err);
      }
    },
    setRatesTimer() {
      this.ratesTimer = setInterval(() => {
        this.fetchRates();
      }, 60 * 1000); // Update every minute
    },
    async calculateAmount(tokenModified) {
      this.lastModifiedToken = tokenModified;
      if (tokenModified === 'token1' && this.selectedToken1 && this.selectedToken2 && this.tokenAmount1) {
        if (this.selectedToken1 === 'token0' && this.selectedToken2 === 'token1') {
          let rate = await getPoolPrice(limitOrderPoolKey);
          rate = Number(rate);
          console.log('rate: ', rate);
          console.log('amount1: ', this.tokenAmount1);
          this.tokenAmount2 = parseFloat((this.tokenAmount1 * rate).toFixed(6));
          console.log('amount2: ', this.tokenAmount2);
        } else if (this.selectedToken1 === 'token1' && this.selectedToken2 === 'token0') {
          let rate = await getPoolPrice(limitOrderPoolKey);
          rate = Number(1 / rate);
          console.log('rate: ', rate);
          console.log('amount1: ', this.tokenAmount1);
          this.tokenAmount2 = parseFloat((this.tokenAmount1 * rate).toFixed(6));
          console.log('amount2: ', this.tokenAmount2);
        } else {
          let rate = this.rates[this.selectedToken1] / this.rates[this.selectedToken2];
          this.tokenAmount2 = parseFloat((this.tokenAmount1 * rate).toFixed(6)); // Round and then parse
          console.log('正常兑换');
        }
      } else if (tokenModified === 'token2' && this.selectedToken1 && this.selectedToken2 && this.tokenAmount2) {
        if (this.selectedToken1 === 'token1' && this.selectedToken2 === 'token0') {
          let rate = await getPoolPrice(limitOrderPoolKey);
          rate = Number(rate);
          this.tokenAmount1 = parseFloat((this.tokenAmount2 * rate).toFixed(6));
        } else if (this.selectedToken1 === 'token0' && this.selectedToken2 === 'token1') {
          let rate = await getPoolPrice(limitOrderPoolKey);
          rate = Number(1 / rate);
          this.tokenAmount1 = parseFloat((this.tokenAmount2 * rate).toFixed(6));
        } else {
          let rate = this.rates[this.selectedToken2] / this.rates[this.selectedToken1];
          this.tokenAmount1 = parseFloat((this.tokenAmount2 * rate).toFixed(6));
        }
      }
    },
    async exchange() {
      const store = useUserStore();
      this.userLoggedIn = store.isAuthenticated;
      if (!this.userLoggedIn) {
        alert('您还没有连接钱包！');
      } else if (this.selectedToken1 && this.selectedToken2 && this.tokenAmount1) {
        try {
          try {
            console.log('poolkey', limitOrderPoolKey);
            console.log('fromamonut:', ethers.utils.parseUnits(this.tokenAmount1.toString(), 18));
            if (this.tokenAddresses[this.selectedToken1] > this.tokenAddresses[this.selectedToken2]) {
              await swap(limitOrderPoolKey, ethers.utils.parseUnits(this.tokenAmount1.toString(), 18), false);
            } else {
              await swap(limitOrderPoolKey, ethers.utils.parseUnits(this.tokenAmount1.toString(), 18), true);
            }
          } catch (err) {
            console.log(err);
          }
          console.log('执行了兑换！');
          let price0 = await getPoolPrice(limitOrderPoolKey); //获取最新的市价

          console.log('最新市价：' + price0);
          // 发送price0到后端
          const response = await axios.post('http://localhost:8080/myExchange/myExchange', {
            price0: price0.toString(),
          });
          if (response.data.message) {
            alert('兑换成功并成功更新订单状态!');
          } else {
            alert('兑换成功但更新订单状态失败!');
          }
        } catch (error) {
          console.error(error);
          alert('兑换失败！');
        }
      } else {
        alert('兑换信息不完整，请完善相关信息');
      }
    },
    async fetchData() {
      const coinMapping = {
        ETH: 'ethereum',
        BTC: 'bitcoin',
        BNB: 'binancecoin',
        ADA: 'cardano',
        DOGE: 'dogecoin',
        XRP: 'ripple',
        USDC: 'usd-coin',
        DAI: 'dai',
        token0: 'token0',
        token1: 'token1',
      };
      let coin1 = coinMapping[this.selectedToken1];
      let coin2 = coinMapping[this.selectedToken2];
      try {
        let response1 = await axios.get(`https://api.coingecko.com/api/v3/coins/${coin1}/market_chart`, {
          params: {
            vs_currency: 'usd',
            days: 1,
          },
        });
        let response2 = await axios.get(`https://api.coingecko.com/api/v3/coins/${coin2}/market_chart`, {
          params: {
            vs_currency: 'usd',
            days: 1,
          },
        });

        let prices1 = response1.data.prices.map((p) => p[1]);
        let prices2 = response2.data.prices.map((p) => p[1]);
        console.log(`Fetching data for: ${this.selectedToken1} and ${this.selectedToken2}`);

        // 计算比值并确保结果总是大于1
        this.ratioValues = prices1.map((price1, index) => {
          const price2 = prices2[index];
          return price1 >= price2 ? price1 / price2 : price2 / price1;
        });
        this.times = response1.data.prices.map((p) => {
          const date = new Date(p[0]);
          return `${date.getHours()}:${date.getMinutes()}`;
        });
        times.shift();
        let chart = echarts.init(document.getElementById('chart'));
        let option = {
          title: {
            text: `${this.selectedToken1} / ${this.selectedToken2}`,
            left: 'center',
            textStyle: {
              color: '#00000',
            },
          },
          grid: {
            left: '15%',
            right: '5%',
            bottom: '15%',
          },
          xAxis: {
            type: 'category',
            data: times,
            axisLabel: {
              rotate: 45,
              textStyle: {
                color: '#FFFFFF',
              },
            },
            axisLine: {
              lineStyle: {
                color: '#FFFFFF',
              },
            },
          },
          yAxis: {
            type: 'value',
            min: minY,
            max: maxY,
            show: true,
            axisLine: {
              lineStyle: {
                color: '#FFFFFF',
              },
            },
            splitLine: {
              lineStyle: {
                type: 'dashed',
                color: '#CCCCCC',
              },
            },
          },
          tooltip: {
            trigger: 'axis',
            formatter: function (params) {
              let startValue = params[0].value[1];
              let endValue = params[0].value[2];
              return `${params[0].name}: 从 ${startValue} 到 ${endValue}`;
            },
          },
          series: [
            {
              type: 'custom',
              renderItem: function (params, api) {
                let categoryIndex = api.value(0);
                let start = api.coord([categoryIndex, api.value(1)]);
                let end = api.coord([categoryIndex, api.value(2)]);
                return {
                  type: 'rect',
                  shape: {
                    x: start[0] - 5,
                    y: end[1],
                    width: 10,
                    height: start[1] - end[1],
                  },
                  style: api.style(),
                };
              },
              data: items,
            },
          ],
        };
        chart.setOption(option);
      } catch (err) {
        console.log(err);
      }
    },
  },
};
</script>

<style scoped>
.settings {
  position: absolute;
  right: 10px;
  top: 10px;
  color: #007bff;
}

.settings > a-button {
  background-color: #2d3748 !important;
  transition: background-color 0.3s;
  margin-left: 10px;
}

.settings > a-button:hover {
  background-color: #1a202c !important;
}

.settings-panel input {
  width: 100%;
  padding: 10px;
  border: 1px solid blue;
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
  padding: 0 30px;
}

.custom-input,
.custom-select {
  max-width: 80%;
  background-color: transparent;
  border: 1px solid black;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.15s ease-in-out;
}

.custom-input::placeholder,
.custom-select::placeholder {
  color: lightslategray;
}

.custom-input:focus,
.custom-select:focus {
  border-color: lightyellow;
  box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.25);
}

.select-option {
  color: lightyellow;
  background-color: #2d3748;
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
  width: 80%;
  margin: 1px auto;
  padding: 20px;
  border: 2px solid midnightblue;
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
  color: black;
}

.rate-display p {
  color: darkslategray;
}

.dialog-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
</style>
