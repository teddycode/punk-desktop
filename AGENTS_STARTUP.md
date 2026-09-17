# PunkOS Desktop 启动与调试指南（面向后续 Agent）

本文件只讲**怎么把项目跑起来**和**怎么调试**。项目结构、目录职责、依赖版本请看根目录 `AGENTS.md`。

> **先读这三条，能省掉大部分时间**
>
> 1. **启动只有一条命令**：`npm run start`。不要手工拆开启动 vite 和 electron。
> 2. **渲染端 dev server 端口是 1600**（写在 `vite/script/dev.js`），不是 vite 默认的 5173。
> 3. **同一时刻只跑一个 Electron 实例**。多开会互相抢资源，表现为页面全白。

---

## 0. 本机环境的两个限制（会影响你用什么方式执行命令）

| 限制 | 现象 | 应对 |
| --- | --- | --- |
| **bash 工具不可用** | 任何 bash 命令都返回 `WSL (xx - Relay) ERROR: CreateProcessCommon:800: execvpe(/bin/bash) failed` | 改用 `ctx_execute`（javascript/shell 沙箱）里的 `child_process.execSync/spawn` 执行命令；或让用户在自己的 PowerShell 里执行 |
| **`npm`/`node` 在 PATH 上** | `node -v` 可用（本机 Node 18+） | 长跑进程用 `spawn(..., {detached:true, stdio:['ignore',logFd,logFd]})` + `unref()`，输出重定向到文件再读，避免阻塞 |

**给 Agent 的建议**：不要在仓库根目录里创建临时目录（我踩过：用 `--user-data-dir` 在仓库里留了个 Electron 缓存目录，一下多出 2400+ 个未跟踪文件）。必须用临时 user-data 时，放到系统临时目录（如 `%TEMP%\punkos-agent-xxx`）。

---

## 1. 启动项目

### 1.1 唯一正确方式

```powershell
# 在仓库根目录
npm run start        # 等价于 yarn start
```

它展开为（`package.json` 原文：`npm run build && concurrently "npm run watch" "npm run startRender" "npm run startElectron"`）：

```
npm run build                              # buildMain + buildBrowser + buildBrowserStyles + buildPreload
concurrently
  ├─ npm run watch        → node ./scripts/watch.js       # 监听 main/、js/ 改动并重建
  ├─ npm run startRender  → cd vite && yarn start（= node ./script/dev）  # vite dev server，端口 1600
  └─ npm run startElectron→ electron . --development-mode # 桌面客户端
```

### 1.2 为什么会有这么多 node/electron 进程（正常现象）

一条命令就会产生下面这些，**不是异常**：

```
node  concurrently.js
node  npm-cli.js run watch
node  scripts/watch.js
node  npm-cli.js run startRender
node  yarn.js run start            (启动 vite 的中间层)
node  ./script/dev                 ← vite dev server，监听 0.0.0.0:1600
node  npm-cli.js run startElectron
node  electron/cli.js . --development-mode
electron.exe  (主进程)
electron.exe  (--type=gpu-process)
electron.exe  (--type=utility)
electron.exe  (--type=crashpad-handler)
electron.exe  (--type=renderer) ×2
```

此外，主进程 `main/serviceManager.js` 会按各服务 `service.js` 的 `meta.autostart` 拉起本地服务（各占一个 node/python 进程）：

| 服务 | autostart | 端口 |
| --- | --- | --- |
| `node-monitor` | true | backend 3710x / gateway 38105 |
| `pot-mock` | true | 37103 / 38106 |
| `storage-market-dist` | true | 静态服务 38107 |
| `crosschain` | **false** | （已退役自动启动，前端改为直读链上） |

> 排查"进程太多"时，先按上面的清单核对；如果多出**第二组 electron.exe**，就是有人（或 Agent）多开了一个实例。

### 1.3 就绪判据（别靠感觉等）

1. `netstat -ano | findstr :1600` 有 `LISTENING`
2. `http://localhost:1600/html/table.html` 返回 200，且脚本入口是 `/@vite/client` 与 `../packages/table/main.ts`
3. `tasklist /FI "IMAGENAME eq electron.exe"` 共 **6 个**（= 1 个实例）
4. `%APPDATA%\PunkOS-development\app.log` 出现 `table窗口触发显示: ready-to-show`

