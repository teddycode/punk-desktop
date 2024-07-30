<template>
  <div class="content-wrapper">

    <div class="my-stake">
      <a-table :columns="columns" :dataSource="myData" rowKey="id" :pagination="{ pageSize: 2 }" />
    </div>

    <div class="action-area">
      <a-space class="action-space">
        <a-button :type="actionType === 'stake' ? 'primary' : 'default'" @click="showStake"
          class="action-button">质押</a-button>
        <a-button :type="actionType === 'withdraw' ? 'primary' : 'default'" @click="showWithdraw"
          class="action-button">提取</a-button>
      </a-space>

      <a-form v-if="actionType" class="action-form">
        <a-form-item>
          <div class="input-group">
            <div class="form-item-label">地址:</div>
            <a-input placeholder="0x" v-model="nodeId" class="input-field" />
          </div>
        </a-form-item>
        <a-form-item>
          <div class="input-group">
            <div class="form-item-label">金额:</div>
            <a-input placeholder="0.0" v-model="actionAmount" class="input-field" />
          </div>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="performAction" class="action-button">{{ actionType === 'stake' ? '质押' : '提取'
          }}</a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
// import 'ant-design-vue/dist/antd.css';

const actionType = ref('stake');
const nodeId = ref('');
const actionAmount = ref('');

const showStake = () => {
  actionType.value = 'stake';
};

const showWithdraw = () => {
  actionType.value = 'withdraw';
};

const columns = [
  {
    title: '节点ID',
    dataIndex: 'id',
  },
  {
    title: '收益率',
    dataIndex: 'rate',
  },
  {
    title: '当前质押量',
    dataIndex: 'staked',
  },
  {
    title: '当前收益',
    dataIndex: 'earnings',
  },
];

// 示例数据，实际应用中应该从区块链合约获取
const myData = ref([
  { id: '0x402C4B59b084122041fAdc826fD9e0FB61ce3CFd', rate: '5%', staked: '100 ETH', earnings: '5 ETH' },
  { id: '0xc2c55ee8F428866b1929Fd34BC33cE2824Ad9E3a', rate: '2.8%', staked: '50 ETH', earnings: '1.4 ETH' },
  { id: '0x7aF627b45581Dbd35b3d938e6C46F7852f9B2359', rate: '3.6%', staked: '20 ETH', earnings: '0.72 ETH' },
  // 其他节点数据...
]);

const mode = ref('stake'); // 默认为质押模式
const form = ref({
  nodeId: '',
  amount: '',
});

const setMode = (newMode) => {
  mode.value = newMode;
};

const submitForm = () => {
  if (mode.value === 'stake') {
    // 实现质押逻辑
    alert(`质押 ${form.value.amount} 至节点 ${form.value.nodeId}`);
  } else {
    // 实现提取逻辑
    alert(`从节点 ${form.value.nodeId} 提取 ${form.value.amount}`);
  }
};



</script>
<style scoped>
.content-wrapper {
  background-color: #001529;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  width: 100%;
  height: 100%;
}

.my-stake {
  width: 100%;
  max-width: 800px;
  height: 30%;
}

.action-area {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
}

.action-space {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  margin-top: 20px;
}

.action-form {
  width: 100%;
  padding-top: 20px;
  border-top: 1px solid #394e60;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.input-group {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.input-field {
  flex: 1;
  width: 100%;
  max-width: 300px;
  border-radius: 4px;
  background-color: #022140;
  border: 1px solid #394e60;
  color: #fff;
}


.form-item-label {
  color: #f0f0f0;
  white-space: nowrap;
  margin-left: auto;
  margin-right: 10px;
}

.action-button {
  border-radius: 4px;
  border-color: #40a9ff;
  color: #40a9ff;
}

.action-button[type="primary"] {
  background-color: #1890ff;
  border-color: #1890ff;
}
</style>

