<template>

  <a-layout class="BlockchainBrowser">
    <a-layout-header class="header-box">
      <!-- 导航栏 -->
      <Navigation></Navigation>
  </a-layout-header>
    <a-layout-content class="content-box middle-box">
      <div style="font-size: 32px;text-align: center; font-weight: bold; padding-bottom: 10px;">
        区块信息
      </div>
      <a-row>
        <a-col :span="6" style="padding-bottom: 30px; padding-left: 10px;padding-right: 10px">
          <a-card>
            <div class="key-data">
              <div class="title">当前区块</div>
              <div class="data-card-data">19087621</div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6" style="padding-bottom: 30px; padding-left: 10px;padding-right: 10px">
          <a-card>
            <div class="key-data">
              <div class="title">LAST SAFE BLOCK</div>
              <div class="data-card-data">19087593</div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6" style="padding-bottom: 30px; padding-left: 10px;padding-right: 10px">
          <a-card>
            <div class="key-data">
              <div class="title">当前出块奖励</div>
              <div class="data-card-data">20ETH</div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6" style="padding-bottom: 30px; padding-left: 10px;padding-right: 10px">
          <a-card>
            <div class="key-data">
              <div class="title">24小时产生区块数</div>
              <div class="data-card-data">144</div>
            </div>
          </a-card>
        </a-col>
      </a-row>
      <a-table
        class="ant-table-custom"
        size="middle"
        :columns="block_columns"
        :data-source="data"
        :row-class-name="() => 'custom-row'"
        :style="{fontSize: '16px' }"
      >
        <template v-slot:bodyCell="{ column, record }">
          <template v-if="column.key === 'icon'">
            <CodepenOutlined :style="{fontSize: '24px', color: '#08c'}" />
          </template>
          <template v-if="column.key === 'more'">
            <a-button type="text" shape="circle" :icon="h(RightOutlined)" @click="navigateToBlockInfo(record)" />
          </template>
        </template>
      </a-table>
    </a-layout-content>
    <a-layout-footer class="footer-box">

    </a-layout-footer>
  </a-layout>
</template>

<script lang="ts" setup>
import {CodepenOutlined, DownOutlined, RightOutlined} from "@ant-design/icons-vue";
import {h, onMounted, ref} from "vue";
import {useRouter} from "vue-router";
import { mockData } from './data/mock.js';
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
const block_columns = [
  {
    key: 'icon',
    dataIndex: 'icon',
    width:'20px',
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
  }
];
const data = ref([]);

const fetchData = () => {
  data.value = mockData.blocks; // 直接使用导入的mockData
};
const navigateToBlockInfo = (record) => {
  router.push({name: 'BlockInfo', params:{number:record.number}});
}

onMounted(fetchData)

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
