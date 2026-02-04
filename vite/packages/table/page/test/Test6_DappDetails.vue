<template>
  <div class="wallet-test-compact">
    <div class="header">
      <div class="header-left">
        <a-button class="back-btn" @click="$router.push('/test/wallet')">
          ← 返回测试中心
        </a-button>
        <h1>测试6: Dapp 详情页环境</h1>
      </div>
      <div class="status-badge" :class="{ connected: wallet?.isConnected.value }">
        {{ wallet?.isConnected.value ? '已连接' : '未连接' }}
      </div>
    </div>

    <div class="content-grid">
      <!-- 左侧：模拟 Dapp 详情页 -->
      <div class="left-panel">
        <div class="scenario-card">
          <h3>📱 测试场景</h3>
          <p>模拟 Dapp 详情页面，测试钱包集成和交互功能</p>
        </div>

        <!-- Dapp 信息卡片 -->
        <div class="dapp-card">
          <div class="dapp-header">
            <img :src="mockDapp.icon" alt="icon" class="dapp-icon" />
            <div class="dapp-info">
              <h3>{{ mockDapp.name }}</h3>
              <p>{{ mockDapp.description }}</p>
            </div>
          </div>
          <div class="dapp-stats">
            <div class="stat-item">
              <span class="label">类型</span>
              <span class="value">{{ mockDapp.category }}</span>
            </div>
            <div class="stat-item">
              <span class="label">链</span>
              <span class="value">{{ mockDapp.chain }}</span>
            </div>
            <div class="stat-item">
              <span class="label">用户</span>
              <span class="value">{{ mockDapp.users }}</span>
            </div>
          </div>
        </div>

        <!-- 钱包连接区域 -->
        <div class="wallet-section">
          <h4>🔗 钱包连接</h4>
          <div v-if="!wallet?.isConnected.value" class="connect-prompt">
            <p>此 Dapp 需要连接钱包才能使用</p>
            <a-button 
              type="primary" 
              size="large" 
              block
              @click="connectWallet"
              :loading="connectLoading"
            >
              连接钱包
            </a-button>
          </div>
          <div v-else class="connected-info">
            <div class="wallet-info">
              <div class="info-row">
                <span class="label">地址:</span>
                <span class="value">{{ formatAddress(wallet.address.value) }}</span>
              </div>
              <div class="info-row">
                <span class="label">链:</span>
                <span class="value">{{ getChainName(wallet.chainId.value) }}</span>
              </div>
              <div class="info-row">
                <span class="label">余额:</span>
                <span class="value">{{ mockBalance }} ETH</span>
              </div>
            </div>
            <a-button 
              danger 
              block
              @click="disconnectWallet"
              :loading="disconnectLoading"
            >
              断开连接
            </a-button>
          </div>
        </div>

        <!-- Dapp 功能区域 -->
        <div class="dapp-actions">
          <h4>⚡ Dapp 功能</h4>
          <a-space direction="vertical" style="width: 100%">
            <a-button 
              block
              @click="testSwap"
              :disabled="!wallet?.isConnected.value"
              :loading="actionLoading === 'swap'"
            >
              💱 模拟 Swap 交易
            </a-button>
            <a-button 
              block
              @click="testStake"
              :disabled="!wallet?.isConnected.value"
              :loading="actionLoading === 'stake'"
            >
              🏦 模拟 Stake 操作
            </a-button>
            <a-button 
              block
              @click="testNFTMint"
              :disabled="!wallet?.isConnected.value"
              :loading="actionLoading === 'mint'"
            >
              🎨 模拟 NFT Mint
            </a-button>
            <a-button 
              block
              @click="testSignMessage"
              :disabled="!wallet?.isConnected.value"
              :loading="actionLoading === 'sign'"
            >
              ✍️ 模拟签名消息
            </a-button>
          </a-space>
        </div>

        <!-- 交易历史 -->
        <div class="transaction-history">
          <h4>📜 交易历史</h4>
          <div v-if="transactions.length === 0" class="empty-state">
            暂无交易记录
          </div>
          <div v-else class="tx-list">
            <div 
              v-for="tx in transactions" 
              :key="tx.id"
              class="tx-item"
            >
              <div class="tx-icon">{{ tx.icon }}</div>
              <div class="tx-info">
                <div class="tx-action">{{ tx.action }}</div>
                <div class="tx-time">{{ tx.time }}</div>
              </div>
              <div :class="['tx-status', tx.status]">
                {{ tx.status === 'success' ? '✅' : '⏳' }}
              </div>
            </div>
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
        💡 提示：这是一个模拟的 Dapp 详情页，展示了如何在实际应用中集成钱包功能。
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, computed } from 'vue';

