# PunkOS Desktop

PunkOS Desktop 是一个基于 Electron 的桌面客户端项目，用于承载浏览器能力、桌面工作台和 Web3 应用场景。

- 官网：https://www.punkos.com
- 桌面前端：`vite/`
- 主进程与本地能力：`main/`、`src/`
- 项目文档：`docs/`

## 技术概览

- Electron 26
- Vue 3 + Vite
- SQLite + Knex
- Yarn 作为依赖安装器
- 支持页面级应用、网页级应用和部分钱包能力接入

## 目录说明

| 目录 | 说明 |
|------|------|
| `main/` | Electron 主进程代码 |
| `src/` | 预加载、本地模型、桌面 API |
| `vite/` | 渲染进程与桌面工作台页面 |
| `pages/` | 主进程页面资源 |
| `packages/` | 本地第三方扩展包 |
| `res/` | 二进制资源 |
| `scripts/` | 构建脚本 |
| `docs/` | 项目文档 |

## 环境要求

- Node.js `18.04`（使用 `nvm` 时可对应 `18.4.0`）
- Yarn `1.x`
- Python `3.10+`
- Windows 下建议提前准备 C/C++ 构建工具，避免 `sqlite3`、`node-hid` 等原生依赖安装失败

依赖下载较慢时，可按需配置镜像环境变量：

```bash
electron_mirror=https://registry.npmmirror.com/mirrors/electron/
ELECTRON_BUILDER_BINARIES_MIRROR=http://registry.npmmirror.com/mirrors/electron-builder-binaries/
node_sqlite3_binary_host_mirror=http://registry.npmmirror.com/mirrors/
sass_binary_site=https://registry.npmmirror.com/mirrors/node-sass/
PYTHON_MIRROR=http://registry.npmmirror.com/mirrors/python
profiler_binary_host_mirror=http://registry.npmmirror.com/mirrors/node-inspector/
registry=https://registry.npmmirror.com
canvas_binary_host_mirror=https://registry.npmmirror.com/-/binary/canvas
```

## 安装依赖

```bash
git clone --recurse-submodules <repo-url>
cd punk-desktop
nvm install 18.4.0
nvm use 18.4.0
yarn
cd vite
yarn
cd ..
```

首次安装后，建议先执行一次前端构建：

```bash
cd vite
yarn build
cd ..
```

## 本地启动

### 1. 可选：配置 hosts

在 `C:\Windows\System32\drivers\etc\hosts` 中加入：

```text
127.0.0.1 table.com
127.0.0.1 1.table.com
127.0.0.1 2.table.com
127.0.0.1 3.table.com
127.0.0.1 4.table.com
127.0.0.1 5.table.com
127.0.0.1 6.table.com
```

当前开发模式默认走 `localhost:1600`，本地启动通常不再依赖这些 `hosts` 映射。
只有在你需要兼容旧的多域名调试方式时，才需要配置这一步。若本机开了代理，请将这些域名加入直连列表。

### 2. 启动开发环境

```bash
yarn start
```

在项目根目录执行即可。当前根目录的 `yarn start` 会同时拉起：

- `watch`
- `vite` 开发服务
- Electron

不需要再单独进入 `vite` 目录启动一次渲染进程。

如果代码改动后界面没有更新，先退出 Electron，再删除用户数据目录后重启。可通过托盘菜单打开数据目录。

## 常用命令

| 命令 | 说明 |
|------|------|
| `yarn build` | 构建主进程与浏览器相关资源 |
| `cd vite && yarn build` | 构建桌面前端资源 |
| `yarn start` | 启动桌面客户端 |
| `yarn packageWin` | 打包 Windows 客户端 |
| `yarn package` | 使用 `electron-builder` 打包 |
| `yarn lint` | 格式化并修复部分代码风格问题 |

## 开发说明

- 本地后端默认地址：`http://127.0.0.1:9090`
- 远程服务端地址：`http://punk.buaadcl.tech:36066`
- 本地与远程切换目前通过全局搜索替换完成

## 常见问题

### 依赖安装失败或速度慢

- 确认使用 `yarn`
- 检查镜像环境变量或执行 `yarn config set registry https://registry.npmmirror.com/`

### Electron 相关依赖下载失败

```bash
yarn config set electron_mirror https://cdn.npmmirror.com/binaries/electron/
yarn config set electron_builder_binaries_mirror https://npmmirror.com/mirrors/electron-builder-binaries/
```

### `sqlite3` 编译失败

- 确认 Python 和系统构建工具已安装
- Windows 下优先使用管理员终端

### 缺少 `dragula.min.css`

如果启动时报 `dragula.min.css` 缺失，可复制：

```text
node_modules/dragula/dist/dragula.css
```

为：

```text
node_modules/dragula/dist/dragula.min.css
```

## 文档索引

详细说明请查看 [docs/README.md](./docs/README.md)。

| 文档 | 说明 |
|------|------|
| [docs/钱包使用说明.md](./docs/钱包使用说明.md) | 钱包与合约调用接入说明 |
| [docs/SQLiteStorageAnalysis.md](./docs/SQLiteStorageAnalysis.md) | 本地 SQLite 存储说明 |
| [docs/table-ui-libs.md](./docs/table-ui-libs.md) | Table UI 基础组件速查 |
| [docs/pledge_api_reference.md](./docs/pledge_api_reference.md) | 质押 RPC 接口速查 |

## 开源说明

本项目基于 Electron 生态与开源浏览器能力扩展实现，桌面前端部分参考并整合了已有开源工作台方案；后端服务不在本仓库中。
