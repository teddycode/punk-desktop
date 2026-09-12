# LCL v2 搬运器运行包

本包包含批量搬运器、取头与 Clique 校验模块、生产合约 ABI、依赖清单和配置模板。无需 Forge，不包含全节点客户端。适用于 chain ID 3030 的固定单签名者 LCL 和已完成初始化、注册的 LCL v2 中继合约。

## 安装与配置

1. 安装 Python 3.10 或更高版本。解压并进入 `lcl_relay_bundle` 文件夹。
2. 创建隔离环境并安装依赖：

```sh
python -m venv .venv
```

Windows PowerShell：

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
```

macOS / Linux（创建环境时可用 `python3`）：

```sh
.venv/bin/python -m pip install -r requirements.txt
cp .env.example .env
```

3. 编辑 `.env`，填写 `LCL_RPC_URL`（源链节点 HTTP 或本机 IPC）、`DEV_RPC_URL`（磐古目标链 RPC）和 `DEV_PRIVATE_KEY`（专用搬运账户私钥）。不要把源链 RPC 填进目标链字段。test 环境改用 `TEST_RPC_URL` / `TEST_PRIVATE_KEY`。
4. 将已部署的 **LCL v2 中继合约地址**、**Manager 地址**分别填入 `data/dev/LCL.address`、`data/dev/Manager.address`。每个文件只填一行非零的 EIP-55 校验和地址。test 使用 `data/test/`。地址模板刻意留空，须与实际运行环境及 Manager 注册关系一致。
5. 确认源节点同步完成、目标合约已初始化并启用，且搬运账户已质押并有目标链手续费余额。本包不自动部署、切换注册或追加质押。

## 检查并启动

先运行本地配置检查（不会连接节点或发送交易）：

```powershell
.\.venv\Scripts\python.exe lcl_relay_runner.py --env dev --check-config
```

检查通过后启动。此命令会使用配置的搬运账户向目标链发送交易：

```powershell
.\.venv\Scripts\python.exe lcl_relay_runner.py --env dev --batch-size 4 --interval 1 --confirmations 2
```

macOS / Linux 将上述 Python 路径替换为 `.venv/bin/python`。从其他目录启动时添加 `--project-root <解压目录>`。批量大小范围为 1–32，先用 4 观察，再按需增加。

`--check-config` 只检查本机依赖、ABI、配置格式和文件齐全性，不保证节点可达、合约版本或账户余额正确。正式启动时会检查 LCL chain ID、合约 HEADER_VERSION、创世哈希、Manager 注册关系、同步状态和质押。

## 停止、恢复与迁移

用 Ctrl+C 停止，确认进程已退出后再启动。每个环境仅运行一个进程；专用搬运账户不要并发发送其他交易。保留 `tmp/lcl-relayer/<env>/`：其中的 `pending.json` 保存待确认批次，重启会恢复相同签名交易，不能通过删除它来绕过错误。

另一台电脑已有搬运器运行时，不要使用同一账户同时启动本包。迁移须先停旧进程，保留并迁移该环境的待确认状态目录，再使用相同账户、链及合约配置启动。配置中的私钥只在本地填写，不要分享 `.env` 或运行状态。

日志中的 `Confirmed ... height=...` 是已确认的搬运高度。确认深度和承诺/揭示流程会导致进度落后源链，不能直接把源链最新高度当成搬运完成高度。

## 维护

运行核心来源：sepCross3 的 `script/LCL/relay_batch.py`、`get_LCL_Header.py`、`clique_header.py`。ABI 由生产 `src/LCL/RelayContract.sol:LCL_Relay` 编译生成，只分发 ABI，不包含部署字节码。

合约更新时，在 desktop 根目录执行 `node scripts/exportLclRelayAbi.cjs ../sepCross3` 重新导出生产 ABI（维护环境需提供 sepCross3 的 `.tools/node_modules/solc`）。同步三个运行核心模块后，执行 `python scripts/buildLclRelayBundle.py` 重新生成下载 ZIP，再使用已安装依赖的 Python 运行 `scripts/testLclRelayBundle.py`。

构建仅收录固定文件清单，排除真实 `.env`、私钥、缓存和运行状态；ZIP 内的 `manifest.json` 记录各文件 SHA-256。
