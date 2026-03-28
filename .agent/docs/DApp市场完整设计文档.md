# DApp 市场完整设计文档

## 目录
- [1. 概述](#1-概述)
- [2. 数据库设计](#2-数据库设计)
- [3. API 接口设计](#3-api-接口设计)
- [4. 前端组件设计](#4-前端组件设计)
- [5. 数据流设计](#5-数据流设计)

---

## 1. 概述

本文档描述了 PunkOS DApp 市场的完整设计方案，包括：
- **DApp Store**：展示去中心化应用，支持质押投资
- **智能合约广场**：展示以太坊智能合约，支持合约质押
- **我的投资**：用户投资管理和收益查看
- **质押投资系统**：对 DApp 及其关联合约进行质押，获取收益

**核心功能：**
1. DApp 浏览、搜索、筛选、评分、评论
2. 智能合约浏览、详情查看、关联关系展示
3. 质押投资（支持按合约分配）
4. 投资收益跟踪和管理
5. 质押退出机制

---

## 2. 数据库设计

### 2.1 扩展的 DApp 信息表

#### d_dappinfo - DApp信息表（扩展）

在原有基础上新增字段：

| 新增字段 | 类型 | 约束 | 说明 |
|---------|------|------|------|
| quality_level | TINYINT | DEFAULT 0 | 质量等级（1-5星） |
| visit_count | INT | DEFAULT 0 | 访问量 |
| stakers_count | INT | DEFAULT 0 | 质押人数 |
| total_staked | DECIMAL(20,2) | DEFAULT 0 | 投资总额（PUNK） |
| staking_cap | DECIMAL(20,2) | DEFAULT 0 | 投资上限（PUNK） |
| revenue | DECIMAL(20,2) | DEFAULT 0 | 总收益（PUNK） |

---

### 2.2 智能合约相关表

#### d_contract - 智能合约表

存储智能合约的基本信息和代码。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 合约ID |
| name | VARCHAR(255) | NOT NULL | 合约名称 |
| address | VARCHAR(255) | NOT NULL, UNIQUE | 合约地址 |
| category | VARCHAR(50) | | 分类：finance/social/game/tool/nft/dao |
| description | TEXT | | 合约描述 |
| logo | VARCHAR(255) | | Logo 图片地址 |
| code | LONGTEXT | | 合约源代码 |
| abi | LONGTEXT | | 合约 ABI |
| bytecode | LONGTEXT | | 合约 Bytecode |
| version | VARCHAR(50) | | 合约版本号 |
| certification_level | TINYINT | DEFAULT 0 | 认证等级（1-5星） |
| visit_count | INT | DEFAULT 0 | 访问量 |
| stakers_count | INT | DEFAULT 0 | 质押人数 |
| total_staked | DECIMAL(20,2) | DEFAULT 0 | 质押总额（PUNK） |
| staking_cap | DECIMAL(20,2) | DEFAULT 0 | 质押上限（PUNK） |
| revenue | DECIMAL(20,2) | DEFAULT 0 | 总收益（PUNK） |
| website | VARCHAR(255) | | 官方网站 |
| github | VARCHAR(255) | | GitHub 仓库 |
| create_time | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| update_time | DATETIME | ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

---

#### d_contract_relation - 合约关联表

存储合约之间的关联关系。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 关联ID |
| contract_id | INT | FOREIGN KEY | 合约ID |
| related_address | VARCHAR(255) | NOT NULL | 关联合约地址 |
| relation_type | VARCHAR(50) | | 关系类型：dependency/upgrade/family 等 |

---

#### d_contract_audit - 合约审计报告表

存储合约的审计报告链接。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 审计ID |
| contract_id | INT | FOREIGN KEY | 合约ID |
| audit_url | VARCHAR(255) | | 审计报告 URL |
| audit_org | VARCHAR(255) | | 审计机构 |
| audit_date | DATE | | 审计日期 |

---

### 2.3 质押投资相关表

#### d_staking - 质押投资表

存储用户的质押投资记录。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 质押ID |
| user_id | INT | FOREIGN KEY | 用户ID |
| dapp_id | INT | FOREIGN KEY, NULLABLE | DApp ID（如果是 DApp 质押） |
| total_amount | DECIMAL(20,2) | NOT NULL | 质押总额（PUNK） |
| current_revenue | DECIMAL(20,2) | DEFAULT 0 | 当前收益（PUNK） |
| revenue_rate | DECIMAL(10,2) | DEFAULT 0 | 收益率（%） |
| status | VARCHAR(20) | DEFAULT 'active' | 状态：active/completed/withdrawn |
| start_time | DATETIME | DEFAULT CURRENT_TIMESTAMP | 质押开始时间 |
| end_time | DATETIME | NULLABLE | 质押结束时间 |
| tx_hash | VARCHAR(255) | NULLABLE | 质押交易哈希 |
| create_time | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| update_time | DATETIME | ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

**索引：**
- INDEX (user_id, status)
- INDEX (dapp_id)

---

#### d_staking_allocation - 质押合约分配表

存储质押金额在各个合约上的分配。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 分配ID |
| staking_id | INT | FOREIGN KEY | 质押ID |
| contract_address | VARCHAR(255) | NOT NULL | 合约地址 |
| contract_name | VARCHAR(255) | | 合约名称（冗余） |
| allocated_amount | DECIMAL(20,2) | NOT NULL | 分配金额（PUNK） |
| current_revenue | DECIMAL(20,2) | DEFAULT 0 | 当前收益（PUNK） |
| revenue_rate | DECIMAL(10,2) | DEFAULT 0 | 收益率（%） |
| create_time | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

**索引：**
- INDEX (staking_id)
- INDEX (contract_address)

---

#### d_staking_revenue - 质押收益记录表

存储每日的质押收益记录。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 记录ID |
| staking_id | INT | FOREIGN KEY | 质押ID |
| revenue_type | VARCHAR(20) | | 收益类型：daily/bonus/other |
| amount | DECIMAL(20,2) | NOT NULL | 收益金额（PUNK） |
| total_revenue | DECIMAL(20,2) | | 累计收益（PUNK） |
| note | VARCHAR(255) | | 备注 |
| revenue_date | DATE | NOT NULL | 收益日期 |
| create_time | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

**索引：**
- INDEX (staking_id, revenue_date)

---

## 3. API 接口设计

### 3.1 DApp 相关接口（扩展）

#### 3.1.1 查询 DApp 列表（扩展）

**接口地址**: `GET /dDappinfo/page`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| pageNum | int | 是 | 页码 |
| pageSize | int | 是 | 每页大小 |
| chain | string | 否 | 区块链筛选 |
| name | string | 否 | 名称搜索 |
| qualityLevel | int | 否 | 质量等级筛选 |
| sortBy | string | 否 | 排序字段：visitCount/stakersCount/totalStaked/revenue |

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "records": [{
      "id": 1,
      "name": "Uniswap",
      "logo": "...",
      "description": "...",
      "qualityLevel": 5,
      "visitCount": 1500000,
      "stakersCount": 25000,
      "totalStaked": 15000000,
      "stakingCap": 20000000,
      "revenue": 750000
    }],
    "totalRow": 100,
    "totalPage": 10
  }
}
```

---

#### 3.1.2 查询 DApp 扩展信息

**接口地址**: `GET /dDappinfo/getExtendedInfo/{id}`

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "qualityLevel": 5,
    "visitCount": 1500000,
    "stakersCount": 25000,
    "totalStaked": 15000000,
    "stakingCap": 20000000,
    "revenue": 750000,
    "contracts": ["0xE59...", "0x1F9..."]
  }
}
```

---

#### 3.1.3 增加访问量

**接口地址**: `POST /dDappinfo/incrementVisit`

**请求参数**:
```json
{
  "dappId": 1
}
```

**响应**: `boolean`

---

### 3.2 智能合约接口

#### 3.2.1 分页查询合约列表

**接口地址**: `GET /dContract/page`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| pageNum | int | 是 | 页码 |
| pageSize | int | 是 | 每页大小 |
| category | string | 否 | 分类筛选 |
| name | string | 否 | 名称/地址搜索 |
| sortBy | string | 否 | 排序：hot/stakers/staked/revenue/certification |

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "records": [{
      "id": 1,
      "name": "Uniswap V3 Router",
      "address": "0xE592427A0AEce92De3Edee1F18E0157C05861564",
      "category": "finance",
      "logo": "...",
      "certificationLevel": 5,
      "visitCount": 2580000,
      "stakersCount": 15420,
      "totalStaked": 8500000,
      "revenue": 425000
    }],
    "totalRow": 50,
    "totalPage": 6
  }
}
```

---

#### 3.2.2 根据地址查询合约详情

**接口地址**: `GET /dContract/getByAddress/{address}`

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "id": 1,
    "name": "Uniswap V3 Router",
    "address": "0xE592...",
    "code": "pragma solidity...",
    "abi": "[...]",
    "bytecode": "0x6080...",
    "version": "1.0.0",
    "certificationLevel": 5,
    "relatedContracts": ["0x1F9...", "0xC36..."],
    "auditReports": [{
      "url": "https://...",
      "org": "CertiK",
      "date": "2023-01-15"
    }]
  }
}
```

---

#### 3.2.3 查询关联合约

**接口地址**: `GET /dContract/getRelated/{address}`

**响应**: `List<Contract>`

---

### 3.3 质押投资接口

#### 3.3.1 提交质押投资

**接口地址**: `POST /dStaking/submit`

**请求参数**:
```json
{
  "userId": 1,
  "dappId": 1,
  "totalAmount": 50000,
  "allocations": [
    {
      "contractAddress": "0xE592...",
      "amount": 30000
    },
    {
      "contractAddress": "0x1F9...",
      "amount": 20000
    }
  ]
}
```

**响应**:
```json
{
  "code": 200,
  "data": {
    "stakingId": 123,
    "txHash": "0xabc..."
  }
}
```

**说明**：
- 此接口返回后，前端需要调用 Web3 接口发起质押交易
- 交易类型为自定义的以太坊质押交易
- 质押对象是合约地址

---

#### 3.3.2 查询用户投资列表

**接口地址**: `GET /dStaking/getUserStakings`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | int | 是 | 用户ID |
| status | string | 否 | 状态筛选：active/completed |

**响应示例**:
```json
{
  "code": 200,
  "data": [{
    "id": 123,
    "dapp": {
      "id": 1,
      "name": "Uniswap",
      "logo": "..."
    },
    "totalAmount": 50000,
    "currentRevenue": 6250,
    "revenueRate": 12.5,
    "status": "active",
    "startTime": "2024-01-15 10:00:00",
    "days": 45
  }]
}
```

---

#### 3.3.3 查询质押详情

**接口地址**: `GET /dStaking/getDetail/{stakingId}`

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "id": 123,
    "dapp": {
      "name": "Uniswap",
      "logo": "..."
    },
    "totalAmount": 50000,
    "currentRevenue": 6250,
    "revenueRate": 12.5,
    "days": 45,
    "status": "active",
    "startTime": "2024-01-15",
    "allocations": [
      {
        "contractAddress": "0xE592...",
        "contractName": "Uniswap V3 Router",
        "amount": 30000,
        "revenue": 3750,
        "revenueRate": 12.5
      }
    ]
  }
}
```

---

#### 3.3.4 退出质押

**接口地址**: `POST /dStaking/withdraw`

**请求参数**:
```json
{
  "stakingId": 123
}
```

**响应**:
```json
{
  "code": 200,
  "data": {
    "txHash": "0xdef...",
    "principal": 50000,
    "revenue": 6250,
    "total": 56250
  }
}
```

---

#### 3.3.5 查询收益记录

**接口地址**: `GET /dStaking/getRevenue`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| stakingId | int | 是 | 质押ID |
| pageNum | int | 是 | 页码 |
| pageSize | int | 是 | 每页大小 |

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "records": [
      {
        "date": "2024-03-04",
        "type": "daily",
        "amount": 138.89,
        "totalRevenue": 6250,
        "note": "每日质押收益"
      }
    ],
    "totalRow": 45
  }
}
```

