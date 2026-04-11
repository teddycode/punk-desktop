# Web3Modal 钱包集成方案

## 一、现状分析

### 1.1 Splash.vue 中的钱包实现

在 `Splash.vue` 中，钱包功能集中在以下几个方面：

#### 1.1.1 初始化钱包

```javascript
// 行 191: mounted 钩子中调用
this.initWallet();

// 行 509-518: 初始化方法
async initWallet() {
  try {
    await createWeb3Modal(walletConfig());
    // 设置钱包事件监听器
    setupWalletListener(this.processUserInfo, this.userInfo);
  } catch (e) {
    console.log('创建钱包错误：', e.toString());
  }
}
```

#### 1.1.2 登录功能

```javascript
// 行 368-385: 打开钱包连接对话框
login() {
  const toast = useToast();
  let modal = useWeb3Modal();
  modal.open().then(() => {
    let account = useWeb3ModalAccount();
    if (account.isConnected.value) {
      toast.success(this.$t('toast.walletConnected'));
      setTimeout(() => {
        modal.close();
      }, 3000);
    }
  });
}
```

#### 1.1.3 注销功能

```javascript
// 行 417-429: 切换账户/注销
async reLoginUser() {
  await this.deleteUserInfo();
  let res = await ipc.invoke('direct-logout', this.userInfo?.uid);
  if (res) {
    message.success(this.$t('message.logoutSuccess'));
    useDisconnect()
      .disconnect()
      .then(() => {
        this.login();
      });
  } else {
    message.error(this.$t('message.logoutFail'));
  }
}
```

### 1.2 icon.vue 中的环境调用场景

在 `icon.vue` 的 `newOpenApp()` 方法中，有多种打开应用的方式：

1. **default** (行 182-184): 在系统默认浏览器中打开
2. **internal** (行 186-188): 在嵌入浏览器中打开，支持 wallet 参数
   ```javascript
   browser.openInTable(this.open.value, { wallet: this?.open?.wallet });
   ```
3. **thinksky** (行 190-192): 在磐古跨链客户端中打开
4. **lightApp** (行 194-198): 轻应用
5. **coolApp** (行 200-202): 路由跳转
6. **tableApp** (行 204-206): 本地应用
7. **pageApp** (行 208-212): 桌面内嵌页面
8. **Dapp** (行 214-216): Dapp 小程序
9. **sysPage** (行 218-221): 系统应用市场弹窗

### 1.3 问题分析

当前 **只有 `internal` 类型** 支持传递 `wallet` 参数，但传递后的处理逻辑被注释掉了（browser.ts 行 37-41）。其他环境类型无法访问钱包功能。

## 二、解决方案设计

### 2.1 设计目标

1. 在所有需要钱包功能的应用环境中，都能访问 Web3Modal 钱包功能
2. 创建可复用的钱包服务模块
3. 支持钱包状态的全局共享
4. 提供统一的钱包操作 API

### 2.2 技术方案

#### 2.2.1 创建全局钱包服务 (composables)

创建 `useWalletService.ts` composable，封装所有钱包相关功能：

