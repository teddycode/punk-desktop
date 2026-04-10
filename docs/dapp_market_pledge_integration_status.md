# DApp 广场质押对接状态

本文档记录 `vite/packages/table/page/core/DappMarket` 中与质押能力相关的前端接入情况。

## 相关文档

- [`pledge_api_reference.md`](./pledge_api_reference.md)：质押查询接口
- [`stake-deposit-test.js`](./stake-deposit-test.js)：type=6 质押交易测试脚本

## 服务层

| 文件 | 作用 |
|------|------|
| `vite/packages/table/js/service/pledgeRpc.ts` | 统一封装 `eth_*` 查询方法 |
| `vite/packages/table/js/service/stakeDeposit.ts` | 组装并发送 type=6 质押交易 |
| `vite/packages/table/js/service/stakePositionsStorage.ts` | 使用 `localStorage` 保存本地质押记录 |

## 已接入页面

| 页面 | 现状 |
|------|------|
| `DappStakingPage.vue` | 已接入质押签名、广播、成功后的本地记录 |
| `MyInvestmentPage.vue` | 已根据本地记录补充链上质押信息 |
| `StakingDetailsPage.vue` | 已按合约地址查询收益与受益人信息 |
| `ContractDetails.vue` | 已尝试读取合约级质押统计信息 |
| `NewDAppCard.vue` | 已修正收益详情跳转与导航索引 |

## 仍待完成

1. 退出质押
2. 基于投资人地址的全链路索引
3. 多合约分配与单笔 type=6 交易语义确认
4. `stakedTime` 等表单输入能力
5. 收益趋势和历史明细接口

## 联调建议

- 优先确认节点支持自定义 `eth_*` 方法
- 钱包侧需支持 type=6 交易签名
- 本地联调可先运行 `docs/stake-deposit-test.js`
