# SEP Relay Bundle

## Contents
- `sep_relay_runner.py`：纯 Python 搬运入口（内置全节点预校验）
- `script/get_SEP_Header.py`：SEP 区块头抓取与编码脚本
- `data/dev/Manager.address`、`data/test/Manager.address`：管理合约地址

## Steps
1. 安装依赖：`pip install -r requirements.txt`
2. 将 `.env.example` 复制为 `.env` 并填写参数
3. 在解压目录执行：`python sep_relay_runner.py --env dev --interval 5`

## Fullnode Validation Mode
- 推荐在 `.env` 中额外配置 `SEPOLIA_FULLNODE_RPC_URL`，用于搬运前合法性预校验。
- 每轮搬运前会执行：
	- 检查全节点同步状态（`eth_syncing`）
	- 校验确认窗口内父子哈希连续性
	- 比对 `get_SEP_Header.py` 生成的区块哈希与全节点哈希
- 常用参数：
	- `--fullnode-rpc`：命令行指定全节点 RPC（优先于 `.env`）
	- `--finality-depth`：回退确认深度，默认 `8`
	- `--verify-window`：连续性校验窗口，默认 `16`
	- `--skip-fullnode-check`：跳过全节点校验（不建议）

## Notes
- 解压后的当前目录就是运行根目录
- 不再依赖 `forge`、`foundry.toml`、`src/`、`lib/`
- 脚本会持续轮询，直到手动停止