```typescript
// vite/packages/table/composables/useWalletService.ts
import { ref, computed } from 'vue';
import { useWeb3Modal, useWeb3ModalAccount, useDisconnect, createWeb3Modal } from '@punkos/ethers5/vue';
import { useToast } from 'vue-toastification';
import { walletConfig } from '@store/wallet';
import { setupWalletListener } from '@table/page/core/Wallets/events';

// 单例模式：确保全局只有一个钱包实例
let walletInstance: any = null;
let isInitialized = false;

export function useWalletService() {
  const toast = useToast();
  const account = useWeb3ModalAccount();
  const { disconnect } = useDisconnect();

  // 钱包状态
  const isConnected = computed(() => account.isConnected?.value || false);
  const address = computed(() => account.address?.value || '');
  const chainId = computed(() => account.chainId?.value || 0);

  /**
   * 初始化钱包
   */
  const initWallet = async (processUserInfo?: Function, userInfo?: any) => {
    if (isInitialized) {
      console.log('钱包已经初始化过了');
      return walletInstance;
    }

    try {
      walletInstance = await createWeb3Modal(walletConfig());
      isInitialized = true;

      // 如果提供了回调函数，设置事件监听
      if (processUserInfo) {
        setupWalletListener(processUserInfo, userInfo);
      }

      console.log('钱包初始化成功');
      return walletInstance;
    } catch (e) {
      console.error('创建钱包错误：', e);
      throw e;
    }
  };

  /**
   * 打开钱包连接对话框
   */
  const openWallet = async () => {
    try {
      if (!isInitialized) {
        await initWallet();
      }

      const modal = useWeb3Modal();
      await modal.open();

      return new Promise((resolve) => {
        const checkConnection = setInterval(() => {
          if (account.isConnected.value) {
            clearInterval(checkConnection);
            toast.success('钱包连接成功');
            modal.close();
            resolve(account);
          }
        }, 500);

        // 30秒超时
        setTimeout(() => {
          clearInterval(checkConnection);
          resolve(null);
        }, 30000);
      });
    } catch (e) {
      toast.error('打开钱包失败：' + e.message);
      throw e;
    }
  };

  /**
   * 断开钱包连接
   */
  const disconnectWallet = async () => {
    try {
      await disconnect();
      toast.success('钱包已断开');
      return true;
    } catch (e) {
      toast.error('断开钱包失败：' + e.message);
      return false;
    }
  };

  /**
   * 获取钱包实例
   */
  const getWalletInstance = () => {
    return walletInstance;
  };

  /**
   * 检查钱包是否已初始化
   */
  const checkInitialized = () => {
    return isInitialized;
  };

  return {
    // 状态
    isConnected,
    address,
    chainId,

    // 方法
    initWallet,
    openWallet,
    disconnectWallet,
    getWalletInstance,
    checkInitialized,
  };
}
```

#### 2.2.2 在 Pinia Store 中管理钱包状态

更新 `wallet.ts` store：

```typescript
// vite/packages/table/store/wallet.ts
import { defineStore } from 'pinia';
import { defaultConfig, Web3ModalOptions } from '@punkos/ethers5';
import { sepolia, mainnet, arbitrum, punkos } from './chains';
import { ref, computed } from 'vue';

export const walletConfig = (): Web3ModalOptions => {
  const projectId = '01c174cab89954d2942216e56549d410';
  const chains = [punkos, sepolia, mainnet, arbitrum];
  const ethersConfig = defaultConfig({
    metadata: {
      name: 'PunkOS client',
      description: 'A cross chain system with state of the art',
      url: 'https://www.punkos.com',
      icons: ['https://pic.imgdb.cn/item/65e292ac9f345e8d03288770.png'],
    },
    defaultChainId: punkos.chainId,
  });

  let options = {
    ethersConfig,
    projectId,
    chains,
    themeMode: 'light',
    themeVariables: {
      '--w3m-color-mix': '#00BB7F',
      '--w3m-color-mix-strength': 20,
    },
    relayConfig: {
      url: 'wss://relay.walletconnect.com',
    },
  };
  return options as Web3ModalOptions;
};

export const walletStore = defineStore('walletStore', {
  state: () => ({
    isInitialized: false,
    walletInstance: null as any,
    isConnected: false,
    address: '',
    chainId: 0,
  }),

  getters: {
    getAddress: (state) => state.address,
    getChainId: (state) => state.chainId,
    getIsConnected: (state) => state.isConnected,
  },

  actions: {
    setInitialized(status: boolean) {
      this.isInitialized = status;
    },

    setWalletInstance(instance: any) {
      this.walletInstance = instance;
    },

    updateWalletState(address: string, chainId: number, isConnected: boolean) {
      this.address = address;
      this.chainId = chainId;
      this.isConnected = isConnected;
    },

    resetWalletState() {
      this.isConnected = false;
      this.address = '';
      this.chainId = 0;
    },
  },

  persist: {
    enabled: true,
    strategies: [
      {
        storage: localStorage,
        paths: ['address', 'chainId'],
      },
    ],
  },
});
```

