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
import {QueryCoinPriceUsingGET} from "@renderer/api/exchange";
import {ref, reactive, onMounted} from 'vue';

export default {
  name: "MainCenterButton",
  setup() {
    const coins = ref([
      {coin: 'ethereum'},
      {coin: 'bitcoin'},
      {coin: 'binancecoin'},
      {coin: 'cardano'},
      {coin: 'dogecoin'},
      {coin: 'ripple'},
      {coin: 'usd-coin'},
      {coin: 'dai'}
    ]);
    const selectedCoin = reactive({coin: 'ethereum'});
    const prices = ref([]);
    const times = ref([]);
    const minPrice = ref(0);
    const maxPrice = ref(0);

    const fetchData = async (coin) => {
      try {
        const res = await QueryCoinPriceUsingGET(coin);
        const obj = JSON.parse(res?.data);
        prices.value = obj.prices.map(p => p[1]);
        times.value = obj.prices.map(p => {
          const date = new Date(p[0]);
          return `${date.getHours()}:${date.getMinutes()}`;
        });
        calculateYAxisRange();
        drawChart();
      } catch (e) {
        console.log(e.toString())
      }
    };

    const calculateYAxisRange = () => {
      let min = Math.min(...prices.value);
      let max = Math.max(...prices.value);
      let diff = max - min;

      if (diff > 1) {
        minPrice.value = Math.floor(min * 0.98);
        maxPrice.value = Math.ceil(max * 1.02);
      } else {
        minPrice.value = min - (diff * 0.02);
        maxPrice.value = max + (diff * 0.02);
      }
    };

    const drawChart = () => {
      const chart = echarts.init(document.getElementById('chart'));
      chart.setOption({
        title: {text: `${selectedCoin.coin} 价格变化（最近24小时）`, left: 'center', textStyle: {color: '#FFFFFF'}},
        tooltip: {
          trigger: 'axis',
          formatter: params => `${times.value[params[0].dataIndex]}<br/>${selectedCoin.coin}: ${params[0].value}`
        },
        xAxis: {type: 'category', boundaryGap: false, show: false},
        yAxis: {type: 'value', min: minPrice.value, max: maxPrice.value},
        series: [{data: prices.value, type: 'line', smooth: true, itemStyle: {color: '#0088CC'}}],
      });
    };

    onMounted(() => fetchData(selectedCoin.coin));

    return {
      coins,
      selectedCoin,
      fetchData
    }
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
  margin-left: 40%;
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
  max-width: 70%;
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
