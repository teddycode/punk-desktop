# DApp 市场新增字段说明

## 数据库字段修改

### d_dappinfo 表需要添加的字段

为了支持 DApp Store 中展示更丰富的信息，需要在 `d_dappinfo` 表中添加以下字段：

| 字段名 | 类型 | 说明 | 默认值 | 备注 |
|--------|------|------|--------|------|
| `quality_level` | DECIMAL(2,1) | 质量等级 | 0 | 范围 0-5，支持半星评分（如 4.5） |
| `visit_count` | INT | 访问量 | 0 | 记录 DApp 的总访问次数 |
| `stakers_count` | INT | 质押人数 | 0 | 参与质押投资的用户数量 |
| `total_staked` | DECIMAL(20,2) | 投资总额 | 0 | 当前总质押金额（PUNK） |
| `staking_cap` | DECIMAL(20,2) | 投资上限 | 0 | 该 DApp 允许的最大质押金额（PUNK） |
| `revenue` | DECIMAL(20,2) | 收益 | 0 | DApp 已产生的总收益（PUNK） |
| `created_at` | TIMESTAMP | 创建时间 | CURRENT_TIMESTAMP | 记录创建时间 |
| `updated_at` | TIMESTAMP | 更新时间 | CURRENT_TIMESTAMP ON UPDATE | 记录更新时间 |

### SQL 语句示例

```sql
-- 添加质量等级字段
ALTER TABLE d_dappinfo ADD COLUMN quality_level DECIMAL(2,1) DEFAULT 0 COMMENT '质量等级（0-5）';

-- 添加访问量字段
ALTER TABLE d_dappinfo ADD COLUMN visit_count INT DEFAULT 0 COMMENT '访问量';

-- 添加质押人数字段
ALTER TABLE d_dappinfo ADD COLUMN stakers_count INT DEFAULT 0 COMMENT '质押人数';

-- 添加投资总额字段
ALTER TABLE d_dappinfo ADD COLUMN total_staked DECIMAL(20,2) DEFAULT 0 COMMENT '投资总额（PUNK）';

-- 添加投资上限字段
ALTER TABLE d_dappinfo ADD COLUMN staking_cap DECIMAL(20,2) DEFAULT 0 COMMENT '投资上限（PUNK）';

-- 添加收益字段
ALTER TABLE d_dappinfo ADD COLUMN revenue DECIMAL(20,2) DEFAULT 0 COMMENT '收益（PUNK）';

-- 添加创建时间字段（如果不存在）
ALTER TABLE d_dappinfo ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间';

-- 添加更新时间字段（如果不存在）
ALTER TABLE d_dappinfo ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间';
```

## API 接口修改

### 1. getDapplist 接口

**路径：** `GET /api/dapp/list`

**返回数据需要包含的新字段：**

```json
{
  "code": 200,
  "data": {
    "records": [
      {
        "id": 1,
        "name": "DApp名称",
        "description": "描述",
        "logo": "logo地址",
        "imgs": [...],
        // 新增字段
        "qualityLevel": 4.5,        // 质量等级
        "visitCount": 12580,         // 访问量
        "stakersCount": 256,         // 质押人数
        "totalStaked": 150000,       // 投资总额（PUNK）
        "stakingCap": 500000,        // 投资上限（PUNK）
        "revenue": 8520.50           // 收益（PUNK）
      }
    ],
    "totalRow": 100,
    "pageNum": 1,
    "pageSize": 6
  }
}
```

### 2. getDappDetail 接口

**路径：** `GET /api/dapp/detail/:id`

**返回数据需要包含的新字段：**

```json
{
  "code": 200,
  "data": {
    "id": 1,
    "name": "DApp名称",
    "description": "描述",
    "detail": "详细信息",
    "logo": "logo地址",
    "imgs": [...],
    "contracts": [
      {
        "address": "0x1234567890abcdef...",
        "name": "合约名称",
        "totalStaked": 50000,
        "stakingCap": 200000
      }
    ],
    // 新增字段
    "qualityLevel": 4.5,
    "visitCount": 12580,
    "stakersCount": 256,
    "totalStaked": 150000,
    "stakingCap": 500000,
    "revenue": 8520.50
  }
}
```

## 业务逻辑说明

### 1. 质量等级 (quality_level)
- **计算方式：** 建议综合以下因素计算
  - 用户评分平均值（权重 40%）
  - 代码审计结果（权重 30%）
  - 活跃度（访问量、交易量）（权重 20%）
  - 社区反馈（权重 10%）
- **更新频率：** 每日凌晨自动计算更新

### 2. 访问量 (visit_count)
- **更新时机：** 用户每次访问 DApp 详情页时 +1
- **建议：** 可以添加去重机制（同一用户 24 小时内只计数一次）

### 3. 质押人数 (stakers_count)
- **计算方式：** 统计对该 DApp 有活跃质押的独立用户数
- **更新时机：** 
  - 用户质押时 +1
  - 用户完全退出质押时 -1

### 4. 投资总额 (total_staked)
- **计算方式：** 该 DApp 下所有合约的质押总和
- **更新时机：**
  - 用户质押时累加
  - 用户退出质押时扣减

### 5. 投资上限 (staking_cap)
- **设置方式：** 由 DApp 创建者或管理员设置
- **用途：** 防止过度集中投资，控制风险

### 6. 收益 (revenue)
- **计算方式：** 该 DApp 累计产生的所有收益
- **更新时机：** 
  - 每日结算时累加当日收益
  - 可以是链上合约产生的实际收益

## 前端展示效果

修改完成后，DApp 卡片将展示如下信息：

```
┌─────────────────────────┐
│     DApp 图片封面        │
│     DApp 名称            │
│     DApp 描述            │
├─────────────────────────┤
│ 质量等级: ★★★★☆ (4.5)   │
│ 访问量: 12.6K            │
│ 质押人数: 256            │
│ 投资总额: 150K PUNK      │
│ 收益: +8.5K PUNK ✓       │
└─────────────────────────┘
```

## 注意事项

1. **数据一致性：** 确保 `total_staked` = sum(所有合约的质押金额)
2. **性能优化：** `visit_count` 等高频更新字段建议使用缓存（Redis）+ 定时同步数据库
3. **数据校验：** 
   - `quality_level` 范围必须在 0-5 之间
   - `total_staked` 不能超过 `staking_cap`
   - 所有金额字段必须 >= 0
4. **索引优化：** 建议为 `quality_level`、`visit_count`、`total_staked` 添加索引，便于排序查询

## 相关功能实现

### 前端已实现
✅ DappCard 组件已支持显示所有新字段  
✅ DappMarketPage 已传递新字段给 DappCard  
✅ DappDetails 页面添加"质押投资"按钮  
✅ 合约地址可点击跳转到合约详情  
✅ DappStakingPage 支持按合约分配投资额度  

### 后端需实现
⏳ 数据库字段添加（SQL 语句见上方）  
⏳ API 接口返回新字段  
⏳ 访问量统计逻辑  
⏳ 质押/退出质押时更新相关字段  
⏳ 质量等级自动计算任务  
⏳ 收益结算定时任务  
