<h1 align="center">PunkOS-Spug</h1>

<div align="center">

本项目基于OpenSpug平台,为磐古跨链系统二次开发的的轻量级无Agent的自动化运维平台，整合了主机监控、
主机管理、主机批量执行、主机在线终端、应用发布部署、在线任务计划、配置中心、监控报警等一系列功能。

</div>

## 功能导图

![design.png](./docs/images/design.png)


## 环境

* Python 3.6+
* Django 2.2
* Node 12.14
* React 16.11

## 本地开发

### 启动后端
1. 安装依赖
```shell
cd ./spug_api/
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple/
```

2. 初始化数据库
```shell
python manage.py updatedb
```

3. 启动api服务
```shell
python server.py --host 0.0.0.0 --port 8000
```

说明：
- 后端默认使用 `spug_api/data/db.sqlite3`
- 系统会自动确保存在 `admin` 超级用户
- 前端启动后会直接进入主页，不再显示登录页
- 后端默认不再依赖 MySQL 和 Redis，单进程内已内嵌执行队列、计划任务、监控调度与 websocket 通知
- Redis 原有的运行态数据现在使用进程内内存保存，进程重启后实时日志/队列状态会重置

### 启动前端
1. 安装依赖
```shell
cd ./spug_web/
yarn
```
2. 启动web页面
```shell
cd ./spug_web/
yarn start
```

### 打包后端可执行文件
Windows：
```powershell
cd .\spug_api\
.\tools\build-executable.ps1
```

Linux：
```bash
cd ./spug_api/
chmod +x ./tools/build-executable.sh
./tools/build-executable.sh
```

打包结果会输出到 `spug_api/dist/`，其中：
- Windows 产物为单文件 `spug-api-windows.exe`
- Linux 产物为单文件 `spug-api-linux`
- 可执行文件运行时仅依赖自身目录，不需要额外部署 MySQL、Redis、worker 或 scheduler 进程
- 首次运行时会在可执行文件同目录自动创建 `data/`、`logs/`、`repos/`、`storage/` 等工作目录

## 开发流程

- clone代码到本地
- 从develop分支创建新的分支
- 编写代码并测试无误
- 提交你的分支代码到develop


## 开源引用说明
 本系统在[OpenSpug](https://github.com/openspug/spug)的基础之上进行二次开发使用，并遵循开源协议的要求对二次开发的服务实行开源，如有侵权请联系删除。

## License 
[AGPL-3.0](https://opensource.org/licenses/AGPL-3.0)

## 更新说明
- 部署到新的服务器