#### 2.2.3 创建钱包注入插件

创建全局插件，在 Vue 应用启动时注入钱包服务：

```typescript
// vite/packages/table/plugins/walletPlugin.ts
import { App } from 'vue';
import { useWalletService } from '@table/composables/useWalletService';

export default {
  install(app: App) {
    const walletService = useWalletService();

    // 注入到全局属性
    app.config.globalProperties.$wallet = walletService;

    // 提供给所有组件
    app.provide('wallet', walletService);
  },
};
```

#### 2.2.4 在不同环境中使用钱包

##### A. 在 Vue 组件中使用（Options API）

```vue
<script>
import { inject } from 'vue';

export default {
  setup() {
    // 通过 inject 获取钱包服务
    const wallet = inject('wallet');
    return { wallet };
  },

  methods: {
    async connectWallet() {
      try {
        const account = await this.wallet.openWallet();
        console.log('连接的账户：', account);
      } catch (e) {
        console.error('连接失败：', e);
      }
    },

    async checkWalletStatus() {
      console.log('钱包状态：', {
        isConnected: this.wallet.isConnected.value,
        address: this.wallet.address.value,
        chainId: this.wallet.chainId.value,
      });
    },
  },
};
</script>
```

##### B. 在 Vue 组件中使用（Composition API）

```vue
<script setup>
import { inject } from 'vue';

const wallet = inject('wallet');

const connectWallet = async () => {
  try {
    const account = await wallet.openWallet();
    console.log('连接的账户：', account);
  } catch (e) {
    console.error('连接失败：', e);
  }
};
</script>
```

##### C. 在嵌入浏览器中使用

更新 `browser.ts` 的实现：

```typescript
// vite/packages/table/js/common/browser.ts
import { useWalletService } from '@table/composables/useWalletService';

const browser = {
  async openInTable(url: string, options: { wallet?: Boolean }) {
    // 如果需要钱包功能
    if (options?.wallet) {
      const walletService = useWalletService();

      // 确保钱包已初始化
      if (!walletService.checkInitialized()) {
        await walletService.initWallet();
      }

      // 如果未连接，尝试连接钱包
      if (!walletService.isConnected.value) {
        await walletService.openWallet();
      }
    }

    window.$app.$router.push({
      name: 'browser',
      params: {
        url: url,
        ...options,
      },
    });
  },
};

export default browser;
```

##### D. 在 iframe 嵌入页面中使用

如果应用通过 iframe 加载页面，需要在父窗口暴露钱包 API：

```typescript
// vite/packages/table/js/common/walletBridge.ts
import { useWalletService } from '@table/composables/useWalletService';

export class WalletBridge {
  private walletService: any;

  constructor() {
    this.walletService = useWalletService();
    this.setupMessageListener();
  }

  /**
   * 监听来自 iframe 的消息
   */
  private setupMessageListener() {
    window.addEventListener('message', async (event) => {
      // 验证消息来源
      if (!this.isValidOrigin(event.origin)) {
        return;
      }

      const { type, data } = event.data;

      switch (type) {
        case 'WALLET_CONNECT':
          const account = await this.walletService.openWallet();
          this.sendToIframe(event.source, {
            type: 'WALLET_CONNECT_RESPONSE',
            data: {
              isConnected: this.walletService.isConnected.value,
              address: this.walletService.address.value,
              chainId: this.walletService.chainId.value,
            },
          });
          break;

        case 'WALLET_DISCONNECT':
          await this.walletService.disconnectWallet();
          this.sendToIframe(event.source, {
            type: 'WALLET_DISCONNECT_RESPONSE',
            data: { success: true },
          });
          break;

        case 'WALLET_STATUS':
          this.sendToIframe(event.source, {
            type: 'WALLET_STATUS_RESPONSE',
            data: {
              isConnected: this.walletService.isConnected.value,
              address: this.walletService.address.value,
              chainId: this.walletService.chainId.value,
            },
          });
          break;
      }
    });
  }

  /**
   * 发送消息到 iframe
   */
  private sendToIframe(target: any, message: any) {
    target.postMessage(message, '*');
  }

  /**
   * 验证消息来源
   */
  private isValidOrigin(origin: string): boolean {
    // 这里可以添加白名单验证
    return true;
  }
}
```

