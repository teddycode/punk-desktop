# PunkOS 开发指南 - AI Coding Agent Instructions

## 项目概述

PunkOS（磐古OS）是一个基于 Electron 的跨链浏览器客户端，旨在打通区块链与互联网。项目基于 Min Browser 扩展开发，集成了 Web3 钱包、多标签浏览、密码管理、收藏夹等功能。

**核心技术栈：**
- **主进程：** Electron 26.4.0 + Node.js
- **渲染进程：** Vue 3 + Vite + TypeScript + Ant Design Vue 4
- **数据库：** SQLite3 + Knex.js (主数据) + Dexie (浏览器数据)
- **Web3：** Ethers.js v5 (自定义fork) + WalletConnect v3 + Web3Modal
- **构建：** Webpack 4 (主进程) + Vite (渲染进程) + Electron Builder

## 架构关键点

### 双进程架构
- **主进程 (`main/`)：** 浏览器核心逻辑、窗口管理、IPC通信、扩展系统
- **渲染进程 (`vite/`)：** Vue3应用、桌面工作台、Web3集成
- **通信：** 通过 `ipcMain`/`ipcRenderer` 进行进程间通信，参考 `main/bindIPC.js`

### 关键目录结构
```
main/              # 主进程核心模块（浏览器引擎）
├── main.js        # 主窗口管理、生命周期
├── extension.js   # Chrome扩展支持（MetaMask等）
├── bindIPC.js     # IPC通信绑定
└── render.js      # 自定义协议处理（tsbapp://）

vite/packages/table/  # 桌面工作台（主要开发区域）
├── page/core/        # 核心功能页面（钱包、设置等）
├── store/            # Pinia状态管理
├── route/            # Vue Router路由
└── api/              # 后端API封装

src/                  # 主进程业务逻辑
├── model/            # 数据模型（SQLite）
├── browserApi/       # 浏览器API封装
└── util/             # 工具类（sqldb、ldb等）

js/                   # 浏览器UI脚本（非Vue）
packages/             # 第三方包（本地修改版）
└── ethersjs-punkos/  # 自定义Ethers.js fork
```

## 开发工作流

### 启动开发环境
```bash
# 1. 安装依赖（根目录）
yarn

# 2. 安装渲染进程依赖
cd vite && yarn

# 3. 构建渲染进程（首次或修改后）
cd vite && yarn run build

# 4. 启动开发模式（根目录）
yarn run start  # 自动构建主进程 + 启动Electron
```

**重要：** 代码更新后需清理用户数据目录（右键托盘图标 → 打开数据目录 → 删除）

### 构建流程
- **主进程构建：** `npm run build` → 执行 `scripts/buildMain.js` + `buildBrowser.js` + `buildPreload.js`
- **渲染进程构建：** `cd vite && yarn run build` → Vite多页面打包
- **打包客户端：** `yarn run packageWin` → 先构建渲染进程，再执行 Electron Builder

### 调试技巧
- **主进程调试：** 使用 `console.log` 输出到终端
- **渲染进程调试：** 打开 DevTools（F12）
- **IPC通信调试：** 在 `main/bindIPC.js` 和渲染进程中添加日志
- **数据库查看：** 使用 SQLite 工具打开 `userData/db/db.sqlite`

## 项目特定约定

### 命名规范
- **JS文件：** 小驼峰 `fileManager.js`，单词优先 `preload.js`
- **Vue组件：** 大驼峰文件夹 + `index.vue`，如 `Wallets/index.vue`
- **路由命名：** 小写+连字符，如 `wallet-management`

### 数据库操作
- **主数据库：** 使用 `SqlDb` 类（`src/util/sqldb.js`）
  ```javascript
  const { SqlDb } = require('../util/sqldb');
  const sqlDb = new SqlDb();
  await sqlDb.knex('table_name').where({ id: 1 }).first();
  ```
- **配置存储：** `sqlDb.getConfig(key, defaultValue)` / `sqlDb.setConfig(key, value)`
- **数据迁移：** 在模型初始化时检查列是否存在，参考 `src/model/userModel.js`

### Web3 集成模式
**全局钱包实例：** 在 `vite/packages/table/page/Splash.vue` 中初始化 Web3Modal
```javascript
import { createWeb3Modal, useWeb3ModalProvider, useWeb3ModalAccount } from '@punkos/ethers5/vue';

// 创建全局实例（仅一次）
await createWeb3Modal(walletConfig());

// 在组件中使用
const provider = useWeb3ModalProvider();
const account = useWeb3ModalAccount();
const ethersProvider = new ethers.providers.Web3Provider(provider.walletProvider.value);
```

**合约调用示例：** 参考 `docs/钱包使用说明.md`