const wallet = inject('wallet');
const logs = ref([]);
const connectLoading = ref(false);
const disconnectLoading = ref(false);
const actionLoading = ref(null);
const transactions = ref([]);

// 模拟的 Dapp 数据
const mockDapp = ref({
  name: 'DeFi Swap Pro',
  description: '去中心化交易协议，支持多链资产交换',
  icon: '🦄',
  category: 'DeFi',
  chain: 'Ethereum',
  users: '1.2M+'
});

const mockBalance = ref('1.5234');

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

const formatAddress = (address) => {
  if (!address) return '无';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const getChainName = (chainId) => {
  const chains = {
    1: 'Ethereum',
    5: 'Goerli',
    137: 'Polygon',
    42161: 'Arbitrum'
  };
  return chains[chainId] || `Chain ${chainId}`;
};

onMounted(async () => {
  addLog('========== Dapp 详情页加载 ==========', 'info');
  addLog(`Dapp: ${mockDapp.value.name}`, 'info');
  
  if (!wallet) {
    addLog('❌ 钱包服务未注入！', 'error');
    return;
  }
  
  addLog('✅ 钱包服务已就绪', 'success');
  
  // 检查钱包初始化状态
  if (!wallet.checkInitialized()) {
    addLog('⚠️ 钱包未初始化，正在初始化...', 'warning');
    try {
      await wallet.initWallet();
      addLog('✅ 钱包初始化成功', 'success');
    } catch (e) {
      addLog(`❌ 钱包初始化失败: ${e.message}`, 'error');
    }
  } else {
    addLog('✅ 钱包已初始化', 'success');
  }
  
  // 检查连接状态
  if (wallet.isConnected.value) {
    addLog(`✅ 钱包已连接: ${wallet.address.value}`, 'success');
    addLog(`链ID: ${wallet.chainId.value}`, 'info');
  } else {
    addLog('💡 请连接钱包以使用 Dapp 功能', 'info');
  }
});

const connectWallet = async () => {
  connectLoading.value = true;
  addLog('========== 连接钱包 ==========', 'info');
  
  try {
    if (!wallet) {
      throw new Error('钱包服务未注入');
    }
    
    addLog('正在打开钱包连接对话框...', 'info');
    const account = await wallet.openWallet();
    
    if (account) {
      addLog(`✅ 连接成功: ${account}`, 'success');
      addLog(`链ID: ${wallet.chainId.value}`, 'info');
      addLog('💡 现在可以使用 Dapp 功能了', 'info');
    } else {
      addLog('⚠️ 用户取消连接或连接超时', 'warning');
    }
    
  } catch (e) {
    addLog(`❌ 连接失败: ${e.message}`, 'error');
  } finally {
    connectLoading.value = false;
  }
};

const disconnectWallet = async () => {
  disconnectLoading.value = true;
  addLog('========== 断开钱包 ==========', 'info');
  
  try {
    if (!wallet) {
      throw new Error('钱包服务未注入');
    }
    
    addLog('正在断开钱包...', 'info');
    const success = await wallet.disconnectWallet();
    
    if (success) {
      addLog('✅ 断开成功', 'success');
      // 清空交易历史
      transactions.value = [];
      addLog('交易历史已清空', 'info');
    } else {
      addLog('⚠️ 断开失败', 'warning');
    }
    
  } catch (e) {
    addLog(`❌ 断开失败: ${e.message}`, 'error');
  } finally {
    disconnectLoading.value = false;
  }
};

const addTransaction = (action, icon) => {
  const tx = {
    id: Date.now(),
    action,
    icon,
    time: new Date().toLocaleTimeString(),
    status: 'pending'
  };
  
  transactions.value.unshift(tx);
  
  // 模拟交易确认
  setTimeout(() => {
    tx.status = 'success';
  }, 2000);
};

const testSwap = async () => {
  actionLoading.value = 'swap';
  addLog('========== 模拟 Swap 交易 ==========', 'info');
  
  try {
    addLog('准备交易参数...', 'info');
    addLog('Token A: ETH', 'info');
    addLog('Token B: USDC', 'info');
    addLog('Amount: 0.1 ETH', 'info');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    addLog('✅ 交易已提交', 'success');
    addLog('交易哈希: 0x1234...5678', 'info');
    
    addTransaction('Swap 0.1 ETH → USDC', '💱');
    addLog('💡 交易已添加到历史记录', 'info');
    
  } catch (e) {
    addLog(`❌ 交易失败: ${e.message}`, 'error');
  } finally {
    actionLoading.value = null;
  }
};

const testStake = async () => {
  actionLoading.value = 'stake';
  addLog('========== 模拟 Stake 操作 ==========', 'info');
  
  try {
    addLog('准备 Stake 参数...', 'info');
    addLog('Token: ETH', 'info');
    addLog('Amount: 1.0 ETH', 'info');
    addLog('Pool: ETH Staking Pool', 'info');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    addLog('✅ Stake 成功', 'success');
    addLog('预计年化收益: 4.5%', 'info');
    
    addTransaction('Stake 1.0 ETH', '🏦');
    addLog('💡 Stake 记录已添加', 'info');
    
  } catch (e) {
    addLog(`❌ Stake 失败: ${e.message}`, 'error');
  } finally {
    actionLoading.value = null;
  }
};

const testNFTMint = async () => {
  actionLoading.value = 'mint';
  addLog('========== 模拟 NFT Mint ==========', 'info');
  
  try {
    addLog('准备 Mint 参数...', 'info');
    addLog('Collection: Cool Cats', 'info');
    addLog('Price: 0.08 ETH', 'info');
    addLog('Quantity: 1', 'info');
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    addLog('✅ Mint 成功', 'success');
    addLog('Token ID: #1234', 'info');
    
    addTransaction('Mint Cool Cats NFT', '🎨');
    addLog('💡 NFT 已添加到钱包', 'info');
    
  } catch (e) {
    addLog(`❌ Mint 失败: ${e.message}`, 'error');
  } finally {
    actionLoading.value = null;
  }
};

const testSignMessage = async () => {
  actionLoading.value = 'sign';
  addLog('========== 模拟签名消息 ==========', 'info');
  
  try {
    const message = 'Welcome to DeFi Swap Pro! Sign this message to verify your wallet.';
    addLog(`消息内容: ${message}`, 'info');
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    addLog('✅ 签名成功', 'success');
    addLog('Signature: 0xabcd...ef01', 'info');
    
    addTransaction('签名验证消息', '✍️');
    addLog('💡 签名已验证', 'info');
    
  } catch (e) {
    addLog(`❌ 签名失败: ${e.message}`, 'error');
  } finally {
    actionLoading.value = null;
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

.dapp-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  color: white;
  margin-bottom: 20px;
}

.dapp-header {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.dapp-icon {
  font-size: 48px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.2);
  border-radius: 12px;
}

.dapp-info h3 {
  margin: 0 0 5px 0;
  font-size: 20px;
}

.dapp-info p {
  margin: 0;
  opacity: 0.9;
  font-size: 13px;
}

.dapp-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.stat-item {
  background: rgba(255,255,255,0.2);
  padding: 10px;
  border-radius: 8px;
  text-align: center;
}

.stat-item .label {
  display: block;
  font-size: 11px;
  opacity: 0.8;
  margin-bottom: 4px;
}

.stat-item .value {
  display: block;
  font-size: 14px;
  font-weight: 600;
}

.wallet-section,
.dapp-actions,
.transaction-history {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.wallet-section:last-child,
.dapp-actions:last-child,
.transaction-history:last-child {
  border-bottom: none;
}

.wallet-section h4,
.dapp-actions h4,
.transaction-history h4 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 15px;
}

.connect-prompt {
  text-align: center;
}

.connect-prompt p {
  margin: 0 0 15px 0;
  color: #666;
  font-size: 13px;
}

.connected-info {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 15px;
}

.wallet-info {
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
}

.info-row .label {
  color: #666;
  font-weight: 500;
}

.info-row .value {
  font-family: 'Courier New', monospace;
  color: #333;
}

.tx-list {
  max-height: 200px;
  overflow-y: auto;
}

.tx-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 6px;
  margin-bottom: 8px;
}

.tx-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
}

.tx-info {
  flex: 1;
}

.tx-action {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
}

.tx-time {
  font-size: 11px;
  color: #999;
}

.tx-status {
  font-size: 18px;
}

.tx-status.pending {
  opacity: 0.5;
}

.empty-state {
  text-align: center;
  padding: 30px;
  color: #999;
  font-size: 13px;
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
.left-panel::-webkit-scrollbar,
.tx-list::-webkit-scrollbar {
  width: 6px;
}

.log-list::-webkit-scrollbar-track {
  background: #333;
  border-radius: 3px;
}

.left-panel::-webkit-scrollbar-track,
.tx-list::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 3px;
}

.log-list::-webkit-scrollbar-thumb {
  background: #666;
  border-radius: 3px;
}

.left-panel::-webkit-scrollbar-thumb,
.tx-list::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.log-list::-webkit-scrollbar-thumb:hover {
  background: #888;
}

.left-panel::-webkit-scrollbar-thumb:hover,
.tx-list::-webkit-scrollbar-thumb:hover {
  background: #999;
}
</style>
