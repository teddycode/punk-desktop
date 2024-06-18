<template>
  <div class="content st-background">
    <!-- <h2>链下存储区状态</h2> -->

    <div v-if="loading">数据获取中</div>

    <div v-if="error">{{ error }}</div>

    <!-- 添加整体标题 -->
    <div style="text-align: center; font-size: 24px; font-weight: bold; color: white; margin-top: 10px">
      市场交易情况
    </div>
    <div ref="chartContainer" style="display: flex; justify-content: space-between; width: 100%; height: 230px">
      <div ref="chart1" style="flex: 1"></div>
      <div ref="chart2" style="flex: 1"></div>
      <div ref="chart3" style="flex: 1"></div>
    </div>

    <!-- 新的仪表盘容器 -->
    <div style="text-align: center; font-size: 24px; font-weight: bold; color: white; margin-top: 10px">
      实时服务费用
    </div>
    <div style="margin-top: 20px; margin-bottom: 20px">
      <div style="display: flex; justify-content: space-between; width: 100%; height: 300px">
        <div ref="scoreChart" style="flex: 1; height: 100%"></div>
        <div id="gaugeChart" class="gauge-chart-container" style="flex: 1; height: 100%"></div>
      </div>
    </div>

    <!-- Table for dataOrderCreateds -->
    <table v-if="data && data.dataOrderCreateds">
      <caption>
        已达成数据交易订单
      </caption>
      <thead>
        <tr>
          <th>ID</th>
          <th>Buyer Address</th>
          <th>Owner Address</th>
          <th>Data Name</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in data.dataOrderCreateds" :key="'order-' + index">
          <td>{{ item.id.slice(-9) }}</td>
          <td>{{ item.buyerAddress.slice(-9) }}</td>
          <td>{{ item.ownerAddress.slice(-9) }}</td>
          <td>{{ item.dataName }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Table for storageOrderCreateds -->
    <table v-if="data && data.storageOrderCreateds">
      <caption>
        已达成数据存储订单
      </caption>
      <thead>
        <tr>
          <th>ID</th>
          <th>Buyer Address</th>
          <th>Owner Address</th>
          <th>Storage Space</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in data.storageOrderCreateds" :key="'storage-order-' + index">
          <td>{{ item.id.slice(-9) }}</td>
          <td>{{ item.buyerAddress.slice(-9) }}</td>
          <td>{{ item.providerAddress.slice(-9) }}</td>
          <td>{{ item.storageSpace }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Table for dataOwnerRegistereds -->
    <table v-if="data && data.dataOwnerRegistereds">
      <caption>
        可用数据资源
      </caption>
      <thead>
        <tr>
          <th>ID</th>
          <th>Owner Address</th>
          <th>Data Name</th>
          <th>Data Price</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in data.dataOwnerRegistereds" :key="'owner-' + index">
          <td>{{ item.id.slice(-9) }}</td>
          <td>{{ item.ownerAddress.slice(-9) }}</td>
          <td>{{ item.dataName.slice(-9) }}</td>
          <td>{{ item.dataPrice }}</td>
        </tr>
      </tbody>
    </table>

    <!-- New Table for storageProviderRegistereds -->
    <table v-if="data && data.storageProviderRegistereds">
      <caption>
        可用存储资源
      </caption>
      <thead>
        <tr>
          <th>ID</th>
          <th>Provider Address</th>
          <th>Price Per GB Per Month</th>
          <th>Available Space</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in data.storageProviderRegistereds" :key="'provider-' + index">
          <td>{{ item.id.slice(-9) }}</td>
          <td>{{ item.providerAddress.slice(-9) }}</td>
          <td>{{ item.pricePerGBPerMonth }}</td>
          <td>{{ item.availableSpace }}</td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top: 20px">
      <table class="network-status-table">
        <caption>
          可用存储资源
        </caption>
        <tbody>
          <tr>
            <th>网络状态</th>
            <th>延迟</th>
            <th>带宽</th>
          </tr>
          <tr>
            <td>{{ networkOnline ? '在线' : '离线' }}</td>
            <td>{{ networkOnline ? networkState.info.rtt + 'ms' : '--' }}</td>
            <td>{{ networkOnline ? networkState.info.downlink + 'Mb/s' : '--' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div>
      <br />
      <p v-if="gasPrice !== null" style="color: white">当前Gas价格{{ gasPrice }} Gwei</p>
      <p v-else>Loading Gas价格...</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import * as echarts from 'echarts'; // 导入ECharts库
import Web3 from 'web3'; // 导入Web3.js库
import { reactive, ref, onMounted } from 'vue';

export default {
  name: 'offChainStorageMarket',
  data() {
    return {
      data: null,
      loading: true,
      error: null,
      gasPrice: null,

      ethPrice: null, // 新增，用于存储ETH价格
      gasPriceInEth: null, // 新增，用于存储Gas价格的ETH值

      ethToCNY: null, // 用于存储ETH兑CNY的汇率
      networkOnline: ref(true),
      networkState: reactive({
        info: {
          effectiveType: '',
          rtt: '',
          downlink: '',
        },
      }),
    };
  },
  async mounted() {
    try {
      // 获取ETH价格（假设使用CoinGecko的API）
      const ethResponse = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
      );
      this.ethPrice = ethResponse.data.ethereum.usd;

      // 使用CoinGecko的API获取ETH兑CNY的汇率
      const huilvresponse = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=cny',
      );

      // 提取ETH兑CNY的汇率
      this.ethToCNY = huilvresponse.data.ethereum.cny;

      const query = `
        {
            dataOrderCreateds(first: 5) {
                id
                buyerAddress
                ownerAddress
                dataName
            }
            dataOwnerRegistereds(first: 5) {
                id
                ownerAddress
                dataName
                dataPrice
            }
            storageProviderRegistereds {
                id
                pricePerGBPerMonth
                providerAddress
                availableSpace
            }
            storageOrderCreateds {
                id
                buyerAddress
                providerAddress
                storageSpace
            }
        }
        `;

      // 初始化ECharts图表
      const chartContainer = echarts.init(this.$refs.chartContainer);

      const option = {
        dataset: [
          {
            source: [
              ['Product', 'Sales', 'Price', 'Year'],
              ['Cake', 123, 32, 2011],
              ['Cereal', 231, 14, 2011],
              ['Tofu', 235, 5, 2011],
              ['Dumpling', 341, 25, 2011],
              ['Biscuit', 122, 29, 2011],
              ['Cake', 143, 30, 2012],
              ['Cereal', 201, 19, 2012],
              ['Tofu', 255, 7, 2012],
              ['Dumpling', 241, 27, 2012],
              ['Biscuit', 102, 34, 2012],
              ['Cake', 153, 28, 2013],
              ['Cereal', 181, 21, 2013],
              ['Tofu', 395, 4, 2013],
              ['Dumpling', 281, 31, 2013],
              ['Biscuit', 92, 39, 2013],
              ['Cake', 223, 29, 2014],
              ['Cereal', 211, 17, 2014],
              ['Tofu', 345, 3, 2014],
              ['Dumpling', 211, 35, 2014],
              ['Biscuit', 72, 24, 2014],
            ],
          },
          {
            transform: {
              type: 'filter',
              config: { dimension: 'Year', value: 2011 },
            },
          },
          {
            transform: {
              type: 'filter',
              config: { dimension: 'Year', value: 2012 },
            },
          },
          {
            transform: {
              type: 'filter',
              config: { dimension: 'Year', value: 2013 },
            },
          },
        ],
        series: [
          {
            type: 'pie',
            radius: 50,
            center: ['50%', '25%'],
            datasetIndex: 1,
            title: {
              show: true,
              offsetCenter: [0, '80%'], // 将标题放在饼图的下方
              textStyle: {
                fontSize: 14,
                fontWeight: 'bold',
                color: 'white',
              },
            },
          },
          {
            type: 'pie',
            radius: 50,
            center: ['50%', '50%'],
            datasetIndex: 2,
            title: {
              show: true,
              offsetCenter: [0, '80%'], // 将标题放在饼图的下方
              textStyle: {
                fontSize: 14,
                fontWeight: 'bold',
                color: 'white',
              },
            },
          },
          {
            type: 'pie',
            radius: 50,
            center: ['50%', '75%'],
            datasetIndex: 3,
            title: {
              show: true,
              offsetCenter: [0, '80%'], // 将标题放在饼图的下方
              textStyle: {
                fontSize: 14,
                fontWeight: 'bold',
                color: 'white',
              },
            },
          },
        ],
        // Optional. Only for responsive layout:
        media: [
          {
            query: { minAspectRatio: 1 },
            option: {
              series: [{ center: ['15%', '50%'] }, { center: ['50%', '50%'] }, { center: ['85%', '50%'] }],
            },
          },
          {
            option: {
              series: [{ center: ['50%', '25%'] }, { center: ['50%', '50%'] }, { center: ['50%', '75%'] }],
            },
          },
        ],
        title: [
          {
            text: '日交易情况', // 第一个饼图的标题
            left: '15%', // 调整标题位置
            top: '90%', // 调整标题距离顶部的距离
            textAlign: 'center',
            textStyle: {
              color: 'white', // 设置标题字体颜色为白色
            },
          },
          {
            text: '月交易情况', // 第二个饼图的标题
            left: '50%', // 调整标题位置
            top: '90%', // 调整标题距离顶部的距离
            textAlign: 'center',
            textStyle: {
              color: 'white', // 设置标题字体颜色为白色
            },
          },
          {
            text: '年交易情况', // 第三个饼图的标题
            left: '85%', // 调整标题位置
            top: '90%', // 调整标题距离顶部的距离
            textAlign: 'center',
            textStyle: {
              color: 'white', // 设置标题字体颜色为白色
            },
          },
        ],
      };

      chartContainer.setOption(option);

      // 添加这段代码，用于创建新的仪表盘
      const scoreChart = echarts.init(this.$refs.scoreChart);

      const scoreOption = {
        title: {
          text: '实时数据交易服务费用', // 标题文本
          left: 'center', // 标题水平居中
          textStyle: {
            color: 'white', // 标题文本颜色
            fontSize: 18, // 标题字体大小
            fontWeight: 'bold', // 标题字体粗细
          },
        },
        tooltip: {
          formatter: '{a} <br/>{b} : {c}%',
        },
        series: [
          {
            name: 'Pressure',
            type: 'gauge',
            max: 500,
            detail: {
              formatter: '数据存储服务费用\n{value}元', // 在此处添加名称并用换行符来下移
              offsetCenter: [0, '80%'],
              fontSize: 14,
              color: 'white',
            },
            data: [
              {
                value: 0.02 * this.ethToCNY,
                name: '',
              },
            ],
          },
        ],
      };

      scoreChart.setOption(scoreOption);

      const response = await axios.post('https://api.studio.thegraph.com/query/49438/storagemarket3/v0.0.1', { query });
      this.data = response.data.data;
    } catch (err) {
      this.error = 'Error loading data.';
    } finally {
      this.loading = false;
    }
    try {
      // 初始化Web3.js
      const web3 = new Web3('https://mainnet.infura.io/v3/d0a678444e0543388d9c6dcd5c7eed6e'); // 替换为您的以太坊节点URL

      // 获取Gas价格
      const gasPrice = await web3.eth.getGasPrice();
      this.gasPrice = web3.utils.fromWei(gasPrice, 'gwei');

      // 计算Gas价格对应的ETH价格
      this.gasPriceInEth = (this.gasPrice * 1e-9).toFixed(9); // 将Gwei转换为ETH

      // 更新ECharts图表
      this.updateGaugeChart();
    } catch (error) {
      console.error('获取Gas价格时出错', error);
    } finally {
      this.loading = false;
    }
    const updateOnline = () => {
      const { effectiveType, rtt, downlink } = navigator.connection;
      this.networkOnline = navigator.onLine;
      this.networkState.info.effectiveType = effectiveType;
      this.networkState.info.rtt = rtt;
      this.networkState.info.downlink = downlink;
    };

    const connection = navigator.connection || navigator.webkitConnection || navigator.mozConnection;
    updateOnline(); // 初始化运行一次
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);
    connection.addEventListener('change', updateOnline);
  },
  methods: {
    updateGaugeChart() {
      const gasPriceGwei = this.gasPrice; // 获取 Gas 价格（已经是 Gwei 单位）

      // 假设当前 ETH 对人民币的汇率为 ethToCNY（请替换为实际值）
      const ethToCNY = this.ethToCNY; // 假设 1 ETH = 6000 人民币

      // 计算 Gas 价格对应的人民币价值
      const gasPriceCNYyiduiyi = (gasPriceGwei * 1738717 * ethToCNY * 1e-11).toFixed(2); // 保留两位小数
      const gasPriceCNYyiduiduo = (gasPriceGwei * 1943463 * ethToCNY * 1e-11).toFixed(2); // 保留两位小数

      const gaugeData = [
        {
          value: gasPriceCNYyiduiyi, // 将Gas价格更新到gaugeData
          name: '一对一',
          title: {
            offsetCenter: ['-30%', '75%'],
          },
          detail: {
            offsetCenter: ['-60%', '95%'],
          },
        },
        {
          value: gasPriceCNYyiduiduo,
          name: '一对多',
          title: {
            offsetCenter: ['30%', '75%'],
          },
          detail: {
            offsetCenter: ['60%', '95%'],
          },
        },
      ];

      const gaugeChart = echarts.init(document.getElementById('gaugeChart'));

      const option = {
        // ... 其他ECharts配置 ...
        title: {
          text: '实时数据交易服务费用',
          textStyle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: 'White',
          },
          left: 'center', // 标题居中对齐
        },

        series: [
          {
            type: 'gauge',
            // ... 其他配置 ...

            data: gaugeData,
            title: {
              fontSize: 18,
              color: 'white',
            },
            detail: {
              width: 100,
              height: 18,
              fontSize: 14,
              color: '#fff',
              backgroundColor: 'inherit',
              borderRadius: 3,
              formatter: `{a|{value} * 10^-7人民币}`, // 显示Gas价格
              rich: {
                a: {
                  color: 'black', // 设置字体颜色为黑色
                },
              },
            },
          },
        ],
      };

      gaugeChart.setOption(option);
    },
  },
};
</script>

<style scoped lang="scss">
.st-background {
  background-image: url('/images/background/mainbg.png');
  background-size: 100% auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th,
td {
  border: 1px solid white;
  padding: 8px 12px;
}

th {
  background-color: #333;
}

tr:nth-child(even) {
  background-color: #555;
}

caption {
  color: white;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
  display: table-caption;
  caption-side: top;
  width: 100%;
}

h2 {
  font-size: 32px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  text-align: center;
  margin-bottom: 20px;
}

/* 修改一对一底下的框 */
.gauge-chart-container {
  position: relative;
  /* left: 20%; */
}

.gauge-box {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  padding: 6px 12px;
  border-radius: 4px;
  z-index: 2;
  color: white;
  font-size: 12px;
}
</style>
