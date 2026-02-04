<template>
  <div class="wallet-test-compact">
    <div class="header">
      <div class="header-left">
        <a-button class="back-btn" @click="$router.push('/test/wallet')">
          ← 返回测试中心
        </a-button>
        <h1>🎨 测试3: Vue 组件环境</h1>
      </div>
      <div class="status-badge" :class="{ connected: wallet?.isConnected.value }">
        {{ wallet?.isConnected.value ? '✅ 已连接' : '⚪ 未连接' }}
      </div>
    </div>

    <div class="content-grid">
      <!-- 左侧：测试组件 -->
      <div class="left-panel">
        <div class="scenario-card">
          <h3>📋 测试场景</h3>
          <p>验证普通 Vue 组件中使用钱包服务的各种方式</p>
        </div>

        <!-- 方式1: inject 使用 -->
        <div class="test-group">
          <h4>1️⃣ inject 方式</h4>
          <p class="hint">在 setup 脚本中使用 inject('wallet')</p>
          <div class="code-preview">
            <code>const wallet = inject('wallet');</code>
          </div>
          <div class="result-display">
            <div class="result-item">
              <span class="label">可用性:</span>
              <span :class="['value', wallet ? 'success' : 'error']">
                {{ wallet ? '✅ 可用' : '❌ 不可用' }}
              </span>
            </div>
            <div class="result-item">
              <span class="label">连接状态:</span>
              <span class="value">{{ wallet?.isConnected.value ? '✅' : '❌' }}</span>
            </div>
            <div class="result-item">
              <span class="label">地址:</span>
              <span class="value addr">{{ wallet?.address.value || '(未连接)' }}</span>
            </div>
          </div>
          <a-button 
            type="primary" 
            size="small"
            block
            @click="testInjectConnect"
            :disabled="!wallet || wallet?.isConnected.value"
          >
            使用 inject 连接钱包
          </a-button>
        </div>

        <!-- 方式2: composable 直接调用 -->
        <div class="test-group">
          <h4>2️⃣ Composable 直接调用</h4>
          <p class="hint">直接导入并调用 useWalletService()</p>
          <div class="code-preview">
            <code>import { useWalletService } from '...';<br>const service = useWalletService();</code>
          </div>
          <div class="result-display">
            <div class="result-item">
              <span class="label">可用性:</span>
              <span :class="['value', directWallet ? 'success' : 'error']">
                {{ directWallet ? '✅ 可用' : '❌ 不可用' }}
              </span>
            </div>
            <div class="result-item">
              <span class="label">与inject是同一实例:</span>
              <span :class="['value', isSameInstance ? 'success' : 'error']">
                {{ isSameInstance ? '✅ 是' : '❌ 否' }}
              </span>
            </div>
          </div>
          <a-button 
            size="small"
            block
            @click="testDirectCall"
          >
            测试直接调用
          </a-button>
        </div>

        <!-- 方式3: 子组件传递 -->
        <div class="test-group">
          <h4>3️⃣ Props 传递</h4>
          <p class="hint">通过 props 将钱包服务传递给子组件</p>
          <a-button 
            size="small"
            block
            @click="showChildComponent = !showChildComponent"
          >
            {{ showChildComponent ? '隐藏' : '显示' }}子组件测试
          </a-button>
          
          <ChildWalletComponent 
            v-if="showChildComponent"
            :wallet="wallet"
            @log="addLog"
          />
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
        💡 此测试验证钱包服务在普通 Vue 组件中的多种使用方式
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, shallowRef, computed, onMounted, inject } from 'vue';
import { useWalletService } from '@table/composables/useWalletService';
import ChildWalletComponent from './components/ChildWalletComponent.vue';

const wallet = inject('wallet');
// 使用 shallowRef 避免自动解包和代理，这样才能正确比较实例引用
const directWallet = shallowRef(null);
const logs = ref([]);
const showChildComponent = ref(false);

const isSameInstance = computed(() => {
  if (!wallet || !directWallet.value) return false;
  return wallet === directWallet.value;
});

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

onMounted(() => {
  addLog('测试页面已加载', 'info');
  
  if (wallet) {
    addLog('✅ inject 方式成功获取钱包服务', 'success');
  } else {
    addLog('❌ inject 方式获取钱包服务失败', 'error');
  }
});

// 测试1: 使用 inject 连接钱包
const testInjectConnect = async () => {
  if (!wallet) {
    addLog('❌ 钱包服务不可用', 'error');
    return;
  }

  try {
    addLog('========== 测试1: inject 方式连接钱包 ==========', 'info');
    
    // 确保已初始化
    if (!wallet.checkInitialized()) {
      addLog('钱包未初始化，正在初始化...', 'info');
      await wallet.initWallet();
      addLog('✅ 初始化成功', 'success');
    }
    
    // 连接钱包
    addLog('打开钱包连接对话框...', 'info');
    const result = await wallet.openWallet();
    
    if (result) {
      addLog(`✅ 连接成功！地址: ${result.address}`, 'success');
      addLog(`⛓️ 链ID: ${result.chainId}`, 'info');
      addLog('💡 inject 方式可以正常使用钱包的所有功能', 'success');
    } else {
      addLog('⚠️ 连接被取消或超时', 'warning');
    }
  } catch (e) {
    addLog(`❌ 连接失败: ${e.message}`, 'error');
  }
};

// 测试2: 直接调用 useWalletService
const testDirectCall = () => {
  addLog('========== 测试2: 直接调用 useWalletService ==========', 'info');
  
  try {
    directWallet.value = useWalletService();
    addLog('✅ 成功调用 useWalletService()', 'success');
    
    // 验证是否是同一个实例
    if (wallet === directWallet.value) {
      addLog('✅ 验证通过：inject 和直接调用返回的是同一个实例（单例模式）', 'success');
      addLog('💡 这意味着在任何地方调用都能获得相同的钱包状态', 'info');
    } else {
      addLog('❌ 警告：返回的不是同一个实例！', 'error');
      console.log('Wallet (Inject):', wallet);
      console.log('Wallet (Direct):', directWallet.value);
    }
    
    // 比较状态
    addLog(`inject 连接状态Ref: ${wallet?.isConnected}`, 'info');
    addLog(`inject 连接状态Val: ${wallet?.isConnected?.value}`, 'info');
    
    addLog(`direct 连接状态Ref: ${directWallet.value?.isConnected}`, 'info');
    addLog(`direct 连接状态Val: ${directWallet.value?.isConnected?.value}`, 'info');
    
    const wVal = wallet?.isConnected?.value;
    const dVal = directWallet.value?.isConnected?.value;
    
    if (wVal !== undefined && wVal === dVal) {
      addLog('✅ 状态一致', 'success');
    } else {
      addLog(`❌ 状态不一致: ${wVal} vs ${dVal}`, 'error');
    }
  } catch (e) {
    addLog(`❌ 调用失败: ${e.message}`, 'error');
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

.test-group:last-child {
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

.code-preview {
  background: #1e1e1e;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
}

.code-preview code {
  color: #95de64;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.6;
}

.result-display {
  background: #f5f5f5;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 13px;
}

.result-item .label {
  color: #666;
  font-weight: 500;
}

.result-item .value {
  font-family: 'Courier New', monospace;
  color: #333;
}

.result-item .value.success {
  color: #52c41a;
}

.result-item .value.error {
  color: #ff4d4f;
}

.result-item .value.addr {
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
