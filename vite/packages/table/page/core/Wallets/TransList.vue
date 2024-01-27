<template>
  <a-card :bordered="true" style="margin-top: 10px">
    <a-row>
      <a-col :sm="12" :xs="24">
        <info title="收入" value="约11100.443774元" :bordered="true" />
      </a-col>
      <a-col :sm="12" :xs="24">
        <info title="支出" value="约2020.13443元" :bordered="true" />
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
      <a-table :columns="columns" :data-source="data">
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
            <div v-if="record.type === 1">
              <a-tag color="green">收入</a-tag>
            </div>
            <div v-else-if="record.type === 0">
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
import TaskForm from './components/TaskForm.vue';
import LayoutFooter from '@page/core/Layouts/components/layout-footer.vue';
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons-vue';

export default defineComponent({
  name: 'TransactionsPage',
  components: {
    LayoutFooter,
    info,
    TaskForm,
    EyeOutlined,
    DeleteOutlined,
  },
  setup() {
    // 代币类型，交易哈希，区块高度，付款方，收款方，交易类型，数额，费用，查看详情
    const columns = [
      {
        title: '主键',
        dataIndex: 'id',
        key: 'id',
        width: 60,
      },
      {
        title: '代币符号',
        dataIndex: 'symbol',
        key: 'symbol',
        width: 100,
        align: 'center',
      },
      {
        title: '交易哈希',
        dataIndex: 'hash',
        key: 'hash',
        ellipsis: true,
      },
      {
        title: '区块高度',
        dataIndex: 'height',
        key: 'height',
      },
      {
        title: '付款方',
        key: 'from',
        dataIndex: 'from',
        ellipsis: true,
      },
      {
        title: '收款方',
        key: 'to',
        dataIndex: 'to',
        ellipsis: true,
      },
      {
        title: '交易类型',
        key: 'type',
        dataIndex: 'type',
      },
      {
        title: '数额',
        key: 'amount',
        dataIndex: 'amount',
      },
      {
        title: '费用',
        key: 'fee',
        dataIndex: 'fee',
        ellipsis: true,
      },
      {
        title: '操作',
        key: 'action',
      },
    ];

    const data = [
      {
        id: 1,
        symbol: 'ETH',
        hash: '0x3c3f7013840ac8ae006bd68990d1ea6a217cb0afb85efe57ced298e5e61c9a77',
        height: 10431437,
        from: '0xEDaf4083F29753753d0Cd6c3C50ACEb08c87b5BD',
        to: '0x1423f4ceC7fCBE8400A957121ad616C439a0d4CF',
        type: 1,
        amount: 0.02,
        fee: '0.000000000025137 ETH',
      },
      {
        id: 2,
        symbol: 'ETH',
        hash: '0xeda85045e89c98d55618b271657820508296c0d37cba88ada380fb5e34566869',
        height: 10439797,
        from: '0x87c9B02A10eC2CB4dcB3b2e573e26169CF3cd9Bf',
        to: '0x1423f4ceC7fCBE8400A957121ad616C439a0d4CF',
        type: 1,
        amount: 0.02,
        fee: '0.000000000065205 ETH',
      },
      {
        id: 3,
        symbol: 'ETH',
        hash: '0x41aacfc5ff4ff1e066ec5ddad080be11b6901c421c996cfc5265d70c526c261f',
        height: 10431498,
        from: '0x1423f4ceC7fCBE8400A957121ad616C439a0d4CF',
        to: '0x8942E52BE95b4f7e7566A91D77308F415DCf1d5D',
        type: 0,
        amount: 0.0,
        fee: '0.000052501500385011 ETH',
      },
    ];
    function add() {}
    function edit(record) {}
    // 获取代币图标
    function getCoinIcon(name) {
      return '/icons/coins/svg/' + name.toLowerCase() + '.svg';
    }

    let timeRange = ref({
      start: '',
      end: '',
    });
    return {
      columns,
      timeRange,
      data,
      add,
      edit,
      getCoinIcon,
    };
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
