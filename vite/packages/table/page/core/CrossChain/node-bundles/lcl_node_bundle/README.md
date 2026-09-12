# LCL 全节点运行包（Geth 1.13.15）

此包用于加入已有 LCL 网络，运行非出块全节点。chain ID 和 network ID 均为 3030，Clique period=3、epoch=30000。无需账户或私钥，也不启动搬运器。

首次安装需联网下载固定版本的官方 Geth 二进制；支持 Windows x64、Linux x64/ARM64、macOS Intel/Apple Silicon。需要 Python 3.10+，无第三方 Python 依赖。Windows ARM 暂不自动安装。

## 使用

解压后打开终端，进入本文件所在目录：

```sh
python node.py install
python node.py start
```

macOS / Linux 可将 `python` 替换为 `python3`。安装会核对官方 HTTPS 下载文件的长度和 MD5，再检查 Geth 版本；这不是 PGP 签名校验。没有系统级安装，也不修改已有 Geth。

启动会初始化本包独立的 `data/`，在不连接网络的情况下核对实际创世哈希，再连接预设静态节点。若已有不兼容数据，会报错，不自动删除或重置。可用 `--data-dir <目录>` 指定另外的独立目录。

保留启动终端，使用 Ctrl+C 正常停止并等待数据库写入完成。不要同时用两个进程打开同一个数据目录。

另开终端查看状态：

```sh
python node.py status
```

仅当链 ID、network ID、创世哈希正确，有已连接节点、同步结束且区块时间新鲜时显示 `readyForRelayer: true`。这是本地就绪检查，不是跨链交易成功证明。退出码 0 表示就绪，2 表示仍需等待，1 表示错误。系统时钟需要准确。

## 搬运器接入

节点同步就绪后，在单独的 LCL 搬运器运行包 `.env` 中配置：

```dotenv
LCL_RPC_URL=http://127.0.0.1:18545
```

该 URL 是本机源链节点，不是磐古目标链 RPC。目标链 RPC、搬运账户和合约地址仍按搬运器 README 配置。已有其他电脑使用同一搬运账户时，不要重复启动搬运器。

默认 RPC 仅监听 127.0.0.1:18545，仅开放 eth/net/web3；不开放远程管理 API、账户解锁或出块。P2P 默认端口 30304，避免与已有节点的 30303 冲突。可用 `--rpc-port` 和 `--p2p-port` 修改，status 必须使用相同 RPC 端口。

## 网络信息

- Geth：1.13.15-stable，官方提交 c5ba367e。
- 创世哈希：`0xd141a7700d2a681d81b5b3e14326a64ce08e974c201fdcff778e2c4947dcae00`。
- 静态节点：`network.json` 中的 enode，目标 10.136.101.174:30303。
- 该地址是内网地址，使用者必须有对应局域网或 VPN 路由。TCP 可达不代表已完成 Geth 握手。
- `discport=0` 表示远端不提供 UDP 发现，所以使用 StaticNodes 并关闭发现。节点身份使用 enode 公钥，与出块账户地址不同。
- genesis.json 来自现有网络；不要自行更改 alloc、分叉配置或 extraData，否则会进入不同的链。

## 客户端来源

官方发布：https://github.com/ethereum/go-ethereum/releases/tag/v1.13.15

官方二进制：https://geth.ethereum.org/downloads/

本包通过 `downloads.json` 固定各平台的官方资源地址及完整性元数据。Geth 可执行程序采用 GPL-3.0，相关许可与源码见上述固定版本仓库。本包为在线安装运行包，不包含 Geth 二进制或链数据。