在 iframe 页面中使用：

```javascript
// iframe 页面中的钱包客户端
class WalletClient {
  constructor() {
    this.setupMessageListener();
  }

  setupMessageListener() {
    window.addEventListener('message', (event) => {
      const { type, data } = event.data;

      switch (type) {
        case 'WALLET_CONNECT_RESPONSE':
          console.log('钱包连接成功：', data);
          this.onConnected(data);
          break;

        case 'WALLET_STATUS_RESPONSE':
          console.log('钱包状态：', data);
          this.onStatusUpdate(data);
          break;
      }
    });
  }

  async connect() {
    window.parent.postMessage(
      {
        type: 'WALLET_CONNECT',
        data: {},
      },
      '*',
    );
  }

  async disconnect() {
    window.parent.postMessage(
      {
        type: 'WALLET_DISCONNECT',
        data: {},
      },
      '*',
    );
  }

  async getStatus() {
    window.parent.postMessage(
      {
        type: 'WALLET_STATUS',
        data: {},
      },
      '*',
    );
  }

  onConnected(data) {
    // 处理连接成功
  }

  onStatusUpdate(data) {
    // 处理状态更新
  }
}

// 使用
const walletClient = new WalletClient();
walletClient.connect();
```

## 三、实现步骤

### 3.1 创建文件结构

```
vite/packages/table/
├── composables/
│   └── useWalletService.ts          # 钱包服务 composable
├── plugins/
│   └── walletPlugin.ts              # 钱包插件
├── js/common/
│   ├── browser.ts                   # 更新浏览器工具（已存在）
│   └── walletBridge.ts              # iframe 钱包桥接
```

### 3.2 更新现有文件

1. **更新 Splash.vue**：使用新的 walletService
2. **更新 wallet.ts store**：添加状态管理
3. **更新 icon.vue**：支持更多环境的钱包调用
4. **更新 browser.ts**：完善钱包参数处理

### 3.3 注册插件

在主应用入口注册钱包插件：

```typescript
// vite/packages/table/main.ts (或相应的入口文件)
import walletPlugin from '@table/plugins/walletPlugin';

app.use(walletPlugin);
```

## 四、测试方案

### 4.1 单元测试

创建测试文件 `tests/walletService.test.ts`：

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useWalletService } from '@table/composables/useWalletService';

describe('WalletService', () => {
  let walletService: any;

  beforeEach(() => {
    walletService = useWalletService();
  });

  it('应该正确初始化钱包', async () => {
    await walletService.initWallet();
    expect(walletService.checkInitialized()).toBe(true);
  });

  it('应该能够获取钱包实例', async () => {
    await walletService.initWallet();
    const instance = walletService.getWalletInstance();
    expect(instance).not.toBeNull();
  });

  it('初始状态应该是未连接', () => {
    expect(walletService.isConnected.value).toBe(false);
  });
});
```

### 4.2 集成测试示例

创建测试组件 `tests/components/WalletTestComponent.vue`：

```vue
<template>
  <div class="wallet-test">
    <h2>钱包集成测试</h2>

    <div class="status-panel">
      <h3>钱包状态</h3>
      <p>连接状态: {{ wallet.isConnected.value ? '已连接' : '未连接' }}</p>
      <p>地址: {{ wallet.address.value || '无' }}</p>
      <p>链ID: {{ wallet.chainId.value || '无' }}</p>
    </div>

    <div class="action-panel">
      <a-button type="primary" @click="connectWallet" :disabled="wallet.isConnected.value"> 连接钱包 </a-button>

      <a-button @click="disconnectWallet" :disabled="!wallet.isConnected.value"> 断开钱包 </a-button>

      <a-button @click="checkStatus"> 检查状态 </a-button>
    </div>

    <div class="test-scenarios">
      <h3>测试场景</h3>

      <a-button @click="testInternalBrowser"> 测试嵌入浏览器 (internal) </a-button>

      <a-button @click="testIframeBridge"> 测试 iframe 桥接 </a-button>

      <a-button @click="testDappEnvironment"> 测试 Dapp 环境 </a-button>
    </div>

    <div class="log-panel">
      <h3>日志</h3>
      <pre>{{ logs }}</pre>
    </div>
  </div>