### 1.4 绝对不要这么做（都是踩过的坑）

| 错误做法 | 后果 |
| --- | --- |
| `cd vite && npx vite` 或 `yarn dev`（默认 5173） | 主进程 dev 模式只认 `http://localhost:1600`，窗口加载失败，页面停在 `chrome-error://chromewebdata/`，`document.body.innerText` 为空 |
| 手工 `vite` + 手工 `electron` 分开起（不带 watch） | 改 `main/`、`js/` 的代码不会重建 `main.build.js`/`dist`，出现"代码改了没生效"的假象 |
| 多次重启 electron 且沿用同一个调试端口 | 见 §3.3："僵尸端口"导致 CDP 永远超时 |
| 同时开两个以上 Electron 实例 | 渲染异常、页面全白（用户实测：关掉多余窗口才恢复） |
| 在仓库根目录用 `--user-data-dir=` | 生成上千个未跟踪文件，污染 `git status` |

---

## 2. 只启动其中一部分（按需）

```powershell
# 只重建主进程（改了 main/ 之后）
npm run buildMain

# 只重建浏览器注入脚本 / 样式 / preload
npm run buildBrowser
npm run buildBrowserStyles
npm run buildPreload

# 只跑渲染端 dev server（端口 1600）——注意用 script/dev，不要用 vite 默认端口
cd vite
node script/dev

# 只构建渲染端产物（= yarn buildVite），产物在 vite/dist
cd vite
node --max_old_space_size=14096 node_modules/vite/bin/vite.js build
```

---

## 3. 调试

### 3.1 主进程日志（第一手信息）

```
%APPDATA%\PunkOS-development\app.log        ← dev 模式（userData 带 -development 后缀）
%APPDATA%\PunkOS\app.log                    ← 非 dev 模式
```

日志里有：窗口创建（`table窗口触发显示: ready-to-show`）、服务启动/端口分配（`服务启动成功 [node-monitor] 37114 38105`）、服务 stderr 转发。**服务是否被拉起、分到哪个端口，都在这里看。**

### 3.2 渲染端调试（CDP）

渲染端没有日志文件，必须用 Chrome DevTools Protocol 连进去。**官方启动命令不带调试端口**，需要单独加：

```powershell
# 保留 npm run start 起的 watch + vite(1600)，只把 electron 换成带调试端口的
node_modules\.bin\electron.cmd . --development-mode --remote-debugging-port=9333
```

然后访问 `http://127.0.0.1:9333/json/list` 拿 `webSocketDebuggerUrl`。

**现成工具**（不要重复造）：

```powershell
# 页面快照：跳到指定路由，打印页面标题/侧边导航/统计/表格行数/空态/错误，以及顶栏钱包区
node packages/table/page/core/CrossChain/__tests__/ui.cjs dashboard --port 9333

# 任意表达式求值（表达式模式）
node packages/table/page/core/CrossChain/__tests__/ui.cjs "document.querySelector('.header-wallet-area').innerText" --port 9333

# 抓启动期异常：注入钩子后再 reload，收集 error/rejection/console.error
node packages/table/page/core/CrossChain/__tests__/ui.cjs x --boot-errors --port 9333
```

可选路由名：`dashboard | create | tasks | network | relay | manage | legacyMulti | legacyTasks`。

### 3.3 两个 CDP 致命坑

**坑 1：僵尸端口。** `taskkill /F /IM electron.exe` 之后，调试端口会残留为 `LISTENING`，但持有它的 PID 已经不存在（`tasklist` 里找不到）。此时 `/json/list` 与 `/json/version` 都会**一直超时**，看起来像"CDP 坏了"。

- 判断：`netstat -ano | findstr :9333` 拿到的 PID 不在 `tasklist` 的 electron 列表里 → 僵尸。
- 应对：**每次重启都换一个新端口**（9222 → 9333 → 9444 → 9555 …）。

**坑 2：仓库里的 `ws` 与 Electron 26 握手不兼容。** 用 `require('ws')` 连 CDP 会报：

```
Unexpected server response: 101
```

- 应对：手写 WebSocket 帧（`net` + 帧编解码），`__tests__/ui.cjs` 已经实现，直接复用。

