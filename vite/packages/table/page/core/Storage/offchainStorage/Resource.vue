<template>
  <div class="content st-background">
    <!-- 存储服务提供商部分 -->
    <div class="section" style="display: flex; flex-direction: column; align-items: center; justify-content: center">
      <div class="section-title">
        存储服务提供商资源注册
      </div>
      <div class="flex-container">
        <div class="input-column">
          <div class="input-row">
            <label for="available-space">可用数据空间大小(GB):</label>
            <input type="number" id="available-space" v-model="availableSpace" />
          </div>
          <div class="input-row">
            <label for="price-per-gb">每GB存储的月费:</label>
            <input type="number" id="price-per-gb" v-model="pricePerGBPerMonth" />
          </div>
          <div class="input-row">
            <label for="bandwidth">带宽(Mbps):</label>
            <input type="number" id="bandwidth" v-model="bandwidth" />
          </div>
        </div>
        <button @click="registerStorageProvider">注册</button>
      </div>
    </div>

    <!-- 数据所有者部分 -->
    <div class="section" style="display: flex; flex-direction: column; align-items: center; justify-content: center">
      <div class="section-title">
        数据所有者资源注册
      </div>
      <div class="flex-container">
        <div class="input-column">
          <div class="input-row">
            <label for="data-name">数据名称:</label>
            <input type="text" id="data-name" v-model="dataName" />
          </div>
          <div class="input-row">
            <label for="data-price">数据价格:</label>
            <input type="number" id="data-price" v-model="dataPrice" />
          </div>
          <div class="input-row">
            <label for="bandwidth">带宽(Mbps):</label>
            <input type="number" id="bandwidth" v-model="dataOwnerBandwidth" />
          </div>
        </div>
        <button @click="registerDataOwner">注册</button>
      </div>
    </div>

    <div class="section" style="display: flex; flex-direction: column; align-items: center; justify-content: center">
      <div class="section-title">
        数据所有者执行数据访问控制
      </div>
      <div class="flex-container">
        <div class="input-column">
          <div class="input-row">
            <label for="data-name">数据名称:</label>
            <input type="text" id="data-name" v-model="dataName" />
          </div>
          <div class="input-row">
            <label for="data-price">数据共享价格:</label>
            <input type="number" id="data-price" v-model="dataPrice" />
          </div>
          <div class="input-row">
            <label for="bandwidth">支付给存储服务提供商的费用:</label>
            <input type="number" id="bandwidth" v-model="dataOwnerBandwidth" />
          </div>
        </div>
        <button @click="registerDataOwner">注册</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ethers } from 'ethers';

export default {
  name: 'offChainStorageResource',
  data() {
    return {
      contractAddress: '0xc9a57d70dab488914a2ca1cf95138a5688ce25a6',
      abi: [
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
      ],
      contractInstance: null,
      availableSpace: 10,
      pricePerGBPerMonth: 100,
      dataName: 'lol-2',
      dataPrice: 1,
    };
  },
  async created() {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        this.contractInstance = new ethers.Contract(this.contractAddress, this.abi, signer);
      } catch (error) {
        console.error(error);
      }
    } else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  },
  methods: {
    async registerStorageProvider() {
      if (this.contractInstance) {
        try {
          const tx = await this.contractInstance.registerStorageProvider(this.availableSpace, this.pricePerGBPerMonth);
          console.log(tx);
        } catch (error) {
          console.error(error);
        }
      }
    },
    async registerDataOwner() {
      if (this.contractInstance) {
        try {
          const tx = await this.contractInstance.registerDataOwner(this.dataName, this.dataPrice);
          console.log(tx);
        } catch (error) {
          console.error(error);
        }
      }
    },
  },
};
</script>

<style scoped>
.st-background {
  background-image: url('/images/background/mainbg.png');
  background-size: 100% auto;
}

.section {
  margin-bottom: 20px; /* adjust as needed */
  text-align: center;
}

.flex-container {
  display: flex;
  align-items: center; /* vertically center the button with the input fields */
}

.input-column {
  margin-right: 20px; /* adjust as needed */
}

.input-row {
  margin-bottom: 10px; /* adjust as needed */
}

/* To ensure that buttons retain their default color */
button {
  color: initial;
}

/* Similarly, to ensure input placeholders retain their default color */
input::placeholder {
  color: initial;
}

h2 {
  font-size: 32px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  text-align: center;
  margin-bottom: 20px;
}

.section-title {
  /* color: white;
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 10px;
    text-align: center;
    display: table-caption;
    caption-side: top;
    width: 100%; */
  white-space: nowrap; /* 阻止文本自动换行 */
  overflow: hidden; /* 防止文本溢出容器 */
  text-overflow: ellipsis; /* 如果文本超出容器宽度，显示省略号 */
  max-width: 100%; /* 限制标题宽度为其容器的最大宽度 */
  color: white;
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  caption-side: top;
}
</style>
