<template>

  <a-layout class="BlockchainBrowser">
    <a-layout-header class="header-box">
      <!-- 导航栏 -->
      <Navigation></Navigation>
    </a-layout-header>
    <a-layout-content class="content-box middle-box">
      <div style="font-size: 32px;text-align: center; font-weight: bold; padding-bottom: 10px;">
        交易信息
      </div>
      <a-row>
        <a-col :span="6" style="padding-bottom: 30px; padding-left: 10px;padding-right: 10px">
          <a-card>
            <a-statistic title="24小时交易量" :value="1173661"></a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6" style="padding-bottom: 30px; padding-left: 10px;padding-right: 10px">
          <a-card>
            <a-statistic title="平均交易费用" :value="5.77">
              <template #suffix>USD
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6" style="padding-bottom: 30px; padding-left: 10px;padding-right: 10px">
          <a-card>
            <a-statistic title="24小时网络交易费用" :value="456.45" >
              <template #suffix>ETH
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6" style="padding-bottom: 30px; padding-left: 10px;padding-right: 10px">
          <a-card>
            <a-statistic title="24小时交易手续费" :value="0.1789">
              <template #suffix>ETH
              </template>
            </a-statistic>
          </a-card>
        </a-col>
      </a-row>
      <a-table
        class="ant-table-custom"
        size="middle"
        :columns="tx_columns"
        :data-source="transactions"
        :row-class-name="() => 'custom-row'"
        :style="{fontSize: '16px' }"
      >
        <template v-slot:bodyCell="{ column, record }">
          <template v-if="column.key === 'icon'">
            <FileTextOutlined :style="{fontSize: '24px', color: '#08c'}" />
          </template>

          <template v-if="column.key === 'more'">
            <a-button type="text" shape="circle" :icon="h(RightOutlined)"  @click="navigateToTransactionInfo(record)"/>
          </template>
        </template>
      </a-table>
    </a-layout-content>
    <a-layout-footer class="footer-box">

    </a-layout-footer>
  </a-layout>
</template>

<script lang="ts" setup>
import {DownOutlined, FileTextOutlined, RightOutlined} from "@ant-design/icons-vue";
import {h, ref} from "vue";
import {useRouter} from "vue-router";
import { transactionsData } from './data/transactions.js';
import Navigation from "./Navigation.vue";

const value = ref<string>('');
const selectedOption = ref<string>('All Filters');
const LanguageChoice = ref<string>('中文');
const onSearch = (searchValue: string) => {
  console.log('use value', searchValue);
  console.log('or use this.value', value.value);
};
const router = useRouter();
// 可以在此添加数据、方法等
const goToHome = () => {
  router.push('./index');
};
const tx_columns = [
  {
    key: 'icon',
    dataIndex: 'icon',
    width:'20px',
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
  }
]
const transactions = ref(transactionsData);
const formatHash = (hash) => {
  return hash && hash.length > 15 ? `${hash.substring(0, 12)}...` : hash;
};
const navigateToTransactionInfo = (record) => {
  router.push({name: 'TransactionInfo', params:{txnHash:record.txnHash}});
}
</script>

<style scoped>
/* 在此处添加样式 */
.BlockchainBrowser {
  width: 100%;
  margin: 0 auto;
}
.header-box, .middle-box, .footer-box {
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
.ant-dropdown-link{
  color: black;
}
.navigation{
  font-size: large;
}
.ant-table-custom :deep(.ant-table-thead > tr > th) {
  background-color: white;
}

.ant-table-custom :deep(.custom-row) td {
  background-color: white;
}
.key-data .title {
  color: #a3a3a3;
  margin-bottom: 8px;
}

.key-data {
  text-align: center;
}
.data-card-data{
  font-size: large;
  font-weight: bold;
}
</style>
