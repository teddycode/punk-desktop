# App 后端 API 需求梳理

本文按功能模块梳理 PunkOS Desktop 当前 App 需要的后端 API。范围覆盖 Electron 桌面壳层、`vite/packages/table` 工作台、`vite/packages/table/page/core` 磐古核心区，以及仓库内随客户端启动的本地服务。

接口状态说明：

- 已调用：前端代码中已经通过 axios/fetch/service 封装调用，需要后端保持兼容。
- 应补齐：页面当前使用 mock、localStorage、链上直连或第三方直连；如果要产品化，需要提供对应后端 API。
- 可选：不阻塞当前主流程，但建议后端提供统一代理、索引或审计能力。

## 1. 通用约定

### 1.1 基础地址

| 类型 | 基础地址 | 使用位置 | 说明 |
| --- | --- | --- | --- |
| 渲染端主业务 API | `http://punk.buaadcl.tech:36066/api` | `vite/packages/table/js/axios/utils/request.ts` | 新核心页面默认使用；请求头带 `Authorization`。 |
| 旧桌面业务 API | `http://punk.buaadcl.tech:36066` | `src/api/*`、`src/util/axios.js` | 旧桌面壳层接口多为 `/app/...`。 |
| 共识 PoT 本地服务 | `http://127.0.0.1:10000/api` | `services/pot-mock`、`Consensus/services/potApi.ts` | 优先通过 Electron `services.resolvePage('pot-mock')` 解析。 |
| 跨链本地服务 | `http://localhost:3020/api` | `services/crosschain`、`CrossChain/*` | 服务健康检查为 `/api/health`。 |
| DVPN 本地服务 | `http://localhost:8080` | `Network/components/vpn.vue`、部分 Exchange 页面 | 当前页面直连，建议统一纳入服务管理或网关。 |
| IPFS 服务 | `http://47.243.174.71:12801/api/v0` | `src/browserApi/punkosApi/storage.js` | 上传使用 `/add`，访问网关为 `http://47.243.174.71:17801/ipfs/{cid}`。 |

### 1.2 统一响应格式

除区块链浏览器、部分本地服务和第三方接口外，建议所有业务接口统一返回：

```json
{
  "code": 200,
  "msg": "ok",
  "data": {}
}
```

错误响应建议：

```json
{
  "code": 400,
  "msg": "invalid address",
  "data": null
}
```

要求：

- 成功业务码统一为 `200`。现有渲染端封装会将 `code !== 200` 视为失败。
- HTTP 状态码仍应正确表达认证失败、权限不足、参数错误、服务异常，例如 `401`、`403`、`422`、`500`。
- 钱包地址、交易哈希、区块哈希必须保留原始大小写或提供 checksum 地址。
- 金额、余额、gas、质押数量等大整数必须用字符串返回，避免 JS 精度损失。
- 时间字段建议统一使用 ISO 8601 字符串；如兼容旧页面可额外返回毫秒时间戳。
- 分页接口统一支持 `pageNumber/pageSize` 或兼容 `pageNum/pageSize`，返回 `records/totalRow/pageNumber/pageSize`。

分页响应建议：

```json
{
  "records": [],
  "pageNumber": 1,
  "pageSize": 10,
  "totalRow": 0
}
```

### 1.3 认证与权限

请求头：

```http
Authorization: <token>
Content-Type: application/json
```

要求：

- 旧桌面接口使用 `/app/loginBrowser`、`/app/refreshBrowserToken` 维护 token。
- 钱包登录使用 nonce + 签名认证，详见“钱包与账户”模块。
- 用户权限开关由 `/user-permissions/current` 维护，详见“用户设置”模块。
- 本地服务接口如跨链、PoT、DVPN 运行在本机时也建议支持来源校验和只监听 `127.0.0.1`。

## 2. 认证、用户与桌面壳层

### 2.1 登录与用户信息

| 状态 | 方法 | 路径 | 参数 | 返回要求 |
| --- | --- | --- | --- | --- |
| 已调用 | `POST` | `/app/loginBrowser` | 登录表单、客户端信息 | token、refreshToken、用户基础信息。 |
| 已调用 | `POST` | `/app/logoutBrowser` | 当前用户 token | 注销结果。 |
| 已调用 | `POST` | `/app/autoLogin` | `client_id` | 自动登录结果和用户信息。 |
| 已调用 | `POST` | `/app/imAutoLogin` | `client_id`、`bind_id` | IM 自动登录结果。 |
| 已调用 | `POST` | `/app/refreshBrowserToken` | `refreshToken` | 新 token；旧代码期望 `code === 1000`，建议兼容。 |
| 已调用 | `GET` | `/app/getUserInfo` | `fields` | `fans`、`follow`、`post_count`、`signature`、`nickname`、`avatar` 等。 |
| 已调用 | `GET` | `/app/chat/getUserSig` | 当前用户 | 腾讯 IM `userSig`。 |
| 已调用 | `POST` | `/app/createTask` | `uid`、`site_list` | 初始化任务结果；`uid` 可能为空。 |

### 2.2 空间与桌面同步

| 状态 | 方法 | 路径 | 参数 | 返回要求 |
| --- | --- | --- | --- | --- |
| 已调用 | `POST` | `/app/addSpace` | `name` | 新空间对象。 |
| 已调用 | `POST` | `/app/copySpace` | `nanoid` | 复制后的空间对象。 |
| 已调用 | `GET` | `/app/spaceListMy` | 无 | 当前用户空间列表。 |
| 已调用 | `POST` | `/app/changeSpace` | `nanoid`、`clientId`、`clientName`、`force` | 切换空间结果。 |
| 已调用 | `POST` | `/app/saveSpace` | `nanoid`、`clientId`、`saveData`、`force` | 保存结果和版本信息。 |
| 已调用 | `POST` | `/app/getSpace` | `nanoid` | 空间详情和 `saveData`。 |
| 已调用 | `POST` | `/app/deleteSpace` | `nanoid` | 删除结果。 |
| 已调用 | `POST` | `/app/importSpaces` | `spaces` | 导入结果。 |
| 已调用 | `POST` | `/app/copySpaceBySpace` | `space` | 从完整空间对象复制。 |
| 已调用 | `POST` | `/app/renameSpace` | `newName`、`nanoid` | 重命名结果。 |
| 已调用 | `POST` | `/app/clientOnline` | `nanoid`、`force`、`clientId`、`clientName` | 客户端占用/上线状态。 |
| 已调用 | `POST` | `/app/clientOffline` | `clientId` | 客户端离线结果。 |

空间对象建议字段：

```json
{
  "nanoid": "space_xxx",
  "name": "默认空间",
  "saveData": {},
  "clientId": "desktop_xxx",
  "clientName": "Windows Client",
  "version": 12,
  "updatedAt": "2026-06-17T10:00:00.000Z"
}
```

### 2.3 应用、分组与弹幕

