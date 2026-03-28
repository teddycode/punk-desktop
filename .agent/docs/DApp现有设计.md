# DApp 模块接口和数据库设计文档

## 目录
- [1. 概述](#1-概述)
- [2. 数据库设计](#2-数据库设计)
- [3. API 接口说明](#3-api-接口说明)

---

## 1. 概述

本文档详细描述了PunkOS后端系统中DApp（去中心化应用）模块的数据库表结构和API接口设计。DApp模块为用户提供了发布、浏览、评分、评论、收藏和点赞DApp的功能。

**主要功能模块：**
- DApp信息管理
- DApp评分系统
- DApp评论系统
- DApp点赞与收藏
- 用户桌面管理
- 标签分类系统

---

## 2. 数据库设计

### 2.1 核心表结构

#### 2.1.1 d_dappinfo - DApp信息表

存储DApp的基本信息和元数据。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | DApp ID |
| user_id | INT | | 发布者（作者）用户ID |
| name | VARCHAR(255) | | DApp名称 |
| description | TEXT | | 简短描述 |
| detail | TEXT | | 详细介绍 |
| chain | VARCHAR(255) | | 所属区块链（如ETH、BSC、Hive等） |
| website | VARCHAR(255) | | 官网地址 |
| logo | VARCHAR(255) | | Logo图片地址 |
| state | INT | DEFAULT 0 | 审核状态：0-未审核，1-审核失败，2-审核通过 |
| love_count | INT | DEFAULT 0 | 点赞数量 |
| create_time | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| update_time | DATETIME | ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

**关联关系：**
- 一对多：一个DApp可以有多张图片（d_dapp_img）
- 一对多：一个DApp可以有多个合约地址（d_dapp_contract）
- 多对多：一个DApp可以有多个标签（通过d_dapp_tag关联表）

---

#### 2.1.2 d_dapp_img - DApp图片表

存储DApp的展示图片。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 图片ID |
| dapp_id | INT | FOREIGN KEY | 关联的DApp ID |
| img | VARCHAR(255) | | 图片URL地址 |

---

#### 2.1.3 d_dapp_contract - DApp合约表

存储DApp相关的智能合约地址。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 合约记录ID |
| dapp_id | INT | FOREIGN KEY | 关联的DApp ID |
| address | VARCHAR(255) | | 合约地址 |

---

#### 2.1.4 d_tag - 标签表

存储DApp分类标签。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 标签ID |
| tag_name | VARCHAR(255) | | 标签名称 |

**预设标签示例：**
- 游戏
- 金融
- NFT
- 体育

---

#### 2.1.5 d_dapp_tag - DApp标签关联表

存储DApp与标签的多对多关系。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 关联记录ID |
| dapp_id | INT | FOREIGN KEY | DApp ID |
| tag_id | INT | FOREIGN KEY | 标签ID |

---

### 2.2 交互功能表

#### 2.2.1 d_rating - 评分表

存储用户对DApp的评分信息。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 评分记录ID |
| dapp_id | INT | FOREIGN KEY | DApp ID |
| user_id | INT | FOREIGN KEY | 评分用户ID |
| score | TINYINT | | 评分（1-5分） |
| create_time | DATETIME | DEFAULT CURRENT_TIMESTAMP | 评分时间 |

---

#### 2.2.2 d_comment - 评论表

存储用户对DApp的评论，支持评论回复（树形结构）。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 评论ID |
| dapp_id | INT | FOREIGN KEY | DApp ID |
| user_id | INT | FOREIGN KEY | 评论用户ID |
| parent_id | INT | NULLABLE | 父评论ID，NULL表示顶层评论 |
| content | LONGTEXT | | 评论内容 |
| create_time | DATETIME | DEFAULT CURRENT_TIMESTAMP | 评论时间 |

**关联关系：**
- 一对多：一条评论可以有多张图片（d_comment_img）
- 自关联：支持评论的多级回复

---

#### 2.2.3 d_comment_img - 评论图片表

存储评论中的图片附件。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 图片ID |
| comment_id | INT | FOREIGN KEY | 关联的评论ID |
| img | VARCHAR(255) | | 图片URL地址 |

---

#### 2.2.4 d_love - 点赞表

存储用户对DApp的点赞记录。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 点赞记录ID |
| user_id | INT | FOREIGN KEY | 点赞用户ID |
| dapp_id | INT | FOREIGN KEY | DApp ID |
| create_time | DATETIME | DEFAULT CURRENT_TIMESTAMP | 点赞时间 |

---

#### 2.2.5 d_collect - 收藏表

存储用户收藏的DApp。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 收藏记录ID |
| user_id | INT | FOREIGN KEY | 收藏用户ID |
| dapp_id | INT | FOREIGN KEY | DApp ID |
| create_time | DATETIME | DEFAULT CURRENT_TIMESTAMP | 收藏时间 |

---

#### 2.2.6 d_desk - 用户桌面表

存储用户添加到桌面的DApp快捷方式。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 桌面记录ID |
| user_id | INT | FOREIGN KEY | 用户ID |
| dapp_id | INT | FOREIGN KEY | DApp ID |
| create_time | DATETIME | DEFAULT CURRENT_TIMESTAMP | 添加时间 |

---

### 2.3 ER关系图说明

```
┌─────────────┐         ┌──────────────┐
│  d_dappinfo │────┬───→│  d_dapp_img  │
│   (主表)    │    │    └──────────────┘
└─────────────┘    │
       │           │    ┌──────────────────┐
       │           └───→│ d_dapp_contract  │
       │                └──────────────────┘
       │
       │           ┌──────────────┐
       ├──────────→│  d_dapp_tag  │←─────┬─────────┐
       │           └──────────────┘      │  d_tag  │
       │                                 └─────────┘
       │
       │           ┌──────────┐
       ├──────────→│ d_rating │
       │           └──────────┘
       │
       │           ┌───────────┐         ┌────────────────┐
       ├──────────→│ d_comment │────────→│ d_comment_img  │
       │           └───────────┘         └────────────────┘
       │
       │           ┌─────────┐
       ├──────────→│ d_love  │
       │           └─────────┘
       │
       │           ┌────────────┐
       ├──────────→│ d_collect  │
       │           └────────────┘
       │
       │           ┌─────────┐
       └──────────→│ d_desk  │
                   └─────────┘
```

---

## 3. API 接口说明

**基础URL**: `/api`（根据实际部署环境调整）

### 3.1 DApp信息管理模块

#### 3.1.1 添加DApp

**接口地址**: `POST /dDappinfo/save`

**请求参数**:
```json
{
  "userId": 1,
  "name": "Uniswap",
  "description": "去中心化交易所",
  "detail": "Uniswap是一个基于以太坊的去中心化交易协议...",
  "chain": "ETH",
  "website": "https://uniswap.org",
  "logo": "https://example.com/logo.png",
  "state": 0
}
```

**响应**: `boolean` - true表示添加成功，false表示失败

---

#### 3.1.2 删除DApp

**接口地址**: `DELETE /dDappinfo/remove/{id}`

**路径参数**:
- `id`: DApp ID

**响应**: `boolean`

---

#### 3.1.3 更新DApp

**接口地址**: `PUT /dDappinfo/update`

**请求参数**: 与添加接口相同，但必须包含id字段

**响应**: `boolean`

---

#### 3.1.4 查询所有DApp

**接口地址**: `GET /dDappinfo/list`

**响应**: `List<DDappinfo>`
```json
[
  {
    "id": 1,
    "userId": 1,
    "name": "Alien Worlds",
    "description": "您可以收集和玩独特的数字项目。",
    "detail": "详细介绍...",
    "chain": "ETH",
    "website": "https://alienworlds.io",
    "logo": "https://example.com/logo.png",
    "state": 2,
    "loveCount": 5,
    "createTime": "2024-01-01T00:00:00",
    "updateTime": "2024-01-02T00:00:00",
    "user": {...},
    "imgs": [...],
    "contracts": [...],
    "tags": [...]
  }
]
```

---

#### 3.1.5 根据ID获取DApp详情

**接口地址**: `GET /dDappinfo/getInfo/{id}`

**路径参数**:
- `id`: DApp ID

**响应**: `DDappinfo`对象（包含完整的关联信息：用户、图片、合约、标签）

---

#### 3.1.6 分页查询DApp

**接口地址**: `GET /dDappinfo/page`

**查询参数**:
- `pageNum`: 页码（必填）
- `pageSize`: 每页大小（必填）
- `chain`: 区块链筛选（可选）
- `name`: 名称搜索（可选）

**响应**: `Page<DDappinfo>`
```json
{
  "records": [...],
  "totalRow": 100,
  "pageNumber": 1,
  "pageSize": 10,
  "totalPage": 10
}
```

---

#### 3.1.7 查询用户发布的DApp

**接口地址**: `GET /dDappinfo/getUserDapps`

**查询参数**:
- `userId`: 用户ID（必填）
- `state`: DApp状态筛选（可选，0/1/2）

**响应**: `List<DDappinfo>`

---

### 3.2 DApp评分模块

#### 3.2.1 提交评分

**接口地址**: `POST /dRating/save`

**请求参数**:
```json
{
  "dappId": 1,
  "userId": 1,
  "score": 5
}
```

**响应**: `boolean`

---

#### 3.2.2 获取DApp评分信息

**接口地址**: `GET /dRating/getRatingInfo/{dappId}`

**路径参数**:
- `dappId`: DApp ID

**查询参数**:
- `userId`: 用户ID（可选，用于查询该用户是否已评分）

**响应**: `RatingDetailVo`
```json
{
  "averageScore": 4.5,
  "totalRatings": 100,
  "userScore": 5,
  "hasRated": true
}
```

---

#### 3.2.3 删除评分

**接口地址**: `DELETE /dRating/remove/{id}`

**路径参数**:
- `id`: 评分记录ID

**响应**: `boolean`

---

#### 3.2.4 更新评分

**接口地址**: `PUT /dRating/update`

**请求参数**: 包含id和新的score

**响应**: `boolean`

---

### 3.3 DApp评论模块

#### 3.3.1 添加评论

**接口地址**: `POST /dComment/save`

**请求参数**:
```json
{
  "dappId": 1,
  "userId": 1,
  "parentId": null,
  "content": "这个DApp很棒！"
}
```

**响应**: `DComment`（返回创建的评论对象）

---

#### 3.3.2 查询DApp的所有评论

**接口地址**: `GET /dComment/list/{dappId}`

**路径参数**:
- `dappId`: DApp ID

**响应**: `List<CommentDetailVo>`（包含评论的层级结构和回复）
```json
[
  {
    "id": 1,
    "dappId": 1,
    "userId": 1,
    "parentId": null,
    "content": "这个DApp很棒！",
    "createTime": "2024-01-01T00:00:00",
    "imgs": [...],
    "reply": [
      {
        "id": 2,
        "parentId": 1,
        "content": "我也觉得！",
        ...
      }
    ]
  }
]
```

---

#### 3.3.3 删除评论

**接口地址**: `DELETE /dComment/remove/{id}`

**路径参数**:
- `id`: 评论ID

**响应**: `boolean`

---

#### 3.3.4 更新评论

**接口地址**: `PUT /dComment/update`

**请求参数**: 包含id和新的content

**响应**: `boolean`

---

### 3.4 DApp点赞模块

#### 3.4.1 点赞/取消点赞

**接口地址**: `PUT /dLove/dappLove`

**查询参数**:
- `userId`: 用户ID（必填）
- `dappId`: DApp ID（必填）

**功能**: 如果未点赞则点赞，如果已点赞则取消点赞

**响应**: `boolean`

---

#### 3.4.2 查询是否已点赞

**接口地址**: `GET /dLove/isLiked`

**查询参数**:
- `userId`: 用户ID（必填）
- `dappId`: DApp ID（必填）

**响应**: `boolean` - true表示已点赞

---

#### 3.4.3 添加点赞记录

**接口地址**: `POST /dLove/save`

**请求参数**:
```json
{
  "userId": 1,
  "dappId": 1
}
```

**响应**: `boolean`

---

#### 3.4.4 删除点赞记录

**接口地址**: `DELETE /dLove/remove/{id}`

**路径参数**:
- `id`: 点赞记录ID

**响应**: `boolean`

---

### 3.5 DApp收藏模块

#### 3.5.1 收藏/取消收藏

**接口地址**: `PUT /dCollect/dappCollect`

**查询参数**:
- `userId`: 用户ID（必填）
- `dappId`: DApp ID（必填）

**功能**: 如果未收藏则收藏，如果已收藏则取消收藏

**响应**: `boolean`

---

#### 3.5.2 查询用户收藏列表

**接口地址**: `GET /dCollect/getUserCollects/{userId}`

**路径参数**:
- `userId`: 用户ID

**响应**: `List<DDappinfo>`（用户收藏的所有DApp）

---

#### 3.5.3 查询是否已收藏

**接口地址**: `GET /dCollect/isCollected`

**查询参数**:
- `userId`: 用户ID（必填）
- `dappId`: DApp ID（必填）

**响应**: `boolean` - true表示已收藏

---

#### 3.5.4 添加收藏记录

**接口地址**: `POST /dCollect/save`

**请求参数**:
```json
{
  "userId": 1,
  "dappId": 1
}
```

**响应**: `boolean`

---

#### 3.5.5 删除收藏记录

**接口地址**: `DELETE /dCollect/remove/{id}`

**路径参数**:
- `id`: 收藏记录ID

**响应**: `boolean`

---

### 3.6 用户桌面模块

#### 3.6.1 查询用户桌面

**接口地址**: `GET /dDesk/getUserDesk/{userId}`

**路径参数**:
- `userId`: 用户ID

**响应**: `List<DDappinfo>`（用户桌面上的所有DApp）

---

#### 3.6.2 添加桌面DApp

**接口地址**: `GET /dDesk/addDappCard`

**查询参数**:
- `userId`: 用户ID（必填）
- `dappId`: DApp ID（必填）

**响应**: `boolean`

---

#### 3.6.3 删除桌面DApp

**接口地址**: `DELETE /dDesk/removeDappCard`

**查询参数**:
- `userId`: 用户ID（必填）
- `dappId`: DApp ID（必填）

**响应**: `boolean`

---

#### 3.6.4 查询是否已添加到桌面

**接口地址**: `GET /dDesk/isAdded`

**查询参数**:
- `userId`: 用户ID（必填）
- `dappId`: DApp ID（必填）

**响应**: `boolean` - true表示已添加

---

## 4. 数据模型详细说明

### 4.1 DDappinfo 实体类

```java
{
  "id": Integer,              // DApp ID
  "userId": Integer,          // 作者ID
  "name": String,             // DApp名称
  "description": String,      // 简短描述
  "detail": String,           // 详细介绍
  "chain": String,            // 所属区块链
  "website": String,          // 官网地址
  "logo": String,             // Logo地址
  "state": Integer,           // 状态（0/1/2）
  "loveCount": Integer,       // 点赞数
  "createTime": Date,         // 创建时间
  "updateTime": Date,         // 更新时间
  "user": UsersEntity,        // 发布用户信息
  "imgs": List<DDappImg>,     // 图片列表
  "contracts": List<DDappContract>,  // 合约地址列表
  "tags": List<DTag>          // 标签列表
}
```

### 4.2 DComment 实体类

```java
{
  "id": Integer,              // 评论ID
  "dappId": Integer,          // DApp ID
  "userId": Integer,          // 评论用户ID
  "parentId": Integer,        // 父评论ID（null表示顶层）
  "content": String,          // 评论内容
  "createTime": Date,         // 评论时间
  "imgs": List<DCommentImg>,  // 评论图片
  "reply": List<DComment>     // 子评论列表
}
```

---

## 5. 业务流程说明

### 5.1 DApp发布流程

1. 用户提交DApp基本信息（通过 `/dDappinfo/save`）
2. 系统创建DApp记录，状态设为"未审核"(state=0)
3. 上传DApp相关图片到IPFS/云存储
4. 关联图片记录到d_dapp_img表
5. 添加智能合约地址到d_dapp_contract表
6. 关联标签到d_dapp_tag表
7. 管理员审核后更新state字段（2-通过，1-拒绝）

### 5.2 用户评分流程

1. 用户对DApp评分（通过 `/dRating/save`）
2. 检查用户是否已评分
   - 已评分：更新原有评分
   - 未评分：创建新评分记录
3. 系统自动计算平均分

### 5.3 评论互动流程

1. 用户发表评论（通过 `/dComment/save`）
2. 如果是回复评论，设置parentId
3. 可选：上传评论图片到d_comment_img表
4. 其他用户可以继续回复，形成评论树

---

## 6. 注意事项

1. **审核机制**: DApp发布后需要审核才能公开展示
2. **评分限制**: 每个用户对同一DApp只能评分一次
3. **点赞/收藏**: 重复操作会自动取消
4. **评论层级**: 支持无限层级评论回复
5. **区块链字段**: chain字段应该使用标准的区块链标识（如ETH、BSC、Polygon等）
6. **图片存储**: 建议使用IPFS或云存储服务，数据库只存储URL

---

## 7. 技术栈

- **后端框架**: Spring Boot
- **ORM框架**: MyBatis-Flex
- **数据库**: MySQL
- **API文档**: Swagger/OpenAPI

---

## 8. 联系方式

如有任何问题或建议，请联系开发团队。

**文档版本**: v1.0  
**最后更新**: 2024年2月4日
