<template>
  <div class="content st-background">
    <div v-if="loading">Loading data...</div>

    <div v-if="error">{{ error }}</div>

    <div style="text-align: center; font-size: 24px; font-weight: bold; color: white; margin-top: 10px">已有资源</div>
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

    <div style="text-align: center; font-size: 24px; font-weight: bold; color: white; margin-top: 50px">请求服务</div>
    <div class="section-container" style="display: flex; justify-content: space-between; align-items: center; gap: 5px">
      <!-- 左侧section -->
      <div class="section" style="display: flex; flex-direction: column; align-items: center; justify-content: center">
        <div class="input-column">
          <div class="input-row">
            <label for="providerAddress">存储服务提供商:</label>
            <input type="text" id="providerAddress" placeholder="Enter provider address" /><br />
          </div>

          <div class="input-row">
            <label for="storageSpace">Storage Space (in GB):</label>
            <input type="number" id="storageSpace" placeholder="Enter storage space in GB" /><br />
          </div>

          <div class="input-row">
            <label for="storageProtocol">数据存储协议:</label>
            <input type="text" id="storageProtocol" placeholder="Enter storage protocol address" /><br />
          </div>

          <div class="input-row">
            <!-- 添加总费用输入框 -->
            <label for="totalCost">Total Cost (in Wei):</label>
            <input type="number" id="totalCost" placeholder="Enter total cost in Wei" /><br />
          </div>
        </div>
        <button type="button" id="sendTransaction1">发起数据存储服务</button>
      </div>

      <!-- 右侧section -->
      <div class="section" style="display: flex; flex-direction: column; align-items: center; justify-content: center">
        <div class="input-column">
          <div class="input-row">
            <label for="ownerAddress">数据提供者:</label>
            <input type="text" id="ownerAddress" placeholder="Enter owner address" /><br />
          </div>

          <div class="input-row">
            <label for="dataPurchaseProtocol">数据购买协议:</label>
            <input type="text" id="dataPurchaseProtocol" placeholder="Enter data purchase protocol address" /><br />
          </div>

          <div class="input-row">
            <label for="dataValue">Data Value (in Wei):</label>
            <input type="number" id="dataValue" placeholder="Enter data value in Wei" /><br />
          </div>
        </div>

        <button type="button" id="sendTransaction">发起数据交易服务</button>
      </div>
    </div>

    <!-- echarts 图表容器 -->
    <div ref="chartContainer" style="width: 100%; height: 300px"></div>
  </div>
</template>

<script>
import axios from 'axios';
import * as echarts from 'echarts';
import { ethers } from 'ethers';

