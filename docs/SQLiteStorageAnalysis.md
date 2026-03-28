# 项目本地 SQLite 存储服务分析

本报告详细分析了 PunkOS 项目中的 SQLite 本地存储服务使用方法，包括工具封装、Vue 页面中的使用方式、数据存储路径以及现有的数据模型。

## 1. 工具封装 (Tool Encapsulation)

项目使用了 **Knex.js** 作为 SQL 查询构建器，配合 **sqlite3** 驱动来操作数据库。核心封装逻辑主要集中在以下文件中：

### 1.1 核心数据库类 `SqlDb`

- **文件路径**: `src/util/sqldb.js`
- **主要功能**:
  - 封装了 `knex` 实例的初始化配置。
  - 直接提供了 `getConfig` 和 `setConfig` 等便捷方法，用于操作内置的 `config` 表（系统配置）。
  - 通过 `this.knex` 属性直接暴露原始的 knex 对象，供其他业务 Model 使用，提供了灵活的查询能力。

### 1.2 路径管理 `dbUtil`

- **文件路径**: `src/util/dbUtil.js`
- **主要功能**:
  - 负责根据当前运行环境（开发模式或生产环境）动态计算数据库文件的存储路径。
  - 确保开发环境与生产环境的数据隔离（开发环境下路径通常包含 `-development` 后缀）。

## 2. Vue 页面中的使用方法 (Usage in Vue)

在 Vue 页面中（主要是系统级页面，如桌面或 Table 应用），前端无法直接引用 Node.js 模块。项目通过 **Electron Preload 脚本** 将后端模型挂载到全局 `window` 对象，从而实现前端对数据库的访问。

### 2.1 注入机制

参考 `src/preload/tablePreload.js`，后端模型被统一挂载到 `window.$models` 对象下：

```javascript
// src/preload/tablePreload.js
window.$models = {
  appModel: require('../model/appModel'),
  storageModel: new StorageModel(),
  // ...以及其他模型
};
```

### 2.2 前端调用示例

在 Vue 组件中，可以通过 `window.$models` 访问这些模型的方法。

**示例 1：获取所有应用列表**

```javascript
const getAllApps = async () => {
  // 确保在 mounted 或 window.$models 加载后调用
  if (window.$models && window.$models.appModel) {
    const apps = await window.$models.appModel.getAllApps();
    console.log('本地应用列表:', apps);
  }
};
```

**示例 2：使用简易键值存储 (StorageModel)**

```javascript
const useStorage = async () => {
  // 存储数据
  // 参数: key, value(对象会自动序列化), sign(可选签名)
  await window.$models.storageModel.setItem('myKey', { some: 'data' }, 'mySign');

  // 读取数据
  const data = await window.$models.storageModel.getItem('myKey', 'mySign');
  console.log('读取的数据:', data);
};
```

## 3. 数据保存路径 (Storage Path)

数据库文件保存在操作系统的 **用户数据目录 (UserData)** 下的 `db` 文件夹中。

- **Windows 路径示例**:
  `C:\Users\{用户名}\AppData\Roaming\punkos\db\{dbName}.sqlite`
  _(注意：如果是开发模式，路径通常会变为 `punkos-development\db\{dbName}.sqlite`)_

- **数据库文件名**:
  - **默认数据库 (`db.sqlite`)**: 由 `SqlDb`类默认参数决定，存储系统核心数据。
  - **存储模块数据库 (`storage.sqlite`)**: 由 `StorageModel` 初始化时指定，用于通用键值存储。

## 4. 现有保存的数据模型 (Existing Data Models)

项目中定义了多个 Model，每个 Model 通常对应一个 SQLite 表，处理特定的业务逻辑。

| Model 文件路径              | 表名 (Table) | 主要用途                   | 关键字段示例                                                    |
| :-------------------------- | :----------- | :------------------------- | :-------------------------------------------------------------- |
| `src/model/appModel.js`     | **app**      | 存储本地安装的应用信息     | `nanoid`, `name`, `package`, `url`, `logo`, `window` (窗体配置) |
| `src/model/userModel.js`    | **account**  | 存储用户登录账号信息       | `uid`, `token`, `user_info`, `is_current` (标记当前登录用户)    |
| `src/model/settingModel.js` | **setting**  | 通用设置存储 (支持分组)    | `group`, `sign`, `key`, `value`                                 |
| `src/model/storageModel.js` | **storage**  | 简易键值对存储 (Key-Value) | `key`, `value`, `sign`                                          |
| `src/util/sqldb.js` (内置)  | **config**   | 系统级基础配置             | `key`, `value`, `remark`                                        |

此外，项目中还包含 `message` (消息), `space` (空间), `watchTask` (监控任务) 等其他业务模型。

## 5. 开发建议

如果您需要在 Vue 页面中持久化保存业务数据，建议遵循以下原则：

1.  **简单数据**: 推荐直接使用 `window.$models.storageModel`。它提供了简单的 `setItem` 和 `getItem` 接口 (即用即存)，无需定义表结构，适合存取配置或简单状态。
2.  **复杂业务数据**: 建议模仿 `appModel.js` 的模式：
    - 在 `src/model/` 目录下创建新的 Model 类。
    - 在类中定义 `createTable` 方法来初始化表结构。
    - 在 `preload` 脚本中引入该 Model 并挂载到 `window.$models`，甚至暴露特定的 API 方法。