---

#### 3.3.6 查询收益趋势

**接口地址**: `GET /dStaking/getTrend`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| stakingId | int | 是 | 质押ID |
| period | string | 否 | 时间周期：7d/30d/90d/all |

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "dataPoints": [1000, 1500, 2200, 2800, 3500, 4200, 5000, 5600, 6250],
    "labels": ["1/15", "1/22", "1/29", "2/5", "2/12", "2/19", "2/26", "3/4", "今"]
  }
}
```

---

## 4. 前端组件设计

### 4.1 组件结构

```
NewDAppCard.vue (主容器)
├── DappMarketPage.vue (DApp Store)
│   ├── DappCard.vue (DApp 卡片)
│   └── DappDetails.vue (DApp 详情)
│       └── DappStakingPage.vue (质押投资)
├── ContractMarketPage.vue (合约广场)
│   ├── ContractCard.vue (合约卡片)
│   └── ContractDetails.vue (合约详情)
│       └── DappStakingPage.vue (质押投资)
├── MyInvestmentPage.vue (我的投资)
│   └── StakingDetailsPage.vue (质押详情)
└── MyInfoPage.vue (我的信息)
```

---

### 4.2 组件说明

#### 4.2.1 DappMarketPage.vue
- **功能**：DApp 市场首页
- **特性**：
  - 分类筛选（DeFi/DEX/游戏/NFT/DAO/社交）
  - 排序（热度/质押人数/质押总额/收益）
  - 搜索
  - 卡片展示（大卡片+小卡片混合布局）

---

#### 4.2.2 ContractMarketPage.vue
- **功能**：智能合约广场
- **特性**：
  - 分类筛选（金融/社交/游戏/工具/NFT/DAO）
  - 排序（访问量/质押人数/质押总额/收益/认证等级）
  - 合约卡片展示

---

#### 4.2.3 ContractCard.vue
- **展示内容**：
  - 合约名称、Logo
  - 合约地址（简短显示）
  - 认证等级（星级）
  - 访问量、质押人数
  - 质押总额、收益
  - 操作按钮（查看详情、质押投资）

---

#### 4.2.4 ContractDetails.vue
- **展示内容**：
  - 基本信息（名称、地址、版本、认证等级）
  - 统计数据卡片（访问量、质押人数、质押总额、收益）
  - 合约描述
  - 合约代码（可复制）
  - ABI（可复制）
  - Bytecode（可复制）
  - 关联合约列表（可点击跳转）
  - 审计报告链接
  - 外部链接（官网、GitHub、Etherscan）

---

#### 4.2.5 DappStakingPage.vue
- **功能**：DApp 质押投资页面
- **特性**：
  - 显示 DApp 基本信息和统计
  - 输入质押总额
  - 按合约分配投资额度
    - 滑块调整百分比
    - 直接输入金额
    - 快速分配（平均/按现有质押比例）
  - 显示每个合约的质押进度
  - 质押摘要（总额、已分配、未分配、预计 APY）
  - 质押须知

---

#### 4.2.6 MyInvestmentPage.vue
- **功能**：我的投资列表
- **特性**：
  - 顶部统计卡片（总投资、累计收益、参与项目数）
  - 筛选（全部/进行中/已完成）
  - 排序（时间/金额/收益）
  - 投资卡片展示
    - DApp 信息
    - 投资金额、当前收益、收益率、投资时长
    - 收益趋势小图
    - 操作按钮（查看详情、收益详情、退出质押）

---

#### 4.2.7 StakingDetailsPage.vue
- **功能**：质押收益详情页
- **特性**：
  - 头部信息（DApp名称、状态、时间范围）
  - 统计卡片（本金、累计收益、收益率、质押天数）
  - 收益趋势图（可切换时间周期）
  - 合约分配详情（各合约的分配金额和收益）
  - 收益记录表格（分页）
  - 退出质押按钮

---

### 4.3 路由和视图管理

NewDAppCard.vue 使用 `currentView` 状态管理不同视图：

| currentView | 显示内容 | 触发条件 |
|-------------|---------|---------|
| menu | 菜单页面 | 默认状态 |
| dappDetails | DApp 详情 | 点击 DApp 卡片 |
| contractDetails | 合约详情 | 点击合约卡片/地址 |
| dappStaking | 质押投资 | 点击质押按钮 |
| stakingDetails | 收益详情 | 点击收益详情 |
| projectDetails | 项目详情 | 点击我的项目 |

---

## 5. 数据流设计

### 5.1 质押投资流程

```
用户选择 DApp/合约
    ↓