| 模块 | 状态 | 方法 | 路径 | 参数/要求 |
| --- | --- | --- | --- | --- |
| 用户应用列表 | 已调用 | `POST` | `/app/browser/appUserList/list` | 查询用户应用列表。 |
| 用户应用列表 | 已调用 | `POST` | `/app/browser/appUserList/add` | 新增应用列表项。 |
| 用户应用列表 | 已调用 | `POST` | `/app/browser/appUserList/update` | 更新应用列表项。 |
| 用户应用列表 | 已调用 | `POST` | `/app/browser/appUserList/delete` | 批量删除 ids。 |
| 我的应用 | 已调用 | `POST` | `/app/browser/myApps/list` | `list_id`。 |
| 我的应用 | 已调用 | `POST` | `/app/browser/myApps/add` | 应用详情。 |
| 我的应用 | 已调用 | `POST` | `/app/browser/myApps/update` | 应用详情。 |
| 我的应用 | 已调用 | `POST` | `/app/browser/myApps/delete` | 批量删除 ids。 |
| 圈子/分组 | 已调用 | `GET` | `/app/browser/group/getJoinedCircle` | 已加入圈子。 |
| 圈子/分组 | 已调用 | `GET` | `/app/browser/group/getMyCircle` | 我的圈子。 |
| 圈子/分组 | 已调用 | `GET` | `/app/browser/group/getCircleInfoById` | 圈子详情。 |
| 圈子/分组 | 已调用 | `POST` | `/app/browser/group/list` | 分组列表。 |
| 分组应用列表 | 已调用 | `POST` | `/app/browser/appGroupList/list` | `id`。 |
| 分组应用列表 | 已调用 | `POST` | `/app/browser/appGroupList/add` | 新增。 |
| 分组应用列表 | 已调用 | `POST` | `/app/browser/appGroupList/update` | 更新。 |
| 分组应用列表 | 已调用 | `POST` | `/app/browser/appGroupList/delete` | 删除。 |
| 分组应用 | 已调用 | `POST` | `/app/browser/groupApps/list` | `list_id`。 |
| 分组应用 | 已调用 | `POST` | `/app/browser/groupApps/add` | 新增。 |
| 分组应用 | 已调用 | `POST` | `/app/browser/groupApps/update` | 更新。 |
| 分组应用 | 已调用 | `POST` | `/app/browser/groupApps/delete` | 删除。 |
| 弹幕 | 已调用 | `POST` | `/app/addBarrage` | 弹幕内容、页面 channel。 |
| 弹幕 | 已调用 | `POST` | `/app/deleteBarrage` | `nanoid`。 |
| 弹幕 | 已调用 | `POST` | `/app/getBarrageList` | `channel`、`pageUrl`。 |

## 3. 钱包与账户

钱包区入口在 `vite/packages/table/page/core/Wallets`，服务封装在 `vite/packages/table/js/service/wallets.ts`、`transaction.ts`、`user.ts`。

### 3.1 钱包登录

| 状态 | 方法 | 路径 | 参数 | 返回要求 |
| --- | --- | --- | --- | --- |
| 已调用 | `GET` | `/users/login/nonce` | `address` | 返回一次性 nonce 或待签名 message。 |
| 已调用 | `POST` | `/users/login/auth` | `address`、`signature`、`message` | token、用户信息、钱包绑定状态。 |
| 已调用 | `GET` | `/users/info` | `token` | 当前用户信息。 |

签名登录要求：

- `nonce` 必须一次性使用，并设置过期时间。
- `message` 必须包含域名/应用名、地址、nonce、签名时间，避免跨站重放。
- 认证成功后返回的 token 需兼容主业务请求头 `Authorization`。

### 3.2 钱包列表与状态

| 状态 | 方法 | 路径 | 参数 | 返回要求 |
| --- | --- | --- | --- | --- |
| 已调用 | `POST` | `/wallets/page` | `pageNumber`、`pageSize`、`userId` | 钱包分页列表。 |
| 已调用 | `GET` | `/wallets/status` | `id`，当前传用户 id | 钱包统计：类型、账户数、资产值。 |
| 已调用 | `PUT` | `/wallets/info` | `id`、`name`、`coin`、`type` | 更新成功返回 `true`。 |
| 已调用 | `GET` | `/wallets/pledge` | `address` | 钱包质押信息。 |

钱包记录建议字段：

```json
{
  "id": 1,
  "name": "Main Wallet",
  "address": "0x...",
  "symbol": "PUNK",
  "type": "metamask",
  "status": "active",
  "amount": "1000000000000000000",
  "createdAt": "2026-06-17T10:00:00.000Z"
}
```

### 3.3 交易记录

| 状态 | 方法 | 路径 | 参数 | 返回要求 |
| --- | --- | --- | --- | --- |
| 已调用 | `POST` | `/transactions/page` | `userId`、`address`、`pageNumber`、`pageSize` | 交易分页列表。 |
| 已调用 | `GET` | `/transactions/status` | `userId`、`address` | 收入、支出、交易数统计。 |

交易记录建议字段：

```json
{
  "hash": "0x...",
  "blockNumber": 123,
  "from": "0x...",
  "to": "0x...",
  "amount": "1000000000000000000",
  "symbol": "PUNK",
  "fee": "21000000000000",
  "status": "success",
  "createdAt": "2026-06-17T10:00:00.000Z"
}
```

### 3.4 钱包运行时要求

前端仍会直接调用 EIP-1193 钱包能力，后端无需代理签名，但需要能校验和索引相关交易：

- `eth_requestAccounts`
- `personal_sign` 或 `signMessage`
- `eth_signTransaction`
- `eth_sendRawTransaction`
- `eth_getTransactionReceipt`

质押交易中存在 `type: 6` 扩展字段，后端和 RPC 节点如需解析交易，应支持：

```json
{
  "type": 6,
  "deployerAddress": "0x...",
  "investorAddress": "0x...",
  "beneficiaryAddress": "0x...",
  "stakedAmount": "1000000000000000000",
  "stakedTime": "31536000"
}
```

## 4. DApp/CApp 市场、合约市场与质押

DApp 市场服务封装在 `vite/packages/table/js/service/dappMarket.ts`，页面集中在 `vite/packages/table/page/core/DappMarket`。CApp 市场页面复用同类数据模型。

### 4.1 DApp 基础信息

| 状态 | 方法 | 路径 | 参数 | 返回要求 |
| --- | --- | --- | --- | --- |
| 已调用 | `GET` | `/dDappinfo/page` | `pageNum`、`pageSize`、`chain`、`name` | DApp 分页列表。 |
| 已调用 | `GET` | `/dDappinfo/getInfo/{id}` | path: `id` | DApp 详情。 |
| 已调用 | `POST` | `/dDappinfo/save` | DApp 表单 | 创建或提交 DApp。 |
| 已调用 | `GET` | `/dDappinfo/getUserDapps` | `userId`、`state` | 用户提交的 DApp。 |
| 已调用 | `GET` | `/dDappinfo/getExtendedInfo/{dappId}` | path: `dappId` | 扩展统计。 |
| 已调用 | `POST` | `/dDappinfo/incrementVisit` | `dappId` | 访问量加一。 |

DApp 详情建议字段：

