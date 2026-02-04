<template>
  <div class="wallet-test-compact">
    <div class="header">
      <div class="header-left">
        <a-button class="back-btn" @click="$router.push('/test/wallet')">
          ← 返回测试中心
        </a-button>
        <h1>🔧 测试1: 基础钱包服务</h1>
      </div>
      <div class="status-badge" :class="{ connected: wallet?.isConnected.value }">
        {{ wallet?.isConnected.value ? '✅ 已连接' : '⚪ 未连接' }}
      </div>
    </div>

    <div class="content-grid">
      <!-- 左侧：状态和测试 -->
      <div class="left-panel">
        <!-- 快速状态 -->
        <div class="status-card">
          <div class="status-row">
            <span class="label">插件注入:</span>
            <span :class="['value', walletAvailable ? 'success' : 'error']">
              {{ walletAvailable ? '✅' : '❌' }}
            </span>
          </div>
          <div class="status-row">
            <span class="label">方法可用:</span>
            <span :class="['value', methodsAvailable ? 'success' : 'error']">
              {{ methodsAvailable ? '✅' : '❌' }}
            </span>
          </div>
          <div class="status-row">
            <span class="label">响应式状态:</span>
            <span :class="['value', stateAvailable ? 'success' : 'error']">
              {{ stateAvailable ? '✅' : '❌' }}
            </span>
          </div>
          <div class="divider"></div>
          <div class="status-row">
            <span class="label">已初始化:</span>
            <span class="value">{{ wallet?.checkInitialized() ? '✅' : '❌' }}</span>
          </div>
          <div class="status-row">
            <span class="label">地址:</span>
            <span class="value address">{{ wallet?.address.value || '(空)' }}</span>
          </div>
          <div class="status-row">
            <span class="label">链ID:</span>
            <span class="value">{{ wallet?.chainId.value || '(空)' }}</span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="actions">
          <a-button 
            type="primary" 
            block
            @click="testInitialize"
            :loading="initLoading"
            :disabled="wallet?.checkInitialized()"
          >
            1️⃣ 初始化钱包
          </a-button>
          
          <a-button 
            type="primary" 
            block
            @click="testConnect"
            :disabled="!wallet?.checkInitialized() || wallet?.isConnected.value"
            :loading="connectLoading"
          >
            2️⃣ 连接钱包
          </a-button>
          
          <a-button 
            danger
            block
            @click="testDisconnect"
            :disabled="!wallet?.isConnected.value"
          >
            断开连接
          </a-button>
        </div>

        <!-- 说明 -->
        <div class="tips">
          <div class="tip-item">💡 初始化 = 创建实例</div>
          <div class="tip-item">💡 连接 = 用户授权</div>
          <div class="tip-item">💡 只有连接后才有地址</div>
        </div>
      </div>

      <!-- 右侧：日志 -->
      <div class="right-panel">
        <div class="log-header">
          <span>📝 测试日志</span>
          <a-button size="small" @click="logs = []">清空</a-button>
        </div>
        <div class="log-list">
          <div v-for="(log, index) in logs.slice(0, 15)" :key="index" :class="['log-item', log.type]">
            <span class="log-type">{{ getLogIcon(log.type) }}</span>
            <span class="log-msg">{{ log.message }}</span>
          </div>
          <div v-if="logs.length === 0" class="log-empty">
            等待操作...
          </div>
        </div>
      </div>
    </div>

    <!-- 底部状态栏 -->
    <div class="footer">
      <span v-if="allPassed" class="success-msg">✅ 所有基础测试通过！</span>
      <span v-else class="pending-msg">⏳ 等待测试...</span>
      <span class="divider-v">|</span>
      <span class="hint">完成连接测试后告诉我，进入下一步</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue';

const wallet = inject('wallet');
const walletAvailable = ref(false);
const methodsAvailable = ref(false);
const stateAvailable = ref(false);
const logs = ref([]);
const initLoading = ref(false);
const connectLoading = ref(false);

const allPassed = computed(() => walletAvailable.value && methodsAvailable.value && stateAvailable.value);

const methods = [
  'initWallet',
  'openWallet',
  'disconnectWallet',
  'checkInitialized',
  'getWalletInstance'
];

const addLog = (message, type = 'info') => {
  logs.value.unshift({ message, type });
  console.log(`[${type.toUpperCase()}] ${message}`);
};

const getLogIcon = (type) => {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  return icons[type] || 'ℹ️';
};