打开质押投资页面 (DappStakingPage)
    ↓
加载 DApp 信息和关联合约列表
    ↓
用户输入质押总额
    ↓
用户分配各合约投资额度
    ↓
提交质押请求 → 后端 /dStaking/submit
    ↓
返回 stakingId 和交易数据
    ↓
前端调用 Web3 发起质押交易（自定义交易类型）
    ↓
交易确认后更新质押状态
    ↓
跳转到我的投资页面
```

---

### 5.2 退出质押流程

```
我的投资页面 → 点击退出质押
    ↓
确认弹窗（显示本金+收益）
    ↓
调用 /dStaking/withdraw 接口
    ↓
后端生成退出交易
    ↓
前端调用 Web3 发起退出交易
    ↓
交易确认后更新状态为 completed
    ↓
资金到账（24小时内）
```

---

### 5.3 收益结算流程

```
后端定时任务（每日 00:00）
    ↓
遍历所有 active 状态的质押记录
    ↓
根据合约收益率计算每日收益
    ↓
插入 d_staking_revenue 记录
    ↓
更新 d_staking.current_revenue
    ↓
更新 d_staking_allocation.current_revenue
    ↓
触发前端收益通知
```

---

## 6. 后端需要添加的字段和表

### 6.1 d_dappinfo 表需要添加的字段

```sql
ALTER TABLE d_dappinfo 
ADD COLUMN quality_level TINYINT DEFAULT 0 COMMENT '质量等级（1-5星）',
ADD COLUMN visit_count INT DEFAULT 0 COMMENT '访问量',
ADD COLUMN stakers_count INT DEFAULT 0 COMMENT '质押人数',
ADD COLUMN total_staked DECIMAL(20,2) DEFAULT 0 COMMENT '投资总额（PUNK）',
ADD COLUMN staking_cap DECIMAL(20,2) DEFAULT 0 COMMENT '投资上限（PUNK）',
ADD COLUMN revenue DECIMAL(20,2) DEFAULT 0 COMMENT '总收益（PUNK）';
```

---

### 6.2 需要新建的表

1. **d_contract** - 智能合约表
2. **d_contract_relation** - 合约关联表
3. **d_contract_audit** - 合约审计报告表
4. **d_staking** - 质押投资表
5. **d_staking_allocation** - 质押合约分配表
6. **d_staking_revenue** - 质押收益记录表

完整建表语句参见第2章数据库设计。

---

## 7. 前端接口调用示例

### 7.1 查询 DApp 列表

```typescript
import { getDapplist } from '@/js/service/dappMarket';