### 3.4 必须"冷启动"验证，不要靠刷新

改完源码后，vite HMR 对**组件**会热更新，但对**路由文件等非组件模块**会触发整页 reload；而本应用在 reload 时会因 Web3Modal 尚未初始化而白屏（见 §4.2）。所以：

- 验证功能改动：`taskkill /F /IM electron.exe` → 重新起 electron（dev server 可以不动）。
- `<keep-alive>` 包裹的组件可能保留旧状态，热更新看起来"没生效"——同样用冷启动确认。

### 3.5 数据层的功能自测（不依赖界面）

跨链模块有一份只读的链上自测（跑真实 RPC，82 项断言）：

```powershell
cd vite
node packages/table/page/core/CrossChain/__tests__/run.cjs
```

它用 esbuild 打包 + 桩替换后跑 Node，覆盖：环境解析、业务类型与验证器能力探测、任务分页读取、事件驱动扫描（全量 + 增量）、详情/过滤、区块时间换算、源链与 relay 参数、证明参数校验、目标链探测、展示格式化。**改了 `page/core/CrossChain/services/*` 后先跑它。**

### 3.6 构建校验

```powershell
cd vite
node --max_old_space_size=14096 node_modules/vite/bin/vite.js build   # 与 yarn build 同命令
```

产物自检（确认新代码真的进包、旧链路真的去掉）：

```powershell
# 应存在
findstr /C:"crosschain-module" /C:"EXPECTED_CHAIN" vite\dist\assets\table.*.js > nul && echo OK
# 应不存在（旧本机执行 / 旧后端）
findstr /C:"--reverse-execute" /C:"PUNKOS_NODE" /C:"localhost:37100" /C:"localhost:3020" /C:"relayer.js" vite\dist\assets\table.*.js
```

注意：构建产物里的中文是 `\uXXXX`（大写十六进制）转义，用中文搜不到不代表没打进去。

---

## 4. 白屏排查流程（最高频故障）

页面全白时，**先按这个顺序查**，不要一上来就怀疑某个业务模块。

### 4.1 判定白屏程度

用 §3.2 的探针执行：

```js
({ bodyLen: document.body.innerText.length,
   containerLen: (document.querySelector('.a-container')||{innerHTML:''}).innerHTML.length,
   appChildren: document.querySelector('#app')?.children.length })
```

- `bodyLen: 0` 且 `containerLen: 0` → 应用级渲染失败，见 4.2 / 4.3。
- 其它模块正常、只有目标模块空白 → 才是模块自身问题，看 §4.4。

### 4.2 原因 A：Web3Modal 未初始化（会让**所有** `/core/*` 页面空白）

控制台典型输出：

```
[Vue warn]: Unhandled error during execution of setup function at <PunkClaw> at <MainLayout>
rejection: Error: Please call "createWeb3Modal" before using "useWeb3ModalAccount" composition
```

- `createWeb3Modal` 在 `composables/useWalletService.ts`、`page/Splash.vue` 中调用；
  `layout-header.vue`、`PunkClaw.vue`、`Wallets/*` 直接使用 `useWeb3ModalAccount()`。
- Web3Modal 未就绪时这些组件 setup 全部抛错 → `.a-container` 渲染为空 →
  **computing、storage、crosschain 等所有核心模块都白屏**，和具体业务模块无关。
- 排查：确认钱包/登录流程是否走完；这与跨链模块无因果关系，不要误判。
- 补充：vite 整页 reload 时也容易撞上这一条，所以用冷启动验证（§3.4）。

### 4.3 原因 B：多余实例 / 端口冲突

同时开多个 Electron 实例会渲染异常、页面全白。

```powershell
tasklist /FI "IMAGENAME eq electron.exe"      # 应该是 6 个；明显多于 6 个就是多开了
taskkill /F /IM electron.exe                  # 全部关掉
npm run start                                 # 重新起一个
```

### 4.4 原因 C：布局嵌套导致 `parentNode` 崩溃

```
[Vue warn]: Unhandled error during execution of component update at <RouterView>
rejection: TypeError: Cannot read properties of null (reading 'parentNode')
```

`page/core/Layouts/ThirdLayout.vue` 用的是 Vue Router **不支持**的写法：

