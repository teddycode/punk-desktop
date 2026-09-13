/**
 * 钱包服务 Preload 脚本
 * 用于内嵌网页环境，将钱包服务注入到 window 对象
 */

const { contextBridge, ipcRenderer } = require('electron');

console.log('[Wallet Preload] 钱包 preload 脚本开始加载');

// 注入 IPC 通信接口
contextBridge.exposeInMainWorld('ipc', {
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  on: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
  invoke: (channel, ...args) => {
    return ipcRenderer.invoke(channel, ...args);
  },
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});

console.log('[Wallet Preload] ✅ IPC 接口注入成功');

// 注入简化的钱包服务接口
// 这里创建一个占位对象，真实的钱包服务由主窗口通过 IPC 消息注入
// Provide an EIP-1193 provider so standard DApps can use the StarX wallet.
const STARX_CHAIN_ID = 20260902;
const ethereumListeners = new Map();
let ethereumStatePoller = null;
let lastEthereumState = { address: null, chainId: STARX_CHAIN_ID };

function toChainIdHex(chainId) {
  return `0x${Number(chainId || STARX_CHAIN_ID).toString(16)}`;
}

function createProviderError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function emitEthereumEvent(eventName, value) {
  const listeners = ethereumListeners.get(eventName) || [];
  listeners.slice().forEach((listener) => {
    try {
      listener(value);
    } catch (error) {
      console.error(`[Wallet Preload] ethereum ${eventName} listener failed`, error);
    }
  });
}

async function getEthereumState() {
  const result = await ipcRenderer.invoke('wallet-get-state');
  if (!result || result.success === false) {
    throw new Error(result?.error || 'Unable to read StarX wallet state');
  }

  return {
    address: result.connected && result.address ? result.address : null,
    chainId: Number(result.chainId || STARX_CHAIN_ID),
  };
}

async function pollEthereumState() {
  try {
    const state = await getEthereumState();
    if (state.address !== lastEthereumState.address) {
      lastEthereumState.address = state.address;
      emitEthereumEvent('accountsChanged', state.address ? [state.address] : []);
    }
    if (state.chainId !== lastEthereumState.chainId) {
      lastEthereumState.chainId = state.chainId;
      emitEthereumEvent('chainChanged', toChainIdHex(state.chainId));
    }
  } catch (error) {
    console.warn('[Wallet Preload] ethereum state polling failed:', error.message);
  }
}

function startEthereumStatePolling() {
  if (!ethereumStatePoller) {
    ethereumStatePoller = setInterval(pollEthereumState, 1500);
  }
}

async function requestEthereum(method, params = []) {
  switch (method) {
    case 'eth_accounts': {
      const state = await getEthereumState();
      return state.address ? [state.address] : [];
    }
    case 'eth_requestAccounts': {
      const result = await ipcRenderer.invoke('wallet-connect');
      if (!result || !result.success || !result.address) {
        throw createProviderError(4001, result?.error || 'User rejected the wallet connection');
      }
      lastEthereumState = {
        address: result.address,
        chainId: Number(result.chainId || STARX_CHAIN_ID),
      };
      emitEthereumEvent('accountsChanged', [result.address]);
      emitEthereumEvent('chainChanged', toChainIdHex(lastEthereumState.chainId));
      return [result.address];
    }
    case 'eth_chainId': {
      const state = await getEthereumState();
      return toChainIdHex(state.chainId);
    }
    case 'net_version': {
      const state = await getEthereumState();
      return String(state.chainId);
    }
    case 'wallet_requestPermissions': {
      const result = await ipcRenderer.invoke('wallet-connect');
      if (!result || !result.success || !result.address) {
        throw createProviderError(4001, result?.error || 'User rejected the wallet connection');
      }
      lastEthereumState = {
        address: result.address,
        chainId: Number(result.chainId || STARX_CHAIN_ID),
      };
      emitEthereumEvent('accountsChanged', [result.address]);
      return [{
        parentCapability: 'eth_accounts',
        caveats: [{ type: 'restrictReturnedAccounts', value: [result.address] }],
      }];
    }
    default: {
      const result = await ipcRenderer.invoke('wallet-rpc-request', {
        method,
        params,
      });
      if (!result || !result.success) {
        const error = createProviderError(-32603, result?.error || `StarX wallet RPC failed: ${method}`);
        if (result?.code) error.code = result.code;
        throw error;
      }
      return result.result;
    }
  }
}

