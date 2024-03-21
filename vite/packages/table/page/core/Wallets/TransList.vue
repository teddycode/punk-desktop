<template>
  <a-card :bordered="true" style="margin-top: 10px">
    <a-row>
      <a-col :sm="12" :xs="24">
        <info title="收入" :value="countStatus.income + ' USDT'" :bordered="true" />
      </a-col>
      <a-col :sm="12" :xs="24">
        <info title="支出" :value="countStatus.outcome + ' USDT'" :bordered="true" />
      </a-col>
    </a-row>
  </a-card>
  <div style="margin-top: 10px; margin-bottom: 20px">
    <a-card style="margin-top: 24px" :bordered="true" title="交易列表">
      <template #extra>
        时间范围：
        <a-date-picker placeholder="起始时间" v-model:value="timeRange.start" /> -
        <a-date-picker placeholder="结束时间" v-model:value="timeRange.end" />
        代币类型：
        <a-select placeholder="请选择" default-value="0">
          <a-select-option value="0">ETH</a-select-option>
          <a-select-option value="1">BTC</a-select-option>
          <a-select-option value="2">其他</a-select-option>
        </a-select>
        <a-input-search style="margin-left: 16px; width: 272px" />
        <a-button style="margin-left: 5px" type="dashed" @click="add">
          <template #icon> </template>
          刷新
        </a-button>
      </template>
      <a-table :columns="columns" :data-source="tableData" :pagination="pageConfig">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'symbol'">
            <a-tooltip>
              <template #title>{{ record.symbol.toUpperCase() }}</template>
              <a-avatar :src="getCoinIcon(record.symbol)" alt="未知" style="padding-right: 5px" />
              {{ record.symbol.toUpperCase() }}
            </a-tooltip>
          </template>
          <template v-else-if="column.key === 'hash'">
            <a> {{ record.hash }} </a>
          </template>
          <template v-else-if="column.key === 'from'">
            <a> {{ record.from }} </a>
          </template>
          <template v-else-if="column.key === 'to'">
            <a> {{ record.to }} </a>
          </template>
          <template v-else-if="column.key === 'type'">
            <div v-if="record?.to === address">
              <a-tag color="green">收入</a-tag>
            </div>
            <div v-else-if="record?.from === address">
              <a-tag color="red">支出</a-tag>
            </div>
            <template v-else>
              <a-tag color="yellow">未知</a-tag>
            </template>
          </template>
          <template v-else-if="column.key === 'amount'">
            {{ record.amount + ' ' + record.symbol }}
          </template>
          <template v-else-if="column.key === 'action'">
            <span> <EyeOutlined /> <a>详情</a> </span>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<!--
元素： 代币类型，交易哈希，区块高度，付款方，收款方，交易类型，数额，费用，查看详情
-->

<script lang="ts">
import { defineComponent, ref } from 'vue';
import info from './components/Info.vue';
import LayoutFooter from '@page/core/Layouts/components/layout-footer.vue';
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import datas from './data';
import { useRoute } from 'vue-router';
import { GetForWalletStatus, PostWalletPageList } from '@js/service/wallets';
import { PageParams } from '@js/service/typing';
import { appStore } from '@store';
import { GetForTransactionStatus, PostTransactionPageList } from '@js/service/transactions';

export default defineComponent({
  name: 'TransactionsPage',
  components: {
    LayoutFooter,
    info,
    EyeOutlined,
    DeleteOutlined,
  },
  setup() {
    // 代币类型，交易哈希，区块高度，付款方，收款方，交易类型，数额，费用，查看详情
    const columns = datas.transactionColumn;

    const address = useRoute().query?.address;

    console.log('传递的地址参数：', address);

    let tableData = ref([]);

    function add() {}
    function edit(record) {}
    // 获取代币图标
    function getCoinIcon(name) {
      return '/icons/coins/svg/' + name?.toLowerCase() + '.svg';
    }

    let timeRange = ref({
      start: '',
      end: '',
    });

    // 统计数据
    let countStatus = ref({
      income: 0.0,
      outcome: 0.0,
    });

    const userInfo = appStore().userInfo;

    let pageConfig = ref({
      current: 1,
      pageSize: 10,
      total: 0,
    });

    // 获取后端数据
    async function fetchStatusData() {
      const userId = parseInt(userInfo.uid);
      GetForTransactionStatus(userId, address).then((data) => {
        console.log('交易统计数据：', data);
        countStatus.value.income = data?.data.income;
        countStatus.value.outcome = data?.data.outcome;
      });
    }
    //   获取表格数据
    async function fetchTableData() {
      const uid = parseInt(userInfo.uid);
      PostTransactionPageList(uid, address, pageConfig.value).then((resp) => {
        console.log('交易分页数据：', resp);
        tableData.value = resp?.data?.records;
        pageConfig.value.current = resp?.data?.pageNumber;
      });
    }

    return {
      columns,
      address,
      timeRange,
      countStatus,
      tableData,
      pageConfig,
      userInfo,
      add,
      edit,
      fetchTableData,
      fetchStatusData,
      getCoinIcon,
    };
  },
  mounted() {
    //  获取统计信息
    this.fetchTableData();
    //  获取表格信息
    this.fetchStatusData();
  },
});
</script>

<style lang="less" scoped>
.collections-page {
  /*min-height: 100%;*/
  width: 90%;
  margin: 0 auto;
}

.title-section h1 {
  text-align: center;
  margin-bottom: 60px;
}

.table-section {
  padding: 0 5%;
}

.collections-table tr:hover {
  background-color: #eaf4ff;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}
.ant-avatar-lg {
  width: 48px;
  height: 48px;
  line-height: 48px;
}

.list-content-item {
  color: rgba(0, 0, 0, 0.45);
  display: inline-block;
  vertical-align: middle;
  font-size: 14px;
  margin-left: 40px;
  span {
    line-height: 20px;
  }
  p {
    margin-top: 4px;
    margin-bottom: 0;
    line-height: 22px;
  }
}
</style>
