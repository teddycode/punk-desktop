# 质押信息查询 RPC 接口文档

> 适用前端对接，所有接口通过 JSON-RPC 调用，命名空间为 `eth_`。

## 通用说明

- **blockNrOrHash**：区块号或区块哈希，常用值：
  - `"latest"` — 最新区块（最常用）
  - `"pending"` — 待打包区块
  - `"earliest"` — 创世区块
  - `"0x..."` — 十六进制区块号，如 `"0x1a4"`
- **地址格式**：`"0x..."` 40位十六进制，如 `"0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18"`
- **返回值中的数字**：均为十六进制字符串（`"0x..."` 格式），前端需转为十进制
- **AlphaIndex**：受益人分配比例，以 10000 为基数，例如 `5000` 表示 50%

---

## 一、综合质押信息查询

### 1. `eth_getPledgeInfo`

查询合约地址的完整质押信息（一次返回所有字段）。

**参数**：

| 序号 | 参数 | 类型 | 说明 |
|------|------|------|------|
| 1 | contractAddress | `string` | 合约地址 |
| 2 | blockNrOrHash | `string` | 区块号，通常传 `"latest"` |

**调用示例**：

```json
{
  "jsonrpc": "2.0",
  "method": "eth_getPledgeInfo",
  "params": ["0xContractAddress...", "latest"],
  "id": 1
}
```

**返回字段**：

| 字段 | 类型 | 说明 |
|------|------|------|
| pledgeAmount | `number` | 质押金额 |
| pledgeYear | `number` | 质押年限 |
| startTime | `number` | 开始时间（区块号） |
| interestRate | `number` | 利率 |
| earnInterest | `number` | 已赚利息 |
| annualFee | `number` | 年费 |
| lastAnnualFeeTime | `number` | 上次年费时间 |
| contractAddress | `string` | 合约地址 |
| deployedAddress | `string` | 部署者地址 |
| investorAddress | `string` | 投资人地址 |
| beneficiaryAddress | `string` | 受益人地址 |
| isStaked | `boolean` | 是否已质押 |

---

## 二、投资人相关查询（双地址参数）

以下接口支持多投资人体系，需同时传入 **合约地址** 和 **投资人地址**。

### 2. `eth_getPledgeAmount`

查询指定投资人的质押金额。

**参数**：

| 序号 | 参数 | 类型 | 说明 |
|------|------|------|------|
| 1 | contractAddress | `string` | 合约地址 |
| 2 | investorAddress | `string` | 投资人地址 |
| 3 | blockNrOrHash | `string` | 区块号，通常传 `"latest"` |

```json
{
  "jsonrpc": "2.0",
  "method": "eth_getPledgeAmount",
  "params": ["0xContract...", "0xInvestor...", "latest"],
  "id": 1
}
```

**返回**：`"0x..."` 十六进制数字（质押金额）

---

### 3. `eth_getPledgeYear`

查询指定投资人的质押年限。

**参数**：同 `eth_getPledgeAmount`

```json
{
  "jsonrpc": "2.0",
  "method": "eth_getPledgeYear",
  "params": ["0xContract...", "0xInvestor...", "latest"],
  "id": 1
}
```

**返回**：`"0x..."` 十六进制数字（质押年限）

---

### 4. `eth_getStartTime`

查询指定投资人的质押开始时间（区块号）。

**参数**：同 `eth_getPledgeAmount`

```json
{
  "jsonrpc": "2.0",
  "method": "eth_getStartTime",
  "params": ["0xContract...", "0xInvestor...", "latest"],
  "id": 1
}
```

**返回**：`"0x..."` 十六进制数字（开始区块号）

---

### 5. `eth_getInterestRate`

查询指定投资人的利率。

**参数**：同 `eth_getPledgeAmount`

```json
{
  "jsonrpc": "2.0",
  "method": "eth_getInterestRate",
  "params": ["0xContract...", "0xInvestor...", "latest"],
  "id": 1
}
```

**返回**：`"0x..."` 十六进制数字（利率）

---

### 6. `eth_getEarnInterest`

查询指定投资人的已赚利息（链上存储值）。

**参数**：同 `eth_getPledgeAmount`

```json
{
  "jsonrpc": "2.0",
  "method": "eth_getEarnInterest",
  "params": ["0xContract...", "0xInvestor...", "latest"],
  "id": 1
}
```

**返回**：`"0x..."` 十六进制数字（已赚利息）

---

### 7. `eth_getCurrentInterest`

查询指定投资人的**实时利息**（按当前区块动态计算，非链上存储）。

**参数**：同 `eth_getPledgeAmount`

```json
{
  "jsonrpc": "2.0",
  "method": "eth_getCurrentInterest",
  "params": ["0xContract...", "0xInvestor...", "latest"],
  "id": 1
}
```

