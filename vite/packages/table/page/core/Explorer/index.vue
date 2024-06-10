<template>
  <a-layout class="Explorer">
    <!-- 头部布局 -->
    <a-layout-header class="header-box">
      <!-- 导航栏 -->
      <a-row class="navigation">
        <a-col :span="4">logo</a-col>
        <a-col :span="2">
          <a-button type="text" style="font-size: large">主页</a-button>
        </a-col>
        <a-col :span="2">
          <!-- 区块链下拉列表 -->
          <a-dropdown>
            <a class="ant-dropdown-link">
              区块链
              <DownOutlined />
            </a>
            <template #overlay>
              <a-menu arrow="true">
                <a-menu-item key="0">
                  <router-link to="./TransactionList">交易列表</router-link>
                </a-menu-item>
                <a-menu-item key="1">
                  <router-link to="./BlockList">区块列表</router-link>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </a-col>
        <a-col :span="2">
          <a-button type="text" style="font-size: large">代币</a-button>
        </a-col>
        <a-col :span="2">
          <a-button type="text" style="font-size: large">更多</a-button>
        </a-col>
        <a-col :span="8"></a-col>
        <a-col :span="4" class="language-dropdown">
          <!-- 语言选择下拉列表 -->
          <a-radio-group v-model:value="LanguageChoice">
            <a-radio-button value="Chinese">中文</a-radio-button>
            <a-radio-button value="English">English</a-radio-button>
          </a-radio-group>
        </a-col>
      </a-row>
      <a-divider />
      <!-- 搜索框 -->
      <a-input-group size="large">
        <a-select v-model:value="selectedOption" style="width: 10%" size="large">
          <a-select-option value="AllFilters">All Filters</a-select-option>
          <a-select-option value="Address">Address</a-select-option>
          <a-select-option value="TxHash">Txn Hash</a-select-option>
          <a-select-option value="Block">Block</a-select-option>
          <a-select-option value="Token">Token</a-select-option>
          <a-select-option value="DomainName">Domain Name</a-select-option>
        </a-select>
        <a-input-search
          v-model:value="value"
          size="large"
          style="width: 50%"
          placeholder="Search by Address / Txn Hash / Block / Token / Domain Name"
          enter-button="Search"
          @search="onSearch"
        />
      </a-input-group>
    </a-layout-header>

    <!-- 中间内容区 -->
    <a-layout-content class="content-box middle-box">
      <div class="overall">
        <a-row align="middle" justify="space-between">
          <a-col>
            <h2 class="base-data-title">基础数据</h2>
          </a-col>
          <a-col>
            <a-switch
              v-model:checked="state.checked2"
              checked-children="全部数据"
              un-checked-children="收起"
              @click="toggleData"
            />
          </a-col>
        </a-row>
        <a-card class="data-card">
          <a-row :gutter="24" align="middle" justify="center">
            <a-col :span="3">
              <div class="key-data">
                <div class="title">市值</div>
                <div class="data-card-data">$46.58B</div>
              </div>
            </a-col>
            <a-col :span="1">
              <!-- 竖线 -->
              <div class="vertical-line"></div>
            </a-col>
            <a-col :span="3">
              <div class="key-data">
                <div class="title">总交易量</div>
                <div class="data-card-data">5.26B txns</div>
              </div>
            </a-col>
            <a-col :span="1">
              <!-- 竖线 -->
              <div class="vertical-line"></div>
            </a-col>
            <a-col :span="3">
              <div class="key-data">
                <div class="title">Gas 价格</div>
                <div class="data-card-data">3.9501 Gwei</div>
              </div>
            </a-col>
            <a-col :span="1">
              <!-- 竖线 -->
              <div class="vertical-line"></div>
            </a-col>
            <a-col :span="3">
              <div class="key-data">
                <div class="title">TPS</div>
                <div class="data-card-data">49.21 笔/秒</div>
              </div>
            </a-col>
            <a-col :span="1">
              <!-- 竖线 -->
              <div class="vertical-line"></div>
            </a-col>
            <a-col :span="3">
              <div class="key-data">
                <div class="title">24h交易量</div>
                <div class="data-card-data">3.02M</div>
              </div>
            </a-col>
            <a-col :span="1">
              <!-- 竖线 -->
              <div class="vertical-line"></div>
            </a-col>
            <a-col :span="3">
              <div class="key-data">
                <div class="title">区块高度</div>
                <div class="data-card-data">12345870</div>
              </div>
            </a-col>
          </a-row>
          <a-divider />
          <!-- 详细数据 -->
          <div v-if="showAllData" class="detailed-data">
            <a-row :gutter="24" class="data-sections">
              <!-- 交易概览 -->
              <a-col :span="6">
                <div class="section-header">交易概览</div>
                <p class="value">总交易数: <a href="javascript:void(0)" class="value-link">5,262,493,431 txns</a></p>
                <p class="value">未确认交易数: <a href="javascript:void(0)" class="value-link">1,125 txns</a></p>
                <p>总交易费用: <span class="value">2.28B BNB</span></p>
                <p>24小时总交易数: <span class="value">3.02M BNB</span></p>
              </a-col>

              <!-- 地址概览 -->
              <a-col :span="6">
                <div class="section-header">地址概览</div>
                <p>地址数: <span class="value">596,559,656</span> <span class="text-green"></span></p>
                <p>合约地址数: <span class="value">298,293,161</span> <span class="text-green">+24,778</span></p>
                <p>普通地址数: <span class="value">298,266,495</span> <span class="text-green">+628,785</span></p>
                <p>持有BNB地址数: <span class="value">111,840,660</span> <span class="text-green">+34,589</span></p>
                <p>活跃地址数: <span class="value">2,255,133</span> <span class="text-green">+34,901</span></p>
              </a-col>

              <!-- 代币概览 -->
              <a-col :span="6">
                <div class="section-header">代币概览</div>
                <p>
                  代币数: <a href="javascript:void(0)" class="value-link">4,467,917</a>
                  <span class="text-green">+2,146</span>
                </p>
                <p>
                  BEP-20 代币: <a href="javascript:void(0)" class="value-link">3,883,921</a>
                  <span class="text-green">+2,057</span>
                </p>
                <p>BEP-721 代币: <span class="value">572,362</span> <span class="text-green">+88</span></p>
                <p>BEP-1155 代币: <span class="value">11,634</span> <span class="text-green">+1</span></p>
              </a-col>

              <!-- 链信息 -->
              <a-col :span="6">
                <div class="section-header">链信息</div>
                <p>发行日期: <span class="value">2024/1/10</span></p>
                <p>共识算法: <span class="value">PoT</span></p>
                <p>TPS: <span class="value">54.34 笔/秒</span></p>
                <p>已销毁总手续费: <span class="value">213,508.68 BNB</span></p>
                <p>Gas 价格: <span class="value">4.21 Gwei</span></p>
              </a-col>
            </a-row>
          </div>
        </a-card>
      </div>
    </a-layout-content>
    <!-- 底部内容区 -->
    <a-layout-footer class="footer-box">
      <a-row align="middle" justify="space-between">
        <a-col :span="24" class="content-title">
          <a-tabs v-model:activeKey="activeKey" size="large">
            <a-tab-pane key="1">
              <template #tab>
                <span>
                  <codepen-outlined />
                  区块
                </span>
              </template>
              <a-table
                class="ant-table-custom"
                size="middle"
                :columns="block_columns"
                :data-source="data"
                :row-class-name="() => 'custom-row'"
                :style="{ fontSize: '16px' }"
              >
                <template v-slot:bodyCell="{ column, record }">
                  <template v-if="column.key === 'icon'">
                    <CodepenOutlined :style="{ fontSize: '24px', color: '#08c' }" />
                  </template>
                  <template v-if="column.key === 'more'">
                    <a-button
                      type="text"
                      shape="circle"
                      :icon="h(RightOutlined)"
                      @click="navigateToBlockInfo(record)"
                    />
                  </template>
                </template>
              </a-table>
              <a-button size="large" @click="goToBlockList">
                查看所有区块
                <RightOutlined />
              </a-button>
            </a-tab-pane>
            <a-tab-pane key="2">
              <template #tab>
                <span>
                  <dollar-circle-filled />
                  交易
                </span>
              </template>
              <a-table
                class="ant-table-custom"
                size="middle"
                :columns="tx_columns"
                :data-source="transactions"
                :row-class-name="() => 'custom-row'"
                :style="{ fontSize: '16px' }"
              >
                <template v-slot:bodyCell="{ column, record }">
                  <template v-if="column.key === 'icon'">
                    <FileTextOutlined :style="{ fontSize: '24px', color: '#08c' }" />
                  </template>

                  <template v-if="column.key === 'more'">
                    <a-button
                      type="text"
                      shape="circle"
                      :icon="h(RightOutlined)"
                      @click="navigateToTransactionInfo(record)"
                    />
                  </template>
                </template>
              </a-table>
              <a-button size="large" @click="goToTransactionList">
                查看所有交易
                <RightOutlined />
              </a-button>
            </a-tab-pane>
          </a-tabs>
        </a-col>
      </a-row>
    </a-layout-footer>
  </a-layout>
