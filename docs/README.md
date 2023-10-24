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
yarn    //下载相关依赖
```

### 2.开发与调试
```shell
yarn dev    // 一键启动vue进程与electron进程
```

### 3.安装包构建

```shell
yarn pack    // 一键构建并生成应用安装包
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

每个组可以根据自己的需求进行界面风格的设计和实现，整体上风格较为统一即可。

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

## VUE简介

- **src/router/index.js**: 存放路由，路由决定了页面的跳转，具体使用可以参考相关文档。简而言之，router提供了一种路由方式，组件页面之间跳转只需在router中进行配置即可。

- **src/store/index.js** 涉及的技术栈为vuex，以下简单贴一个vuex的介绍：

  `Vuex` 是一个专为 Vue.js 应用程序开发的状态管理模式及其库。当在大型应用中处理多个组件共享的状态时，状态管理变得尤为重要。Vuex 提供了一个中央存储来管理这些共享的状态，并以特定的方式（遵循特定的规则）允许你改变状态。

  下面是 Vuex 的主要概念和部分：

  1. State
     - 这是你的应用的单一数据源。
     - 它是一个普通的 JavaScript 对象。
  2. Getters
     - 用来从 state 中派生出一些状态。
     - 可以认为是 store 的计算属性。
  3. Mutations
     - 是更改状态的方法。
     - 每个 mutation 都有一个字符串的事件类型和一个回调函数。回调函数是实际进行状态更改的地方，并接受 state 作为第一个参数。
     - 必须是同步函数。
  4. Actions
     - 类似于 mutation，但它提交的是 mutation，而不是直接改变状态。
     - 可以包含任意异步操作。
  5. Modules
     - 对于大型应用，可以将 store 分割成模块。
     - 每个模块有自己的 state、mutations、actions、getters，甚至是嵌套子模块。

  **工作流程**:

  1. 组件内部通过 `dispatch` 方法触发 actions。
  2. Actions 通过 `commit` 方法提交 mutations。
  3. Mutations 会直接更改 state。
  4. Vue 组件从 state 中获取数据，反映最新的状态。

  **为什么使用 Vuex**?

  - 当在一个大型单页面应用中，多个组件依赖于共享状态时，Vuex 可以帮助你组织和管理这些状态，确保其一致性。
  - Vuex 也与 Vue 官方开发者工具集成，提供了时间旅行调试和状态快照导出等高级功能。

  总之，Vuex 提供了一个结构化的、集中式的方式来管理 Vue.js 应用中的状态和逻辑，特别是在多个组件需要共享或响应相同的状态时。

- **src/views:** 主要编写代码的文件，用于书写页面级别的组件，区别于conponents(全局通用组件)。

  本项目views下面目前文件夹即文件较多，每个区定义了一个入口vue文件，以及对应的文件夹。两种命名方式，一种为功能命名，而例如main-center一类的命名则是根据其在界面中的位置进行的命名。

#### 如何写一个vue组件

在 Vue 组件中，通常有三个主要部分：`<template>`、`<script>` 和 `<style>`。这三部分共同构成了 Vue 组件的完整定义。

**整体框架**

```vue
<template></template>
```

- 这部分定义了组件的 HTML 结构或标记。
- 在这里，你可以使用 Vue 的模板语法，如指令 (`v-if`, `v-for`, `v-bind`, `v-on` 等) 和插值 (使用 `{{ }}` 对数据进行绑定)。
- `<template>` 部分最终被编译为一个渲染函数，这个函数在组件实例化时用于生成虚拟 DOM。

```vue
<script></script>
```

- 这部分定义了组件的逻辑。
- 你可以在这里定义组件的 `data`、`methods`、`computed` 属性、`watchers` 以及其他 Vue 组件选项。
- 也可以导入其他组件或外部模块，使其在当前组件中可用。

```vue
<style></style>
```

- 这部分定义了组件的样式。
- 你可以在这里写普通的 CSS，或者使用预处理器如 SCSS、LESS，只要你的项目配置支持这些预处理器。
- 使用 `scoped` 属性（即 `<style scoped>`）可以使样式仅应用于当前组件，防止样式泄露到其他组件。

简单来说，template用于书写html，以及绑定数据或者事件，script用于书写组件的具体逻辑和操作，例如点击事件函数等等。

css用于展示样式。

**script**

在 Vue 组件中，`<script>` 标签内定义了组件的逻辑。其中，`data`、`methods` 和生命周期钩子是最常用的部分。以下是它们的简要介绍：

1. **data**:

   - **概念**：`data` 是 Vue 组件的响应式对象，用于存储组件的状态或数据。它应该是一个函数，该函数返回一个对象。

   - **用法**：在组件模板或其他地方，你可以使用 `this` 来访问 `data` 中的属性。

     ```javascript
     data() {
       return {
         message: "Hello Vue!"
       };
     }
     ```

2. **methods**:

   - **概念**：`methods` 对象包含了该组件中的所有方法。这些方法可以被模板、生命周期钩子或其他方法调用。

   - **用法**：你可以在模板中使用 `v-on` 指令或简写 `@` 来调用方法。

     ```javascript
     methods: {
       sayHello() {
         alert(this.message);
       }
     }
     ```

     在模板中使用：

     ```vue
     <button @click="sayHello">Click me</button>
     ```

3. **生命周期钩子**:

   - **概念**：生命周期钩子是一系列在组件的不同生命周期阶段调用的特殊方法。这些方法允许你在特定时刻执行某些操作，例如在组件被创建、插入文档、更新或销毁时。

   - **常见的生命周期钩子**：

     - `beforeCreate`: 在组件实例刚被创建，但还未初始化属性和方法时调用。
     - `created`: 在组件实例被创建并完成了数据属性的初始化后调用。
     - `beforeMount`: 在模板被编译和挂载之前调用。
     - `mounted`: 在模板被编译和挂载后调用。
     - `beforeUpdate`: 在组件的数据发生变化，但尚未重新渲染 DOM 时调用。
     - `updated`: 在组件的数据发生变化并重新渲染 DOM 后调用。
     - `beforeDestroy`: 在组件实例被销毁之前调用。
     - `destroyed`: 在组件实例被销毁后调用。

   - **用法**：只需在组件对象中定义相应的生命周期方法。

     ```javascript
     mounted() {
       console.log("Component is mounted to the DOM!");
     }
     ```

通过合理地使用 `data`、`methods` 和生命周期钩子，你可以为 Vue 组件定义数据、功能和逻辑，从而构建丰富、互动的应用程序。


#### vue3与合约交互

<img src="docs\image\9e7e2c8501d9226097f4a3cf8965027.png" alt="9e7e2c8501d9226097f4a3cf8965027" style="zoom:67%;" />

这是一个目前基本上完成了界面与功能实现的文件目录。

文件夹下面vue组件为页面级别的组件，而function文件夹中为合约调用的脚本，通过vue的script中的import即可调用调用合约的脚本，利于修改也利于代码的模块化。abi文件夹用于存放合约的abi。


#### 问题汇总

1. 依赖包安装时出现连接失败的问题

```shell 
修改yarn源
yarn config set registry https://registry.npmmirror.com/
```

2. 依赖安装时遇到的其他问题

```shell
rm yarn.lock & rm package-lock.json
yarn  // 重新安装依赖
```