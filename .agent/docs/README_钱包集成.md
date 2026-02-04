# 🔗 Web3Modal 钱包集成方案

> 为 PunkOS 系统提供统一的 Web3Modal 钱包管理解决方案

## 📖 文档索引

| 文档                       | 说明                               | 路径                                   |
| -------------------------- | ---------------------------------- | -------------------------------------- |
| 📘 **完整方案文档**        | 详细的技术方案、实现代码和测试方案 | [查看文档](./Web3Modal钱包集成方案.md) |
| 🚀 **快速开始指南**        | 安装步骤、使用示例和常见问题       | [查看文档](./钱包集成快速开始.md)      |
| 📝 **实现总结**            | 已完成工作、文件结构和下一步行动   | [查看文档](./实现总结.md)              |
| 💡 **Splash.vue 更新示例** | 代码迁移指南                       | [查看文档](./Splash.vue更新示例.js)    |
| 📋 **实施检查清单**        | 逐步实施指南和检查项               | [查看文档](./实施检查清单.md)          |
| 🎉 **测试完成报告**        | 所有测试环境的完成报告             | [查看文档](./测试完成报告.md)          |
| 🏗️ **架构图**              | 系统架构可视化                     | [查看文档](./架构图.md)                |
| 📦 **交付清单**            | 完整的交付内容清单                 | [查看文档](./交付清单.md)              |

## 🎯 快速开始

### 1. 注册插件

```typescript
// main.ts
import walletPlugin from '@table/plugins/walletPlugin';
app.use(walletPlugin);
```

### 2. 在组件中使用

```vue
<script setup>
import { inject } from 'vue';

const wallet = inject('wallet');

const connect = async () => {
  await wallet.openWallet();
  console.log('地址:', wallet.address.value);
};
</script>

<template>
  <button @click="connect">连接钱包</button>
</template>
```

## 📦 核心文件

### 已创建的文件

```
✅ vite/packages/table/composables/useWalletService.ts
✅ vite/packages/table/plugins/walletPlugin.ts
✅ vite/packages/table/js/common/walletBridge.ts
✅ vite/packages/table/store/wallet.ts (已更新)
✅ vite/packages/table/js/common/browser.ts (已更新)
✅ vite/packages/table/page/test/WalletTestComponent.vue
✅ vite/public/test-wallet-client.html
```

### 待更新的文件

```
⏳ vite/packages/table/page/Splash.vue
⏳ 主入口文件 (main.ts)
```

## 🔑 核心功能

- ✅ **统一接口**: 所有组件通过相同方式访问钱包
- ✅ **全局共享**: 钱包状态在整个应用中共享
- ✅ **多环境支持**: 支持 Vue 组件、iframe、嵌入浏览器等
- ✅ **状态持久化**: 自动保存连接历史
- ✅ **完整测试**: 提供测试组件和测试用例

## 🧪 测试

访问测试页面：

```
http://localhost:{端口}/test/wallet
```

或直接访问 iframe 测试：

```
http://localhost:{端口}/test-wallet-client.html
```

## 📚 API 参考

### useWalletService

```typescript
const wallet = useWalletService();

// 状态（响应式）
wallet.isConnected; // boolean
wallet.address; // string
wallet.chainId; // number

// 方法
await wallet.initWallet(); // 初始化
await wallet.openWallet(); // 打开连接对话框
await wallet.disconnectWallet(); // 断开连接
wallet.checkInitialized(); // 检查是否已初始化
wallet.getWalletInstance(); // 获取钱包实例
```

### WalletBridge (父窗口)

```typescript
import { WalletBridge } from '@js/common/walletBridge';

const bridge = new WalletBridge(['http://localhost:3000']);
bridge.addAllowedOrigin('https://app.example.com');
```

### WalletClient (iframe)

```typescript
import { WalletClient } from '@js/common/walletBridge';

const client = new WalletClient();

await client.connect();
const status = await client.getStatus();
client.onStatusChange((status) => {
  console.log('状态更新:', status);
});
```

## 💡 使用场景

### 场景 1: 在普通 Vue 组件中

```vue
<script setup>
import { inject } from 'vue';
const wallet = inject('wallet');
</script>
```

### 场景 2: 在内嵌浏览器中

```javascript
import browser from '@js/common/browser';
browser.openInTable('https://app.uniswap.org', { wallet: true });
```

### 场景 3: 在 iframe 中

```html
<script src="walletClient.js"></script>
<script>
  const client = new WalletClient();
  await client.connect();
</script>
```

## ⚠️ 注意事项

1. **单例模式**: 钱包全局只初始化一次
2. **初始化时机**: 在 Splash.vue 中完成初始化
3. **错误处理**: 必须添加 try-catch
4. **安全性**: iframe 通信需验证来源

## 🐛 故障排除

| 问题                  | 解决方案                            |
| --------------------- | ----------------------------------- |
| inject 返回 undefined | 检查是否注册了 walletPlugin         |
| 钱包未初始化          | 确保 Splash.vue 调用了 initWallet() |
| iframe 无法访问钱包   | 确保父窗口已初始化 WalletBridge     |

## 📞 获取帮助

- 查看 [完整方案文档](./Web3Modal钱包集成方案.md)
- 查看 [快速开始指南](./钱包集成快速开始.md)
- 参考 [测试组件](../vite/packages/table/page/test/WalletTestComponent.vue)

## 📝 变更日志

### v1.0 (2026-01-27)

- ✅ 创建核心钱包服务 composable
- ✅ 实现 Vue 插件
- ✅ 添加 iframe 桥接支持
- ✅ 更新 Pinia store
- ✅ 创建完整测试方案
- ✅ 编写详细文档

---

**维护者**: Antigravity AI  
**创建时间**: 2026-01-27  
**版本**: 1.0