</template>

<script lang="ts" setup>
import { h, onMounted, ref } from 'vue';
import { reactive } from 'vue';
import {
  DollarCircleFilled,
  CodepenOutlined,
  DownOutlined,
  RightOutlined,
  FileTextOutlined,
} from '@ant-design/icons-vue';
import axios from 'axios';
import { mockData } from './data/mock.js';
import { transactionsData } from './data/transactions.js';
import { useRouter } from 'vue-router';

const value = ref<string>('');
const selectedOption = ref<string>('All Filters');
const LanguageChoice = ref<string>('中文');
const onSearch = (searchValue: string) => {
  console.log('use value', searchValue);
  console.log('or use this.value', value.value);
};
const showAllData = ref(false);
const toggleData = () => {
  showAllData.value = !showAllData.value;
};
const state = reactive({
  checked1: true,
  checked2: false,
});
const activeKey = ref('1');
const block_columns = [
  {
    key: 'icon',
    dataIndex: 'icon',
    width: '20px',
  },
  {
    title: '区块高度',
    dataIndex: 'number',
    key: 'number',
  },
  {
    title: '出块时间',
    dataIndex: 'time',
  },
  {
    title: '地址',
    dataIndex: 'hash',
    key: 'hash',
  },
  {
    title: '打包交易数',
    dataIndex: 'transactions',
  },
  {
    title: '验证人',
    dataIndex: 'validator',
  },
  {
    key: 'more',
    dataIndex: 'more',
  },
];
const tx_columns = [
  {
    key: 'icon',
    dataIndex: 'icon',
    width: '20px',
  },
  {
    title: '交易地址',
    dataIndex: 'txnHash',
    key: 'txnHash',
    customRender: ({ text }) => formatHash(text),
  },
  {
    title: '打包区块',
    dataIndex: 'block',
  },
  {
    title: '交易时间',
    dataIndex: 'age',
  },
  {
    title: 'From',
    dataIndex: 'from',
    customRender: ({ text }) => formatHash(text),
  },
  {
    title: 'To',
    dataIndex: 'to',
    customRender: ({ text }) => formatHash(text),
  },
  {
    title: '交易数量',
    dataIndex: 'value',
  },
  {
    title: '手续费',
    dataIndex: 'txnFee',
  },
  {
    key: 'more',
    dataIndex: 'more',
  },
];
// 初始化区块数据
const data = ref([]);

