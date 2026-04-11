# Web3Modal 复制功能修复

## 问题描述

在 Electron 环境中使用 WalletConnect 时，点击 "Copy link" 按钮显示 "Failed to copy" 错误。

## 根本原因

1. **异步 Promise 未处理：** `navigator.clipboard.writeText()` 返回一个 Promise，原代码没有 await
2. **Electron 环境限制：** 在某些上下文中，Clipboard API 可能因为权限或安全策略被拒绝
3. **缺少备用方案：** 没有降级处理机制

## 修复方案

### 1. 改进 `CoreHelperUtil.copyToClopboard` 方法

**文件：** `packages/web3modal/packages/core/src/utils/CoreHelperUtil.ts`

**改进点：**
- ✅ 将函数改为 `async`，正确处理 Promise
- ✅ 添加 try-catch 错误处理
- ✅ 实现备用方案：使用传统的 `document.execCommand('copy')`

**代码逻辑：**
```
1. 优先尝试 navigator.clipboard.writeText()
   ↓ 失败
2. 降级到 document.execCommand('copy')
   ↓ 仍失败
3. 抛出错误给调用者处理
```

### 2. 更新调用方法

**修改的文件：**
1. `packages/web3modal/packages/scaffold/src/utils/w3m-connecting-widget/index.ts`
   - `onCopyUri()` 方法改为 async
   - 添加 await 调用
   - 增强错误日志

2. `packages/web3modal/packages/scaffold/src/views/w3m-account-view/index.ts`
   - `onCopyAddress()` 方法改为 async
   - 添加 await 调用
   - 增强错误日志

## 技术细节

### Clipboard API 的限制

在 Electron 中，`navigator.clipboard` API 需要满足以下条件：
1. **HTTPS 或 localhost：** 必须在安全上下文中
2. **用户激活：** 需要由用户手势触发
3. **权限策略：** 需要正确的 Feature Policy 配置

### 备用方案：execCommand

`document.execCommand('copy')` 是一个已废弃但仍然有效的 API：
- ✅ 兼容性好，在 Electron 中更可靠
- ✅ 不需要异步处理
- ⚠️ 已标记为废弃（但仍被广泛支持）

### 实现细节

```typescript
// 创建隐藏的 textarea
const textArea = document.createElement('textarea')
textArea.value = text
textArea.style.position = 'fixed'
textArea.style.left = '-999999px'  // 移出视口
document.body.appendChild(textArea)
textArea.select()                   // 选中文本
document.execCommand('copy')        // 执行复制
document.body.removeChild(textArea) // 清理
```

## 测试验证

### 测试场景
1. ✅ WalletConnect QR 码页面 - 点击 "Copy link"
2. ✅ 账户详情页面 - 点击地址旁的复制按钮
3. ✅ 在不同钱包连接状态下测试

### 预期结果
- ✅ 成功复制时显示 "Link copied" / "Address copied"
- ✅ 失败时显示 "Failed to copy" 并在控制台输出详细错误
- ✅ 在 Electron 环境中可靠工作

## 相关权限配置

项目中已配置的剪贴板权限（`main/permissionManager.js`）：
```javascript
const allowPermissions = [
  'clipboard-sanitized-write',  // 写入剪贴板
  'clipboard-read',              // 读取剪贴板
  // ... 其他权限
];
```

这些权限已经正确配置，修复后应该可以正常工作。

## 构建和测试

```bash
# 1. 重新构建渲染进程
cd vite
yarn run build

# 2. 启动应用
cd ..
yarn run start

# 3. 测试复制功能
# - 打开 WalletConnect 连接界面
# - 点击 "Copy link" 按钮
# - 应该显示 "Link copied" 并成功复制到剪贴板
```

## 注意事项

1. **错误日志：** 如果复制仍然失败，检查浏览器控制台的详细错误信息
2. **Electron 版本：** 确保 Electron 版本支持 Clipboard API（项目使用 26.4.0，完全支持）
3. **CSP 策略：** 确保没有内容安全策略阻止 Clipboard API

## 相关文件

- [packages/web3modal/packages/core/src/utils/CoreHelperUtil.ts](d:\CodeProjects\Idea\punkos\packages\web3modal\packages\core\src\utils\CoreHelperUtil.ts)
- [packages/web3modal/packages/scaffold/src/utils/w3m-connecting-widget/index.ts](d:\CodeProjects\Idea\punkos\packages\web3modal\packages\scaffold\src\utils\w3m-connecting-widget\index.ts)
- [packages/web3modal/packages/scaffold/src/views/w3m-account-view/index.ts](d:\CodeProjects\Idea\punkos\packages\web3modal\packages\scaffold\src\views\w3m-account-view\index.ts)
- [main/permissionManager.js](d:\CodeProjects\Idea\punkos\main\permissionManager.js)
