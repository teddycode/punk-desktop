# PunkOS Desktop 代码导航

本文件面向后续维护者和 Codex，用来快速定位项目结构、关键依赖版本以及磐古系统核心前端代码。当前仓库是 Electron 桌面客户端，渲染端核心工作台在 `vite/`，磐古系统核心前端主要在 `vite/packages/table/page/core`。

## 项目关键结构

| 路径 | 说明 |
| --- | --- |
| `package.json` | 根工程配置，定义 Electron 主进程构建、打包和桌面启动脚本，产品版本为 `1.1.2`。 |
| `.nvmrc` | Node.js 版本为 `18.4.0`。 |
| `main/` | Electron 主进程代码，包括窗口、菜单、托盘、IPC、下载、扩展、权限和本地服务管理。`main/serviceManager.js` 管理本地服务生命周期。 |
| `main.build.js` | 根工程打包后的主进程入口，`package.json` 的 `main` 指向此文件。 |
| `src/` | 预加载、本地能力和桌面 API 相关代码。 |
| `vite/` | Vite 渲染端工程，包含多页面 HTML、桌面工作台、前端构建配置和渲染端依赖。 |
| `vite/vite.config.ts` | Vite 配置，定义多 HTML 入口、Vue 插件、Tailwind/PostCSS、别名和构建分包。 |
| `vite/packages/table/` | 桌面工作台主前端应用，入口包括 `main.ts`、`App.vue`、`router.ts`、`store.ts`。 |
| `vite/packages/table/route/` | 工作台路由。`second.ts` 挂载 `/core` 和其他二级应用，`route/core/*.ts` 定义磐古核心区各模块路由。 |
| `vite/packages/table/page/` | 工作台页面。磐古核心页面集中在 `page/core`。 |
| `vite/packages/table/components/` | 工作台通用组件，例如底部面板、窗口组件和桌面小组件。 |
| `vite/packages/table/composables/` | Vue composables，例如钱包服务组合逻辑 `useWalletService.ts`。 |
| `vite/packages/table/services/` | 渲染端服务封装，包含跨链等业务服务。 |
| `vite/packages/table/store/` | 渲染端状态管理相关代码。 |
| `vite/packages/table/assets/` | 渲染端静态资源和样式资源。 |
| `packages/` | 本地 vendored 包和改造过的第三方包，例如 `ethersjs-punkos`、`web3modal`、`dragula`、`loudness`、Electron 扩展相关包。 |
| `services/` | 本地或配套服务。当前包括 `crosschain`、`governance/fronted`、`node-monitor`、`pot-mock`。 |
| `scripts/` | 根工程构建、打包和服务构建脚本。 |
| `docs/` | 项目文档。 |
| `examples/` | 示例应用。 |
| `api/` | 应用/服务元数据，例如 `apps.json`、`apps2.json`。 |

## 核心依赖版本

### 根工程与 Electron

| 依赖 | 版本 |
| --- | --- |
| Node.js | `18.4.0` |
| PunkOS Desktop | `1.1.2` |
| Electron | `26.4.0` |
| `@electron/remote` | `^2.0.1` |
| `electron-builder` | `23.2.0` |
| `electron-updater` | `^4.3.9` |
| Webpack | `4.44.1` |
| Standard | `^14.3.4` |
| Prettier | `^2.2.1` |
| `sqlite3` | `5.0.10` |
| `knex` | `^2.4.2` |
| `dexie` | `^3.0.3` |
| `pouchdb` / `pouchdb-find` | `^8.0.1` |
| `axios` | `^0.24.0` |
| `lodash` | `^4.17.21` |
| `@grpc/grpc-js` | `^1.8.14` |
| `systeminformation` | `^5.17.12` |
| `keytar` | `7.9` |

### Vite 渲染端

