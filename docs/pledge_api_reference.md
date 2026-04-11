# 质押 RPC 接口速查

本文档面向前端联调，所有接口均通过 JSON-RPC 调用，命名空间为 `eth_`。

## 通用约定

- `blockNrOrHash` 常用值：`latest`、`pending`、`earliest`、`0x...`
- 地址统一为 `0x...` 格式
- 数值字段大多以十六进制字符串返回，需要前端自行转换
- `alphaIndex` 以 `10000` 为基数，例如 `5000` 表示 `50%`

## 关键返回结构

### `eth_getPledgeInfo`

| 字段 | 说明 |
|------|------|
| `pledgeAmount` | 质押金额 |
| `pledgeYear` | 质押年限 |
| `startTime` | 开始时间或开始区块 |
| `interestRate` | 利率 |
| `earnInterest` | 已赚利息 |
| `annualFee` | 年费 |
| `lastAnnualFeeTime` | 上次年费时间 |
| `contractAddress` | 合约地址 |
| `deployedAddress` | 部署者地址 |
| `investorAddress` | 投资人地址 |
| `beneficiaryAddress` | 受益人地址 |
| `isStaked` | 是否已质押 |

### `eth_getInvestorInterest`

| 字段 | 说明 |
|------|------|
| `investorAddress` | 投资人地址 |
| `pledgeAmount` | 质押金额 |
| `pledgeYear` | 质押年限 |
| `interestRate` | 利率 |
| `startTime` | 开始时间 |
| `accruedInterest` | 当前累计利息 |
| `totalInterest` | 到期总利息 |
| `elapsedRatio` | 已过时间比例 |
| `isMatured` | 是否到期 |
| `currentBlock` | 当前计算区块 |

### `eth_getBeneficiariesInfo`

返回数组，单项结构如下：

| 字段 | 说明 |
|------|------|
| `beneficiaryAddress` | 受益人地址 |
| `alphaIndex` | 分配比例，基数为 `10000` |

## 接口清单

| 分类 | 方法 | 参数 |
|------|------|------|
| 综合查询 | `eth_getPledgeInfo` | `(contractAddress, blockNrOrHash)` |
| 投资人查询 | `eth_getPledgeAmount` | `(contractAddress, investorAddress, blockNrOrHash)` |
| 投资人查询 | `eth_getPledgeYear` | `(contractAddress, investorAddress, blockNrOrHash)` |
| 投资人查询 | `eth_getStartTime` | `(contractAddress, investorAddress, blockNrOrHash)` |
| 投资人查询 | `eth_getInterestRate` | `(contractAddress, investorAddress, blockNrOrHash)` |
| 投资人查询 | `eth_getEarnInterest` | `(contractAddress, investorAddress, blockNrOrHash)` |
| 投资人查询 | `eth_getCurrentInterest` | `(contractAddress, investorAddress, blockNrOrHash)` |
| 投资人查询 | `eth_getInvestorInterest` | `(contractAddress, investorAddress, blockNrOrHash)` |
| 投资人查询 | `eth_getAllInvestorsInterest` | `(contractAddress, blockNrOrHash)` |
| 受益人查询 | `eth_getBeneficiaryAddress` | `(contractAddress, blockNrOrHash)` |
| 受益人查询 | `eth_getBeneficiariesInfo` | `(contractAddress, blockNrOrHash)` |
| 受益人查询 | `eth_getBeneficiaryInfo` | `(contractAddress, beneficiaryAddress, blockNrOrHash)` |
| 合约级查询 | `eth_getAnnualFee` | `(contractAddress, blockNrOrHash)` |
| 合约级查询 | `eth_getLastAnnualFeeTime` | `(contractAddress, blockNrOrHash)` |
| 合约级查询 | `eth_getDeployedAddress` | `(contractAddress, blockNrOrHash)` |
| 合约级查询 | `eth_getInvestorAddress` | `(contractAddress, blockNrOrHash)` |
| 合约级查询 | `eth_getStakeFlag` | `(contractAddress, blockNrOrHash)` |
| 其他查询 | `eth_getSecurityLevel` | `(address, blockNrOrHash)` |
| 其他查询 | `eth_getTotalNumberOfGas` | `(contractAddress, blockNrOrHash)` |
| 其他查询 | `eth_getContractCallCount` | `(contractAddress, blockNrOrHash)` |
| 其他查询 | `eth_getTotalValueTx` | `(contractAddress, blockNrOrHash)` |

## 调用示例

```ts
import { ethers } from 'ethers'

const provider = new ethers.providers.JsonRpcProvider('http://your-rpc-url:8545')

const pledgeInfo = await provider.send('eth_getPledgeInfo', [
  contractAddress,
  'latest'
])

const investorInterest = await provider.send('eth_getInvestorInterest', [
  contractAddress,
  investorAddress,
  'latest'
])

const beneficiaries = await provider.send('eth_getBeneficiariesInfo', [
  contractAddress,
  'latest'
])
```

## 前端处理建议

- 十六进制数值统一集中转换
- 页面展示前先确认 `interestRate`、`pledgeYear` 的实际业务含义
- 需要列表页时，优先使用 `eth_getAllInvestorsInterest`、`eth_getBeneficiariesInfo`