```json
{
  "id": 1,
  "name": "Sample DApp",
  "description": "short description",
  "detail": "markdown or html detail",
  "website": "https://example.com",
  "chain": "punkos",
  "logo": "https://...",
  "imgs": [{ "img": "https://..." }],
  "tags": [{ "tagName": "DeFi" }],
  "contracts": [{ "address": "0x..." }],
  "user": { "id": 1, "nickname": "alice", "avatar": "https://..." },
  "qualityLevel": "A",
  "visitCount": 100,
  "stakersCount": 10,
  "totalStaked": "1000000000000000000",
  "stakingCap": "10000000000000000000",
  "revenue": "0",
  "createTime": "2026-06-17T10:00:00.000Z",
  "updateTime": "2026-06-17T10:00:00.000Z"
}
```

提交 DApp 请求建议：

```json
{
  "userId": 1,
  "name": "Sample DApp",
  "chain": "punkos",
  "description": "short description",
  "detail": "markdown detail",
  "website": "https://example.com",
  "logo": "https://...",
  "imgs": [{ "img": "https://..." }],
  "tags": [{ "tagName": "DeFi" }],
  "contracts": [{ "address": "0x..." }]
}
```

### 4.2 收藏、点赞、桌面卡片

| 状态 | 方法 | 路径 | 参数 | 返回要求 |
| --- | --- | --- | --- | --- |
| 已调用 | `GET` | `/dLove/isLiked` | `userId`、`dappId` | 是否已点赞。 |
| 已调用 | `PUT` | `/dLove/dappLove` | `userId`、`dappId` | 切换点赞状态。 |
| 已调用 | `GET` | `/dCollect/isCollected` | `userId`、`dappId` | 是否已收藏。 |
| 已调用 | `PUT` | `/dCollect/dappCollect` | `userId`、`dappId` | 切换收藏状态。 |
| 已调用 | `GET` | `/dCollect/getUserCollects/{userId}` | path: `userId` | 用户收藏列表。 |
| 已调用 | `GET` | `/dDesk/getUserDesk/{userId}` | path: `userId` | 用户桌面 DApp 卡片。 |
| 已调用 | `GET` | `/dDesk/addDappCard` | `userId`、`dappId` | 添加桌面卡片。 |
| 已调用 | `DELETE` | `/dDesk/removeDappCard` | `userId`、`dappId` | 移除桌面卡片。 |
| 已调用 | `GET` | `/dDesk/isAdded` | `userId`、`dappId` | 是否已添加到桌面。 |

### 4.3 评论与评分

| 状态 | 方法 | 路径 | 参数 | 返回要求 |
| --- | --- | --- | --- | --- |
| 已调用 | `GET` | `/dComment/list/{id}` | path: DApp id | 评论树。 |
| 已调用 | `POST` | `/dComment/save` | `dappId`、`parentId`、`userId`、`content`、`imgs` | 新评论。 |
| 已调用 | `GET` | `/dRating/getRatingInfo/{dappId}` | `userId` | 总评价数、平均分、占比、用户评分。 |
| 已调用 | `POST` | `/dRating/save` | `dappId`、`userId`、`score` | 保存评分。 |

评论对象建议字段：

```json
{
  "id": 1,
  "parentId": 0,
  "uid": 1,
  "content": "nice app",
  "contentImg": "",
  "createTime": "2026-06-17T10:00:00.000Z",
  "user": {
    "username": "alice",
    "avatar": "https://..."
  },
  "reply": []
}
```

### 4.4 合约市场

| 状态 | 方法 | 路径 | 参数 | 返回要求 |
| --- | --- | --- | --- | --- |
| 已调用/部分页面 mock | `GET` | `/dContract/page` | `pageNum`、`pageSize`、`category`、`name` | 合约分页列表。 |
| 已调用 | `GET` | `/dContract/getByAddress/{address}` | path: 合约地址 | 合约详情。 |
| 已调用 | `GET` | `/dContract/getRelated/{address}` | path: 合约地址 | 相关合约。 |

合约对象建议字段：

```json
{
  "address": "0x...",
  "name": "Token",
  "category": "ERC20",
  "chain": "punkos",
  "abi": [],
  "sourceCode": "",
  "verified": true,
  "deployer": "0x...",
  "createdAt": "2026-06-17T10:00:00.000Z"
}
```

### 4.5 DApp 质押

REST 接口：

| 状态 | 方法 | 路径 | 参数 | 返回要求 |
| --- | --- | --- | --- | --- |
| 已调用 | `POST` | `/dStaking/submit` | 质押表单、交易哈希 | 创建质押记录。 |
| 已调用 | `GET` | `/dStaking/getUserStakings` | `userId`、`status` | 用户质押列表。 |
| 已调用 | `GET` | `/dStaking/getDetail/{stakingId}` | path: `stakingId` | 质押详情。 |
| 已调用 | `POST` | `/dStaking/withdraw` | `stakingId` | 提现/解押。 |
| 已调用 | `GET` | `/dStaking/getRevenue` | `stakingId`、`pageNum`、`pageSize` | 收益明细。 |
| 已调用 | `GET` | `/dStaking/getTrend` | `stakingId`、`period` | 收益趋势。 |

链上查询当前使用 JSON-RPC，完整说明见 `docs/pledge_api_reference.md`。后端如果做代理或索引器，需要兼容以下方法：

- `eth_getPledgeInfo`
- `eth_getInvestorInterest`
- `eth_getAllInvestorsInterest`
- `eth_getBeneficiariesInfo`
- `eth_getStakeFlag`
- `eth_getPledgeAmount`
- `eth_getPledgeYear`
- `eth_getStartTime`
- `eth_getInterestRate`
- `eth_getEarnInterest`
- `eth_getCurrentInterest`
- `eth_getBeneficiaryAddress`
- `eth_getBeneficiaryInfo`
- `eth_getAnnualFee`
- `eth_getLastAnnualFeeTime`
- `eth_getDeployedAddress`
- `eth_getInvestorAddress`
- `eth_getTotalNumberOfGas`
- `eth_getContractCallCount`
- `eth_getTotalValueTx`
- `eth_getSecurityLevel`

