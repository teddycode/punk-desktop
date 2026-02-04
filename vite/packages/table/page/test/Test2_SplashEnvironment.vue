<template>
  <div class="wallet-test-compact">
    <div class="header">
      <div class="header-left">
        <a-button class="back-btn" @click="$router.push('/test/wallet')">
          ← 返回测试中心
        </a-button>
        <h1>🚀 测试2: Splash.vue 环境</h1>
      </div>
      <div class="status-badge" :class="{ connected: wallet?.isConnected.value }">
        {{ wallet?.isConnected.value ? '✅ 已连接' : '⚪ 未连接' }}
      </div>
    </div>

    <div class="content-grid">
      <!-- 左侧：测试场景 -->
      <div class="left-panel">
        <div class="scenario-card">
          <h3>📋 测试场景</h3>
          <p>模拟 Splash.vue 中的钱包使用流程</p>
        </div>

        <!-- 场景1: 应用启动 -->
        <div class="test-group">
          <h4>1️⃣ 应用启动初始化</h4>
          <p class="hint">模拟 Splash.vue mounted 时自动初始化钱包</p>
          <a-button 
            type="primary" 
            block
            @click="testAutoInit"
            :loading="autoInitLoading"
          >
            模拟应用启动
          </a-button>
        </div>

        <!-- 场景2: 用户登录 -->
        <div class="test-group">
          <h4>2️⃣ 用户登录流程</h4>
          <p class="hint">模拟用户点击登录按钮，打开钱包连接</p>
          <a-button 
            type="primary" 
            block
            @click="testLogin"
            :disabled="!wallet?.checkInitialized()"
            :loading="loginLoading"
          >
            模拟用户登录
          </a-button>
        </div>

        <!-- 场景3: 重新登录 -->
        <div class="test-group">
          <h4>3️⃣ 重新登录流程</h4>
          <p class="hint">断开当前钱包，重新连接</p>
          <a-button 
            block
            @click="testReLogin"
            :disabled="!wallet?.isConnected.value"
            :loading="reLoginLoading"
          >
            模拟重新登录
          </a-button>
        </div>

        <!-- 状态显示 -->
        <div class="status-display">
          <div class="status-item">
            <span class="label">初始化:</span>
            <span class="value">{{ wallet?.checkInitialized() ? '✅' : '❌' }}</span>
          </div>
          <div class="status-item">
            <span class="label">连接状态:</span>
            <span class="value">{{ wallet?.isConnected.value ? '✅' : '❌' }}</span>
          </div>
          <div class="status-item">
            <span class="label">地址:</span>
            <span class="value addr">{{ wallet?.address.value || '(未连接)' }}</span>
          </div>
          <div class="status-item">
            <span class="label">链ID:</span>
            <span class="value">{{ wallet?.chainId.value || '(未连接)' }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧：日志 -->
      <div class="right-panel">
        <div class="log-header">
          <span>📝 测试日志</span>
          <a-button size="small" @click="logs = []">清空</a-button>
        </div>
        <div class="log-list">
          <div v-for="(log, index) in logs.slice(0, 20)" :key="index" :class="['log-item', log.type]">
            <span class="log-type">{{ getLogIcon(log.type) }}</span>
            <span class="log-msg">{{ log.message }}</span>
          </div>
          <div v-if="logs.length === 0" class="log-empty">
            等待操作...
          </div>
        </div>
      </div>
    </div>

    <!-- 底部说明 -->
    <div class="footer">
      <span class="hint-text">
        💡 此测试验证钱包服务在 Splash.vue 环境中的集成情况
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue';

const wallet = inject('wallet');
const logs = ref([]);
const autoInitLoading = ref(false);
const loginLoading = ref(false);
const reLoginLoading = ref(false);

// 模拟的用户信息
const mockUserInfo = ref(null);

const addLog = (message, type = 'info') => {
  logs.value.unshift({ message, type, time: new Date().toLocaleTimeString() });
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

// 模拟的用户信息处理回调
const processUserInfo = (data) => {
  addLog('收到钱包事件回调，正在处理用户信息...', 'info');
  mockUserInfo.value = data;
  addLog(`用户信息已更新: ${JSON.stringify(data).substring(0, 50)}...`, 'success');
};

onMounted(() => {
  addLog('测试页面已加载', 'info');
  addLog('等待用户操作...', 'info');
});

// 场景1: 应用启动自动初始化
const testAutoInit = async () => {
  if (!wallet) {
    addLog('❌ 钱包服务不可用', 'error');
    return;
  }

  try {
    autoInitLoading.value = true;
    addLog('========== 场景1: 应用启动 ==========', 'info');
    addLog('模拟 Splash.vue mounted 生命周期...', 'info');
    
    // 模拟 Splash.vue 中的 initWallet 调用
    await wallet.initWallet(processUserInfo, mockUserInfo.value);
    
    addLog('✅ 钱包自动初始化成功', 'success');
    addLog('💡 在真实环境中，这会在应用启动时自动执行', 'info');
  } catch (e) {
    addLog(`❌ 初始化失败: ${e.message}`, 'error');
  } finally {
    autoInitLoading.value = false;
  }
};

// 场景2: 用户登录
const testLogin = async () => {
  if (!wallet || !wallet.checkInitialized()) {
    addLog('❌ 请先执行场景1（应用启动）', 'error');
    return;
  }

  try {
    loginLoading.value = true;
    addLog('========== 场景2: 用户登录 ==========', 'info');
    addLog('模拟用户点击登录按钮...', 'info');
    
    // 模拟 Splash.vue 中的 login 方法
    const result = await wallet.openWallet();
    
    if (result) {
      addLog(`✅ 登录成功！地址: ${result.address}`, 'success');
      addLog(`⛓️ 链ID: ${result.chainId}`, 'info');
      addLog('💡 在真实环境中，这会触发用户信息保存和页面跳转', 'info');
    } else {
      addLog('⚠️ 用户取消登录或超时', 'warning');
    }
  } catch (e) {
    addLog(`❌ 登录失败: ${e.message}`, 'error');
  } finally {
    loginLoading.value = false;
  }
};

// 场景3: 重新登录
const testReLogin = async () => {
  if (!wallet || !wallet.isConnected.value) {
    addLog('❌ 请先执行场景2（用户登录）', 'error');
    return;
  }

  try {
    reLoginLoading.value = true;
    addLog('========== 场景3: 重新登录 ==========', 'info');
    addLog('模拟用户点击"重新登录"...', 'info');
    
    // 第一步：断开当前钱包
    addLog('1. 断开当前钱包连接...', 'info');
    const disconnected = await wallet.disconnectWallet();
    
    if (!disconnected) {
      addLog('❌ 断开失败', 'error');
      return;
    }
    
    addLog('✅ 已断开当前钱包', 'success');
    
    // 第二步：等待一会儿
    addLog('2. 等待状态清理...', 'info');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 第三步：重新连接
    addLog('3. 打开钱包选择器，准备重新连接...', 'info');
    const result = await wallet.openWallet();
    
    if (result) {
      addLog(`✅ 重新登录成功！地址: ${result.address}`, 'success');
      addLog(`⛓️ 链ID: ${result.chainId}`, 'info');
      addLog('💡 在真实环境中，这会保存新的用户信息', 'info');
    } else {
      addLog('⚠️ 重新登录被取消', 'warning');
    }
  } catch (e) {
    addLog(`❌ 重新登录失败: ${e.message}`, 'error');
  } finally {
    reLoginLoading.value = false;
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
  overflow-y: auto;
}

.scenario-card {
  background: #e6f7ff;
  border: 2px solid #1890ff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.scenario-card h3 {
  margin: 0 0 8px 0;
  color: #1890ff;
  font-size: 16px;
}

.scenario-card p {
  margin: 0;
  color: #666;
  font-size: 13px;
}

.test-group {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.test-group:last-of-type {
  border-bottom: none;
}

.test-group h4 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 15px;
}

.test-group .hint {
  margin: 0 0 12px 0;
  color: #999;
  font-size: 12px;
  line-height: 1.5;
}

.status-display {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 15px;
  margin-top: auto;
}

.status-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
}

.status-item .label {
  color: #666;
  font-weight: 500;
}

.status-item .value {
  font-family: 'Courier New', monospace;
  color: #333;
}

.status-item .value.addr {
  font-size: 11px;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
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
  text-align: center;
}

.hint-text {
  color: #666;
  font-size: 13px;
}

/* 滚动条样式 */
.log-list::-webkit-scrollbar,
.left-panel::-webkit-scrollbar {
  width: 6px;
}

.log-list::-webkit-scrollbar-track {
  background: #333;
  border-radius: 3px;
}

.left-panel::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 3px;
}

.log-list::-webkit-scrollbar-thumb {
  background: #666;
  border-radius: 3px;
}

.left-panel::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.log-list::-webkit-scrollbar-thumb:hover {
  background: #888;
}

.left-panel::-webkit-scrollbar-thumb:hover {
  background: #999;
}
</style>