const fetchDappList = async () => {
  const res = await getDapplist(
    currentPage.value, 
    pageSize.value, 
    selectedCategory.value, 
    searchValue.value
  );
  displayedDapps.value = res.data.records;
  totalRow.value = res.data.totalRow;
};
```

---

### 7.2 提交质押投资

```typescript
import { submitStaking } from '@/js/service/dappMarket';
import { ethers } from 'ethers';

const handleStake = async () => {
  const stakingData = {
    userId: appStore().userInfo.uid,
    dappId: dapp.value.id,
    totalAmount: totalStakeAmount.value,
    allocations: contracts.value.map(c => ({
      contractAddress: c.address,
      amount: c.allocatedAmount
    }))
  };

  // 1. 提交到后端
  const res = await submitStaking(stakingData);
  const { stakingId, txHash } = res.data;

  // 2. 调用 Web3 发起质押交易（预留接口）
  // const provider = useWeb3ModalProvider();
  // const ethersProvider = new ethers.providers.Web3Provider(provider.walletProvider.value);
  // const signer = ethersProvider.getSigner();
  // await signer.sendTransaction({
  //   to: contractAddress,
  //   value: ethers.utils.parseUnits(amount.toString(), 18),
  //   data: customStakingData
  // });

  message.success('质押成功！');
  emit('success', stakingData);
};
```

---

### 7.3 查询用户投资列表

```typescript
import { getUserStakings } from '@/js/service/dappMarket';