JSON-RPC 格式：

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "eth_getPledgeInfo",
  "params": ["0x...", "latest"]
}
```

## 5. 区块链浏览器

浏览器服务封装在 `vite/packages/table/js/service/explorerBlocks.ts`、`explorerTransactions.ts`、`explorerAccounts.ts`。这些接口当前走特殊分支，返回可以是不带 `{ code, data }` 包装的原始数据。

### 5.1 区块

| 状态 | 方法 | 路径 | 参数 | 返回要求 |
| --- | --- | --- | --- | --- |
| 已调用 | `GET` | `/blocks` | `page`、`size` | 区块分页列表。 |
| 已调用 | `GET` | `/blocks/latest` | 无 | 最新区块。 |
| 已调用 | `GET` | `/blocks/{blockNumber}` | path: 区块高度 | 区块详情。 |
| 已调用 | `GET` | `/blocks/hash/{blockHash}` | path: 区块哈希 | 区块详情。 |

区块字段建议：

```json
{
  "blockNumber": 1,
  "hash": "0x...",
  "parentHash": "0x...",
  "timestamp": "2026-06-17T10:00:00.000Z",
  "miner": "0x...",
  "gasUsed": "0",
  "gasLimit": "0",
  "transactionCount": 0
}
```

### 5.2 交易

| 状态 | 方法 | 路径 | 参数 | 返回要求 |
| --- | --- | --- | --- | --- |
| 已调用 | `GET` | `/transaction` | `page`、`size` | 交易分页列表。 |
| 已调用 | `GET` | `/transaction/{txHash}` | path: 交易哈希 | 交易详情。 |
| 已调用 | `GET` | `/transaction/address/{address}` | `page`、`size` | 地址相关交易。 |
| 已调用 | `GET` | `/transaction/block/{blockNumber}` | path: 区块高度 | 区块内交易。 |

交易字段建议：

```json
{
  "hash": "0x...",
  "blockNumber": 1,
  "from": "0x...",
  "to": "0x...",
  "value": "0",
  "fee": "0",
  "status": "success",
  "timestamp": "2026-06-17T10:00:00.000Z"
}
```

### 5.3 账户

| 状态 | 方法 | 路径 | 参数 | 返回要求 |
| --- | --- | --- | --- | --- |
| 已调用 | `POST` | `/accounts/refresh/{address}` | path: 地址 | 触发账户索引刷新。 |
| 已调用 | `GET` | `/accounts/{address}` | path: 地址 | 账户详情。 |
| 已调用 | `GET` | `/accounts/{address}/balance` | path: 地址 | 账户余额。 |
| 已调用 | `GET` | `/accounts/{address}/security-level` | path: 地址 | 安全等级。 |

账户详情建议字段：

```json
{
  "address": "0x...",
  "balance": "0",
  "nonce": 0,
  "txCount": 0,
  "securityLevel": 1,
  "updatedAt": "2026-06-17T10:00:00.000Z"
}
```

## 6. 共识区与 PoT 可视化

共识区前端在 `vite/packages/table/page/core/Consensus`。当前主流程调用本地 `pot-mock` 服务，路径前缀为 `/api`。

### 6.1 系统状态

| 状态 | 方法 | 路径 | 参数 | 返回要求 |
| --- | --- | --- | --- | --- |
| 已调用 | `GET` | `/api/health` | 无 | 服务健康状态。 |
| 已调用 | `GET` | `/api/system/overview` | 无 | 系统总览。 |
| 已调用 | `GET` | `/api/pot/status` | 无 | PoT 状态。 |
| 已调用 | `GET` | `/api/pot/vdf` | 无 | VDF 状态。 |
| 已调用 | `GET` | `/api/committee/status` | 无 | 委员会状态。 |
| 已调用 | `GET` | `/api/bci/status` | 无 | BCI 状态。 |
| 已调用 | `GET` | `/api/mempool/status` | 无 | 交易池状态。 |
| 已调用 | `GET` | `/api/network/topology` | 无 | 网络拓扑。 |
| 已调用 | `GET` | `/api/nodes` | 无 | 节点列表。 |

### 6.2 区块与交易

| 状态 | 方法 | 路径 | 参数 | 返回要求 |
| --- | --- | --- | --- | --- |
| 已调用 | `GET` | `/api/blocks/recent` | `count` | 最近共识区块。 |
| 已调用 | `GET` | `/api/blocks/{height}` | path: 高度 | 共识区块详情。 |
| 已调用 | `GET` | `/api/business/blocks/recent` | `count` | 最近业务区块。 |
| 已调用 | `GET` | `/api/business/blocks/{height}` | path: 高度 | 业务区块详情。 |
| 已调用 | `GET` | `/api/self/overview` | 无 | 当前节点概览。 |
| 已调用 | `GET` | `/api/self/blocks/recent` | `count` | 当前节点近期出块。 |
| 已调用 | `GET` | `/api/transactions/recent` | `count` | 最近交易。 |

### 6.3 创建锁定交易

| 状态 | 方法 | 路径 | 请求体 | 返回要求 |
| --- | --- | --- | --- | --- |
| 已调用 | `POST` | `/api/createlocktransaction` | `transaction`、`type` | 交易 id、状态、类型、输入输出数量。 |

请求体格式：

```json
{
  "type": "1",
  "transaction": {
    "Txid": "0x...",
    "TxInputs": [
      {
        "Txid": "0x...",
        "Voutput": 0,
        "ScriptSig": "",
        "Value": "0",
        "Address": "0x...",
        "BciType": "bci"
      }
    ],
    "TxOutputs": [
      {
        "Address": "0x...",
        "Value": "0",
        "Interest": "0",
        "Proof": "",
        "LockTime": 0,
        "BciType": "bci",
        "Data": "",
        "BurnLock": false,
        "Rate": "0"
      }
    ],
    "TransactionFee": "0"
  }
}
```

### 6.4 WebSocket 推送

| 状态 | 路径 | 客户端订阅 | 服务端消息 |
| --- | --- | --- | --- |
| 已调用 | `/api/ws` | `{"topics":["system","pot","vdf","committee","mempool","network","bci"]}` | `{"type":"system","timestamp":"...","data":{}}` |

### 6.5 历史共识接口

旧封装中仍保留以下接口，如后端曾经提供过，需要兼容或明确废弃：

- `GET /consensus/block/list`
- `GET /consensus/block/byHeight`
- `GET /consensus/block/byHash`
- `GET /consensus/block/mic/byHeight`
- `GET /consensus/block/mic/byHash`
- `GET /consensus/block/mine`
- `GET /consensus/block/mic/mine`

## 7. 跨链区

跨链区页面在 `vite/packages/table/page/core/CrossChain`，本地服务在 `services/crosschain`，合约调用封装在 `vite/packages/table/services/crosschain.ts`。

### 7.1 本地跨链服务 REST API

| 状态 | 方法 | 路径 | 参数 | 返回要求 |
| --- | --- | --- | --- | --- |
| 已调用 | `GET` | `/api/health` | 无 | `{ "status": "ok" }`。 |
| 已调用 | `GET` | `/api/crosschainzone` | 无 | 跨链区域配置列表。 |
| 已调用 | `GET` | `/api/sourceChains` | 无 | 源链列表。 |
| 已调用 | `GET` | `/api/systemContracts` | 无 | 系统合约信息。 |
| 已调用 | `GET` | `/api/blocks` | 无 | Hub 区块列表。 |
| 已调用 | `GET` | `/api/txs` | 无 | Hub 交易列表。 |
| 已调用 | `GET` | `/api/tasks` | 无 | 最近跨链任务。 |
| 已调用 | `GET` | `/api/shadowBlocks/{chainId}` | path: `chainId` | 影子区块列表。 |
| 已调用 | `GET` | `/api/manager-address` | 无 | Manager 合约地址。 |
| 已调用 | `GET` | `/api/contract-address` | 无 | Transport 合约地址。 |
| 已调用 | `GET` | `/api/task-verifier-address` | 无 | TaskVerifier 合约地址。 |
| 已调用 | `POST` | `/api/lcl-proof` | `destTxHash`、`txHeight`、`confirmHeight`、`taskTypeName` | LCL proof。 |

主要字段要求：

- `crosschainzone`：`name`、`zone_type`、`rpc`、`multi_addr`、`transport_addr`、`manager_addr`。
- `sourceChains`：`chain_id`、`symbol`、`name`、`state`。
- `blocks`：`block_number`、`block_hash`、`prev_hash`、`if_matter`、`created_at`、`no`。
- `txs`：`tx_hash`、`block_number`、`tx_index`、`block_hash`、`from_addr`、`to_addr`、`value`、`gas_used`、`created_at`。
- `tasks`：`index`、`task_key`、`user`、`fee_eth`、`payload`、`label`。

### 7.2 页面仍在直连的桥交易接口

以下接口当前页面直接请求 `http://localhost:3020`，建议补齐或迁移到统一跨链服务：

