# 方案B完整实施 - 测试指南

## ✅ 已完成的实现

### 1. Preload 脚本（js/preload/walletPreload.js）
- ✅ 注入 `window.ipc` 和 `window.wallet`
- ✅ 基础钱包方法：init, connect, disconnect, getState
- ✅ **高级方法：**
  - `getWalletProvider()` - 获取 Provider 代理
  - `queryContract()` - 查询合约（只读）
  - `invokeContract()` - 调用合约（写操作）
  - `signMessage()` - 签名消息
  - `sendTransaction()` - 发送交易

### 2. 主进程 IPC 处理器（src/main/tableTabManager.js）
- ✅ 基础处理器：wallet-init, connect, disconnect, get-state
- ✅ **高级处理器：**
  - `wallet-query-contract` - 查询合约
  - `wallet-invoke-contract` - 调用合约
  - `wallet-sign-message` - 签名消息
  - `wallet-send-transaction` - 发送交易
  - `wallet-get-network` - 获取网络信息
  - `wallet-get-provider` - 获取 Provider

### 3. 桌面钱包服务监听器（vite/packages/table/page/Splash.vue）
- ✅ 新增 `setupWalletIPC()` 方法
- ✅ **10 个 IPC 监听器：**
  1. `wallet-init-request` → 初始化钱包
  2. `wallet-connect-request` → 连接钱包
  3. `wallet-disconnect-request` → 断开钱包
  4. `wallet-get-state-request` → 获取状态
  5. `wallet-get-provider-request` → 获取 Provider
  6. **`wallet-query-contract-request`** → 查询合约（核心功能）
  7. **`wallet-invoke-contract-request`** → 调用合约（核心功能）
  8. `wallet-sign-message-request` → 签名消息
  9. `wallet-send-transaction-request` → 发送交易
  10. `wallet-get-network-request` → 获取网络信息

### 4. 测试页面（vite/html/wallet-test.html）
- ✅ 基础测试：环境检测、连接、断开
- ✅ **新增合约测试：**
  - `testQueryContract()` - 查询 USDT 余额
  - `testInvokeContract()` - USDT 转账交易
  - 完整的日志和状态显示

---

## 🚀 完整测试流程

### 前置准备

