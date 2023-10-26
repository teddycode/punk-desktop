<template>
  <div class="limitOrder">
    <!-- <div class="chart-container">
        <div id="chart" style="width: 100%; height: 400px; margin-bottom: 40px;margin-top: 40px"></div>
    </div> -->
    <div class="limitOrder-panel-transaction">
      <!-- <h2 class="exchange-title">限价单</h2> -->
      <!-- Sell & Buy Dropdowns -->
      <div class="limitOrder-token-pair">
        <label class="limitOrder-token-label">Sell</label>
        <div class="limitOrder-select-wrapper">
          <select v-model="selectedToken1" class="limitOrder-custom-select">
            <option v-for="token in tokens" :key="token.value" :value="token.value" class="select-option">{{
                token.label
              }}
            </option>
          </select>
        </div>
      </div>

      <div class="limitOrder-token-pair">
        <label class="limitOrder-token-label">Buy</label>
        <div class="limitOrder-select-wrapper">
          <select v-model="selectedToken2" class="limitOrder-custom-select">
            <option v-for="token in tokens" :key="token.value" :value="token.value" class="select-option">{{
                token.label
              }}
            </option>
          </select>
        </div>
      </div>
      <!-- Divider -->
      <!-- <div class="divider"/> -->
      <!-- Fee Tiers -->
      <!-- <div class="fee-tiers-title">Fee Tiers</div> -->
      <div class="fee-options">
        <label v-for="fee in fees" :key="fee" :class="{ 'selected': selectedFee === fee }" class="limitOrder-fee-box">
          <input v-model="selectedFee" :value="fee" class="limitOrder-hidden-radio" name="fee" type="radio"/>
          {{ fee }}
        </label>
      </div>
      <!-- Divider -->
      <!-- <div class="divider"/> -->
      <div class="limitOrder-token-input">
        <label class="limitOrder-token-label">Amount</label>
        <input v-model="amount" class="limitOrder-custom-input" type="text"/>
      </div>
      <div class="limitOrder-token-input">
        <label class="limitOrder-token-label">Price</label>
        <div class="input-with-token">
          <input v-model="price" class="limitOrder-custom-input" type="text"/>
          <span class="selected-tokens">{{ selectedToken1 }}/{{ selectedToken2 }}</span>
        </div>
      </div>
      <addnode-button style="width: 150px;height: 40px" @click="place">Add</addnode-button>
    </div>
  </div>
</template>


<script>
import axios from "axios";
import * as echarts from 'echarts';
import addnodeButton from "@renderer/components/buttons/ShapeButton.vue";
import {limitOrderPoolKey} from "@pages/Exchange/function/address";
import {placeLimitOrderFrontend} from "@pages/Exchange/function/place";
import {ethers} from "ethers";

export default {
  components: {
    addnodeButton
  },
  data() {
    return {
      tokens: [
        {label: 'ETH', value: 'ETH'},
        {label: 'BTC', value: 'BTC'},
        {label: 'BNB', value: 'BNB'},
        {label: 'ADA', value: 'ADA'},
        {label: 'DOGE', value: 'DOGE'},
        {label: 'XRP', value: 'XRP'},
        {label: 'USDC', value: 'USDC'},
        {label: 'DAI', value: 'DAI'},
        {label: 'token0', value: 'token0'},
        {label: 'token1', value: 'token1'},
      ],
      selectedToken1: 'ETH',
      selectedToken2: 'USDC',
      fees: ['0.04%', '0.2%', '动态'],
      selectedFee: '0.04%',
      amount: '',
      price: '',
      fromAccount: '',
    };
  },
  watch: {
    selectedToken1() {
      this.fetchData();
    },
    selectedToken2() {
      this.fetchData();
    }
  },
  created: function () {
    this.fetchData();
  },
  methods: {
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
      };
      let coin1 = coinMapping[this.selectedToken1];
      let coin2 = coinMapping[this.selectedToken2];
      try {
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

        // 计算比值并确保结果总是大于1
        this.ratioValues = prices1.map((price1, index) => {
          const price2 = prices2[index];
          return (price1 >= price2) ? (price1 / price2) : (price2 / price1);
        });

        this.times = response1.data.prices.map(p => {
          const date = new Date(p[0]);
          return `${date.getHours()}:${date.getMinutes()}`;
        });
        //this.calculateYAxisRange();
        this.drawChart();
      } catch (err) {
        console.log(err);
      }
    },
    drawChart() {
      let currentHour = new Date().getHours();
      let times = [];
      for (let i = 1; i <= 24; i++) {
        let hour = (currentHour - i + 24) % 24;
        times.unshift(hour + ":00");
      }

      let validRatioValues = this.ratioValues.filter(val => typeof val === 'number' && !isNaN(val));

      let minY = Math.min(...validRatioValues) * 0.999;
      let maxY = Math.max(...validRatioValues) * 1.001;
      // 修改 minY 和 maxY 的取整方法
      minY = minY > 100 ? Math.floor(minY) : parseFloat(minY.toFixed(2));
      maxY = maxY > 100 ? Math.ceil(maxY) : parseFloat(maxY.toFixed(2));
      // 确保 minY 和 maxY 不相等
      if (minY === maxY) {
        minY -= 0.01;
        maxY += 0.01;
      }
      console.log(minY, maxY)
      let items = [];
      for (let i = 1; i < this.ratioValues.length; i++) {
        let startValue = this.ratioValues[i - 1];
        let endValue = this.ratioValues[i];
        let color = endValue < startValue ? 'red' : 'green';
        items.push({
          value: [times[i - 1], startValue, endValue],
          itemStyle: {
            color: color
          }
        });
      }
      // 我们从索引1开始，所以times数组也要相应地减少一个元素
      times.shift();
      let chart = echarts.init(document.getElementById('chart'));
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
            let startValue = params[0].value[1];
            let endValue = params[0].value[2];
            return `${params[0].name}: 从 ${startValue} 到 ${endValue}`;
          }
        },
        series: [{
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
                height: start[1] - end[1]
              },
              style: api.style()
            };
          },
          data: items
        }]
      };
      chart.setOption(option);
    },
    async place() {
      let epoch;
      let flag = 0;
      if (typeof window.ethereum !== 'undefined') {
        // 使用MetaMask提供的provider
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        try {
          // 请求账户访问
          await window.ethereum.request({method: 'eth_requestAccounts'});
          const signer = provider.getSigner();
          this.fromAccount = await signer.getAddress(); // 设置第一个账户为默认账户
          console.log("address:" + this.fromAccount)
        } catch (error) {
          console.error("Error accessing accounts: ", error);
        }
      } else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
      }
      try {
        try {
          epoch = await placeLimitOrderFrontend(limitOrderPoolKey, this.price, this.selectedToken1, this.selectedToken2, ethers.utils.parseUnits(this.amount.toString(), 18))
          console.log("address2:" + this.fromAccount)
          flag = 1
        } catch (err) {
          console.log(err)
        }
        if (flag === 1) {
          // 发送POST请求到后端
          const currentDate = new Date();
          const formattedDate = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()} ${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;

          const requestBody = {
            userAddress: this.fromAccount,
            sell: this.selectedToken1,
            buy: this.selectedToken2,
            amount: this.amount,
            price: this.price,
            feeRates: this.selectedFee,
            status: "待成交",
            epoch: epoch,
            submitTime: formattedDate
          };
          console.log("requestBody", requestBody);
          const response = await axios.post("http://localhost:8080/Exchanges/limitOrder", requestBody);
          if (response.data.message) {
            alert("Order added successfully!");
          } else {
            alert("插入数据失败！")
          }
        }
      } catch (err) {
        console.log(err)
        alert("操作失败")
      }
    }
  }
};
</script>

