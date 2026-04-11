# SQLite 本地存储说明

项目通过 SQLite 保存本地配置、应用数据和部分业务状态，核心方案为 `knex + sqlite3`。

## 核心文件

| 文件 | 作用 |
|------|------|
| `src/util/sqldb.js` | SQLite 封装与 `knex` 初始化 |
| `src/util/dbUtil.js` | 数据库路径计算 |
| `src/preload/tablePreload.js` | 将模型注入到前端 `window.$models` |

## 页面内使用方式

前端页面不能直接访问 Node 模块，项目通过 preload 暴露模型：

```js
window.$models = {
  appModel: require('../model/appModel'),
  storageModel: new StorageModel()
}
```

页面里通常这样调用：

```js
const data = await window.$models.storageModel.getItem('myKey', 'mySign')
await window.$models.storageModel.setItem('myKey', { some: 'data' }, 'mySign')
```

## 数据保存位置

数据库位于系统用户数据目录下的 `db` 目录。

- Windows 示例：`C:\Users\<用户名>\AppData\Roaming\punkos\db\`
- 开发模式通常带 `-development` 后缀

常见数据库文件：

- `db.sqlite`
- `storage.sqlite`

## 常见模型

| 文件 | 表名 | 用途 |
|------|------|------|
| `src/model/appModel.js` | `app` | 本地应用信息 |
| `src/model/userModel.js` | `account` | 当前登录账号 |
| `src/model/settingModel.js` | `setting` | 系统设置 |
| `src/model/storageModel.js` | `storage` | 简单键值存储 |
| `src/util/sqldb.js` | `config` | 基础配置 |

## 开发建议

- 简单配置或轻量状态：优先使用 `storageModel`
- 复杂业务数据：新建独立 model，并在 preload 中暴露给页面
- 需要排查数据问题时，先确认当前运行的是开发库还是生产库