**返回**：`"0x..."` 十六进制数字（当前动态计算的利息）

---

### 8. `eth_getInvestorInterest`

查询指定合约下某投资人的**详细实时利息信息**（动态计算，含多个维度）。

**参数**：

| 序号 | 参数 | 类型 | 说明 |
|------|------|------|------|
| 1 | contractAddress | `string` | 合约地址 |
| 2 | investorAddress | `string` | 投资人地址 |
| 3 | blockNrOrHash | `string` | 区块号，通常传 `"latest"` |

```json
{
  "jsonrpc": "2.0",
  "method": "eth_getInvestorInterest",
  "params": ["0xContract...", "0xInvestor...", "latest"],
  "id": 1
}
```

**返回字段**：

| 字段 | 类型 | 说明 |
|------|------|------|
| investorAddress | `string` | 投资人地址 |
| pledgeAmount | `string` | 质押金额（hex） |
| pledgeYear | `string` | 质押年限（hex） |
| interestRate | `string` | 利率（hex） |
| startTime | `string` | 开始时间（hex） |
| accruedInterest | `string` | 已累积利息，按时间比例动态计算（hex） |
| totalInterest | `string` | 到期总利息（hex） |
| elapsedRatio | `string` | 已过时间比例，万分比 10000=100%（hex） |
| isMatured | `boolean` | 是否已到期 |
| currentBlock | `string` | 当前计算所用区块号（hex） |

---

### 9. `eth_getAllInvestorsInterest`

查询指定合约下**所有投资人**的实时利息信息。

**参数**：

| 序号 | 参数 | 类型 | 说明 |
|------|------|------|------|
| 1 | contractAddress | `string` | 合约地址 |
| 2 | blockNrOrHash | `string` | 区块号，通常传 `"latest"` |

```json
{
  "jsonrpc": "2.0",
  "method": "eth_getAllInvestorsInterest",
  "params": ["0xContract...", "latest"],
  "id": 1
}
```

**返回**：数组，每个元素字段同 `eth_getInvestorInterest`（不含 `currentBlock`）。

---

## 三、受益人相关查询

### 10. `eth_getBeneficiaryAddress`

查询合约的受益人地址（旧版单受益人字段）。

**参数**：

| 序号 | 参数 | 类型 | 说明 |
|------|------|------|------|
| 1 | address | `string` | 合约地址 |
| 2 | blockNrOrHash | `string` | 区块号，通常传 `"latest"` |

```json
{
  "jsonrpc": "2.0",
  "method": "eth_getBeneficiaryAddress",
  "params": ["0xContract...", "latest"],
  "id": 1
}
```

**返回**：`"0x..."` 受益人地址

---

### 11. `eth_getBeneficiariesInfo` 🆕

查询合约下**所有受益人**及其分配比例。

**参数**：

| 序号 | 参数 | 类型 | 说明 |
|------|------|------|------|
| 1 | contractAddress | `string` | 合约地址 |
| 2 | blockNrOrHash | `string` | 区块号，通常传 `"latest"` |

```json
{
  "jsonrpc": "2.0",
  "method": "eth_getBeneficiariesInfo",
  "params": ["0xContract...", "latest"],
  "id": 1
}
```

**返回**：数组

| 字段 | 类型 | 说明 |
|------|------|------|
| beneficiaryAddress | `string` | 受益人地址 |
| alphaIndex | `string` | 分配比例（hex），基数 10000，如 `"0x1388"` = 5000 = 50% |

**返回示例**：

```json
[
  {
    "beneficiaryAddress": "0xAbc123...",
    "alphaIndex": "0x1388"
  },
  {
    "beneficiaryAddress": "0xDef456...",
    "alphaIndex": "0x1388"
  }
]
```

> 所有受益人的 `alphaIndex` 之和应等于 `10000`（0x2710）。

---

### 12. `eth_getBeneficiaryInfo` 🆕

查询指定受益人的分配比例。

**参数**：

| 序号 | 参数 | 类型 | 说明 |
|------|------|------|------|
| 1 | contractAddress | `string` | 合约地址 |
| 2 | beneficiaryAddress | `string` | 受益人地址 |
| 3 | blockNrOrHash | `string` | 区块号，通常传 `"latest"` |

```json
{
  "jsonrpc": "2.0",
  "method": "eth_getBeneficiaryInfo",
  "params": ["0xContract...", "0xBeneficiary...", "latest"],
  "id": 1
}
```

**返回字段**：

| 字段 | 类型 | 说明 |
|------|------|------|
| beneficiaryAddress | `string` | 受益人地址 |
| alphaIndex | `string` | 分配比例（hex），基数 10000 |

---

## 四、其他质押相关查询（单地址参数）

以下接口以合约地址为参数，查询合约级别的信息。

### 13. `eth_getAnnualFee`

**参数**：`(address, blockNrOrHash)` — 合约地址 + 区块号