export default {
  name: 'offChainStorageOrders',
  data() {
    return {
      data: null,
      loading: true,
      error: null,
    };
  },
  async mounted() {
    try {
      const query = `
        {
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
        }
        `;

      const response = await axios.post('https://api.studio.thegraph.com/query/49438/storagemarket3/v0.0.1', { query });
      this.data = response.data.data;
    } catch (err) {
      this.error = 'Error loading data.';
    } finally {
      this.loading = false;
    }

    const chartContainer = this.$refs.chartContainer;
    const myChart = echarts.init(chartContainer);
    myChart.setOption(this.chartOption);

    document.getElementById('sendTransaction').addEventListener('click', async function () {
      try {
        // 获取页面输入的值
        const ownerAddress = document.getElementById('ownerAddress').value;
        const dataPurchaseProtocol = document.getElementById('dataPurchaseProtocol').value;
        const weiValue = ethers.utils.parseUnits(document.getElementById('dataValue').value, 'wei'); // 将输入的值转换为 Wei

        // 检查 MetaMask 是否已安装
        if (typeof window.ethereum === 'undefined') {
          alert('Please install MetaMask to use this feature.');
          return;
        }

        // 请求用户账户访问权限
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        // 创建一个 Web3Provider
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        // 获取当前账户地址
        const signer = provider.getSigner();
        const fromAddress = await signer.getAddress();

        // 创建一个合约实例
        const contractAddress = '0xc9a57d70dab488914a2ca1cf95138a5688ce25a6'; // 请替换为您的合约地址
        const contractABI = [
          {
            inputs: [
              {
                internalType: 'address',
                name: 'ownerAddress',
                type: 'address',
              },
              {
                internalType: 'contract IDataPurchaseProtocol',
                name: 'dataPurchaseProtocol',
                type: 'address',
              },
            ],
            name: 'createDataOrder',
            outputs: [],
            stateMutability: 'payable',
            type: 'function',
          },
          {
            inputs: [
              {
                internalType: 'address',
                name: 'providerAddress',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'storageSpace',
                type: 'uint256',
              },
              {
                internalType: 'contract IStorageProtocol',
                name: 'storageProtocol',
                type: 'address',
              },
            ],
            name: 'createStorageOrder',
            outputs: [],
            stateMutability: 'payable',
            type: 'function',
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: false,
                internalType: 'address',
                name: 'buyerAddress',
                type: 'address',
              },
              {
                indexed: false,
                internalType: 'address',
                name: 'ownerAddress',
                type: 'address',
              },
              {
                indexed: false,
                internalType: 'string',
                name: 'dataName',
                type: 'string',
              },
              {
                indexed: false,
                internalType: 'uint256',
                name: 'price',
                type: 'uint256',
              },
              {
                indexed: false,
                internalType: 'address',
                name: 'protocol',
                type: 'address',
              },
            ],
            name: 'DataOrderCreated',
            type: 'event',
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: false,
                internalType: 'address',
                name: 'ownerAddress',
                type: 'address',
              },
              {
                indexed: false,
                internalType: 'string',
                name: 'dataName',
                type: 'string',
              },
              {
                indexed: false,
                internalType: 'uint256',
                name: 'dataPrice',
                type: 'uint256',
              },
            ],
            name: 'DataOwnerRegistered',
            type: 'event',
          },
          {
            inputs: [
              {
                internalType: 'string',
                name: 'dataName',
                type: 'string',
              },
              {
                internalType: 'uint256',
                name: 'dataPrice',
                type: 'uint256',
              },
            ],
            name: 'registerDataOwner',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
          {
            inputs: [
              {
                internalType: 'uint256',
                name: 'availableSpace',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'pricePerGBPerMonth',
                type: 'uint256',
              },
            ],
            name: 'registerStorageProvider',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: false,
                internalType: 'address',
                name: 'buyerAddress',
                type: 'address',
              },
              {
                indexed: false,
                internalType: 'address',
                name: 'providerAddress',
                type: 'address',
              },
              {
                indexed: false,
                internalType: 'uint256',
                name: 'storageSpace',
                type: 'uint256',
              },
              {
                indexed: false,
                internalType: 'uint256',
                name: 'totalCost',
                type: 'uint256',
              },
              {
                indexed: false,
                internalType: 'address',
                name: 'protocol',
                type: 'address',
              },
            ],
            name: 'StorageOrderCreated',
            type: 'event',
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: false,
                internalType: 'address',
                name: 'providerAddress',
                type: 'address',
              },
              {
                indexed: false,
                internalType: 'uint256',
                name: 'availableSpace',
                type: 'uint256',
              },
              {
                indexed: false,
                internalType: 'uint256',
                name: 'pricePerGBPerMonth',
                type: 'uint256',
              },
            ],
            name: 'StorageProviderRegistered',
            type: 'event',
          },
          {
            inputs: [
              {
                internalType: 'address',
                name: '',
                type: 'address',
              },
            ],
            name: 'dataOrders',
            outputs: [
              {
                internalType: 'address',
                name: 'buyerAddress',
                type: 'address',
              },
              {
                internalType: 'address',
                name: 'ownerAddress',
                type: 'address',
              },
              {
                internalType: 'string',
                name: 'dataName',
                type: 'string',
              },
              {
                internalType: 'uint256',
                name: 'price',
                type: 'uint256',
              },
              {
                internalType: 'contract IDataPurchaseProtocol',
                name: 'dataPurchaseProtocol',
                type: 'address',
              },
            ],
            stateMutability: 'view',
            type: 'function',
          },
          {
            inputs: [
              {
                internalType: 'address',
                name: '',
                type: 'address',
              },
            ],
            name: 'dataOwners',
            outputs: [
              {
                internalType: 'address',
                name: 'ownerAddress',
                type: 'address',
              },
              {
                internalType: 'string',
                name: 'dataName',
                type: 'string',
              },
              {
                internalType: 'uint256',
                name: 'dataPrice',
                type: 'uint256',
              },
            ],
            stateMutability: 'view',
            type: 'function',
          },
          {
            inputs: [
              {
                internalType: 'address',
                name: '',
                type: 'address',
              },
            ],
            name: 'storageOrders',
            outputs: [
              {
                internalType: 'address',
                name: 'buyerAddress',
                type: 'address',
              },
              {
                internalType: 'address',
                name: 'providerAddress',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'storageSpace',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'totalCost',
                type: 'uint256',
              },
              {
                internalType: 'contract IStorageProtocol',
                name: 'storageProtocol',
                type: 'address',
              },
            ],
            stateMutability: 'view',
            type: 'function',
          },
          {
            inputs: [
              {
                internalType: 'address',
                name: '',
                type: 'address',
              },
            ],
            name: 'storageProviders',
            outputs: [
              {
                internalType: 'address',
                name: 'providerAddress',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'availableSpace',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'pricePerGBPerMonth',
                type: 'uint256',
              },
            ],
            stateMutability: 'view',
            type: 'function',
          },
        ];
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        // 发送交易
        const transaction = await contract.createDataOrder(ownerAddress, dataPurchaseProtocol, { value: weiValue });
        await transaction.wait();
        alert('Transaction sent successfully! Transaction hash: ' + transaction.hash);
      } catch (error) {
        alert('Error sending transaction: ' + error.message);
      }
    });

    document.getElementById('sendTransaction1').addEventListener('click', async function () {
      try {
        // 获取页面输入的值
        const providerAddress = document.getElementById('providerAddress').value;
        const storageSpace = parseInt(document.getElementById('storageSpace').value);
        const storageProtocol = document.getElementById('storageProtocol').value;
        const totalCost = parseInt(document.getElementById('totalCost').value); // 获取总费用输入框的值

        // 检查 MetaMask 是否已安装
        if (typeof window.ethereum === 'undefined') {
          alert('Please install MetaMask to use this feature.');
          return;
        }

        // 请求用户账户访问权限
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        // 创建一个 Web3Provider
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        // 获取当前账户地址
        const signer = provider.getSigner();
        const fromAddress = await signer.getAddress();

        // 创建一个合约实例
        const contractAddress = '0xc9a57d70dab488914a2ca1cf95138a5688ce25a6'; // 请替换为您的合约地址
        const contractABI = [
          {
            inputs: [
              {
                internalType: 'address',
                name: 'ownerAddress',
                type: 'address',
              },
              {
                internalType: 'contract IDataPurchaseProtocol',
                name: 'dataPurchaseProtocol',
                type: 'address',
              },
            ],
            name: 'createDataOrder',
            outputs: [],
            stateMutability: 'payable',
            type: 'function',
          },
          {
            inputs: [
              {
                internalType: 'address',
                name: 'providerAddress',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'storageSpace',
                type: 'uint256',
              },
              {
                internalType: 'contract IStorageProtocol',
                name: 'storageProtocol',
                type: 'address',
              },
            ],
            name: 'createStorageOrder',
            outputs: [],
            stateMutability: 'payable',
            type: 'function',
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: false,
                internalType: 'address',
                name: 'buyerAddress',
                type: 'address',
              },
              {
                indexed: false,
                internalType: 'address',
                name: 'ownerAddress',
                type: 'address',
              },
              {
                indexed: false,
                internalType: 'string',
                name: 'dataName',
                type: 'string',
              },
              {
                indexed: false,
                internalType: 'uint256',
                name: 'price',
                type: 'uint256',
              },
              {
                indexed: false,
                internalType: 'address',
                name: 'protocol',
                type: 'address',
              },
            ],
            name: 'DataOrderCreated',
            type: 'event',
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: false,
                internalType: 'address',
                name: 'ownerAddress',
                type: 'address',
              },
              {
                indexed: false,
                internalType: 'string',
                name: 'dataName',
                type: 'string',
              },
              {
                indexed: false,
                internalType: 'uint256',
                name: 'dataPrice',
                type: 'uint256',
              },
            ],
            name: 'DataOwnerRegistered',
            type: 'event',
          },
          {
            inputs: [
              {
                internalType: 'string',
                name: 'dataName',
                type: 'string',
              },
              {
                internalType: 'uint256',
                name: 'dataPrice',
                type: 'uint256',
              },
            ],
            name: 'registerDataOwner',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
          {
            inputs: [
              {
                internalType: 'uint256',
                name: 'availableSpace',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'pricePerGBPerMonth',
                type: 'uint256',
              },
            ],
            name: 'registerStorageProvider',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: false,
                internalType: 'address',
                name: 'buyerAddress',
                type: 'address',
              },
              {
                indexed: false,
                internalType: 'address',
                name: 'providerAddress',
                type: 'address',
              },
              {
                indexed: false,
                internalType: 'uint256',
                name: 'storageSpace',
                type: 'uint256',
              },
              {
                indexed: false,
                internalType: 'uint256',
                name: 'totalCost',
                type: 'uint256',
              },
              {
                indexed: false,
                internalType: 'address',
                name: 'protocol',
                type: 'address',
              },
            ],
            name: 'StorageOrderCreated',
            type: 'event',
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: false,
                internalType: 'address',
                name: 'providerAddress',
                type: 'address',
              },
              {
                indexed: false,
                internalType: 'uint256',
                name: 'availableSpace',
                type: 'uint256',
              },
              {
                indexed: false,
                internalType: 'uint256',
                name: 'pricePerGBPerMonth',
                type: 'uint256',
              },
            ],
            name: 'StorageProviderRegistered',
            type: 'event',
          },
          {
            inputs: [
              {
                internalType: 'address',
                name: '',
                type: 'address',
              },
            ],
            name: 'dataOrders',
            outputs: [
              {
                internalType: 'address',
                name: 'buyerAddress',
                type: 'address',
              },
              {
                internalType: 'address',
                name: 'ownerAddress',
                type: 'address',
              },
              {
                internalType: 'string',
                name: 'dataName',
                type: 'string',
              },
              {
                internalType: 'uint256',
                name: 'price',
                type: 'uint256',
              },
              {
                internalType: 'contract IDataPurchaseProtocol',
                name: 'dataPurchaseProtocol',
                type: 'address',
              },
            ],
            stateMutability: 'view',
            type: 'function',
          },
          {
            inputs: [
              {
                internalType: 'address',
                name: '',
                type: 'address',
              },
            ],
            name: 'dataOwners',
            outputs: [
              {
                internalType: 'address',
                name: 'ownerAddress',
                type: 'address',
              },
              {
                internalType: 'string',
                name: 'dataName',
                type: 'string',
              },
              {
                internalType: 'uint256',
                name: 'dataPrice',
                type: 'uint256',
              },
            ],
            stateMutability: 'view',
            type: 'function',
          },
          {
            inputs: [
              {
                internalType: 'address',
                name: '',
                type: 'address',
              },
            ],
            name: 'storageOrders',
            outputs: [
              {
                internalType: 'address',
                name: 'buyerAddress',
                type: 'address',
              },
              {
                internalType: 'address',
                name: 'providerAddress',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'storageSpace',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'totalCost',
                type: 'uint256',
              },
              {
                internalType: 'contract IStorageProtocol',
                name: 'storageProtocol',
                type: 'address',
              },
            ],
            stateMutability: 'view',
            type: 'function',
          },
          {
            inputs: [
              {
                internalType: 'address',
                name: '',
                type: 'address',
              },
            ],
            name: 'storageProviders',
            outputs: [
              {
                internalType: 'address',
                name: 'providerAddress',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'availableSpace',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'pricePerGBPerMonth',
                type: 'uint256',
              },
            ],
            stateMutability: 'view',
            type: 'function',
          },
        ];
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        // 发送交易
        const transaction = await contract.createStorageOrder(providerAddress, storageSpace, storageProtocol, {
          value: totalCost,
        });
        await transaction.wait();
        alert('Transaction sent successfully! Transaction hash: ' + transaction.hash);
      } catch (error) {
        alert('Error sending transaction: ' + error.message);
      }
    });
  },
  computed: {
    chartOption() {
      return {
        title: {
          text: 'Stacked Area Chart',
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985',
            },
          },
        },
        legend: {
          data: ['Email', 'Union Ads', 'Video Ads', 'Direct', 'Search Engine'],
        },
        toolbox: {
          feature: {
            saveAsImage: {},
          },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          },
        ],
        yAxis: [
          {
            type: 'value',
          },
        ],
        series: [
          {
            name: 'Email',
            type: 'line',
            stack: 'Total',
            areaStyle: {},
            emphasis: {
              focus: 'series',
            },
            data: [120, 132, 101, 134, 90, 230, 210],
          },
          {
            name: 'Union Ads',
            type: 'line',
            stack: 'Total',
            areaStyle: {},
            emphasis: {
              focus: 'series',
            },
            data: [220, 182, 191, 234, 290, 330, 310],
          },
          {
            name: 'Video Ads',
            type: 'line',
            stack: 'Total',
            areaStyle: {},
            emphasis: {
              focus: 'series',
            },
            data: [150, 232, 201, 154, 190, 330, 410],
          },
          {
            name: 'Direct',
            type: 'line',
            stack: 'Total',
            areaStyle: {},
            emphasis: {
              focus: 'series',
            },
            data: [320, 332, 301, 334, 390, 330, 320],
          },
          {
            name: 'Search Engine',
            type: 'line',
            stack: 'Total',
            label: {
              show: true,
              position: 'top',
            },
            areaStyle: {},
            emphasis: {
              focus: 'series',
            },
            data: [820, 932, 901, 934, 1290, 1330, 1320],
          },
        ],
      };
    },
  },
};
</script>

<style scoped>
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

button {
  color: initial;
}

.input-column {
  margin-right: 20px; /* adjust as needed */
}

.input-row {
  margin-bottom: 10px; /* adjust as needed */
}

.section {
  margin: 0;
}

.section-container {
  margin: 20px;
}
</style>