| 状态 | 方法 | 路径 | 参数 | 返回要求 |
| --- | --- | --- | --- | --- |
| 应补齐 | `GET` | `/api/bridgeTxs` | 可选分页、链 id、地址 | 跨链桥交易列表。 |
| 应补齐 | `GET` | `/api/bridgeTxsInBlock/{blockHash}` | path: 区块哈希 | 某区块内桥交易。 |

桥交易建议字段：

```json
{
  "txHash": "0x...",
  "sourceChainId": 1,
  "destChainId": 2,
  "from": "0x...",
  "to": "0x...",
  "token": "PUNK",
  "amount": "0",
  "status": "pending",
  "blockHash": "0x...",
  "createdAt": "2026-06-17T10:00:00.000Z"
}
```

### 7.3 链上/RPC 能力要求

跨链前端会通过 ethers 调用合约，后端索引器或 RPC 网关需支持：

- Transport：`getAllRoutes`、`createTask`、`finishTask`、`setCrossChainRoute`、`taskNum`、`taskIndex`、`getTaskInfoByKey`、`acceptTask`、`getContractState`、`getRequireStake`、`getMyStake`、`becomeRelayer`。
- Manager：`contract_chain_index`、`getSourceChainNum`、`getSourceChainInfo`、`getCommitteeMembers`、`inviteCommitteeMember`、`committeeMembers`。
- RPC：`eth_getRawTransactionByHash`、`eth_getTransactionReceipt`、基础 `eth_call`、`eth_sendRawTransaction`。

## 8. 治理区

当前实际挂载的是 `Governance_v1`。页面大量使用 Pinia mock 和合约直连；要产品化，需要后端提供治理索引、提案状态、投票、质押和特殊交易审计 API。

### 8.1 治理后端建议 API

| 状态 | 方法 | 路径 | 参数/请求体 | 返回要求 |
| --- | --- | --- | --- | --- |
| 应补齐 | `GET` | `/governance/proposals` | `status`、`type`、分页 | 提案列表。 |
| 应补齐 | `GET` | `/governance/proposals/{id}` | path: 提案 id | 提案详情、投票统计、执行状态。 |
| 应补齐 | `POST` | `/governance/proposals` | 创建提案表单、链上 txHash | 创建提案记录。 |
| 应补齐 | `POST` | `/governance/proposals/{id}/vote` | `support`、`amount`、`txHash` | 投票记录。 |
| 应补齐 | `POST` | `/governance/proposals/{id}/execute` | `txHash` | 执行记录。 |
| 应补齐 | `GET` | `/governance/users/{address}` | path: 地址 | 用户治理资产、投票、质押。 |
| 应补齐 | `POST` | `/governance/stakes` | `address`、`amount`、`txHash` | 质押记录。 |
| 应补齐 | `POST` | `/governance/stakes/{id}/withdraw` | `txHash` | 解押记录。 |
| 应补齐 | `GET` | `/governance/treasury` | 无 | 国库余额、收支统计。 |
| 应补齐 | `GET` | `/governance/events` | `address`、`proposalId`、分页 | 治理事件流。 |

提案字段需兼容当前 store：

```json
{
  "id": 1,
  "title": "升级提案",
  "status": "active",
  "yesVotes": "0",
  "noVotes": "0",
  "target": "parameter",
  "upgradeType": "parameter",
  "executor": "0x...",
  "proposer": "0x...",
  "version": "v1",
  "upgradeParameter": {},
  "targetAddress": "0x...",
  "managePermission": "",
  "switchTo": "",
  "upgradeTo": "",
  "createdTime": "2026-06-17T10:00:00.000Z",
  "startTime": "2026-06-17T10:00:00.000Z",
  "endTime": "2026-06-24T10:00:00.000Z",
  "executeTime": null
}
```

### 8.2 特殊系统交易

服务封装中有一组标准接口，页面中还有一组直连测试接口。建议后端统一成标准接口，并临时兼容页面直连路径。

| 状态 | 方法 | 路径 | 请求体 | 返回要求 |
| --- | --- | --- | --- | --- |
| 已封装 | `POST` | `/v1/transactions/account/lock` | `addresses`、`privateKey`、`to`、`gasLimit`、`gasPrice` | 包装响应，含 `txHash`。 |
| 已封装 | `POST` | `/v1/transactions/account/unlock` | `addresses`、`privateKey`、`to`、`gasLimit`、`gasPrice` | 包装响应，含 `txHash`。 |
| 已调用 | `POST` | `/api/tx/account-lock` | `addresses`、`gasLimit` | 页面当前期望 `{ "success": true, "txHash": "0x..." }`。 |
| 已调用 | `POST` | `/api/tx/account-unlock` | `addresses`、`gasLimit` | 页面当前期望 `{ "success": true, "txHash": "0x..." }`。 |

要求：

- 后端不得在前端传输或长期保存明文私钥；如必须代签，应走受控签名服务。
- 每次锁定/解锁必须记录操作者、地址列表、链 id、交易哈希、结果和错误原因。

### 8.3 治理链上配置

前端从 localStorage 读取 `punkos.governance.deployment.v1`，包含：

- `rpcUrl`
- `parameter.paramRegistry`
- `upgrade.upgradeGovernance`
- `upgrade.proxy`
- `upgrade.newImplementation`
- `treasury.treasury`

建议新增：

| 状态 | 方法 | 路径 | 参数 | 返回要求 |
| --- | --- | --- | --- | --- |
| 应补齐 | `GET` | `/governance/deployment` | `chainId` | 当前治理合约部署配置。 |

## 9. 交易区 Exchange

交易区页面在 `vite/packages/table/page/core/Exchange`。当前混合使用 mock、第三方行情、localhost 接口和合约直连。

### 9.1 行情与订单

| 状态 | 方法 | 路径 | 参数/请求体 | 返回要求 |
| --- | --- | --- | --- | --- |
| 已封装/历史 | `GET` | `/exchange/others/market/{query}` | path: 查询条件 | 市场行情。 |
| 已调用 | `POST` | `http://localhost:8080/myExchange/myExchange` | 用户或地址条件 | 我的兑换/交易列表。 |
| 已调用 | `POST` | `http://localhost:8080/Exchanges/limitOrder` | 限价单表单 | 创建限价单。 |
| 已调用 | `POST` | `http://localhost:8080/Transactions/myOrder` | 用户或地址条件 | 我的订单。 |
| 应补齐 | `GET` | `/exchange/tokens` | 链 id、关键词 | 可交易 token 列表。 |
| 应补齐 | `GET` | `/exchange/quotes` | `base`、`quote`、`amount` | 报价。 |
| 应补齐 | `GET` | `/exchange/klines` | `symbol`、`period` | K 线。 |
| 应补齐 | `POST` | `/exchange/orders/limit` | 限价单 | 创建限价单。 |
| 应补齐 | `POST` | `/exchange/orders/{id}/cancel` | path: 订单 id | 撤单。 |
| 应补齐 | `GET` | `/exchange/orders` | 地址、状态、分页 | 订单列表。 |