const loadInvestments = async () => {
  const res = await getUserStakings(
    appStore().userInfo.uid,
    filterStatus.value === 'all' ? null : filterStatus.value
  );
  investments.value = res.data;
};
```

---

## 8. 注意事项

### 8.1 质押交易实现

质押投资通过**自定义的以太坊交易类型**实现，具体实现需要：

1. 定义质押交易的数据结构
2. 在智能合约中实现质押函数
3. 前端使用 ethers.js 发起交易
4. 监听交易确认并更新后端状态

**前端预留接口示例**：

```typescript
// 质押交易接口（需要实现）
interface StakingTransaction {
  contractAddress: string;
  amount: string;
  stakingId: number;
}

async function executeStakingTransaction(
  provider: any, 
  tx: StakingTransaction
): Promise<string> {
  // TODO: 实现质押交易逻辑
  // 1. 构造交易数据
  // 2. 发送交易
  // 3. 等待确认
  // 4. 返回交易哈希
  throw new Error('Not implemented');
}
```

---

### 8.2 收益计算

收益计算逻辑由后端定时任务执行：

- 每日 00:00 计算前一日收益
- 根据合约收益率和质押金额计算
- 支持复利（自动复投）
- 记录到 d_staking_revenue 表

---

### 8.3 数据同步

- 访问量：前端每次查看详情时调用 incrementDappVisit
- 质押人数/总额/收益：由质押操作自动更新
- 质量等级：由管理员手动设置或算法自动评估

---

## 9. 完整实现清单

### 9.1 前端组件 ✅

- [x] ContractMarketPage.vue - 合约广场
- [x] ContractCard.vue - 合约卡片
- [x] ContractDetails.vue - 合约详情
- [x] DappStakingPage.vue - 质押投资页面
- [x] MyInvestmentPage.vue - 我的投资
- [x] StakingDetailsPage.vue - 质押详情
- [x] mockContracts.ts - Mock 合约数据
- [x] 扩展 DappCard.vue - 添加新字段显示
- [x] 更新 NewDAppCard.vue - 路由和菜单

### 9.2 接口定义 ✅

- [x] dappMarket.ts - 添加所有新接口定义

### 9.3 后端需要实现 ⏳

- [ ] 数据库表结构修改（扩展 d_dappinfo）
- [ ] 创建新表（d_contract、d_staking 等）
- [ ] 实现合约相关接口
- [ ] 实现质押投资接口
- [ ] 实现收益记录接口
- [ ] 实现定时收益结算任务
- [ ] 质押交易智能合约开发

---

## 附录

### A. Mock 数据说明

项目包含 15 个以太坊主流智能合约的 Mock 数据，涵盖：
- **金融类**：Uniswap、Aave、Compound、Curve、MakerDAO
- **NFT类**：OpenSea Seaport、Azuki
- **游戏类**：Axie Infinity、Decentraland
- **社交类**：Lens Protocol
- **工具类**：Chainlink、ENS、Gnosis Safe
- **DAO类**：Uniswap Governance、Snapshot

详见 `vite/packages/table/data/mockContracts.ts`

---

**文档版本**: 1.0  
**最后更新**: 2024-03-04  
**维护者**: PunkOS 开发团队