const fetchData = () => {
  data.value = mockData.blocks; // 直接使用导入的mockData
};
const transactions = ref(transactionsData);
const formatHash = (hash) => {
  return hash && hash.length > 15 ? `${hash.substring(0, 12)}...` : hash;
};
const router = useRouter();

const goToBlockList = () => {
  router.push('./BlockList');
};
const goToTransactionList = () => {
  router.push('./TransactionList');
};
const navigateToBlockInfo = (record) => {
  router.push({ name: 'BlockInfo', params: { number: record.number } });
};
const navigateToTransactionInfo = (record) => {
  router.push({ name: 'TransactionInfo', params: { txnHash: record.txnHash } });
};
onMounted(fetchData);
</script>

<style scoped>
.Explorer {
  width: 100%;
  margin: 0 auto;
}

.header-box,
.middle-box,
.footer-box {
  margin-left: 5%;
  margin-right: 5%;
  /*border: 1px solid black;*/
  border-radius: 10px;
  text-align: center;
  padding: 10px;
  box-sizing: border-box;
  background-color: transparent;
}

.header-box {
  height: auto; /* 根据内容调整高度 */
}

.middle-box {
  height: auto;
}

.footer-box {
  height: auto;
}
.navigation {
  font-size: large;
}
.ant-dropdown-link {
  color: black;
}
.overall {
  padding: 20px 30px;
}
.data-card {
  width: 100%;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
}

.key-data .title {
  color: #a3a3a3;
  margin-bottom: 8px;
}

.key-data {
  text-align: center;
}

.vertical-line {
  background-color: #e8e8e8;
  width: 1px;
  height: 100px; /* Adjust the height as needed */
  margin: 0 auto; /* This will ensure the line is centered in the column */
}

.additional-data {
  margin-top: 20px;
  text-align: center;
}
.data-card-data {
  font-size: large;
  font-weight: bold;
}
.base-data-title {
  font-weight: bold;
}
.section-header {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
}

.data-sections {
  margin-top: 20px;
}
.value-link {
  color: #2a9df4;
  font-weight: bold;
}

.text-green {
  color: #3f8600;
  font-weight: bold;
}

.value {
  font-weight: bold;
}
.ant-table-custom :deep(.ant-table-thead > tr > th) {
  background-color: white;
}

.ant-table-custom :deep(.custom-row) td {
  background-color: white;
}
</style>