订单字段建议：

```json
{
  "id": "order_xxx",
  "owner": "0x...",
  "baseToken": "0x...",
  "quoteToken": "0x...",
  "side": "buy",
  "price": "1.23",
  "amount": "100",
  "filledAmount": "0",
  "status": "open",
  "txHash": "0x...",
  "createdAt": "2026-06-17T10:00:00.000Z"
}
```

### 9.2 合约/RPC 要求

Exchange 仍通过 ethers 调用 token、pool、swap、withdraw 相关合约。后端如果做索引或代理，需要支持：

- token 余额、授权额度、转账和 approve 事件索引。
- swap、添加/移除流动性、withdraw 交易状态索引。
- 第三方行情建议由后端代理 CoinGecko 等接口，避免前端直连受限。

## 10. 存储区

存储区在 `vite/packages/table/page/core/Storage/offchainStorage`。当前直连 The Graph、CoinGecko、Infura 和链上合约。建议后端提供统一存储市场索引 API。

### 10.1 市场查询

| 状态 | 方法 | 路径 | 参数 | 返回要求 |
| --- | --- | --- | --- | --- |
| 应补齐 | `GET` | `/storage/market/summary` | `chainId` | 市场概览、价格、订单统计。 |
| 应补齐 | `GET` | `/storage/data-resources` | 分页、关键词 | 数据资源列表。 |
| 应补齐 | `GET` | `/storage/providers` | 分页、状态 | 存储提供者列表。 |
| 应补齐 | `GET` | `/storage/data-orders` | 地址、分页 | 数据购买订单。 |
| 应补齐 | `GET` | `/storage/storage-orders` | 地址、分页 | 存储订单。 |

字段需兼容当前 GraphQL 查询：

- `dataOrderCreateds`：`id`、`buyerAddress`、`ownerAddress`、`dataName`。
- `dataOwnerRegistereds`：`id`、`ownerAddress`、`dataName`、`dataPrice`。
- `storageProviderRegistereds`：`id`、`providerAddress`、`availableSpace`、`pricePerGBPerMonth`。
- `storageOrderCreateds`：`id`、`buyerAddress`、`providerAddress`、`storageSpace`。

### 10.2 市场写入

| 状态 | 方法 | 路径 | 请求体 | 返回要求 |
| --- | --- | --- | --- | --- |
| 应补齐 | `POST` | `/storage/providers` | `address`、`availableSpace`、`pricePerGBPerMonth`、`txHash` | 注册存储提供者。 |
| 应补齐 | `POST` | `/storage/data-resources` | `ownerAddress`、`dataName`、`dataPrice`、`txHash` | 注册数据资源。 |
| 应补齐 | `POST` | `/storage/data-orders` | `buyerAddress`、`ownerAddress`、`dataPurchaseProtocol`、`txHash` | 创建数据订单。 |
| 应补齐 | `POST` | `/storage/storage-orders` | `buyerAddress`、`providerAddress`、`storageSpace`、`storageProtocol`、`txHash` | 创建存储订单。 |

链上合约函数需索引：

- `registerStorageProvider(availableSpace, pricePerGBPerMonth)`
- `registerDataOwner(dataName, dataPrice)`
- `createDataOrder(ownerAddress, dataPurchaseProtocol)`
- `createStorageOrder(providerAddress, storageSpace, storageProtocol)`

## 11. 网络区 DVPN

网络区在 `vite/packages/table/page/core/Network`。`vpn.vue` 当前直连本地服务，其他账号、节点、质押页面多为 mock。

### 11.1 DVPN 本地服务

| 状态 | 方法 | 路径 | 参数 | 返回要求 |
| --- | --- | --- | --- | --- |
| 已调用 | `GET/POST` | `http://localhost:8080/start` | 可选节点、账号配置 | 启动 VPN。 |
| 已调用 | `GET/POST` | `http://localhost:8080/stop` | 无 | 停止 VPN。 |
| 应补齐 | `GET` | `http://localhost:8080/status` | 无 | 连接状态、节点、时长。 |
| 应补齐 | `GET` | `http://localhost:8080/speed` | 无 | 上下行速度。 |
| 应补齐 | `GET` | `http://localhost:8080/traffic` | 无 | 流量统计。 |

### 11.2 网络账号、节点与质押

| 状态 | 方法 | 路径 | 参数/请求体 | 返回要求 |
| --- | --- | --- | --- | --- |
| 应补齐 | `GET` | `/dvpn/account` | 地址 | 账户余额、套餐、流量。 |
| 应补齐 | `POST` | `/dvpn/account/recharge` | 地址、金额、txHash | 充值记录。 |
| 应补齐 | `GET` | `/dvpn/nodes` | 地区、状态、分页 | VPN 节点列表。 |
| 应补齐 | `POST` | `/dvpn/nodes/register` | 节点信息、质押 txHash | 注册节点。 |
| 应补齐 | `GET` | `/dvpn/stakes` | 地址、状态、分页 | 质押列表。 |
| 应补齐 | `POST` | `/dvpn/stakes/stake` | 节点 id、金额、txHash | 节点质押。 |
| 应补齐 | `POST` | `/dvpn/stakes/withdraw` | stake id、txHash | 解除质押。 |

## 12. 转账区

转账区在 `vite/packages/table/page/core/Transfers`。当前主要使用 `window.ethereum`/Web3 直接发起链上转账，本地记录存在用户 store 中。

| 状态 | 方法 | 路径 | 参数/请求体 | 返回要求 |
| --- | --- | --- | --- | --- |
| 应补齐 | `POST` | `/transfers` | `from`、`to`、`amount`、`token`、`chainId`、`txHash` | 保存转账记录。 |
| 应补齐 | `GET` | `/transfers` | 地址、链 id、状态、分页 | 转账历史。 |
| 应补齐 | `GET` | `/transfers/{txHash}` | path: 交易哈希 | 转账详情和确认状态。 |

要求：

- 普通链上转账由钱包签名，后端负责记录、索引和状态刷新。
- 跨链转账应复用“跨链区”的任务和桥交易模型。

## 13. 社交、社区、消息与增长功能

这些接口散布在 `vite/packages/table/js/service/socialNetwork_*`、store 和旧桌面页面中。

### 13.1 社区论坛

| 状态 | 方法 | 路径 | 参数/请求体 | 返回要求 |
| --- | --- | --- | --- | --- |
| 已调用 | `GET` | `/forum/list` | 分页、关键词 | 帖子列表。 |
| 已调用 | `GET` | `/forum/getInfo/{id}` | path: 帖子 id | 帖子详情。 |
| 已调用 | `POST` | `/forum/save` | 标题、内容、标签、图片 | 创建/更新帖子。 |
| 已调用 | `GET` | `/forum/getListByTag/{tag_id}` | path: 标签 id | 标签下帖子。 |
| 已调用 | `POST` | `/file/upload` | multipart file | 上传文件，返回 URL。 |
| 已调用 | `GET` | `/comment/list/{id}` | path: 帖子 id | 评论列表。 |
| 已调用 | `POST` | `/comment/save` | 帖子 id、父评论、内容、图片 | 保存评论。 |
| 已调用 | `GET` | `/tag/list` | 无 | 标签列表。 |
| 已调用 | `GET` | `/tag/top` | `num` | 热门标签。 |