</template>

<script>
import { inject, ref } from 'vue';
import browser from '@js/common/browser';

export default {
  setup() {
    const wallet = inject('wallet');
    const logs = ref([]);

    const addLog = (message) => {
      const timestamp = new Date().toLocaleTimeString();
      logs.value.push(`[${timestamp}] ${message}`);
    };

    const connectWallet = async () => {
      try {
        addLog('开始连接钱包...');
        const account = await wallet.openWallet();
        if (account) {
          addLog(`钱包连接成功: ${wallet.address.value}`);
        } else {
          addLog('钱包连接超时或被取消');
        }
      } catch (e) {
        addLog(`钱包连接失败: ${e.message}`);
      }
    };

    const disconnectWallet = async () => {
      try {
        addLog('开始断开钱包...');
        const success = await wallet.disconnectWallet();
        if (success) {
          addLog('钱包已断开');
        }
      } catch (e) {
        addLog(`断开钱包失败: ${e.message}`);
      }
    };

    const checkStatus = () => {
      addLog(
        `当前钱包状态: ${JSON.stringify({
          isConnected: wallet.isConnected.value,
          address: wallet.address.value,
          chainId: wallet.chainId.value,
        })}`,
      );
    };

    const testInternalBrowser = () => {
      addLog('测试：打开内嵌浏览器并启用钱包');
      browser.openInTable('https://app.uniswap.org', { wallet: true });
    };

    const testIframeBridge = () => {
      addLog('测试：iframe 钱包桥接');
      // 创建测试 iframe
      const iframe = document.createElement('iframe');
      iframe.src = '/test-iframe.html';
      iframe.style.width = '100%';
      iframe.style.height = '400px';
      document.body.appendChild(iframe);
    };

    const testDappEnvironment = () => {
      addLog('测试：Dapp 环境钱包调用');
      // 模拟 Dapp 环境的钱包调用
      if (wallet.isConnected.value) {
        addLog(`Dapp 可以访问钱包: ${wallet.address.value}`);
      } else {
        addLog('Dapp 环境未连接钱包，请先连接');
      }
    };

    return {
      wallet,
      logs,
      connectWallet,
      disconnectWallet,
      checkStatus,
      testInternalBrowser,
      testIframeBridge,
      testDappEnvironment,
    };
  },
};
</script>