const ethereumProvider = {
  isStarX: true,
  // Some legacy DApps only recognize a provider through this compatibility flag.
  isMetaMask: true,
  request: ({ method, params = [] } = {}) => {
    if (!method) {
      return Promise.reject(createProviderError(-32600, 'A JSON-RPC method is required'));
    }
    return requestEthereum(method, params);
  },
  on(eventName, listener) {
    if (typeof listener !== 'function') return this;
    const listeners = ethereumListeners.get(eventName) || [];
    if (!listeners.includes(listener)) listeners.push(listener);
    ethereumListeners.set(eventName, listeners);
    if (eventName === 'accountsChanged' || eventName === 'chainChanged') {
      startEthereumStatePolling();
    }
    return this;
  },
  addListener(eventName, listener) {
    return this.on(eventName, listener);
  },
  enable() {
    return requestEthereum('eth_requestAccounts');
  },
  removeListener(eventName, listener) {
    const listeners = ethereumListeners.get(eventName) || [];
    ethereumListeners.set(eventName, listeners.filter((item) => item !== listener));
    return this;
  },
  off(eventName, listener) {
    return this.removeListener(eventName, listener);
  },
  removeAllListeners(eventName) {
    if (eventName) ethereumListeners.delete(eventName);
    else ethereumListeners.clear();
    return this;
  },
  sendAsync(payload, callback) {
    const request = Array.isArray(payload) ? payload[0] : payload;
    requestEthereum(request.method, request.params || []).then(
      (result) => callback(null, { id: request.id, jsonrpc: '2.0', result }),
      (error) => callback(error, { id: request.id, jsonrpc: '2.0', error: { code: error.code, message: error.message } }),
    );
  },
  send(methodOrPayload, params = []) {
    if (typeof methodOrPayload === 'object') {
      if (typeof params === 'function') {
        return this.sendAsync(methodOrPayload, params);
      }
      return requestEthereum(methodOrPayload.method, methodOrPayload.params || []).then((result) => ({
        id: methodOrPayload.id,
        jsonrpc: '2.0',
        result,
      }));
    }
    return requestEthereum(methodOrPayload, params);
  },
};

contextBridge.exposeInMainWorld('ethereum', ethereumProvider);
console.log('[Wallet Preload] ethereum provider adapter injected');