#### 1. 准备测试环境
- **移动端钱包：** 安装 MetaMask Mobile（[Android下载](https://github.com/MetaMask/metamask-mobile)）
- **测试网络：** 切换到 Goerli Testnet
- **测试代币：** 领取 Goerli ETH：https://goerlifaucet.com/
- **测试合约：** USDT 地址 `0x8942E52BE95b4f7e7566A91D77308F415DCf1d5D`

#### 2. 构建应用
```bash
# 根目录
cd d:\CodeProjects\Idea\punkos

# 构建渲染进程
cd vite
yarn run build

# 回到根目录，启动应用
cd ..
yarn run start
```

---

### 第 1 阶段：基础测试

#### 1. 打开测试页面
- 在桌面创建图标，配置：
  ```javascript
  {
    type: 'internal',
    value: 'wallet-test.html',
    wallet: true  // 关键参数！
  }
  ```
- 点击图标打开测试页面

#### 2. 验证环境
打开 DevTools (F12)，查看 Console：

**预期日志：**
```
[Wallet Preload] 钱包 preload 脚本开始加载
[Wallet Preload] ✅ IPC 接口注入成功
[Wallet Preload] ✅ Wallet 接口注入成功（含合约调用）
[Wallet Preload] 📦 Wallet Preload 脚本加载完成
========== 页面加载完成 ==========
✅ [环境检测] 环境: Electron
✅ [钱包服务] 找到 window.wallet
```

**检查注入：**
```javascript
typeof window.wallet  // "object"
typeof window.ipc     // "object"

// 检查合约方法
typeof window.wallet.queryContract    // "function"
typeof window.wallet.invokeContract   // "function"
```

#### 3. 连接钱包
1. 点击"连接钱包"按钮
2. 在移动端 MetaMask 打开 WalletConnect 扫码
3. 等待连接成功

**预期日志：**
```
[Wallet Preload] openWallet 调用
[TableTabManager IPC] wallet-connect 调用
[Splash] 收到钱包连接请求
[Splash] 钱包连接成功: 0x1423...d4CF
✅ [连接钱包] 钱包连接成功, 地址: 0x1423...d4CF
```

---

### 第 2 阶段：合约查询测试

#### 1. 查询 USDT 余额
点击"查询合约（USDT余额）"按钮

**完整调用链路：**
```
内嵌网页 (wallet-test.html)
  ↓ window.wallet.queryContract(USDT_ADDRESS, USDT_ABI, 'balanceOf', [address])
  
Preload (walletPreload.js)
  ↓ ipcRenderer.invoke('wallet-query-contract', { contractAddress, abi, method, params })
  
主进程 (tableTabManager.js)
  ↓ ipc.handle('wallet-query-contract')
  ↓ tableWin.webContents.send('wallet-query-contract-request', data)
  
桌面主窗口 (Splash.vue)
  ↓ ipc.on('wallet-query-contract-request')
  ↓ const provider = useWeb3ModalProvider()
  ↓ const contract = new ethers.Contract(address, abi, provider)
  ↓ const result = await contract.balanceOf(address)
  ↓ ipc.send('wallet-query-contract-complete', { success: true, data: result })
  
主进程
  ↓ ipc.once('wallet-query-contract-complete', listener)
  ↓ resolve(result)
  
Preload
  ↓ return result.data
  
内嵌网页
  ↓ 显示余额
```

**预期日志：**
```javascript
[Wallet Test] 查询地址: 0x1423f4ceC7fCBE8400A957121ad616C439a0d4CF
[Wallet Test] 合约地址: 0x8942E52BE95b4f7e7566A91D77308F415DCf1d5D
[Wallet Test] 调用方法: balanceOf

[Wallet Preload] queryContract 调用: { contractAddress, method: "balanceOf", params: [...] }
[TableTabManager IPC] wallet-query-contract 调用
[Splash] 收到查询合约请求
[Splash] 调用合约方法: balanceOf 参数: ["0x1423..."]
[Splash] 合约查询结果: 1000000000 // 示例值
[TableTabManager IPC] wallet-query-contract 响应: { success: true, data: "1000000000" }
[Wallet Preload] queryContract 结果: 1000000000

✅ [查询合约] 查询成功！余额: 1000000000
✅ 余额（格式化）: 1000 USDT
```

---

### 第 3 阶段：合约调用测试（核心功能）

#### 1. USDT 转账交易
点击"调用合约（USDT转账）"按钮

**完整调用链路：**
```
内嵌网页
  ↓ window.wallet.invokeContract(USDT_ADDRESS, USDT_ABI, 'transfer', [to, amount])
  
Preload
  ↓ ipcRenderer.invoke('wallet-invoke-contract', { contractAddress, abi, method, params })
  
主进程
  ↓ ipc.handle('wallet-invoke-contract')
  ↓ tableWin.webContents.send('wallet-invoke-contract-request', data)
  
桌面主窗口 (Splash.vue)
  ↓ ipc.on('wallet-invoke-contract-request')
  ↓ const provider = useWeb3ModalProvider()
  ↓ const signer = await provider.getSigner()  ⚡ 获取签名器
  ↓ const contract = new ethers.Contract(address, abi, signer)  ⚡ 使用签名器
  ↓ const tx = await contract.transfer(to, amount)  ⚡ 发起交易
  ↓ // 移动端钱包弹出签名请求
  ↓ // 用户确认后交易发送
  ↓ ipc.send('wallet-invoke-contract-complete', { success: true, data: tx })
  
主进程
  ↓ ipc.once('wallet-invoke-contract-complete', listener)
  ↓ resolve(result)
  
Preload
  ↓ return result.data  // 交易对象
  
内嵌网页
  ↓ 显示交易哈希、Gas等信息
```

**预期流程：**

1. **浏览器确认框**
   ```
   确认要转账 10 USDT 到测试地址吗？
   
   目标地址: 0x437a5079CE5f89A62bc74e66e5f5a772Eb31CaB9
   
   这将在移动端钱包弹出签名请求
   
   [确定] [取消]
   ```

2. **构造交易（日志）**
   ```
   [Wallet Test] 发送地址: 0x1423f4ceC7fCBE8400A957121ad616C439a0d4CF
   [Wallet Test] 接收地址: 0x437a5079CE5f89A62bc74e66e5f5a772Eb31CaB9
   [Wallet Test] 转账金额: 10 USDT
   [Wallet Test] 合约地址: 0x8942E52BE95b4f7e7566A91D77308F415DCf1d5D
   ⏳ 正在构造交易...
   ⏳ 等待用户签名...（请在移动端钱包确认）
   ```

3. **移动端 MetaMask 弹窗**
   - 显示交易详情：发送地址、接收地址、Gas费
   - 用户点击"确认"按钮

4. **交易发送成功（日志）**
   ```
   [Splash] 交易已发送: 0xabcd1234...
   [TableTabManager IPC] wallet-invoke-contract 响应: { success: true, data: {...} }
   [Wallet Preload] invokeContract 结果: { hash: "0xabcd1234...", ... }
   
   ✅ [调用合约] 交易已发送！
   ✅ 交易哈希: 0xabcd1234...
   📊 Gas Limit: 51000
   📊 Gas Price: 1000000000
   📊 Nonce: 123
   ⏳ 交易已发送，等待确认...（约15-30秒）
   📎 可在 Etherscan 查看: https://goerli.etherscan.io/tx/0xabcd1234...
   ```

5. **10秒后自动查询余额**
   ```
   ⏳ 查询转账后的余额...
   ✅ 当前余额: 990 USDT
   ```

---

## 🎯 验证标准

### ✅ 基础功能验证
- [ ] 环境检测显示"Electron" ✅
- [ ] 钱包服务显示"可用 (window.wallet)" ✅
- [ ] 可以连接钱包，显示地址和链ID
- [ ] 可以断开钱包
- [ ] 状态检查正确反映当前状态

### ✅ 合约查询验证
- [ ] 能够调用 `queryContract()` 方法
- [ ] 成功查询到 USDT 余额
- [ ] 日志显示完整的 IPC 通信链路
- [ ] 余额数值正确（可在 Etherscan 对比）

### ✅ 合约调用验证（核心）
- [ ] 能够调用 `invokeContract()` 方法
- [ ] 移动端钱包弹出签名请求
- [ ] 用户确认后交易成功发送
- [ ] 返回完整的交易对象（hash, gasLimit, gasPrice等）
- [ ] 可在 Etherscan 查看交易记录
- [ ] 交易确认后余额变化正确

---

## 📋 完整 API 文档

### window.wallet 对象

#### 基础方法
```javascript
// 初始化钱包
await window.wallet.initWallet()
// 返回: { success: true, initialized: true/false }

// 连接钱包
await window.wallet.openWallet()
// 返回: { success: true, address: "0x...", chainId: 1 }

// 断开钱包
await window.wallet.disconnectWallet()
// 返回: { success: true }

// 获取钱包状态
await window.wallet.getWalletState()
// 返回: { 
//   success: true, 
//   initialized: true, 
//   connected: true, 
//   address: "0x...", 
//   chainId: 5 
// }
```

#### 高级方法（合约调用）
```javascript
// 查询合约（只读，不消耗gas）
const balance = await window.wallet.queryContract(
  contractAddress,  // 合约地址
  abi,              // 合约 ABI 数组
  methodName,       // 方法名
  params            // 参数数组
)

// 示例：查询 ERC20 余额
const balance = await window.wallet.queryContract(
  '0x8942E52BE95b4f7e7566A91D77308F415DCf1d5D',
  [
    'function balanceOf(address) view returns (uint256)',
  ],
  'balanceOf',
  ['0x1423f4ceC7fCBE8400A957121ad616C439a0d4CF']
)

// 调用合约（写操作，需要签名，消耗gas）
const tx = await window.wallet.invokeContract(
  contractAddress,  // 合约地址
  abi,              // 合约 ABI 数组
  methodName,       // 方法名
  params            // 参数数组
)

// 示例：ERC20 转账
const tx = await window.wallet.invokeContract(
  '0x8942E52BE95b4f7e7566A91D77308F415DCf1d5D',
  [
    'function transfer(address to, uint256 amount)',
  ],
  'transfer',
  ['0x437a5079CE5f89A62bc74e66e5f5a772Eb31CaB9', '10000000']
)

// 签名消息
const signature = await window.wallet.signMessage('Hello World')

// 发送交易
const tx = await window.wallet.sendTransaction({
  to: '0x...',
  value: '1000000000000000000', // 1 ETH (wei)
  data: '0x...'
})
```

---

## 🐛 故障排查

### 问题 1：环境检测失败
**现象：** 显示"非 electron"
**原因：** Preload 脚本未加载
**解决：**
1. 确认 `wallet: true` 参数正确传递
2. 检查主进程日志是否有 `[TableTabManager] 🔐 钱包功能已启用`
3. 检查 preload 脚本路径：`js/preload/walletPreload.js`

---

### 问题 2：查询合约超时
**现象：** 30秒后显示"查询合约超时"
**原因：** 桌面钱包服务未响应
**解决：**
1. 检查 Splash.vue 中是否添加了 `setupWalletIPC()` 调用
2. 检查 DevTools Console 是否有 `[Splash] 设置钱包 IPC 监听器`
3. 检查是否重新构建了渲染进程 (`cd vite && yarn run build`)

---

### 问题 3：移动端钱包不弹窗
**现象：** 调用合约后移动端无反应
**原因：** 钱包未正确连接或网络不匹配
**解决：**
1. 确认移动端钱包已连接到 Goerli 测试网
2. 在测试页面点击"检查状态"，确认 connected 为 true
3. 重新扫码连接钱包

---

### 问题 4：交易失败
**现象：** 移动端确认后显示"调用失败"
**可能原因：**
- Gas 不足：在 Goerli Faucet 领取测试 ETH
- USDT 余额不足：先查询余额确认
- 网络拥堵：等待后重试
- 合约地址错误：确认合约地址正确

**调试：**
1. 查看 Console 中的完整错误信息
2. 查看主进程终端的错误日志
3. 在 Etherscan 查看地址余额和历史交易

---

## 📊 日志分析

### 完整成功日志示例

```javascript
// 1. 页面加载
[Wallet Preload] 钱包 preload 脚本开始加载
[Wallet Preload] ✅ IPC 接口注入成功
[Wallet Preload] ✅ Wallet 接口注入成功（含合约调用）
========== 页面加载完成 ==========
✅ [环境检测] 环境: Electron
✅ [钱包服务] 找到 window.wallet

// 2. 连接钱包
[Wallet Preload] openWallet 调用
[TableTabManager IPC] wallet-connect 调用
[Splash] 收到钱包连接请求
[Splash] 钱包连接成功: 0x1423f4ceC7fCBE8400A957121ad616C439a0d4CF
✅ [连接钱包] 钱包连接成功

// 3. 查询合约
[Wallet Preload] queryContract 调用
[TableTabManager IPC] wallet-query-contract 调用
[Splash] 收到查询合约请求
[Splash] 调用合约方法: balanceOf
[Splash] 合约查询结果: 1000000000
✅ [查询合约] 余额: 1000 USDT

// 4. 调用合约
[Wallet Preload] invokeContract 调用
[TableTabManager IPC] wallet-invoke-contract 调用
[Splash] 收到调用合约请求
[Splash] 调用合约方法（写）: transfer
[Splash] 交易已发送: 0xabcd1234...
✅ [调用合约] 交易哈希: 0xabcd1234...
```

---

## 🎉 成功标准

当你看到以下完整流程时，说明方案B成功实施：

1. ✅ 内嵌网页环境检测通过
2. ✅ 钱包服务可用
3. ✅ 成功连接钱包（WalletConnect）
4. ✅ 成功查询合约（USDT 余额）
5. ✅ **成功调用合约（USDT 转账）**
6. ✅ **移动端钱包弹出签名请求**
7. ✅ **交易成功上链**
8. ✅ **可在 Etherscan 查看交易记录**

**恭喜！你已经完全实现了方案B，内嵌网页可以完整使用 Web3Modal 钱包服务了！** 🎊