**返回**：`"0x..."` 年费

### 14. `eth_getLastAnnualFeeTime`

**参数**：`(address, blockNrOrHash)` — 合约地址 + 区块号

**返回**：`"0x..."` 上次年费时间

### 15. `eth_getDeployedAddress`

**参数**：`(address, blockNrOrHash)` — 合约地址 + 区块号

**返回**：`"0x..."` 部署者地址

### 16. `eth_getInvestorAddress`

**参数**：`(address, blockNrOrHash)` — 合约地址 + 区块号

**返回**：`"0x..."` 投资人地址（旧版单投资人）

### 17. `eth_getStakeFlag`

**参数**：`(address, blockNrOrHash)` — 合约地址 + 区块号

**返回**：`true` / `false` 是否已质押

### 18. `eth_getSecurityLevel`

**参数**：`(address, blockNrOrHash)` — 账户地址 + 区块号

**返回**：`"0x..."` 安全等级

### 19. `eth_getTotalNumberOfGas`

**参数**：`(address, blockNrOrHash)` — 合约地址 + 区块号

**返回**：`"0x..."` 总 Gas 消耗

### 20. `eth_getContractCallCount`

**参数**：`(address, blockNrOrHash)` — 合约地址 + 区块号

**返回**：`"0x..."` 合约调用次数

### 21. `eth_getTotalValueTx`

**参数**：`(address, blockNrOrHash)` — 合约地址 + 区块号

**返回**：`"0x..."` 总交易值

---

## 五、前端调用示例（ethers.js）

```javascript
const provider = new ethers.JsonRpcProvider("http://your-rpc-url:8545");

// 查询完整质押信息
const pledgeInfo = await provider.send("eth_getPledgeInfo", [contractAddr, "latest"]);

// 查询投资人实时利息
const interest = await provider.send("eth_getInvestorInterest", [contractAddr, investorAddr, "latest"]);

// 查询所有受益人及其分配比例
const beneficiaries = await provider.send("eth_getBeneficiariesInfo", [contractAddr, "latest"]);

// 查询单个受益人的分配比例
const beneficiary = await provider.send("eth_getBeneficiaryInfo", [contractAddr, beneficiaryAddr, "latest"]);

// 十六进制转十进制
const pledgeAmount = parseInt(interest.pledgeAmount, 16);
const alphaIndex = parseInt(beneficiaries[0].alphaIndex, 16); // 5000 = 50%
```

---

## 六、接口参数速查表

| 接口 | 参数数量 | 参数格式 | 返回类型 |
|------|---------|---------|---------|
| `eth_getPledgeInfo` | 2 | `(合约地址, 区块号)` | Object |
| `eth_getPledgeAmount` | 3 | `(合约地址, 投资人地址, 区块号)` | Hex数字 |
| `eth_getPledgeYear` | 3 | `(合约地址, 投资人地址, 区块号)` | Hex数字 |
| `eth_getStartTime` | 3 | `(合约地址, 投资人地址, 区块号)` | Hex数字 |
| `eth_getInterestRate` | 3 | `(合约地址, 投资人地址, 区块号)` | Hex数字 |
| `eth_getEarnInterest` | 3 | `(合约地址, 投资人地址, 区块号)` | Hex数字 |
| `eth_getCurrentInterest` | 3 | `(合约地址, 投资人地址, 区块号)` | Hex数字 |
| `eth_getInvestorInterest` | 3 | `(合约地址, 投资人地址, 区块号)` | Object |
| `eth_getAllInvestorsInterest` | 2 | `(合约地址, 区块号)` | Array |
| `eth_getBeneficiaryAddress` | 2 | `(合约地址, 区块号)` | 地址 |
| `eth_getBeneficiariesInfo` | 2 | `(合约地址, 区块号)` | Array |
| `eth_getBeneficiaryInfo` | 3 | `(合约地址, 受益人地址, 区块号)` | Object |
| `eth_getStakeFlag` | 2 | `(合约地址, 区块号)` | Boolean |
| `eth_getAnnualFee` | 2 | `(合约地址, 区块号)` | Hex数字 |
| `eth_getLastAnnualFeeTime` | 2 | `(合约地址, 区块号)` | Hex数字 |
| `eth_getDeployedAddress` | 2 | `(合约地址, 区块号)` | 地址 |
| `eth_getInvestorAddress` | 2 | `(合约地址, 区块号)` | 地址 |
| `eth_getSecurityLevel` | 2 | `(账户地址, 区块号)` | Hex数字 |
| `eth_getTotalNumberOfGas` | 2 | `(合约地址, 区块号)` | Hex数字 |
| `eth_getContractCallCount` | 2 | `(合约地址, 区块号)` | Hex数字 |
| `eth_getTotalValueTx` | 2 | `(合约地址, 区块号)` | Hex数字 |
