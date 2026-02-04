<template>
  <div class="wallet-test-compact">
    <div class="header">
      <div class="header-left">
        <a-button class="back-btn" @click="$router.push('/test/wallet')">
          ← 返回测试中心
        </a-button>
        <h1>测试5: iframe 桥接环境</h1>
      </div>
      <div class="status-badge" :class="{ connected: wallet?.isConnected.value }">
        {{ wallet?.isConnected.value ? '已连接' : '未连接' }}
      </div>
    </div>

    <div class="content-grid">
      <!-- 左侧：测试操作 -->
      <div class="left-panel">
        <div class="scenario-card">
          <h3>🌉 测试场景</h3>
          <p>测试父窗口和 iframe 之间的钱包通信桥接功能</p>
        </div>

        <!-- 测试组1: 初始化桥接 -->
        <div class="test-group">
          <h4>1️⃣ 初始化 WalletBridge</h4>
          <p class="hint">
            在父窗口初始化 WalletBridge，允许 iframe 访问钱包功能
          </p>
          <a-button 
            type="primary" 
            block
            @click="initBridge"
            :disabled="bridgeInitialized"
            :loading="initLoading"
          >
            {{ bridgeInitialized ? '✅ 已初始化' : '初始化桥接' }}
          </a-button>
        </div>

        <!-- 测试组2: 创建测试 iframe -->
        <div class="test-group">
          <h4>2️⃣ 创建测试 iframe</h4>
          <p class="hint">
            创建一个包含 WalletClient 的 iframe 页面
          </p>
          <a-button 
            type="primary" 
            block
            @click="createIframe"
            :disabled="!bridgeInitialized || iframeCreated"
            :loading="createLoading"
          >
            {{ iframeCreated ? '✅ 已创建' : '创建 iframe' }}
          </a-button>
          
          <div v-if="iframeCreated" class="iframe-container">
            <div class="iframe-header">
              <span>📄 iframe 测试页面</span>
              <a-button size="small" danger @click="destroyIframe">
                关闭
              </a-button>
            </div>
            <iframe 
              id="test-iframe"
              :src="iframeUrl"
              style="width: 100%; height: 400px; border: 1px solid #d9d9d9; border-radius: 6px;"
            ></iframe>
          </div>
        </div>

        <!-- 测试组3: 父窗口操作 -->
        <div class="test-group">
          <h4>3️⃣ 父窗口钱包操作</h4>
          <p class="hint">
            在父窗口操作钱包，观察 iframe 中的状态是否同步
          </p>
          <a-space direction="vertical" style="width: 100%">
            <a-button 
              block 
              @click="parentConnect"
              :disabled="!bridgeInitialized"
            >
              父窗口连接钱包
            </a-button>
            <a-button 
              block 
              @click="parentDisconnect"
              :disabled="!bridgeInitialized || !wallet?.isConnected.value"
            >
              父窗口断开钱包
            </a-button>
          </a-space>
        </div>

        <!-- 当前状态 -->
        <div class="status-display">
          <h4>📊 父窗口钱包状态</h4>
          <div class="status-item">
            <span class="label">桥接初始化:</span>
            <span class="value">{{ bridgeInitialized ? '✅ 是' : '❌ 否' }}</span>
          </div>
          <div class="status-item">
            <span class="label">iframe 创建:</span>
            <span class="value">{{ iframeCreated ? '✅ 是' : '❌ 否' }}</span>
          </div>
          <div class="status-item">
            <span class="label">连接状态:</span>
            <span class="value">{{ wallet?.isConnected.value ? '✅ 已连接' : '❌ 未连接' }}</span>
          </div>
          <div class="status-item">
            <span class="label">地址:</span>
            <span class="value addr">{{ wallet?.address.value || '无' }}</span>
          </div>
          <div class="status-item">
            <span class="label">链ID:</span>
            <span class="value">{{ wallet?.chainId.value || '无' }}</span>
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
          <div 
            v-for="(log, index) in logs" 
            :key="index"
            :class="['log-item', log.type]"
          >
            <span class="log-type">{{ getLogIcon(log.type) }}</span>
            <span class="log-msg">{{ log.message }}</span>
          </div>
          <div v-if="logs.length === 0" class="log-empty">
            暂无日志，开始测试吧！
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      <span class="hint-text">
        💡 提示：先初始化桥接，再创建 iframe。在 iframe 中点击按钮测试钱包功能，观察父窗口和 iframe 的状态同步。
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, onUnmounted } from 'vue';
import { WalletBridge } from '@js/common/walletBridge';

const wallet = inject('wallet');
const logs = ref([]);
const bridgeInitialized = ref(false);
const iframeCreated = ref(false);
const initLoading = ref(false);
const createLoading = ref(false);
const iframeUrl = ref('');

let walletBridge = null;

