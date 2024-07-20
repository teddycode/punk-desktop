<template>
  <div class="content-wrapper">
    <div class="form-container">
      <a-form :layout="'inline'" @submit.prevent="registerNode" class="node-form">
        <a-form-item label="节点连接信息">
          <a-input v-model="nodeInfo.connectionInfo" placeholder="请输入节点连接信息"></a-input>
        </a-form-item>
        <a-form-item label="节点价格">
          <a-input v-model="nodeInfo.price" placeholder="ETH/GB"></a-input>
        </a-form-item>
        <a-form-item label="质押金额">
          <a-input v-model="nodeInfo.stakeAmount" placeholder="0.0/ETH"></a-input>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit">注册</a-button>
        </a-form-item>
      </a-form>
    </div>
    <a-table :columns="columns" :dataSource="data" :rowKey="record => record.address" :pagination="{ pageSize: 4 }" class="node-table"></a-table>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

interface NodeData {
  address: string;
  usedData: string;
  price: number;
  stakeAmount: number;
  expectedEarnings: number;
}

const nodeInfo = ref({
  connectionInfo: '',
  price: '',
  stakeAmount: '',
});

const columns = [
  {
    title: '节点地址',
    dataIndex: 'address',
    key: 'address',
  },
  {
    title: '已用流量',
    dataIndex: 'usedData',
    key: 'usedData',
  },
  {
    title: '节点价格',
    dataIndex: 'price',
    key: 'price',
  },
  {
    title: '质押金额',
    dataIndex: 'stakeAmount',
    key: 'stakeAmount',
  },
  {
    title: '预期收益',
    dataIndex: 'expectedEarnings',
    key: 'expectedEarnings',
  },
];

const data = ref<NodeData[]>([
  // 用于存放节点列表数据
]);
// 添加示例数据
data.value.push({
  /* random eth address */
  address: '150.230.20.2',
  usedData: '100GB',
  price: 0.001,
  stakeAmount: 100,
  expectedEarnings: 0.1,
});


const registerNode = () => {
  console.log('注册节点信息:', nodeInfo.value);
};
</script>

<style scoped>
.content-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: #001529;
}

.form-container,
.node-table {
  max-width: 960px;
  width: 100%;
  background: #ffffff;
  /* 白色背景，清晰简洁 */
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  /* 轻微的阴影，增加层次感 */
  margin-bottom: 24px;
  overflow: hidden;
  /* 隐藏内部元素的溢出，保证圆角效果 */
}

.node-form {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  /* 保证元素间有适当的间距 */
  padding: 16px;
}

a-form-item {
  flex-basis: calc(33.333% - 16px);
  /* 三列布局，每项占1/3宽度，减去间隙 */
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin-bottom: 16px;
}

a-form-item label {
  color: #333;
  /* 深色字体，提高可读性 */
  margin-bottom: 8px;
}

a-input {
  border-radius: 4px;
  /* 输入框圆角 */
}

a-button {
  border-radius: 4px;
  /* 按钮圆角 */
  font-weight: 500;
  /* 字体加粗，更易阅读 */
}

.node-table {
  padding: 16px;
}

a-table-thead>tr>th {
  background-color: #f0f2f5;
  /* 浅灰色表头背景 */
  color: #333;
  /* 深色字体，提高可读性 */
}

a-table-cell {
  border-bottom: 1px solid #e8e8e8;
  /* 单元格底部边框 */
}
</style>

