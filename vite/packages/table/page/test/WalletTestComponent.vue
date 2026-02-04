<template>
  <div class="wallet-test">
    <h2>🔗 Web3Modal 钱包集成测试</h2>
    
    <!-- 钱包状态面板 -->
    <div class="status-panel">
      <h3>📊 钱包状态</h3>
      <div class="status-grid">
        <div class="status-item">
          <span class="label">连接状态:</span>
          <span :class="['value', wallet.isConnected.value ? 'connected' : 'disconnected']">
            {{ wallet.isConnected.value ? '✅ 已连接' : '❌ 未连接' }}
          </span>
        </div>
        <div class="status-item">
          <span class="label">钱包地址:</span>
          <span class="value">{{ formatAddress(wallet.address.value) }}</span>
        </div>
        <div class="status-item">
          <span class="label">链 ID:</span>
          <span class="value">{{ wallet.chainId.value || '无' }}</span>
        </div>
        <div class="status-item">
          <span class="label">初始化状态:</span>
          <span class="value">{{ wallet.checkInitialized() ? '✅ 已初始化' : '❌ 未初始化' }}</span>
        </div>
      </div>
    </div>
    
    <!-- 基本操作面板 -->
    <div class="action-panel">
      <h3>🎮 基本操作</h3>
      <div class="button-group">
        <a-button 
          type="primary" 
          size="large"
          @click="connectWallet" 
          :disabled="wallet.isConnected.value"
        >
          🔌 连接钱包
        </a-button>
        
        <a-button 
          size="large"
          danger
          @click="disconnectWallet" 
          :disabled="!wallet.isConnected.value"
        >
          🔌 断开钱包
        </a-button>
        
        <a-button 
          size="large"
          @click="checkStatus"
        >
          🔍 检查状态
        </a-button>
        
        <a-button 
          size="large"
          @click="initWallet"
        >
          🚀 初始化钱包
        </a-button>
      </div>
    </div>
    
    <!-- 测试场景面板 -->
    <div class="test-scenarios">
      <h3>🧪 测试场景</h3>
      
      <a-collapse v-model:activeKey="activeScenarios">
        <a-collapse-panel key="1" header="场景 1: 嵌入浏览器 (internal)">
          <p>测试在内嵌浏览器中打开需要钱包的 DApp</p>
          <a-space>
            <a-button @click="testInternalBrowser('uniswap')">
              🦄 测试 Uniswap
            </a-button>
            <a-button @click="testInternalBrowser('opensea')">
              🌊 测试 OpenSea
            </a-button>
            <a-button @click="testInternalBrowser('custom')">
              🔧 自定义 URL
            </a-button>
          </a-space>
          <a-input 
            v-if="showCustomUrl" 
            v-model:value="customUrl" 
            placeholder="输入自定义 URL"
            style="margin-top: 10px"
          />
        </a-collapse-panel>
        
        <a-collapse-panel key="2" header="场景 2: iframe 钱包桥接">
          <p>测试在 iframe 中通过桥接访问父窗口的钱包</p>
          <a-button @click="testIframeBridge">
            🌉 创建测试 iframe
          </a-button>
          <a-button @click="destroyIframe" danger style="margin-left: 10px">
            🗑️ 销毁 iframe
          </a-button>
          <div v-if="iframeCreated" class="iframe-container">
            <div id="test-iframe-container"></div>
          </div>
        </a-collapse-panel>
        
        <a-collapse-panel key="3" header="场景 3: Dapp 环境调用">
          <p>模拟在 Dapp 环境中使用钱包</p>
          <a-button @click="testDappEnvironment">
            📱 模拟 Dapp 调用
          </a-button>
          <div v-if="dappTestResult" class="test-result">
            <pre>{{ dappTestResult }}</pre>
          </div>
        </a-collapse-panel>
        
        <a-collapse-panel key="4" header="场景 4: 多环境切换测试">
          <p>测试在不同环境类型间切换时钱包状态的一致性</p>
          <a-space>
            <a-button @click="testEnvironmentSwitch('internal')">
              测试 internal
            </a-button>
            <a-button @click="testEnvironmentSwitch('pageApp')">
              测试 pageApp
            </a-button>
            <a-button @click="testEnvironmentSwitch('Dapp')">
              测试 Dapp
            </a-button>
          </a-space>
        </a-collapse-panel>
        
        <a-collapse-panel key="5" header="场景 5: 错误处理测试">
          <p>测试各种错误情况的处理</p>
          <a-space direction="vertical">
            <a-button @click="testConnectionError">
              测试连接失败
            </a-button>
            <a-button @click="testNetworkSwitch">
              测试网络切换
            </a-button>
            <a-button @click="testMultipleConnect">
              测试重复连接
            </a-button>
          </a-space>
        </a-collapse-panel>
      </a-collapse>
    </div>
    
    <!-- 日志面板 -->
    <div class="log-panel">
      <h3>📝 测试日志</h3>
      <div class="log-actions">
        <a-button size="small" @click="clearLogs">清空日志</a-button>
        <a-button size="small" @click="downloadLogs">导出日志</a-button>
      </div>
      <div class="log-content">
        <div 
          v-for="(log, index) in logs" 
          :key="index" 
          :class="['log-entry', log.type]"
        >
          <span class="log-time">{{ log.time }}</span>
          <span class="log-type">{{ log.type.toUpperCase() }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { inject, ref } from 'vue';
import browser from '@js/common/browser';
import { WalletBridge, WalletClient } from '@js/common/walletBridge';

export default {
  name: 'WalletTestComponent',
  
  setup() {
    const wallet = inject('wallet');
    const logs = ref([]);
    const activeScenarios = ref(['1']);
    const showCustomUrl = ref(false);
    const customUrl = ref('');
    const iframeCreated = ref(false);
    const dappTestResult = ref('');
    let walletBridge = null;
    
    const addLog = (message, type = 'info') => {
      const timestamp = new Date().toLocaleTimeString();
      logs.value.unshift({
        time: timestamp,
        type,
        message,
      });
      
      // 限制日志数量
      if (logs.value.length > 100) {
        logs.value = logs.value.slice(0, 100);
      }
    };
    
    const formatAddress = (address) => {
      if (!address) return '无';
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };
    
    const initWallet = async () => {
      try {
        addLog('开始初始化钱包...', 'info');
        if (wallet.checkInitialized()) {
          addLog('钱包已经初始化过了', 'warning');
          return;
        }
        await wallet.initWallet();
        addLog('钱包初始化成功', 'success');
      } catch (e) {
        addLog(`钱包初始化失败: ${e.message}`, 'error');
      }
    };
    
    const connectWallet = async () => {
      try {
        addLog('开始连接钱包...', 'info');
        const account = await wallet.openWallet();
        if (account) {
          addLog(`钱包连接成功: ${wallet.address.value}`, 'success');
        } else {
          addLog('钱包连接超时或被取消', 'warning');
        }
      } catch (e) {
        addLog(`钱包连接失败: ${e.message}`, 'error');
      }
    };
    
    const disconnectWallet = async () => {
      try {
        addLog('开始断开钱包...', 'info');
        const success = await wallet.disconnectWallet();
        if (success) {
          addLog('钱包已断开', 'success');
        } else {
          addLog('断开钱包失败', 'error');
        }
      } catch (e) {
        addLog(`断开钱包失败: ${e.message}`, 'error');
      }
    };
    
    const checkStatus = () => {
      const status = {
        isConnected: wallet.isConnected.value,
        address: wallet.address.value,
        chainId: wallet.chainId.value,
        isInitialized: wallet.checkInitialized(),
      };
      addLog(`当前钱包状态: ${JSON.stringify(status, null, 2)}`, 'info');
    };
    
    const testInternalBrowser = (type) => {
      if (type === 'custom') {
        showCustomUrl.value = !showCustomUrl.value;
        if (!showCustomUrl.value) return;
      }
      
      const urls = {
        uniswap: 'https://app.uniswap.org',
        opensea: 'https://opensea.io',
        custom: customUrl.value || 'https://app.uniswap.org',
      };
      
      const url = urls[type];
      addLog(`测试：打开内嵌浏览器 (${type}) - ${url}`, 'info');
      browser.openInTable(url, { wallet: true });
    };
    
    const testIframeBridge = () => {
      addLog('测试：创建 iframe 钱包桥接', 'info');
      
      // 初始化 WalletBridge
      if (!walletBridge) {
        walletBridge = new WalletBridge();
        addLog('WalletBridge 已初始化', 'success');
      }
      
      // 创建测试 iframe
      const container = document.getElementById('test-iframe-container');
      if (!container) {
        addLog('找不到 iframe 容器', 'error');
        return;
      }
      
      container.innerHTML = `
        <iframe 
          src="/test-wallet-client.html" 
          style="width: 100%; height: 400px; border: 1px solid #ddd; border-radius: 4px;"
        ></iframe>
      `;
      
      iframeCreated.value = true;
      addLog('测试 iframe 已创建', 'success');
    };
    
    const destroyIframe = () => {
      const container = document.getElementById('test-iframe-container');
      if (container) {
        container.innerHTML = '';
        iframeCreated.value = false;
        addLog('iframe 已销毁', 'info');
      }
    };
    
    const testDappEnvironment = () => {
      addLog('测试：Dapp 环境钱包调用', 'info');
      
      if (!wallet.checkInitialized()) {
        dappTestResult.value = '❌ 钱包未初始化';
        addLog('Dapp 测试失败：钱包未初始化', 'error');
        return;
      }
      
      if (wallet.isConnected.value) {
        dappTestResult.value = `✅ Dapp 可以访问钱包\n地址: ${wallet.address.value}\n链ID: ${wallet.chainId.value}`;
        addLog('Dapp 测试成功：可以访问钱包', 'success');
      } else {
        dappTestResult.value = '⚠️ Dapp 环境未连接钱包，请先连接';
        addLog('Dapp 测试：钱包未连接', 'warning');
      }
    };
    
    const testEnvironmentSwitch = (envType) => {
      addLog(`测试：环境切换 - ${envType}`, 'info');
      
      const beforeStatus = {
        isConnected: wallet.isConnected.value,
        address: wallet.address.value,
      };
      
      addLog(`切换前状态: ${JSON.stringify(beforeStatus)}`, 'info');
      
      // 模拟环境切换
      setTimeout(() => {
        const afterStatus = {
          isConnected: wallet.isConnected.value,
          address: wallet.address.value,
        };
        
        addLog(`切换后状态: ${JSON.stringify(afterStatus)}`, 'info');
        
        if (beforeStatus.isConnected === afterStatus.isConnected && 
            beforeStatus.address === afterStatus.address) {
          addLog('✅ 环境切换后钱包状态保持一致', 'success');
        } else {
          addLog('❌ 环境切换后钱包状态不一致', 'error');
        }
      }, 1000);
    };
    
    const testConnectionError = () => {
      addLog('测试：模拟连接失败场景', 'warning');
      // 这里可以添加模拟错误的逻辑
      addLog('请尝试拒绝钱包连接请求来测试错误处理', 'info');
    };
    
    const testNetworkSwitch = () => {
      addLog('测试：网络切换', 'info');
      if (wallet.isConnected.value) {
        addLog('请在钱包中切换网络来测试此功能', 'info');
      } else {
        addLog('请先连接钱包', 'warning');
      }
    };
    
    const testMultipleConnect = async () => {
      addLog('测试：重复连接', 'info');
      try {
        await wallet.openWallet();
        await wallet.openWallet();
        addLog('重复连接测试完成', 'success');
      } catch (e) {
        addLog(`重复连接错误: ${e.message}`, 'error');
      }
    };
    
    const clearLogs = () => {
      logs.value = [];
      addLog('日志已清空', 'info');
    };
    
    const downloadLogs = () => {
      const logText = logs.value
        .map(log => `[${log.time}] [${log.type.toUpperCase()}] ${log.message}`)
        .join('\n');
      
      const blob = new Blob([logText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wallet-test-logs-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      
      addLog('日志已导出', 'success');
    };
    
    return {
      wallet,
      logs,
      activeScenarios,
      showCustomUrl,
      customUrl,
      iframeCreated,
      dappTestResult,
      formatAddress,
      initWallet,
      connectWallet,
      disconnectWallet,
      checkStatus,
      testInternalBrowser,
      testIframeBridge,
      destroyIframe,
      testDappEnvironment,
      testEnvironmentSwitch,
      testConnectionError,
      testNetworkSwitch,
      testMultipleConnect,
      clearLogs,
      downloadLogs,
    };
  }
};
</script>

<style scoped lang="scss">
.wallet-test {
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
  
  h2 {
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 30px;
    color: #1a1a1a;
  }
  
  h3 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 15px;
    color: #333;
  }
}

.status-panel,
.action-panel,
.test-scenarios,
.log-panel {
  margin-bottom: 30px;
  padding: 24px;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 6px;
  
  .label {
    font-weight: 600;
    color: #666;
  }
  
  .value {
    font-family: 'Courier New', monospace;
    
    &.connected {
      color: #52c41a;
      font-weight: bold;
    }
    
    &.disconnected {
      color: #ff4d4f;
    }
  }
}

.button-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.iframe-container {
  margin-top: 15px;
}

.test-result {
  margin-top: 15px;
  padding: 12px;
  background: #f0f0f0;
  border-radius: 6px;
  
  pre {
    margin: 0;
    font-family: 'Courier New', monospace;
    font-size: 13px;
  }
}

.log-panel {
  .log-actions {
    margin-bottom: 12px;
    display: flex;
    gap: 8px;
  }
  
  .log-content {
    background: #1e1e1e;
    border-radius: 6px;
    padding: 16px;
    max-height: 500px;
    overflow-y: auto;
    font-family: 'Courier New', monospace;
    font-size: 13px;
  }
  
  .log-entry {
    padding: 6px 0;
    border-bottom: 1px solid #333;
    
    &:last-child {
      border-bottom: none;
    }
    
    .log-time {
      color: #888;
      margin-right: 10px;
    }
    
    .log-type {
      font-weight: bold;
      margin-right: 10px;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 11px;
    }
    
    .log-message {
      color: #ddd;
    }
    
    &.info .log-type {
      background: #1890ff;
      color: white;
    }
    
    &.success .log-type {
      background: #52c41a;
      color: white;
    }
    
    &.warning .log-type {
      background: #faad14;
      color: white;
    }
    
    &.error .log-type {
      background: #ff4d4f;
      color: white;
    }
  }
}
</style>
