# 磐古OS APP说明文档

致力于构建一个打通区块链与互联网的多链跨链应用操作终端

## 技术框架

### 1. 总体架构

![img_2.png](./docs/image/技术框架.png)

### 2. 框架说明

APP分桌面应用和后端服务，桌面应用由vue和electron构成，后端服务由gin框架及各个小组的后端api组成。
> 本文档为桌面应用介绍文档，后端文档参考这里[TODO]。

### 3. 技术栈列表

| 名称             | 版本      | 作用                 |
|----------------|---------|--------------------|
| vue            | 3.3.4   | 响应式web前端框架,实现页面逻辑  |
| electron       | 22.3.24 | 可运行web的跨平台桌面应用执行环境 |
| jetbrains idea | 2023    | 代码开发工具             |
| yarn           | 1.22    | 代码依赖管理工具           |

## 使用教程

### 1. 依赖安装

```shell
# set npm mirror
config set registry https://registry.npmmirror.com/
# Go into the repository
cd punkos
# install dependencies
npm install
```

### 2.开发与调试

```shell
#  一键启动vue进程与electron进程
npm run dev    
```

### 3.安装包构建

```shell
#  一键构建并生成应用安装包
npm build      
```

> Note1: 其他开发命令请查阅package.json

> Note2: Desktop模块的开发需要先安装第三方依赖,见文档[TODO]

## 项目代码结构

```shell
├── build  // 构建安装包所使用的静态资源
├── docs   // 项目文档
├── logs   // 运行日志
├── public  // 公开访问的资源
├── release   // 项目打包及安装包生成目录
├── src
│   ├── main        // electron主进程
│   │   ├── assets  // 静态依赖文件 TODO[分离到打包后应用程序的资源的目录:./resources/app]
│   │   ├── modules   // 主进程逻辑模块
│   │   ├── windows   // 主进程窗口定义
│   │   └── main.js   // 主进程程序入口
│   └── renderer    // 渲染进程
│       ├── api       // 后端APi接口定义
│       ├── mock       // 模拟API服务
│       ├── assets     // 静态资源
│       ├── components // 封装的组件
│       ├── store      // 状态存储
│       ├── utils      // 统一工具类
│       ├── router     // 页面路由配置
│       │   └── modules  // 各个模块的路由定义 
│       ├── main.js    // 渲染进程入口
│       ├── App.vue   // 渲染进程主界面
│       └── views      // 页面实现
│           ├── Collections    // 数藏页面
│           ├── Computing      // 计算组页面 
│           ├── Consensus      // 共识组页面 
│           ├── Crypto         // 密码组页面
│           ├── Desktop        // 桌面管理页面
│           ├── Governance     // 治理组页面
│           ├── Home           // 大屏页面
│           ├── Network        // 网络组页面
│           ├── SocialNet      // 社交网络模块
│           ├── Storage        // 存储组页面
│           ├── Exchange    // 交易组页面
│           ├── Transfers      // 转账组页面
│           └── Users          // 用户相关页面
├── webpack.config.js   // idea读取的配置
└── vue.config.js  // vue配置文件

```

## 协作指南

约定一些规范,制订相关流程，便于高效协作开发。

### 1. 代码提交规范

即`git commit`
中写的message信息规范，规范的提交信息有利于代码迭代的可读性，请参阅[约定式提交规范](https://zhuanlan.zhihu.com/p/90281637)

### 2. 代码命名规范

- 对于js代码文件，命名尽量一个单词搞定，如`preload.js`，若有歧义再采用小写开头的匈牙利命名方式，如`fileManager.js`
  ，尽可能简洁易懂，如果双单词命名过多，说明需要划分功能模块了。
- 对于vue页面代码，均放在views下，每个模块名均以大写开头的匈牙利命名方式，如`Collections`,尽可能单个单词完成命名。

### 3. 代码结构规范

- 对于js和vue代码，一个模块的实现对应一个文件夹，文件夹内的主文件应命名为`index.js / index.vue`, 文件夹内其他js文件命名遵循命名规范。
- 对于一个vue页面模块，如治理组页面模块，允许在模块内的components文件夹下自定义新组件，参考以下结构：

![img.png](./docs/image/治理组结构示例.png)

- `/renderer`文件夹下的`/api、/router、/store`均采用模块化方式组织代码结构，小组更新代码请在对应的模块下完成更新。

### 4. 小组页面开发流程

- **新建页面代码**： 在`/views/` 目录下寻找本组的文件夹，创建`index.vue`作为小组主界面，完成页面逻辑。
- **新建状态存储**:  在`/store/modules/`下对应的小组状态文件,添加状态信息。
- **新建页面路由**： 在`/router/modules/` 下对应的小组路由文件，创建一级或二级路由信息。
- **新建接口定义**： 如需要后端提供数据，请在`/api/`下按照现有示例添加本组API接口，遵循RESTFUL接口规范。
- **新建模拟数据**： 如有接口但是后端尚未实现，请在`/mock/`下按照现有示例添加本组的模拟接口，实现模拟数据返回。

### 4. 页面实现风格

每个组可以根据自己的需求进行界面风格的设计和实现，整体上风格需要严格较为统一。

目前的实现比较简单：以下图为例：

<img src="docs\image\2ff19bd7ca05919c3b6fe6f56640c79.png" alt="2ff19bd7ca05919c3b6fe6f56640c79" style="zoom: 33%;" />

该页面位于src/views/Exchanges/limitOrder,一些css样式可以在文件中得到，有需要可以直接使用。

对于操作交互的页面，目前实现均比较简单，总结为以下几点：

- 顶上有一个导航栏
- 白色边框，白色字体，透明背景颜色以适应暗色调的背景图片。
- 对于原生button，input，select,radio等的样式重写，同样设置为白框，白字，透明或接近背景颜色的颜色。
- 边框圆角，按钮的话有非常多的样式按钮，可以自行去网上搜寻css代码并使用自己喜欢的。
- 布局：使用的flex布局，由于操作的main-center部分存在缩放，进行尽可能使用%来控制高度和宽度，减少px的使用。
- 屏幕分辨率适配：这一部分目前项目做的还不完善，无法给到更多的建议。
- 需要使用到分页器的，components中有封装好的myPagination.vue组件。
- 比较复杂的样式，也可以借助UI组件库，例如element-plus，primevue等等，只需要重写样式使得与风格较为统一即可。

## 公共组件

> 所在路径 /src/renderer/components/
>
  <img src="docs\image\aec2fa4cfc4d3524570fcc11987cb60.png" alt="aec2fa4cfc4d3524570fcc11987cb60" style="zoom: 67%;" />

**buttons**：封装了两个按钮组件，登录按钮的组件和addmodeButton的组件，后续使用button时，可以替换原生button这两个组件之一，用以改善button的视觉效果。

**topnav**：顶部左侧的可伸缩导航栏

**MainBackground**.vue:定义了界面的背景，将界面按照左中右，分别切割，然后每一部分再按上中下进行div布局。在中间的部分使用slot进行插入，确保所编写的其余界面均在中间部分进行展示而不影响其他部分。

**myPagination.vue**: 自定义的一个分页器，此前使用场景背景为白色，还没做界面背景适配的工作。

**myWallet**：钱包操作的主要内容，包括了通过ethers.js连接metamask，获取metamask地址和余额，钱包切换样式等等页面和功能。

**searchBar**：搜索框的样式

> 其他请参阅 [《VUE开发指南》](./docs/VUE开发指南.md)

## 问题汇总

1. 依赖安装时遇到的其他问题

```shell
rm yarn.lock & rm package-lock.json
yarn  // 重新安装依赖
```