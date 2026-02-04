<template>
  <div class="wallet-test-compact">
    <div class="header">
      <div class="header-left">
        <a-button class="back-btn" @click="$router.push('/test/wallet')">
          ← 返回测试中心
        </a-button>
        <h1>测试4: 内嵌浏览器环境</h1>
      </div>
      <div class="status-badge" :class="{ connected: wallet?.isConnected.value }">
        {{ wallet?.isConnected.value ? '已连接' : '未连接' }}
      </div>
    </div>

    <div class="content-grid">
      <!-- 左侧：测试操作 -->
      <div class="left-panel">
        <div class="scenario-card">
          <h3>🌐 测试场景</h3>
          <p>测试在内嵌浏览器中打开 DApp 时，钱包能否自动初始化和连接</p>
        </div>

        <!-- 测试组1: 打开常见 DApp -->
        <div class="test-group">
          <h4>1️⃣ 打开常见 DApp</h4>
          <p class="hint">
            点击按钮将在内嵌浏览器中打开 DApp，钱包会自动初始化。
            <br>如果未连接，会自动弹出连接对话框。
          </p>
          <div class="button-grid">
            <a-button 
              type="primary" 
              @click="openDapp('uniswap')"
              :loading="loadingDapp === 'uniswap'"
            >
              🦄 Uniswap
            </a-button>
            <a-button 
              type="primary" 
              @click="openDapp('opensea')"
              :loading="loadingDapp === 'opensea'"
            >
              🌊 OpenSea
            </a-button>
            <a-button 
              type="primary" 
              @click="openDapp('aave')"
              :loading="loadingDapp === 'aave'"
            >
              👻 Aave
            </a-button>
            <a-button 
              type="primary" 
              @click="openDapp('compound')"
              :loading="loadingDapp === 'compound'"
            >
              🏦 Compound
            </a-button>
          </div>
        </div>

        <!-- 测试组2: 自定义 URL -->
        <div class="test-group">
          <h4>2️⃣ 自定义 DApp URL</h4>
          <p class="hint">输入任意 DApp URL 进行测试</p>
          <a-input 
            v-model:value="customUrl" 
            placeholder="https://app.example.com"
            style="margin-bottom: 10px"
          />
          <a-button 
            type="primary" 
            block
            @click="openCustomDapp"
            :disabled="!customUrl"
            :loading="loadingDapp === 'custom'"
          >
            打开自定义 DApp
          </a-button>
        </div>

        <!-- 测试组3: 验证钱包参数 -->
        <div class="test-group">
          <h4>3️⃣ 验证钱包参数传递</h4>
          <p class="hint">测试 browser.openInTable 的 wallet 参数是否正确传递</p>
          <a-space direction="vertical" style="width: 100%">
            <a-button block @click="testWalletParam(true)">
              ✅ 带 wallet: true 参数
            </a-button>
            <a-button block @click="testWalletParam(false)">
              ❌ 不带 wallet 参数
            </a-button>
          </a-space>
        </div>

        <!-- 当前状态 -->
        <div class="status-display">
          <h4>📊 当前钱包状态</h4>
          <div class="status-item">
            <span class="label">初始化:</span>
            <span class="value">{{ wallet?.checkInitialized() ? '✅ 是' : '❌ 否' }}</span>
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
        💡 提示：打开 DApp 后，观察钱包是否自动初始化和连接。可以在 DApp 页面中尝试进行交易操作。
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue';
import browser from '@js/common/browser';

const wallet = inject('wallet');
const logs = ref([]);
const customUrl = ref('');
const loadingDapp = ref(null);

const dappUrls = {
  uniswap: 'https://app.uniswap.org',
  opensea: 'https://opensea.io',
  aave: 'https://app.aave.com',
  compound: 'https://app.compound.finance'
};

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
    addLog('❌ 钱包服务未注入！请检查插件是否已注册', 'error');
    return;
  }
  
  if (!wallet.checkInitialized()) {
    addLog('⚠️ 钱包未初始化，建议先在 Splash.vue 中初始化', 'warning');
  } else {
    addLog('✅ 钱包已初始化', 'success');
  }
});

const openDapp = async (dappName) => {
  loadingDapp.value = dappName;
  const url = dappUrls[dappName];
  
  addLog(`========== 测试: 打开 ${dappName.toUpperCase()} ==========`, 'info');
  addLog(`URL: ${url}`, 'info');
  
  try {
    // 确保钱包已初始化
    if (!wallet.checkInitialized()) {
      addLog('钱包未初始化，正在初始化...', 'info');
      await wallet.initWallet();
      addLog('✅ 钱包初始化成功', 'success');
    }
    
    // 如果未连接，先连接
    if (!wallet.isConnected.value) {
      addLog('钱包未连接，正在连接...', 'info');
      const account = await wallet.openWallet();
      if (account) {
        addLog(`✅ 钱包连接成功: ${account}`, 'success');
      } else {
        addLog('⚠️ 用户取消连接或连接超时', 'warning');
        loadingDapp.value = null;
        return;
      }
    }
    
    // 打开内嵌浏览器，传递 wallet 参数
    addLog('正在打开内嵌浏览器...', 'info');
    browser.openInTable(url, { wallet: true });
    addLog('✅ 内嵌浏览器已打开，钱包参数已传递', 'success');
    addLog('💡 请在打开的页面中验证钱包功能', 'info');
    
  } catch (e) {
    addLog(`❌ 打开失败: ${e.message}`, 'error');
  } finally {
    loadingDapp.value = null;
  }
};

const openCustomDapp = async () => {
  if (!customUrl.value) {
    addLog('❌ 请输入 URL', 'error');
    return;
  }
  
  loadingDapp.value = 'custom';
  addLog(`========== 测试: 打开自定义 DApp ==========`, 'info');
  addLog(`URL: ${customUrl.value}`, 'info');
  
  try {
    if (!wallet.checkInitialized()) {
      await wallet.initWallet();
      addLog('✅ 钱包初始化成功', 'success');
    }
    
    if (!wallet.isConnected.value) {
      const account = await wallet.openWallet();
      if (!account) {
        addLog('⚠️ 用户取消连接', 'warning');
        loadingDapp.value = null;
        return;
      }
      addLog(`✅ 钱包连接成功: ${account}`, 'success');
    }
    
    browser.openInTable(customUrl.value, { wallet: true });
    addLog('✅ 自定义 DApp 已打开', 'success');
    
  } catch (e) {
    addLog(`❌ 打开失败: ${e.message}`, 'error');
  } finally {
    loadingDapp.value = null;
  }
};

const testWalletParam = (withWallet) => {
  addLog(`========== 测试: ${withWallet ? '带' : '不带'} wallet 参数 ==========`, 'info');
  
  const testUrl = 'https://app.uniswap.org';
  
  if (withWallet) {
    addLog('调用: browser.openInTable(url, { wallet: true })', 'info');
    browser.openInTable(testUrl, { wallet: true });
    addLog('✅ 已传递 wallet: true 参数', 'success');
    addLog('💡 钱包应该自动初始化和连接', 'info');
  } else {
    addLog('调用: browser.openInTable(url)', 'info');
    browser.openInTable(testUrl);
    addLog('⚠️ 未传递 wallet 参数', 'warning');
    addLog('💡 钱包不会自动初始化', 'info');
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

.button-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
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