| 依赖 | 版本 |
| --- | --- |
| Vite | `^2.9.16` |
| `@vitejs/plugin-vue` | `^2.3.3` |
| TypeScript | `^4.5.4` |
| Vue | `^3.3.4` |
| Vue Router | `4.1.3` |
| Vuex | `^4.0.2` |
| Pinia | `^2.0.23` |
| Ant Design Vue | `4.1.2` |
| `@ant-design/icons-vue` | `^6.1.0` |
| Element Plus | `^2.3.8` |
| `@iconify/vue` | `^4.1.1` |
| Tailwind CSS | `^3.2.7` |
| Sass | `^1.53.0` |
| Less | `^4.1.3` |
| Axios | `^1.6.1` |
| ECharts | `^5.4.1` |
| `ethers` | `../packages/ethersjs-punkos/packages/ethers` |
| `@ethersproject/*` | `../packages/ethersjs-punkos/packages/*` |
| `@punkos/ethers5` | `^3.5.7` |
| Web3 | `^4.0.2` |
| `wujie-vue3` | `^1.0.18` |
| `socket.io-client` | `^4.7.2` |
| `tim-js-sdk` | `^2.27.1` |
| `@tencentcloud/chat-uikit-vue` | `^1.4.4` |
| `@wangeditor/editor` | `^5.1.23` |
| `@wangeditor/editor-for-vue` | `^5.1.12` |

### Vite 别名

`vite/vite.config.ts` 中的常用别名：

| 别名 | 指向 |
| --- | --- |
| `@package` | `vite/packages` |
| `@table` | `vite/packages/table` |
| `@page` | `vite/packages/table/page` |
| `@store` | `vite/packages/table/store` |
| `@route` | `vite/packages/table/route` |
| `@apps` | `vite/packages/table/apps` |
| `@components` | `vite/packages/table/components` |
| `@assets` | `vite/packages/table/assets` |
| `@js` | `vite/packages/table/js` |
| `@governance-fronted` | `services/governance/fronted` |

## 磐古核心前端目录

核心前端入口路径：`vite/packages/table/page/core`。

核心路由挂载路径：`vite/packages/table/route/second.ts` 中的 `/core`，子路由来自 `vite/packages/table/route/core/*.ts`。

### 通用骨架

| 目录 | 说明 |
| --- | --- |
| `vite/packages/table/page/core/Layouts` | 核心区布局组件，包含 `SecondLayout.vue`、`ThirdLayout.vue` 和 header、aside、footer、breadcrumb、pathBar 等布局子组件。 |
| `vite/packages/table/page/core/components` | 核心区共享组件，包括背景、加载态、颜色选择器、分页、形状按钮和 `Table` 组件。 |

### 各功能区前端目录