<style scoped>
.exchange-title {
  margin-top: 10px;
  font-size: 0.5rem;
  font-weight: bold;
  color: white;
}

.fee-tiers-title {
  color: white;
  font-size: 0.5rem;
  text-align: left;
}

.limitOrder {
  display: flex;
  justify-content: space-between;
  gap: 40px;
  padding: 0 30px; /* 设置左右两侧的间距为40px */
}

.chart-container {
  flex: 1.5;
  background: transparent; /* 设置为透明背景 */
  height: 480px;
  padding: 20px;
  border-radius: 20px; /* 设置圆角 */
  margin: 75px auto;
  border: 1px solid white; /* 临时的边框，方便我们看到这个容器，稍后可以删除 */
}

.limitOrder-panel-transaction {
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
  /*margin: 50px auto;*/
  padding: 20px;
  border: 1px solid white; /* Add a white border */
}

.input-section-transaction label {
  margin-right: 10px;
  color: white;
}

.limitOrder-token-pair {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 1%;
  margin-bottom: 1%;
}

.limitOrder-select-wrapper {
  width: 85%;
  position: relative;
  display: inline-block;
}

.limitOrder-custom-select {
  /*margin-left: 5%;*/
  box-sizing: border-box; /* Ensure padding and border are included in the total width */
  width: 100%;
  background-color: transparent;
  border: 1px solid white;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 5px;
  outline: none;
  transition: border-color 0.15s ease-in-out;
}

.limitOrder-custom-select:hover {
  border-color: #007bff;
}

.select-option {
  color: white;
  background-color: #2D3748;
}

.limitOrder-token-label {
  color: white;
  width: 25%;
  margin-right: 5px;
}

.divider {
  width: 90%;
  height: 1px;
  background-color: white;
  margin: 2% 0;
}

.fee-options {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  width: 100%;
}

.limitOrder-token-input {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 1%;
  margin-bottom: 1%;
  position: relative;
}

.limitOrder-custom-input {
  width: 100%; /* 调整宽度为100%以使输入框填满其容器 */
  box-sizing: border-box;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid white;
  background-color: transparent;
  color: white;
  font-size: 5px;
  outline: none;
  transition: border-color 0.15s ease-in-out;
}


.limitOrder-custom-input:hover {
  border-color: #007bff;
}

.limitOrder-custom-input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.limitOrder-fee-box {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid white;
  padding: 5px 10px; /* 减少内边距以减小宽度 */
  margin-right: 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: border-color 0.3s ease;
  color: white;
  width: 30%; /* 设置宽度为30%以确保三个单选框长度一致 */
  text-align: center; /* 文字居中显示 */
}

.limitOrder-fee-box:last-child {
  margin-right: 0; /* 为最后一个单选框移除右边距，以确保宽度一致 */
}

.limitOrder-fee-box.selected {
  border-color: #007bff;
}

.limitOrder-hidden-radio {
  display: none;
}

.input-with-token {
  position: relative;
  width: 100%; /* 调整为70%以确保与token-label的宽度相加为100% */
}

.selected-tokens {
  position: absolute;
  right: 5%; /* 调整到5%以确保在两个输入框中位置一致 */
  bottom: 50%;
  transform: translateY(50%);
  color: rgba(255, 255, 255, 0.7);
  pointer-events: none;
}

</style>