const addLog = (message, type = 'info') => {
  logs.value.unshift({ 
    message, 
    type, 
    time: new Date().toLocaleTimeString() 
  });
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
  
  if (!wallet) {
    addLog('❌ 钱包服务未注入！', 'error');
    return;
  }
  
  addLog('✅ 钱包服务已就绪', 'success');
  
  // 设置 iframe URL
  const protocol = window.location.protocol;
  const host = window.location.host;
  iframeUrl.value = `${protocol}//${host}/test-wallet-client.html`;
  addLog(`iframe URL: ${iframeUrl.value}`, 'info');
});

onUnmounted(() => {
  // 清理资源
  if (walletBridge) {
    addLog('清理 WalletBridge 资源', 'info');
    walletBridge = null;
  }
});

const initBridge = async () => {
  initLoading.value = true;
  addLog('========== 初始化 WalletBridge ==========', 'info');
  
  try {
    if (!wallet) {
      throw new Error('钱包服务未注入');
    }
    
    // 确保钱包已初始化
    if (!wallet.checkInitialized()) {
      addLog('钱包未初始化，正在初始化...', 'info');
      await wallet.initWallet();
      addLog('✅ 钱包初始化成功', 'success');
    }
    
    // 创建 WalletBridge 实例
    addLog('创建 WalletBridge 实例...', 'info');
    const allowedOrigins = [
      window.location.origin,
      'http://localhost:5173',
      'http://localhost:3000'
    ];
    
    walletBridge = new WalletBridge(allowedOrigins);
    addLog(`✅ WalletBridge 已创建`, 'success');
    addLog(`允许的源: ${allowedOrigins.join(', ')}`, 'info');
    
    bridgeInitialized.value = true;
    addLog('✅ 桥接初始化完成！', 'success');
    addLog('💡 现在可以创建 iframe 了', 'info');
    
  } catch (e) {
    addLog(`❌ 初始化失败: ${e.message}`, 'error');
    console.error(e);
  } finally {
    initLoading.value = false;
  }
};

const createIframe = () => {
  createLoading.value = true;
  addLog('========== 创建测试 iframe ==========', 'info');
  
  try {
    if (!bridgeInitialized.value) {
      throw new Error('请先初始化 WalletBridge');
    }
    
    addLog(`加载 iframe: ${iframeUrl.value}`, 'info');
    iframeCreated.value = true;
    
    // 监听 iframe 加载完成
    setTimeout(() => {
      const iframe = document.getElementById('test-iframe');
      if (iframe) {
        iframe.onload = () => {
          addLog('✅ iframe 加载完成', 'success');
          addLog('💡 现在可以在 iframe 中测试钱包功能了', 'info');
        };
      }
    }, 100);
    
    addLog('✅ iframe 已创建', 'success');
    
  } catch (e) {
    addLog(`❌ 创建失败: ${e.message}`, 'error');
  } finally {
    createLoading.value = false;
  }
};

const destroyIframe = () => {
  addLog('========== 销毁 iframe ==========', 'info');
  iframeCreated.value = false;
  addLog('✅ iframe 已销毁', 'success');
};

const parentConnect = async () => {
  addLog('========== 父窗口连接钱包 ==========', 'info');
  
  try {
    if (!wallet) {
      throw new Error('钱包服务未注入');
    }
    
    if (wallet.isConnected.value) {
      addLog('⚠️ 钱包已连接', 'warning');
      return;
    }
    
    addLog('正在打开钱包连接对话框...', 'info');
    const account = await wallet.openWallet();
    
    if (account) {
      addLog(`✅ 连接成功: ${account}`, 'success');
      addLog('💡 观察 iframe 中的状态是否同步更新', 'info');
    } else {
      addLog('⚠️ 用户取消连接或连接超时', 'warning');
    }
    
  } catch (e) {
    addLog(`❌ 连接失败: ${e.message}`, 'error');
  }
};

const parentDisconnect = async () => {
  addLog('========== 父窗口断开钱包 ==========', 'info');
  
  try {
    if (!wallet) {
      throw new Error('钱包服务未注入');
    }
    
    if (!wallet.isConnected.value) {
      addLog('⚠️ 钱包未连接', 'warning');
      return;
    }
    
    addLog('正在断开钱包...', 'info');
    const success = await wallet.disconnectWallet();
    
    if (success) {
      addLog('✅ 断开成功', 'success');
      addLog('💡 观察 iframe 中的状态是否同步更新', 'info');
    } else {
      addLog('⚠️ 断开失败', 'warning');
    }
    
  } catch (e) {
    addLog(`❌ 断开失败: ${e.message}`, 'error');
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

.iframe-container {
  margin-top: 15px;
}

.iframe-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 6px 6px 0 0;
  margin-bottom: -1px;
}

.status-display {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 15px;
  margin-top: auto;
}

.status-display h4 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 14px;
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