contextBridge.exposeInMainWorld('wallet', {
  // 标记钱包服务可用
  _initialized: false,
  _connected: false,
  _address: null,
  _chainId: null,

  // 初始化钱包（异步）
  async initWallet() {
    console.log('[Wallet Preload] initWallet 调用');
    try {
      const result = await ipcRenderer.invoke('wallet-init');
      console.log('[Wallet Preload] initWallet 结果:', result);
      this._initialized = result.success || false;
      return result;
    } catch (error) {
      console.error('[Wallet Preload] initWallet 错误:', error);
      return { success: false, error: error.message };
    }
  },

  // 检查是否已初始化
  checkInitialized() {
    return this._initialized;
  },

  // 打开钱包连接
  async openWallet() {
    console.log('[Wallet Preload] openWallet 调用');
    try {
      const result = await ipcRenderer.invoke('wallet-connect');
      console.log('[Wallet Preload] openWallet 结果:', result);
      if (result.success) {
        this._connected = true;
        this._address = result.address || null;
        this._chainId = result.chainId || null;
      }
      return result;
    } catch (error) {
      console.error('[Wallet Preload] openWallet 错误:', error);
      return { success: false, error: error.message };
    }
  },

  // 断开钱包连接
  async disconnectWallet() {
    console.log('[Wallet Preload] disconnectWallet 调用');
    try {
      const result = await ipcRenderer.invoke('wallet-disconnect');
      console.log('[Wallet Preload] disconnectWallet 结果:', result);
      if (result.success) {
        this._connected = false;
        this._address = null;
        this._chainId = null;
      }
      return result;
    } catch (error) {
      console.error('[Wallet Preload] disconnectWallet 错误:', error);
      return { success: false, error: error.message };
    }
  },

  // 获取钱包状态
  async getWalletState() {
    console.log('[Wallet Preload] getWalletState 调用');
    try {
      const result = await ipcRenderer.invoke('wallet-get-state');
      console.log('[Wallet Preload] getWalletState 结果:', result);
      if (result.success) {
        this._initialized = result.initialized || false;
        this._connected = result.connected || false;
        this._address = result.address || null;
        this._chainId = result.chainId || null;
      }
      return result;
    } catch (error) {
      console.error('[Wallet Preload] getWalletState 错误:', error);
      return { success: false, error: error.message };
    }
  },

  // 兼容属性访问（getter）
  get isConnected() {
    return { value: this._connected };
  },

  get address() {
    return { value: this._address };
  },

  get chainId() {
    return { value: this._chainId };
  },

  // 监听钱包事件
  on(event, callback) {
    ipcRenderer.on(`wallet-${event}`, (e, data) => callback(data));
  },

  off(event) {
    ipcRenderer.removeAllListeners(`wallet-${event}`);
  },

  // ========== 高级功能：合约调用 ==========
  
  /**
   * 获取 WalletProvider（返回代理对象）
   */
  async getWalletProvider() {
    console.log('[Wallet Preload] getWalletProvider 调用');
    try {
      const result = await ipcRenderer.invoke('wallet-get-provider');
      if (!result.success) {
        throw new Error(result.error || '获取 Provider 失败');
      }
      
      // 返回一个代理 provider 对象
      return {
        // 标记为代理对象
        _isProxy: true,
        
        // 获取签名器
        async getSigner() {
          return {
            _isProxy: true,
            // 签名方法
            async signMessage(message) {
              return await ipcRenderer.invoke('wallet-sign-message', { message });
            },
            // 发送交易
            async sendTransaction(tx) {
              return await ipcRenderer.invoke('wallet-send-transaction', { tx });
            },
            // 获取地址
            async getAddress() {
              const state = await ipcRenderer.invoke('wallet-get-state');
              return state.address;
            }
          };
        },
        
        // 获取网络信息
        async getNetwork() {
          return await ipcRenderer.invoke('wallet-get-network');
        }
      };
    } catch (error) {
      console.error('[Wallet Preload] getWalletProvider 错误:', error);
      throw error;
    }
  },

  /**
   * 查询合约（只读操作）
   * @param {string} contractAddress - 合约地址
   * @param {Array} abi - 合约 ABI
   * @param {string} method - 方法名
   * @param {Array} params - 参数数组
   */
  async queryContract(contractAddress, abi, method, params = []) {
    console.log('[Wallet Preload] queryContract 调用:', { contractAddress, method, params });
    try {
      const result = await ipcRenderer.invoke('wallet-query-contract', {
        contractAddress,
        abi: JSON.stringify(abi), // ABI 需要序列化
        method,
        params
      });
      
      console.log('[Wallet Preload] queryContract 结果:', result);
      
      if (!result.success) {
        throw new Error(result.error || '查询合约失败');
      }
      
      return result.data;
    } catch (error) {
      console.error('[Wallet Preload] queryContract 错误:', error);
      throw error;
    }
  },

  /**
   * 调用合约（写操作，需要签名）
   * @param {string} contractAddress - 合约地址
   * @param {Array} abi - 合约 ABI
   * @param {string} method - 方法名
   * @param {Array} params - 参数数组
   */
  async invokeContract(contractAddress, abi, method, params = []) {
    console.log('[Wallet Preload] invokeContract 调用:', { contractAddress, method, params });
    try {
      const result = await ipcRenderer.invoke('wallet-invoke-contract', {
        contractAddress,
        abi: JSON.stringify(abi),
        method,
        params
      });
      
      console.log('[Wallet Preload] invokeContract 结果:', result);
      
      if (!result.success) {
        throw new Error(result.error || '调用合约失败');
      }
      
      return result.data;
    } catch (error) {
      console.error('[Wallet Preload] invokeContract 错误:', error);
      throw error;
    }
  },

  /**
   * 部署合约
   * @param {Array} abi - 合约 ABI
   * @param {string} bytecode - 合约字节码
   * @param {Array} constructorArgs - 构造函数参数
   */
  async deployContract(abi, bytecode, constructorArgs = []) {
    console.log('[Wallet Preload] deployContract 调用:', { abi, bytecode, constructorArgs });
    try {
      const result = await ipcRenderer.invoke('wallet-deploy-contract', {
        abi: JSON.stringify(abi),
        bytecode,
        constructorArgs
      });
      
      console.log('[Wallet Preload] deployContract 结果:', result);
      
      if (!result.success) {
        throw new Error(result.error || '部署合约失败');
      }
      
      return result.address;
    } catch (error) {
      console.error('[Wallet Preload] deployContract 错误:', error);
      throw error;
    }
  },

  /**
   * 签名消息
   */
  async signMessage(message) {
    console.log('[Wallet Preload] signMessage 调用');
    try {
      const result = await ipcRenderer.invoke('wallet-sign-message', { message });
      if (!result.success) {
        throw new Error(result.error || '签名失败');
      }
      return result.signature;
    } catch (error) {
      console.error('[Wallet Preload] signMessage 错误:', error);
      throw error;
    }
  },

  /**
   * 发送交易
   */
  async sendTransaction(tx) {
    console.log('[Wallet Preload] sendTransaction 调用:', tx);
    try {
      const result = await ipcRenderer.invoke('wallet-send-transaction', { tx });
      if (!result.success) {
        throw new Error(result.error || '发送交易失败');
      }
      return result.data;
    } catch (error) {
      console.error('[Wallet Preload] sendTransaction 错误:', error);
      throw error;
    }
  }
});

console.log('[Wallet Preload] ✅ Wallet 接口注入成功（含合约调用）');

// 监听主进程的钱包初始化消息
ipcRenderer.on('init-wallet', (event, data) => {
  console.log('[Wallet Preload] 收到 init-wallet 消息:', data);
  
  // 自动初始化钱包状态
  if (data.enabled) {
    console.log('[Wallet Preload] 钱包功能已启用，准备初始化...');
    
    // 通知页面钱包服务已就绪
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('wallet-ready', { detail: data }));
    }, 100);
  }
});

console.log('[Wallet Preload] 📦 Wallet Preload 脚本加载完成');
