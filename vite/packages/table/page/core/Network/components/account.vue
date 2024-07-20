<template>
  <div class="content-wrapper">
    <a-form class="id-form">
      <a-form-item>
        <div class="input-group">
          <div class="form-item-label">DVPN ID:</div>
          <a-input placeholder="0x..." v-model="ethAddress" :value="ethAddress" class="input-field" />
          <a-button class="generate-button" @click="generateEthAddress">生成</a-button>
        </div>
      </a-form-item>
    </a-form>

    <a-space class="action-space">
      <a-button :type="actionType === 'recharge' ? 'primary' : 'default'" @click="showRecharge"
        class="action-button">充值</a-button>
      <a-button :type="actionType === 'withdraw' ? 'primary' : 'default'" @click="showWithdraw"
        class="action-button">提取</a-button>
    </a-space>

    <a-form v-if="actionType" class="action-form">
      <a-form-item>
        <div class="input-group">
          <div class="form-item-label">余额:</div>
          <a-input placeholder="0.0/BHC" v-model="balance" class="input-field" />
        </div>
      </a-form-item>
      <a-form-item>
        <div class="input-group">
          <div class="form-item-label">罚金:</div>
          <a-input placeholder="0.0/BHC" v-model="deposit" class="input-field" />
        </div>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="performAction" class="action-button">{{ actionType === 'recharge' ? '充值' : '提取'
        }}</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ethers } from 'ethers';

// 定义响应式数据
const ethAddress = ref('');
const balance = ref('');
const deposit = ref('');
const actionType = ref('recharge');

const generateEthAddress = () => {
  const wallet = ethers.Wallet.createRandom();
  ethAddress.value = wallet.address;
};


// 显示充值操作表单
const showRecharge = () => {
  actionType.value = 'recharge';
  // 此处可添加获取余额的逻辑
};

// 显示提取操作表单
const showWithdraw = () => {
  actionType.value = 'withdraw';
  // 此处可添加获取余额的逻辑
};

// 执行充值或提取操作
const performAction = () => {
  // 重置表单
  balance.value = '';
  deposit.value = '';
};
</script>

<style scoped>
.content-wrapper {
  color: #f0f0f0;
  background-color: #001529;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  width: 100%;
  height: 100%;
}

.id-form {
  width: 100%;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.form-item-label {
  color: #f0f0f0;
  margin-right: 10px;
}

.input-group {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.generate-button {
  margin-left: 10px;
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


.action-space {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  margin-top: 20px;
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

.action-form {
  width: 100%;
  padding-top: 20px;
  border-top: 1px solid #394e60;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