```html
<keep-alive><router-view /></keep-alive>   <!-- 控制台有对应警告 -->
```

在 `ThirdLayout` 与其页面之间再插一层布局组件（例如给某个模块加一个嵌套的路由 wrapper），就会抛上面的错误并整页白屏。

- **不要**给 `ThirdLayout` 下的模块加嵌套布局层。
- 模块需要自己的外壳时，**直接复用共享组件**（`Layouts/components/layout-header.vue`、`layout-footer.vue`），参考 `page/core/CrossChain/layouts/CrossChainLayout.vue`。
- 根治办法（会同时消掉 Vue Router 警告，但影响所有核心模块，需单独评估）：

```html
<router-view v-slot="{ Component }">
  <keep-alive><component :is="Component" /></keep-alive>
</router-view>
```

> **教训**：改了某个模块的路由后，如果连"右上角钱包余额"这类公共元素都不见了，说明是**外壳/布局**被换掉了，不是组件问题。

### 4.5 原因 D：dev server 不在 1600

窗口 URL 变成 `chrome-error://chromewebdata/` 时：

```powershell
netstat -ano | findstr :1600          # 没有 LISTENING 就是没起
cd vite; node script/dev              # 用正确的脚本起（端口 1600）
```

---

## 5. 启动相关结构速查

| 内容 | 路径 / 说明 |
| --- | --- |
| 主进程源码 / 产物 | `main/` → `main.build.js`（`main.build.js` 在 `.gitignore` 中，是构建产物） |
| 主进程入口（package.json main） | `main.build.js` |
| 渲染端 dev server | `vite/script/dev.js`（`serverPort: 1600`，host `0.0.0.0`） |
| 渲染端页面入口 | `vite/html/*.html`（`table.html` 是工作台） |
| 渲染端产物 | `cd vite && yarn build` → `vite/dist`（`vite/dist` 被忽略） |
| 渲染端环境变量 | `vite/.env.local`（本地文件，未被 git 跟踪） |
| 本地服务定义 | `services/*/service.js`（`meta.autostart`、`meta.healthPath`） |
| 服务生命周期与端口分配 | `main/serviceManager.js`（backend 37100–37999，gateway 38100–38999） |
| 应用数据 / 日志 | `%APPDATA%\PunkOS-development\`（dev）、`%APPDATA%\PunkOS\`（prod），日志 `app.log` |
| 桌面图标跳转 | 按**路由名**跳转（`open.package` / `open.route`），见 `vite/packages/table/js/data/desktopData.ts`；被引用的名字改动会导致图标失效 |
| 主题约定 | `documentElement` 上的 `dark-model` / `light-model`，以及 `.a-container` 上的 `.dark`（见 `App.vue`、`components/card/hooks/themeSwitch/`） |

---

## 6. 收尾清单（Agent 完成任务时）

1. **关掉多余实例**：只留用户需要的那一个（或多实例全部关掉并告知用户）。
2. **清理临时产物**：自己创建的日志、临时 user-data 目录、`__tests__/.out` 等。
   ```powershell
   git status --porcelain -uall        # 用 -uall 才能看到未跟踪目录里的文件数量
   ```
   排查"文件改动数量异常大"时：大概率是未跟踪的临时目录被展开统计了。
3. **确认构建通过**：改了 `vite/` 下代码就跑一次 §3.6 的构建。
4. **不要提交**：除非用户明确要求，否则只留工作区改动供人工审核（`git add`/`git commit` 都不要做）。
5. **报告要让用户能复核**：给出改动的文件清单 + 每条的用途 + 一键回退命令。

---

## 7. 一分钟自检清单

```
[ ] netstat :1600 有 LISTENING
[ ] http://localhost:1600/html/table.html 返回 200，入口是 /@vite/client + ../packages/table/main.ts
[ ] electron.exe 恰好 6 个（= 1 实例）
[ ] app.log 末尾有 "table窗口触发显示: ready-to-show"
[ ] CDP 探针能读到 .crosschain-module / .header-wallet-area
[ ] 若改了 services/*：跑一遍 __tests__/run.cjs
[ ] 若改了 vite/*：跑一遍 vite build
[ ] git status -uall 里没有临时目录
```
