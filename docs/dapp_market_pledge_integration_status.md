# DApp 广场质押对接进度说明

本文档记录 **Web3 应用广场**（`vite/packages/table/page/core/DappMarket`）中与质押相关的页面与链上接口改造情况，便于后续迭代。

参考文档：

- `docs/pledge_api_reference.md` — 质押查询类 JSON-RPC（`eth_getPledgeInfo`、`eth_getInvestorInterest` 等）
- `docs/stake-deposit-test.js` — type=6 质押交易构造与 `eth_sendRawTransaction` 发送示例

---

## 一、新增/复用的前端服务模块

| 文件 | 说明 |
|------|------|
| `vite/packages/table/js/service/pledgeRpc.ts`（`import` 别名 `@js/service/pledgeRpc`） | 使用 `ethers.providers.JsonRpcProvider`，通过 `provider.send(method, params)` 调用文档中的 `eth_*` 查询方法；含 `formatPledgeRpcError`、数值规范化与 PUNK（按 wei/`formatEther`）展示辅助函数 |
| `vite/packages/table/js/service/stakeDeposit.ts`（`@js/service/stakeDeposit`） | 按 `stake-deposit-test.js` 组装 type=6 交易，经钱包 `eth_signTransaction` 签名后 `eth_sendRawTransaction` 广播，并可 `waitForTransaction` 等待确认 |
| `vite/packages/table/js/service/stakePositionsStorage.ts`（`@js/service/stakePositionsStorage`） | `localStorage` 记录用户质押过的「合约地址 + 投资人地址」及 UI 展示用元数据（`principalPunk` 等），供「我的投资」列表在链上无索引时仍能展示 |

RPC 节点 URL、chainId 默认来自 `vite/packages/table/store/chains.ts` 中的 `punkos`。

质押入口合约地址默认与测试脚本一致（`pledgeRpc.DEFAULT_STAKE_HUB_CONTRACT` / `0x5FcfE7D2aA7fd0f66Fbfe8bD50aDfa30E7D8f995`），可通过 `buildType6StakeDepositTx` 的 `stakeHubOverride` 覆盖。

---

## 二、已更新接口的页面

| 页面 | 路径 | 已对接内容 |
|------|------|------------|
| 质押投资 | `DappStakingPage.vue` | 确认质押：type=6 + 钱包签名 + 广播 + 等待确认；错误统一 `formatPledgeRpcError`；成功后按分配写入 `stakePositionsStorage`；可选调用 `eth_getPledgeInfo` / `eth_getAllInvestorsInterest` 尝试刷新合约行上的质押数据（失败则保留 Mock） |
| 我的投资 | `MyInvestmentPage.vue` | 列表数据：`stakePositionsStorage` + 对每条调用 `eth_getInvestorInterest`  enrich；需连接钱包；无本地记录且未连接时列表为空；退出质押弹窗提示文档未提供链上退出方法 |
| 收益详情 | `StakingDetailsPage.vue` | 入参由数字 `stakingId` 改为 **`contractAddress`（字符串）**；使用 `eth_getInvestorInterest`、`eth_getBeneficiariesInfo` 渲染统计与受益人分配；失败 `message.error`；退出质押同上为占位提示 |
| 合约详情 | `ContractDetails.vue` | 在 Mock 基础上尝试 `eth_getPledgeInfo`、`eth_getAllInvestorsInterest`、`earnInterest` 合并展示质押总额/人数/收益（RPC 失败则静默保留 Mock） |
| 容器 | `page/app/card/NewDAppCard.vue` | 收益详情路由改为传递合约地址；质押成功后跳转「我的投资」的 `navIndex` 修正为 **4**（原误为 3） |

未改动的相关页面（仅跳转或展示 Mock，无 HTTP 质押接口）：`DappDetails.vue`（仅 `emit('stake')`）、`DappMarketPage.vue`、`ContractMarketPage.vue`、`ContractCard.vue` 等。

---

## 三、文档中有但尚未在前端全面接上的 RPC / 能力

以下方法已在 `pledgeRpc.ts` 中**易于扩展**，但当前页面**未全部使用**：

- `eth_getPledgeAmount` / `eth_getPledgeYear` / `eth_getStartTime` / `eth_getInterestRate` / `eth_getEarnInterest` / `eth_getCurrentInterest`（单笔查询，可与 `getInvestorInterest` 互为补充）
- `eth_getBeneficiaryAddress`（单受益人）
- `eth_getBeneficiaryInfo`（单受益人比例）
- `eth_getAnnualFee` / `eth_getLastAnnualFeeTime` / `eth_getDeployedAddress` / `eth_getInvestorAddress` / `eth_getSecurityLevel` / `eth_getTotalNumberOfGas` / `eth_getContractCallCount` / `eth_getTotalValueTx`

---

## 四、仍需产品/链上支持的能力（待实现）

1. **退出质押**  
   `pledge_api_reference.md` 未描述解除质押交易或 RPC；前端已用文案提示，需合约或官方文档补充后再接 `eth_signTransaction` / 合约 `withdraw` 等。

2. **「我的投资」全链上索引**  
   当前依赖用户在本设备上的 `localStorage` 记录质押过的合约；若需换设备或全链「我投过哪些合约」，需要索引服务、事件扫描或新 RPC（例如按投资人枚举合约）。

3. **多合约分配与单笔 type=6 的语义对齐**  
   现实现与 `stake-deposit-test.js` 一致：`to` 为**固定质押入口合约**，**一笔交易**汇总 `totalAllocated`；本地仍为**每条分配合约**写一条 `stakePositionsStorage`，便于 UI 分开展示。若链上要求「每笔质押对应不同 `to` 或 calldata」，需协议确认后改 `stakeDeposit.ts`。

4. **质押年限 `stakedTime`**  
   页面未提供年限输入，代码中固定为与测试脚本相同的默认值（`DEFAULT_STAKED_TIME = 2`）；若需用户可选，应增加表单项并传入 `buildType6StakeDepositTx`。

5. **收益趋势 / 每日收益明细**  
   `StakingDetailsPage` 中趋势与表格仍为基于当前累计利息的**示意数据**；文档无历史收益 RPC，若需真实曲线需后端或事件索引。

6. **后端 REST**（`dappMarket.ts` 中 `submitStaking`、`getUserStakings` 等）  
   已标注为与链上方案并行保留；若彻底弃用需清理调用方并协调后端。

7. **利率/年限字段语义**  
   链上 `interestRate`、`pledgeYear` 的进制与展示（是否需除 100、是否区块号当作时间等）需与节点/合约实现核对，当前为启发式展示。

---

## 五、联调建议

- 使用 `punkos.rpcUrl` 可连通的节点，确认支持自定义 `eth_getPledgeInfo` 等方法。
- 钱包须支持 **type=6** 与扩展字段（`deployerAddress`、`stakedAmount`、`stakedTime` 等）的 `eth_signTransaction`。
- 本地可对照运行 `docs/stake-deposit-test.js`（配置 `PUNKOS_RPC_URL`、`PUNKOS_PRIVATE_KEY` 等）验证与前端同一套参数是否可上链。

---

*文档生成于质押对接改造提交时，后续请在实现新能力时同步更新本节。*