onMounted(() => {
  // 测试 1: 检查 wallet
  if (wallet) {
    walletAvailable.value = true;
    addLog('钱包服务已注入', 'success');
  } else {
    walletAvailable.value = false;
    addLog('钱包服务未找到', 'error');
    return;
  }

  // 测试 2: 检查方法
  try {
    const hasAllMethods = methods.every(method => typeof wallet[method] === 'function');
    if (hasAllMethods) {
      methodsAvailable.value = true;
      addLog('所有方法可用', 'success');
    } else {
      methodsAvailable.value = false;
      addLog('部分方法缺失', 'error');
    }
  } catch (e) {
    addLog('方法检查失败: ' + e.message, 'error');
  }

  // 测试 3: 检查响应式状态
  try {
    const hasState = wallet.isConnected && wallet.address && wallet.chainId;
    if (hasState) {
      stateAvailable.value = true;
      addLog('响应式状态正常', 'success');
    } else {
      stateAvailable.value = false;
      addLog('状态异常', 'error');
    }
  } catch (e) {
    addLog('状态检查失败: ' + e.message, 'error');
  }

  if (allPassed.value) {
    addLog('基础测试通过！地址为空是正常的，需要先连接', 'info');
  }
});

const testInitialize = async () => {
  if (!wallet) return;
  try {
    initLoading.value = true;
    addLog('正在初始化...', 'info');
    await wallet.initWallet();
    addLog('初始化成功！现在可以连接钱包', 'success');
  } catch (e) {
    addLog('初始化失败: ' + e.message, 'error');
  } finally {
    initLoading.value = false;
  }
};

const testConnect = async () => {
  if (!wallet || !wallet.checkInitialized() || connectLoading.value) return;
  
  try {
    connectLoading.value = true;
    addLog('打开钱包对话框...', 'info');
    
    const walletData = await wallet.openWallet();
    
    if (walletData) {
      // 直接使用返回的数据
      addLog(`连接成功！地址: ${walletData.address}`, 'success');
      addLog(`链ID: ${walletData.chainId}`, 'info');
      
      // 再次确认响应式状态
      addLog(`等待UI更新...`, 'info');
      await new Promise(resolve => setTimeout(resolve, 200));
      
      addLog(`UI状态: isConnected=${wallet.isConnected.value}, addr=${wallet.address.value}, chain=${wallet.chainId.value}`, 'info');
    } else {
      addLog('连接超时或取消', 'warning');
    }
  } catch (e) {
    addLog('连接失败: ' + e.message, 'error');
  } finally {
    connectLoading.value = false;
  }
};

const testDisconnect = async () => {
  if (!wallet) return;
  try {
    addLog('断开连接...', 'info');
    await wallet.disconnectWallet();
    addLog('已断开连接', 'success');
  } catch (e) {
    addLog('断开失败: ' + e.message, 'error');
  }
};
</script>

<style scoped>
.wallet-test-compact {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.back-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-size: 13px;
  padding: 6px 12px;
  height: auto;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  color: white;
  transform: translateX(-2px);
}

.header h1 {
  color: white;
  font-size: 24px;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.status-badge {
  background: rgba(255,255,255,0.2);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.status-badge.connected {
  background: #52c41a;
}

.content-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  min-height: 0;
}

.left-panel, .right-panel {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.status-card {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

.status-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
}

.status-row .label {
  color: #666;
  font-weight: 500;
}

.status-row .value {
  font-family: 'Courier New', monospace;
  color: #333;
}

.status-row .value.success {
  color: #52c41a;
}

.status-row .value.error {
  color: #ff4d4f;
}

.status-row .value.address {
  font-size: 11px;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.divider {
  height: 1px;
  background: #d9d9d9;
  margin: 8px 0;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}

.tips {
  background: #fff7e6;
  border-radius: 6px;
  padding: 12px;
  font-size: 12px;
}

.tip-item {
  color: #fa8c16;
  padding: 3px 0;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
  font-weight: 600;
  color: #333;
}

.log-list {
  flex: 1;
  overflow-y: auto;
  background: #1e1e1e;
  border-radius: 6px;
  padding: 10px;
}

.log-item {
  display: flex;
  gap: 8px;
  padding: 6px 8px;
  margin-bottom: 4px;
  background: rgba(255,255,255,0.05);
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.4;
}

.log-type {
  flex-shrink: 0;
}

.log-msg {
  color: #ddd;
  word-break: break-word;
}

.log-item.error .log-msg {
  color: #ff7875;
}

.log-item.success .log-msg {
  color: #95de64;
}

.log-item.warning .log-msg {
  color: #ffc53d;
}

.log-empty {
  color: #666;
  text-align: center;
  padding: 20px;
  font-size: 13px;
}

.footer {
  margin-top: 15px;
  padding: 12px 20px;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}

.success-msg {
  color: #52c41a;
  font-weight: 600;
}

.pending-msg {
  color: #999;
}

.divider-v {
  color: #d9d9d9;
}

.hint {
  color: #666;
}

/* 滚动条样式 */
.log-list::-webkit-scrollbar {
  width: 6px;
}

.log-list::-webkit-scrollbar-track {
  background: #333;
  border-radius: 3px;
}

.log-list::-webkit-scrollbar-thumb {
  background: #666;
  border-radius: 3px;
}

.log-list::-webkit-scrollbar-thumb:hover {
  background: #888;
}
</style>