### 13.2 社交用户、关注、点赞收藏

| 状态 | 方法 | 路径 | 参数 | 返回要求 |
| --- | --- | --- | --- | --- |
| 已调用 | `GET` | `/socialUserinfo/list` | 分页、关键词 | 社交用户列表。 |
| 已调用 | `GET` | `/socialUserinfo/getUserDetail/{id}` | path: 用户 id | 用户详情。 |
| 已调用 | `GET` | `/socialUserinfo/top` | `num` | 热门用户。 |
| 已调用 | `PUT` | `/love/userLove` | `userId`、`forumId` | 帖子点赞切换。 |
| 已调用 | `PUT` | `/collect/userCollect` | `userId`、`forumId` | 帖子收藏切换。 |
| 已调用 | `POST` | `/follower/follow` | `userId`、`followId` | 关注/取消关注。 |

### 13.3 消息、签到、团队与商品

| 模块 | 状态 | 方法 | 路径 | 要求 |
| --- | --- | --- | --- | --- |
| 签到 | 已调用 | `GET` | `/app/com/sign/getTodayRank` | 今日排行。 |
| 签到 | 已调用 | `POST` | `/app/com/sign/doSign` | 执行签到。 |
| 签到 | 已调用 | `GET` | `/app/com/sign/getSignInfo` | 签到信息。 |
| 签到 | 已调用 | `GET` | `/app/com/sign/getDailyNewUsers` | 每日新增用户。 |
| 激活码 | 已调用 | `POST/GET` | `/app/activeCode`、`/app/verifyCode`、`/app/createCodes`、`/app/exchangeCode`、`/app/listCodes` | 激活码创建、校验、兑换、列表。 |
| 消息 | 已调用 | `POST` | `/app/com/message/messageIndex` | 消息首页聚合。 |
| 消息 | 已调用 | `POST` | `/app/com/message/newFollower` | 新粉丝消息。 |
| 消息 | 已调用 | `POST` | `/app/com/message/systemNotice` | 系统通知。 |
| 消息 | 已调用 | `POST` | `/app/com/message/messageNotice` | 消息通知。 |
| 消息 | 已调用 | `POST` | `/app/com/message/push` | 推送消息。 |
| 消息 | 已调用 | `POST` | `/app/com/message/support` | 点赞/支持消息。 |
| 消息 | 已调用 | `POST` | `/app/com/message/commentMessage` | 评论消息。 |
| 消息 | 已调用 | `POST` | `/app/com/message/mentions` | 提及消息。 |
| 团队 | 已调用 | `POST` | `/app/team/create`、`/joinByNo`、`/quitByNo`、`/disbandByNo` | 团队创建、加入、退出、解散。 |
| 团队 | 已调用 | `GET/POST` | `/app/team/getLeader`、`/getMembers`、`/getMy`、`/getByNo`、`/getList` | 团队查询。 |
| 贡献 | 已调用 | `GET/POST` | `/app/online/getMemberDevote`、`/app/online/exchangeDevote` | 贡献值查询和兑换。 |
| 等级勋章 | 已调用 | `GET` | `/app/getUserGrade`、`/app/medal/getUserMedal` | 用户等级和勋章。 |
| 商品 | 已调用 | `GET/POST` | `/app/category/list`、`/app/good/desk/add`、`/app/good/desk/page`、`/app/good/getGoodRecommend`、`/app/good/incSupport`、`/app/good/incCount` | 桌面商品/推荐/计数。 |
| 头像框订单 | 已调用 | `GET/POST` | `/app/good/frame/list`、`/users/update`、`/app/order/ensure`、`/app/order/getQrcode`、`/app/good/frame/my`、`/app/order/checkOrderPaid`、`/app/good/frame/equip` | 头像框购买和装备。 |
| 文章 | 已调用 | `POST` | `/app/article/getOne`、`/app/article/getMany` | 文章读取。 |
| 缓存 | 已调用 | `GET/POST` | `/app/juhe/get`、`/app/cache/get`、`/app/cache/set` | 聚合数据和缓存。 |

## 14. 用户设置与权限

用户设置页面在 `vite/packages/table/page/core/userSettings`，服务封装在 `vite/packages/table/js/service/usersetting.ts`。

| 状态 | 方法 | 路径 | 参数/请求体 | 返回要求 |
| --- | --- | --- | --- | --- |
| 已调用 | `GET` | `/user-permissions/current` | 当前 token | 当前用户权限配置。 |
| 已调用 | `POST` | `/user-permissions/current` | 完整权限对象 | 保存后的权限配置。 |
| 已调用 | `POST` | `/user-permissions/create-default/{userId}` | `userRole` | 创建默认权限。 |

权限对象建议：

```json
{
  "userId": 1,
  "role": "user",
  "features": {
    "wallet": true,
    "governance": true,
    "crossChain": true,
    "storage": true,
    "network": true
  },
  "updatedAt": "2026-06-17T10:00:00.000Z"
}
```

## 15. 收藏区、加密区、计算区与 CApp 运行器

### 15.1 收藏区

收藏区当前主要使用 mock，历史服务保留 `GET /collection/list/`。

| 状态 | 方法 | 路径 | 参数 | 返回要求 |
| --- | --- | --- | --- | --- |
| 已封装/历史 | `GET` | `/collection/list/` | 用户、分页 | 收藏列表。 |
| 应补齐 | `GET` | `/collections` | 类型、用户、分页 | 收藏的 DApp、NFT、合约、文章聚合列表。 |
| 应补齐 | `POST` | `/collections` | `targetType`、`targetId` | 新增收藏。 |
| 应补齐 | `DELETE` | `/collections/{id}` | path: 收藏 id | 删除收藏。 |

### 15.2 加密区

加密区当前是静态页面和本地数据，暂不强依赖后端。

| 状态 | 方法 | 路径 | 参数 | 返回要求 |
| --- | --- | --- | --- | --- |
| 可选 | `GET` | `/crypto/libraries` | 无 | 密码算法、库和教程列表。 |
| 可选 | `GET` | `/crypto/docs/{id}` | path: 文档 id | 加密能力说明。 |

### 15.3 计算区

计算区当前页面较轻，尚未看到稳定业务接口。

| 状态 | 方法 | 路径 | 参数 | 返回要求 |
| --- | --- | --- | --- | --- |
| 应补齐 | `GET` | `/computing/resources` | 分页、状态 | 可用计算资源。 |
| 应补齐 | `POST` | `/computing/tasks` | 任务配置、镜像、资源需求 | 创建计算任务。 |
| 应补齐 | `GET` | `/computing/tasks` | 用户、状态、分页 | 任务列表。 |
| 应补齐 | `GET` | `/computing/tasks/{id}` | path: 任务 id | 任务详情、日志入口。 |
| 应补齐 | `POST` | `/computing/tasks/{id}/cancel` | path: 任务 id | 取消任务。 |

### 15.4 CApp 运行器

