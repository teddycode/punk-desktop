<template>
  <div class="child-component">
    <div class="child-header">
      <span class="child-icon">👶</span>
      <h5>子组件</h5>
    </div>
    
    <div class="child-content">
      <div class="child-info">
        <p>✅ 通过 props 接收钱包服务</p>
        <p>✅ 可以访问父组件的钱包状态</p>
      </div>
      
      <div class="child-status">
        <div class="status-row">
          <span>连接状态:</span>
          <span>{{ wallet?.isConnected.value ? '✅ 已连接' : '❌ 未连接' }}</span>
        </div>
        <div class="status-row">
          <span>地址:</span>
          <span class="addr">{{ wallet?.address.value || '(空)' }}</span>
        </div>
      </div>
      
      <a-button 
        size="small"
        block
        type="primary"
        @click="testInChild"
        :disabled="!wallet"
      >
        在子组件中调用钱包方法
      </a-button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  wallet: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['log']);

const testInChild = async () => {
  emit('log', '========== 子组件测试 ==========', 'info');
  emit('log', '✅ 子组件成功接收到 wallet 对象', 'success');
  emit('log', `当前连接状态: ${props.wallet.isConnected.value}`, 'info');
  
  if (!props.wallet.checkInitialized()) {
    emit('log', '钱包未初始化，正在初始化...', 'info');
    try {
      await props.wallet.initWallet();
      emit('log', '✅ 子组件中初始化成功', 'success');
    } catch (e) {
      emit('log', `❌ 初始化失败: ${e.message}`, 'error');
      return;
    }
  }
  
  if (!props.wallet.isConnected.value) {
    emit('log', '钱包未连接，正在打开连接对话框...', 'info');
    try {
      const result = await props.wallet.openWallet();
      if (result) {
        emit('log', `✅ 子组件中连接成功！地址: ${result.address}`, 'success');
        emit('log', '💡 props 传递的钱包服务完全可用', 'success');
      } else {
        emit('log', '⚠️ 连接被取消', 'warning');
      }
    } catch (e) {
      emit('log', `❌ 连接失败: ${e.message}`, 'error');
    }
  } else {
    emit('log', '💡 钱包已连接，无需重复连接', 'info');
    emit('log', `地址: ${props.wallet.address.value}`, 'success');
  }
};
</script>

<style scoped>
.child-component {
  background: #fff7e6;
  border: 2px dashed #fa8c16;
  border-radius: 8px;
  padding: 15px;
  margin-top: 12px;
}

.child-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.child-icon {
  font-size: 20px;
}

.child-header h5 {
  margin: 0;
  color: #fa8c16;
  font-size: 14px;
  font-weight: 600;
}

.child-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.child-info {
  font-size: 12px;
  color: #666;
  line-height: 1.6;
}

.child-info p {
  margin: 0 0 4px 0;
}

.child-status {
  background: white;
  border-radius: 6px;
  padding: 10px;
}

.status-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 12px;
}

.status-row .addr {
  font-family: 'Courier New', monospace;
  font-size: 10px;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
