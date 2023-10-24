<template>
  <dv-border-box10>
    <div class="main-container">
      <div class="recent-container">
        <h2 class="title">最近关注</h2>
        <div class="chart-container">
          <select id="coinSelect" v-model="selectedCoin.coin" class="coin-select custom-select"
                  @change="fetchData(selectedCoin.coin)">
            <option v-for="coin in coins" :key="coin.coin" :value="coin.coin" class="select-option">{{
                coin.coin
              }}
            </option>
          </select>
          <div id="chart" class="chart"></div>
        </div>
      </div>
    </div>
  </dv-border-box10>
</template>

<script>
import * as echarts from 'echarts';
import axios from 'axios';

export default {
  name: "MainCenterButton",
  data() {
    return {
      coins: [
        {coin: 'ethereum'},
        {coin: 'bitcoin'},
        {coin: 'binancecoin'},
        {coin: 'cardano'},
        {coin: 'dogecoin'},
        {coin: 'ripple'},
        {coin: 'usd-coin'},
        {coin: 'dai'}
      ],
      selectedCoin: {coin: 'ethereum'},
      prices: [],
      times: [],
      minPrice: 0,
      maxPrice: 0,
      apps: [
        {name: 'Uniswap', icon: '@renderer/assets/images/dapps/uniswap.png'},
        {name: 'MakerDAO', icon: '@renderer/assets/images/dapps/maker.webp'},
        {name: 'Compound', icon: '@renderer/assets/images/dapps/compound.png'},
        {name: 'CryptoKitties', icon: '@renderer/assets/images/dapps/CryptoKitties.webp'},
      ],
    };
  },
  methods: {
    fetchData(coin) {
      axios.get(`https://api.coingecko.com/api/v3/coins/${coin}/market_chart`, {
        params: {
          vs_currency: 'usd',
          days: 1,
        }
      }).then(response => {
        this.prices = response.data.prices.map(p => p[1]);
        this.times = response.data.prices.map(p => {
          const date = new Date(p[0]);
          return `${date.getHours()}:${date.getMinutes()}`;
        });
        this.calculateYAxisRange();
        this.drawChart();
      });
    },
    calculateYAxisRange() {
      let min = Math.min(...this.prices);
      let max = Math.max(...this.prices);
      let diff = max - min;

      if (diff > 1) {
        this.minPrice = Math.floor(min * 0.98);
        this.maxPrice = Math.ceil(max * 1.02);
      } else {
        this.minPrice = min - (diff * 0.02);
        this.maxPrice = max + (diff * 0.02);
      }
    },
    drawChart() {
      let chart = echarts.init(document.getElementById('chart'));
      let option = {
        title: {
          text: `${this.selectedCoin.coin} 价格变化（最近24小时）`,
          left: 'center',
          textStyle: { // 修改标题颜色
            color: '#FFFFFF'
          }
        },
        tooltip: {
          trigger: 'axis',
          formatter: (params) => {
            const data = params[0];
            return `${this.times[data.dataIndex]}<br/>${this.selectedCoin.coin}: ${data.value}`
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          show: false,
        },
        yAxis: {
          type: 'value',
          min: this.minPrice,
          max: this.maxPrice,
        },
        series: [{
          data: this.prices,
          type: 'line',
          smooth: true,
          itemStyle: {
            color: '#0088CC'
          },
        }],
      };
      chart.setOption(option);
    }
  },
  created() {
    this.fetchData(this.selectedCoin.coin);
  }
};
</script>

<style scoped>
.main-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.recent-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 1rem;
}

.title {
  font-size: 1.5rem;
  color: #5ab1ef;
}

.chart-container {
  position: relative;
  width: 100%;
  height: 100%;
  padding-right: 10%
}

.chart {
  width: 100%;
  height: 100%;
}

.coin-select {
  position: absolute;
  top: 0;
  right: 0;

}

.custom-select {
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

.custom-select::placeholder {
  color: rgba(255, 255, 255, 0.7); /* Lighter white for placeholders */
}

.custom-select:focus {
  border-color: white; /* White border on focus */
  box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.25); /* White shadow on focus */
}

.select-option {
  color: white;
  background-color: #2D3748;
}
</style>