CApp 运行器主要加载本地 wasm 和应用资源，不直接依赖后端。CApp 发布、市场、收藏、评论、评分建议复用 DApp 市场 API，并额外要求：

| 状态 | 方法 | 路径 | 参数 | 返回要求 |
| --- | --- | --- | --- | --- |
| 应补齐 | `GET` | `/capps/{id}/manifest` | path: CApp id | wasm、入口文件、权限声明、版本。 |
| 应补齐 | `GET` | `/capps/{id}/versions` | path: CApp id | 版本列表和校验哈希。 |

## 16. PunkClaw、模型网关与本地能力

PunkClaw 在 `vite/packages/table/page/core/PunkClaw`。当前更多是本地任务编排和模型配置。

| 状态 | 方法 | 路径 | 参数/请求体 | 返回要求 |
| --- | --- | --- | --- | --- |
| 应补齐 | `GET` | `/punkclaw/tasks` | 状态、分页 | 任务列表。 |
| 应补齐 | `POST` | `/punkclaw/tasks` | prompt、上下文、工具权限 | 创建任务。 |
| 应补齐 | `GET` | `/punkclaw/tasks/{id}` | path: 任务 id | 任务详情、步骤状态。 |
| 应补齐 | `POST` | `/punkclaw/tasks/{id}/cancel` | path: 任务 id | 取消任务。 |
| 应补齐 | `GET` | `/punkclaw/logs` | taskId、分页 | 执行日志。 |
| 可选 | `POST` | `{modelBaseUrl}/v1/chat/completions` | OpenAI-compatible body | 模型推理响应。 |
| 可选/调试 | `POST` | `http://127.0.0.1:7513/ingest/{id}` | 事件数据 | 本地调试采集。 |

如果后端提供模型网关，建议完全兼容 OpenAI Chat Completions：

```json
{
  "model": "gpt-4.1-mini",
  "messages": [
    { "role": "user", "content": "hello" }
  ],
  "stream": true
}
```

## 17. 桌面/远程桌面、钱包静态页与节点监控

桌面和远程桌面视图在 `vite/packages/table/page/core/Desktop`，钱包静态页由 `services/wallet-client` 提供，节点监控由 `services/node-monitor` 提供。

### 17.1 桌面/远程桌面

当前远程桌面主要是前端 VNC 组件和本地配置，未看到稳定业务 API。若要支持多节点远程桌面管理，建议补齐：

| 状态 | 方法 | 路径 | 参数/请求体 | 返回要求 |
| --- | --- | --- | --- | --- |
| 应补齐 | `GET` | `/desktop/sessions` | 地址、节点、状态、分页 | 远程桌面会话列表。 |
| 应补齐 | `POST` | `/desktop/sessions` | 节点 id、连接协议、权限配置 | 创建远程桌面会话，返回连接信息。 |
| 应补齐 | `GET` | `/desktop/sessions/{id}` | path: 会话 id | 会话详情、连接状态。 |
| 应补齐 | `POST` | `/desktop/sessions/{id}/close` | path: 会话 id | 关闭会话。 |

连接信息建议只返回短期 token，不在前端保存长期凭据：

```json
{
  "id": "session_xxx",
  "protocol": "vnc",
  "endpoint": "wss://example.com/vnc/session_xxx",
  "token": "temporary-token",
  "expiresAt": "2026-06-17T10:10:00.000Z"
}
```

### 17.2 钱包静态页服务

`services/wallet-client/service.js` 是静态服务，`healthPath` 为 `/`，要求：

- 构建产物需包含 `index.html` 和 `_next`。
- 通过 Electron 服务管理解析页面入口，不要求额外后端 API。
- 钱包业务数据仍走“钱包与账户”模块 API。

### 17.3 节点监控服务

`services/node-monitor/service.js` 启动本地 Spug API，健康检查为 `/apis/health/`。

| 状态 | 方法 | 路径 | 参数 | 返回要求 |
| --- | --- | --- | --- | --- |
| 已调用 | `GET` | `/apis/health/` | 无 | `{ "status": "ok" }`。 |
| 应补齐/按 Spug 保持 | `GET` | `/apis/...` | 按节点监控页面需要 | 主机、进程、任务、告警、日志等监控数据。 |

要求：

- 本地服务必须监听 `127.0.0.1`。
- 监控数据中涉及主机凭据、SSH 配置、任务脚本时必须脱敏。
- 若未来把节点监控接入核心工作台，建议提供统一摘要接口 `/node-monitor/summary`，返回节点在线数、告警数、CPU/内存/磁盘概览。

## 18. 翻译、IPFS 与第三方代理

| 模块 | 状态 | 方法 | 路径 | 要求 |
| --- | --- | --- | --- | --- |
| 翻译 | 已调用 | `GET` | `/translate/` | 参数 `from`、`to`、`text`，返回译文。 |
| IPFS 上传 | 已调用 | `POST` | `/api/v0/add` | multipart 文件上传，返回 `Hash`。 |
| IPFS 访问 | 已调用 | `GET` | `/ipfs/{cid}` | 网关读取资源。 |
| 第三方行情 | 可选 | `GET` | `/proxy/coingecko/...` | 代理 CoinGecko，避免前端直连限制。 |
| The Graph | 可选 | `POST` | `/proxy/thegraph/storage` | 代理存储市场 GraphQL。 |

IPFS 上传响应需兼容：

```json
{
  "Name": "file.png",
  "Hash": "Qm...",
  "Size": "12345"
}
```

## 19. 后端落地优先级

P0，当前核心页面已经调用或强依赖：

- 认证、用户信息、token 刷新、权限配置。
- 钱包登录、钱包列表、交易记录。
- DApp 市场详情、列表、收藏、点赞、评论、评分、桌面卡片。
- 区块链浏览器区块、交易、账户 API。
- PoT 本地服务 `/api/*` 和 WebSocket。
- 跨链本地服务 `/api/*`，尤其任务、区块、交易、proof。
- 治理特殊系统交易锁定/解锁接口。
- 节点监控服务 `/apis/health/` 和钱包静态页服务入口。

P1，页面可运行但数据不完整或依赖 mock：

- 治理提案、投票、质押、国库索引 API。
- Exchange 行情、订单、交易索引 API。
- 存储市场索引 API。
- DVPN 账号、节点、质押、状态 API。
- 转账历史 API。
- 社区、消息、签到、团队和商品接口。

P2，建议补齐以提升完整性：

- 计算区任务 API。
- 加密区文档 API。
- CApp manifest 和版本 API。
- PunkClaw 任务、日志和模型网关 API。
- 第三方行情、GraphQL、IPFS 的统一代理和限流。

## 20. 实现注意事项

- 不要让前端持有生产环境私钥；涉及代签必须进入受控签名服务并记录审计日志。
- 所有链上交易相关 API 都应保存 `chainId`、`txHash`、`from`、`to`、`status`、`blockNumber`、`confirmations`。
- 大整数一律字符串化，前端再按 token decimals 格式化。
- 本地服务建议只监听 `127.0.0.1`，并通过 Electron 服务管理暴露访问地址。
- 对上传、评论、DApp 描述、CApp manifest 等用户输入做内容安全校验。
- 后端应保留接口版本，例如 `/api/v1/...`，避免当前历史接口和新接口继续混用。