<style scoped>
.wallet-test {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.status-panel,
.action-panel,
.test-scenarios,
.log-panel {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #f9f9f9;
}

.action-panel button,
.test-scenarios button {
  margin-right: 10px;
  margin-bottom: 10px;
}

.log-panel pre {
  background: #2d2d2d;
  color: #0f0;
  padding: 15px;
  border-radius: 4px;
  max-height: 400px;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}
</style>
```

### 4.3 测试用例清单

#### 测试场景 1: 基本钱包连接

- [ ] 初始化钱包服务
- [ ] 打开钱包连接对话框
- [ ] 成功连接钱包
- [ ] 显示正确的账户地址和链 ID
- [ ] 断开钱包连接

#### 测试场景 2: 在 internal 浏览器中使用

- [ ] 打开带 wallet 参数的内嵌浏览器
- [ ] 自动初始化钱包
- [ ] 页面可以访问钱包状态
- [ ] 测试钱包交互功能

#### 测试场景 3: 在 Dapp 环境中使用

- [ ] Dapp 页面可以通过 inject 获取钱包服务
- [ ] Dapp 可以读取钱包状态
- [ ] Dapp 可以调用钱包连接
- [ ] Dapp 可以执行签名操作

#### 测试场景 4: iframe 桥接

- [ ] 父窗口正确初始化 WalletBridge
- [ ] iframe 可以请求钱包连接
- [ ] 父窗口响应 iframe 请求
- [ ] iframe 接收钱包状态更新
- [ ] iframe 可以断开钱包

#### 测试场景 5: 多环境切换

- [ ] pageApp 环境可以使用钱包
- [ ] coolApp 环境可以使用钱包
- [ ] lightApp 环境可以使用钱包
- [ ] 各环境间钱包状态保持一致

#### 测试场景 6: 错误处理

- [ ] 钱包连接失败时的错误提示
- [ ] 用户拒绝连接时的处理
- [ ] 网络切换时的处理
- [ ] 钱包未安装时的处理

## 五、使用示例

### 5.1 在图标配置中启用钱包

更新 `icon.vue` 的配置，添加钱包支持标识：

```javascript
// 在 icon 数据结构中添加 wallet 字段
{
  titleValue: 'Uniswap',
  src: '/icons/uniswap.png',
  open: {
    type: 'internal',
    value: 'https://app.uniswap.org',
    wallet: true  // 启用钱包功能
  }
}
```

### 5.2 在 Dapp 详情页中使用

```vue
<!-- DappDetails.vue -->
<script setup>
import { inject, onMounted } from 'vue';

const wallet = inject('wallet');

onMounted(async () => {
  // 确保钱包已初始化
  if (!wallet.checkInitialized()) {
    await wallet.initWallet();
  }
});

const handleConnectWallet = async () => {
  if (!wallet.isConnected.value) {
    await wallet.openWallet();
  }
};

const handleTransaction = async () => {
  if (!wallet.isConnected.value) {
    message.warning('请先连接钱包');
    return;
  }

  // 执行交易逻辑
  console.log('当前钱包地址：', wallet.address.value);
};
</script>

<template>
  <div class="dapp-details">
    <div class="wallet-info">
      <span v-if="wallet.isConnected.value">
        已连接: {{ wallet.address.value.slice(0, 6) }}...{{ wallet.address.value.slice(-4) }}
      </span>
      <a-button v-else type="primary" @click="handleConnectWallet"> 连接钱包 </a-button>
    </div>

    <!-- Dapp 内容 -->
  </div>
</template>
```

## 六、优点和注意事项

### 6.1 优点

1. **统一管理**: 所有钱包相关逻辑集中在一个地方
2. **可复用**: 任何组件都可以通过 inject 使用钱包服务
3. **状态共享**: 全局共享钱包状态，避免重复连接
4. **易于测试**: composable 模式便于单元测试
5. **扩展性强**: 易于添加新的钱包功能

### 6.2 注意事项

1. **单例模式**: 确保全局只有一个钱包实例
2. **初始化时机**: 在 Splash.vue 中初始化，确保应用启动时钱包就绪
3. **错误处理**: 妥善处理钱包连接失败、用户拒绝等情况
4. **安全性**: 在 iframe 桥接时验证消息来源
5. **性能优化**: 避免频繁创建钱包实例

## 七、总结

本方案通过创建 `useWalletService` composable 和全局插件，实现了在所有应用环境中都能访问 Web3Modal 钱包功能的目标。主要特点：

1. **全局可用**: 通过 Vue 的 provide/inject 机制，任何组件都能使用钱包服务
2. **单例模式**: 确保应用中只有一个钱包实例，避免重复初始化
3. **状态管理**: 结合 Pinia store，实现钱包状态的持久化和共享
4. **多环境支持**: 支持 internal、Dapp、pageApp 等多种环境
5. **iframe 桥接**: 通过 postMessage 实现跨 iframe 的钱包通信
6. **易于测试**: 提供完整的测试方案和示例

实施这个方案后，所有需要钱包功能的环境都能通过统一的 API 访问钱包功能，大大提升了代码的可维护性和用户体验。