| 功能区 | 前端代码目录 | 路由文件 | 主要页面/说明 |
| --- | --- | --- | --- |
| 计算区 | `vite/packages/table/page/core/Computing` | `vite/packages/table/route/core/computing.ts` | `index.vue`，路由名 `ComputingPage`。 |
| 共识区 | `vite/packages/table/page/core/Consensus` | `vite/packages/table/route/core/consensus.ts` | `detail.vue`、`self.vue`、`node.vue`、`PotVisualization.vue`、`potTransaction.vue`，以及 `data/` 下区块模拟数据。 |
| 密码/加密区 | `vite/packages/table/page/core/Crypto` | `vite/packages/table/route/core/crypto.ts` | `index.vue`、`data.ts`，路由名 `CryptoPage`。 |
| 交易区 | `vite/packages/table/page/core/Exchange` | `vite/packages/table/route/core/exchange.ts` | `index.vue` 和 `components/` 下的 `MyExchange`、`TokenPage`、`Trade`、`LimitOrder`、`OrderPage`、`DepositToken`；`services/` 存放合约调用、地址、价格、swap、withdraw、ABI 等。 |
| 治理区 | `vite/packages/table/page/core/Governance_v1` | `vite/packages/table/route/core/governance.ts` | 当前路由实际使用的治理前端。包含 `Home`、`Proposals`、`ProposalDetail`、`UpgradeProposalDetail`、`CreateProposal`、`Stake`、`Treasury`、`SystemSpecialTransaction`，并有 `services/`、`store/`、`component/`。 |
| 旧治理区 | `vite/packages/table/page/core/Governance` | 旧路由代码已在 `route/core/governance.ts` 中注释 | 保留旧版治理页面和大量合约 ABI，修改治理功能时优先确认是否应改 `Governance_v1`。 |
| 网络区 | `vite/packages/table/page/core/Network` | `vite/packages/table/route/core/network.ts` | `index.vue` 以及 `components/account.vue`、`vpn.vue`、`management.vue`、`node.vue`、`stake.vue`。 |
| 转账区 | `vite/packages/table/page/core/Transfers` | `vite/packages/table/route/core/transfers.ts` | `index.vue`、`componnets/myTransfer.vue`、`componnets/TransferRecord.vue`。目录名 `componnets` 为现有拼写。 |
| 收藏区 | `vite/packages/table/page/core/Collections` | `vite/packages/table/route/core/collection.ts` | `index.vue`、`mock.ts`。 |
| 存储区 | `vite/packages/table/page/core/Storage` | `vite/packages/table/route/core/storage.ts` | 链下存储页面主要在 `offchainStorage/Market.vue`、`Orders.vue`、`Resource.vue`。 |
| 钱包区 | `vite/packages/table/page/core/Wallets` | `vite/packages/table/route/core/wallets.ts` | `index.vue`、`TransList.vue`、`components/Info.vue`、`components/TaskForm.vue`、`data.ts`、`events.ts`；`vite/packages/table/composables/useWalletService.ts` 也会接入钱包事件监听。 |
| 区块链浏览器区 | `vite/packages/table/page/core/Explorer` | `vite/packages/table/route/core/explorer.ts` | `index.vue`、`BlockList`、`TransactionList`、`BlockInfo`、`TransactionInfo`、`AccountInfo`，以及 `data/mock.js`、`data/transactions.js`。 |
| DApp 市场区 | `vite/packages/table/page/core/DappMarket` | `vite/packages/table/route/core/DappMarket.ts` | DApp、合约、CApp、质押、我的项目、收藏、提交 DApp、API、详情页等市场相关页面。部分页面也被 `page/app/card/NewDAppCard.vue` 直接引用。 |
| 跨链区 | `vite/packages/table/page/core/CrossChain` | `vite/packages/table/route/core/crosschain.ts` | `Multichain`、`Bridge`、`Relay`、`Manager`、`Transaction`、`Block`、`CrossChainTasks`、`CrossTasksCreated`；`styles/` 存放样式，`utils/` 存放工具，`relay-scripts/` 和 `relay-bundles/` 存放中继脚本/包。目录名 `commponents` 为现有拼写。 |
| 用户设置区 | `vite/packages/table/page/core/userSettings` | `vite/packages/table/route/core/userSettings.ts` | `index.vue`，用于权限/开关设置。 |
| CApp 运行器 | `vite/packages/table/page/core/CAppRunner` | `vite/packages/table/route/second.ts` | `/cAppRunner` 路由直接挂载 `CAppRunner/index.vue`，不在 `/core` 子路由内。 |
| 桌面/远程桌面视图 | `vite/packages/table/page/core/Desktop` | 当前未在 `route/core` 直接挂载 | `Home.vue`、`AppView.vue`、`components/vue-vnc.vue`。 |
| PunkClaw | `vite/packages/table/page/core/PunkClaw` | 由 `vite/packages/table/page/MainLayout.vue` 引用 | AI/任务编排相关前端，包括 `PunkClaw.vue`、命令面板、上下文面板、模型设置抽屉、状态看板和执行日志。 |

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `yarn` | 安装根工程依赖。 |
| `cd vite && yarn` | 安装 Vite 渲染端依赖。 |
| `yarn start` | 在根目录启动开发环境，会同时启动 watch、Vite dev server 和 Electron。 |
| `yarn build` | 构建根工程主进程、浏览器资源、样式和 preload。 |
| `cd vite && yarn build` | 构建渲染端资源。 |
| `yarn packageWin` | 构建 Vite 资源并打包 Windows 客户端。 |
| `yarn test` | 运行根工程 JS lint：`standard --verbose js/**/*.js main/*.js`。 |

## 维护提示

- 修改磐古系统核心页面时，优先从 `vite/packages/table/page/core/<功能区>` 和对应 `vite/packages/table/route/core/<功能区>.ts` 同步查看。
- 治理模块当前实际挂载的是 `Governance_v1`，`Governance` 目录主要保留旧页面和 ABI。
- `CrossChain`、`Exchange`、`Governance_v1` 与合约、钱包和本地/外部服务耦合较深，改动前同时检查 `vite/packages/table/services/`、`services/` 和相关 ABI/地址配置。
- 本仓库存在多个本地包和 vendored 包，依赖升级前先确认是否有本地改造，不要直接替换为上游 npm 包。