### IPC 通信模式
**主进程 → 渲染进程：**
```javascript
// main/main.js
function sendIPCToWindow(window, action, data) {
  if (window && !window.isDestroyed()) {
    window.webContents.send(action, data);
  }
}
```

**渲染进程 → 主进程：**
```javascript
// 渲染进程
const result = await window.ipc.invoke('methodName', args);

// 主进程 (main/bindIPC.js)
ipc.handle('methodName', async (event, args) => {
  return result;
});
```

### 自定义协议
- **tsbapp://** 协议用于加载本地应用页面，支持 localStorage
- **注册位置：** `main/start.js` + `main/render.js`
- **用途：** 桌面应用、工具箱等独立页面

## 常见任务

### 添加新的桌面功能页面
1. 在 `vite/packages/table/page/core/` 创建组件文件夹
2. 在 `vite/packages/table/route/core/` 添加路由配置
3. 在 `vite/packages/table/store/` 添加状态管理（如需要）
4. 在 `vite/packages/table/api/` 添加API接口（如需要）

### 添加主进程功能
1. 在 `main/` 创建新模块文件
2. 在 `scripts/buildMain.js` 的 `modules` 数组中添加文件路径
3. 在 `main/bindIPC.js` 注册 IPC 处理器

### 修改数据库结构
1. 在对应模型文件（`src/model/`）中添加迁移逻辑
2. 使用 `knex.schema.hasColumn()` 检查列是否存在
3. 使用 `knex.schema.table()` 添加新列
4. 参考 `src/model/userModel.js` 的 `initialize()` 方法

## 依赖管理

### 本地修改的包
- **ethersjs-punkos：** 自定义 Ethers.js v5.7.2，位于 `packages/ethersjs-punkos/`
- **electron-chrome-extensions：** 支持 Chrome 扩展，位于 `packages/electron-chrome-extensions/`
- **walletconnect：** WalletConnect SDK，位于 `packages/walletconnect/`

**注意：** 这些包通过相对路径引用，不要使用 `npm install` 覆盖

### 环境变量配置
```bash
# .npmrc 或 .yarnrc
electron_mirror=https://registry.npmmirror.com/mirrors/electron/
ELECTRON_BUILDER_BINARIES_MIRROR=http://registry.npmmirror.com/mirrors/electron-builder-binaries/
node_sqlite3_binary_host_mirror=http://registry.npmmirror.com/mirrors/
registry=https://registry.npmmirror.com
```

## 常见问题

### SQLite3 安装失败
需要管理员权限安装 `windows-build-tools`：
```bash
npm install --global --production windows-build-tools
```

### 渲染进程无法加载
1. 检查 `vite/dist/` 是否存在构建产物
2. 确认 `yarn run build` 在 vite 目录执行成功
3. 清理用户数据目录后重启

### Web3Modal 连接失败
1. 确认 `projectId` 配置正确（WalletConnect Cloud）
2. 检查网络连接和 RPC 节点可用性
3. 查看 `vite/packages/table/page/core/Wallets/events.ts` 的事件监听

### hosts 配置
开发时需要在 `C:\Windows\System32\drivers\etc\hosts` 添加：
```
127.0.0.1 table.com
127.0.0.1 1.table.com
127.0.0.1 2.table.com
```

## 代码风格

- **缩进：** 2空格
- **引号：** 单引号优先
- **分号：** JavaScript 使用分号
- **注释：** 中文注释，关键逻辑必须注释
- **Lint：** 使用 `standard` 规范（主进程），Prettier（渲染进程）

## 参考文档

- **项目文档：** `docs/` 目录
- **钱包集成：** `docs/钱包使用说明.md`
- **钱包集成方案：** `.agent/docs/Web3Modal钱包集成方案.md`
- **钱包测试报告：** `.agent/docs/测试完成报告.md`
- **代码逻辑：** 飞书在线文档（见 `docs/代码逻辑分析.md`）
- **Electron API：** https://www.electronjs.org/docs
- **Ethers.js：** `packages/ethersjs-punkos/docs.wrm/`

## 钱包集成测试

项目已完成完整的 Web3Modal 钱包集成，包含 6 个测试环境：

### 访问测试中心
```
http://localhost:{port}/test/wallet
```

### 测试环境列表
1. **测试1: 基础钱包服务** - 验证插件注册和核心功能
2. **测试2: Splash 环境** - 测试应用启动钱包初始化
3. **测试3: Vue 组件环境** - 测试组件中使用钱包
4. **测试4: 内嵌浏览器环境** - 测试 DApp 钱包自动连接
5. **测试5: iframe 桥接环境** - 测试跨窗口钱包通信
6. **测试6: Dapp 详情页环境** - 测试详情页钱包集成

### 钱包服务使用示例

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

详细文档请查看 `.agent/docs/` 目录。
