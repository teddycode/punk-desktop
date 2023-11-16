const { nanoid } = require('nanoid')
const defaultWeb3Apps = [
  {
    nanoid: nanoid(8),
    name: 'Uniswap',
    logo: 'https://pic.imgdb.cn/item/6545ad80c458853aef97bc71.jpg',
    summary: 'Uniswap是去中心化交易协议，允许无信任交易，自动化市场制造和流动性提供，通过恒定乘积模型确定代币价格，鼓励用户提供流动性。',
    type: 'card',
    appid: 'aJ70dE',
    url: '/web3/uniswap',
    preload: '/pages/group/imPreload.js',
    package: 'com.buaa.web3.uniswap',
    theme_color: '#6fafff',
    user_theme_color: '',
    create_time: Date.now(),
    update_time: Date.now(),
    account_avatar: '',
    order: 0,
    use_count: 3,
    attribute: JSON.stringify({
      isOffical: 1,
      integration: 2
    }),
    last_execute_time: Date.now(),
    settings: JSON.stringify({
      bounds: {
        width: 920,
        height: 720
      },
      autoRun: false,
      showInSideBar: true
    }),
    is_new: true,
    unread_count: 0,
  },
  {
    nanoid: nanoid(8),
    name: 'MakeDAO',
    logo: 'https://pic.imgdb.cn/item/6545adc6c458853aef986fc7.jpg',
    package: 'com.buaa.web3.makedao',
    summary: 'MakeDAO是一个去中心化自治组织，旨在通过区块链技术实现社区成员之间的合作和决策。它的目标是创建一个开放、透明和可持续的生态系统，让参与者能够共同管理和发展项目',
    type: 'card',
    appid: 'A9Iap3',
    url: '/web3/makedao',
    preload: '/pages/com/preload.js',
    theme_color: '#85ff85',
    user_theme_color: '',
    create_time: Date.now(),
    update_time: Date.now(),
    account_avatar: '',
    order: 0,
    use_count: 0,
    attribute: JSON.stringify({
      isOffical: 1,
      integration: 2
    }),
    last_execute_time: Date.now(),
    settings: JSON.stringify({
      bounds: {
        width: 1200,
        height: 800
      },
      showInSideBar: true
    }),
    is_new: true,
    unread_count: 0,
  },
  {
    nanoid: nanoid(8),
    name: 'Compound',
    logo: 'https://pic.imgdb.cn/item/6545ad36c458853aef96f2be.jpg',
    summary: 'Compound是一个去中心化的借贷协议，旨在为数字资产持有者提供利息收益。用户可以将他们的加密资产存入Compound的智能合约中，以获取利息，并借出这些资产给其他用户',
    preload: '/pages/fav/preload.js',
    type: 'card',
    appid: 'GyfdW8',
    package: 'com.buaa.web3.compound',
    url: '/pages/fav/index.html',
    theme_color: '#3c78d8',
    user_theme_color: '',
    create_time: Date.now(),
    update_time: Date.now(),
    account_avatar: '',
    order: 0,
    use_count: 0,
    attribute: JSON.stringify({
      isOffical: 1,
      integration: 2
    }),
    last_execute_time: Date.now(),
    settings: JSON.stringify({
      bounds: {
        width: 1200,
        height: 800
      },
      showInSideBar: false,
    }),
    is_new: true,
    unread_count: 0,
  },
  {
    nanoid: nanoid(8),
    name: 'CryptoKitties',
    logo: 'https://pic.imgdb.cn/item/6545ad69c458853aef977b0a.jpg',
    summary: 'Cryptokitties是一款基于区块链技术的虚拟猫收集游戏，每只猫都是独一无二的非同质化代币（NFT）。',
    type: 'card',
    appid: 'N1jPW6',
    //url: serverConfig.IM.FRONT_URL+ serverConfig.IM.AUTO_LOGIN,
    url: '/web3/cryptokitties',
    preload: '/pages/group/imPreload.js',
    package: 'com.buaa.web3.cryptokitties',
    theme_color: '#689aff',
    user_theme_color: '',
    create_time: Date.now(),
    update_time: Date.now(),
    account_avatar: '',
    order: 0,
    use_count: 0,
    attribute: JSON.stringify({
      isOffical: 1,
      integration: 2
    }),
    last_execute_time: Date.now(),
    settings: JSON.stringify({
      bounds: {
        width: 610,
        height: 500
      },
      showInSideBar: false
    }),
    is_new: true
  },
  {
    nanoid: nanoid(8),
    name: '交易',
    logo: 'https://pic.imgdb.cn/item/654f419ac458853aef821129.png',
    summary: '交易代币',
    type: 'card',
    appid: 'N1jkW6',
    //url: serverConfig.IM.FRONT_URL+ serverConfig.IM.AUTO_LOGIN,
    url: '/web3/exchange',
    preload: '/pages/group/imPreload.js',
    package: 'com.buaa.web3.exchange',
    theme_color: '#689aff',
    user_theme_color: '',
    create_time: Date.now(),
    update_time: Date.now(),
    account_avatar: '',
    order: 0,
    use_count: 0,
    attribute: JSON.stringify({
      isOffical: 1,
      integration: 2
    }),
    last_execute_time: Date.now(),
    settings: JSON.stringify({
      bounds: {
        width: 610,
        height: 500
      },
      showInSideBar: false
    }),
    is_new: true
  },
  {
    nanoid: nanoid(8),
    name: '转账',
    logo: 'https://pic.imgdb.cn/item/654f419fc458853aef82208e.png',
    summary: '将代币转给其他人',
    type: 'card',
    appid: 'N1jPl6',
    //url: serverConfig.IM.FRONT_URL+ serverConfig.IM.AUTO_LOGIN,
    url: '/web3/transfer',
    preload: '/pages/group/imPreload.js',
    package: 'com.buaa.web3.transfer',
    theme_color: '#689aff',
    user_theme_color: '',
    create_time: Date.now(),
    update_time: Date.now(),
    account_avatar: '',
    order: 0,
    use_count: 0,
    attribute: JSON.stringify({
      isOffical: 1,
      integration: 2
    }),
    last_execute_time: Date.now(),
    settings: JSON.stringify({
      bounds: {
        width: 610,
        height: 500
      },
      showInSideBar: false
    }),
    is_new: true
  },
  {
    nanoid: nanoid(8),
    name: '藏品',
    logo: 'https://pic.imgdb.cn/item/654f419ac458853aef82109b.png',
    summary: '独一无二的数字藏品',
    type: 'card',
    appid: 'N1rPl6',
    //url: serverConfig.IM.FRONT_URL+ serverConfig.IM.AUTO_LOGIN,
    url: '/web3/collections',
    preload: '/pages/group/imPreload.js',
    package: 'com.buaa.web3.collections',
    theme_color: '#689aff',
    user_theme_color: '',
    create_time: Date.now(),
    update_time: Date.now(),
    account_avatar: '',
    order: 0,
    use_count: 0,
    attribute: JSON.stringify({
      isOffical: 1,
      integration: 2
    }),
    last_execute_time: Date.now(),
    settings: JSON.stringify({
      bounds: {
        width: 610,
        height: 500
      },
      showInSideBar: false
    }),
    is_new: true
  },
  {
    nanoid: nanoid(8),
    name: '网络',
    logo: 'https://pic.imgdb.cn/item/654f4290c458853aef85389b.png',
    summary: '提供点对点网络服务',
    type: 'card',
    appid: 'N1jEl6',
    //url: serverConfig.IM.FRONT_URL+ serverConfig.IM.AUTO_LOGIN,
    url: '/web3/network',
    preload: '/pages/group/imPreload.js',
    package: 'com.buaa.web3.network',
    theme_color: '#689aff',
    user_theme_color: '',
    create_time: Date.now(),
    update_time: Date.now(),
    account_avatar: '',
    order: 0,
    use_count: 0,
    attribute: JSON.stringify({
      isOffical: 1,
      integration: 2
    }),
    last_execute_time: Date.now(),
    settings: JSON.stringify({
      bounds: {
        width: 610,
        height: 500
      },
      showInSideBar: false
    }),
    is_new: true
  },
  {
    nanoid: nanoid(8),
    name: '治理',
    logo: 'https://pic.imgdb.cn/item/654f419ac458853aef8210bf.png',
    summary: '去中心化链上治理体系',
    type: 'card',
    appid: 'N1WPl6',
    //url: serverConfig.IM.FRONT_URL+ serverConfig.IM.AUTO_LOGIN,
    url: '/web3/government',
    preload: '/pages/group/imPreload.js',
    package: 'com.buaa.web3.government',
    theme_color: '#689aff',
    user_theme_color: '',
    create_time: Date.now(),
    update_time: Date.now(),
    account_avatar: '',
    order: 0,
    use_count: 0,
    attribute: JSON.stringify({
      isOffical: 1,
      integration: 2
    }),
    last_execute_time: Date.now(),
    settings: JSON.stringify({
      bounds: {
        width: 610,
        height: 500
      },
      showInSideBar: false
    }),
    is_new: true
  },
  {
    nanoid: nanoid(8),
    name: '共识',
    logo: 'https://pic.imgdb.cn/item/654f419ac458853aef8210f6.png',
    summary: '分布式共识服务',
    type: 'card',
    appid: 'N1jVl6',
    //url: serverConfig.IM.FRONT_URL+ serverConfig.IM.AUTO_LOGIN,
    url: '/web3/consensus',
    preload: '/pages/group/imPreload.js',
    package: 'com.buaa.web3.consensus',
    theme_color: '#689aff',
    user_theme_color: '',
    create_time: Date.now(),
    update_time: Date.now(),
    account_avatar: '',
    order: 0,
    use_count: 0,
    attribute: JSON.stringify({
      isOffical: 1,
      integration: 2
    }),
    last_execute_time: Date.now(),
    settings: JSON.stringify({
      bounds: {
        width: 610,
        height: 500
      },
      showInSideBar: false
    }),
    is_new: true
  },
  {
    nanoid: nanoid(8),
    name: '计算',
    logo: 'https://pic.imgdb.cn/item/654f419fc458853aef8220e2.png',
    summary: '链上链下计算服务',
    type: 'card',
    appid: 'C1jPl6',
    //url: serverConfig.IM.FRONT_URL+ serverConfig.IM.AUTO_LOGIN,
    url: '/web3/computing',
    preload: '/pages/group/imPreload.js',
    package: 'com.buaa.web3.computing',
    theme_color: '#689aff',
    user_theme_color: '',
    create_time: Date.now(),
    update_time: Date.now(),
    account_avatar: '',
    order: 0,
    use_count: 0,
    attribute: JSON.stringify({
      isOffical: 1,
      integration: 2
    }),
    last_execute_time: Date.now(),
    settings: JSON.stringify({
      bounds: {
        width: 610,
        height: 500
      },
      showInSideBar: false
    }),
    is_new: true
  },
  {
    nanoid: nanoid(8),
    name: '存储',
    logo: 'https://pic.imgdb.cn/item/654f419fc458853aef822000.png',
    summary: '去中心化存储服务',
    type: 'card',
    appid: 'N1jNl6',
    //url: serverConfig.IM.FRONT_URL+ serverConfig.IM.AUTO_LOGIN,
    url: '/web3/storage',
    preload: '/pages/group/imPreload.js',
    package: 'com.buaa.web3.storage',
    theme_color: '#689aff',
    user_theme_color: '',
    create_time: Date.now(),
    update_time: Date.now(),
    account_avatar: '',
    order: 0,
    use_count: 0,
    attribute: JSON.stringify({
      isOffical: 1,
      integration: 2
    }),
    last_execute_time: Date.now(),
    settings: JSON.stringify({
      bounds: {
        width: 610,
        height: 500
      },
      showInSideBar: false
    }),
    is_new: true
  },
  {
    nanoid: nanoid(8),
    name: '密码',
    logo: 'https://pic.imgdb.cn/item/654f3d61c458853aef739f15.png',
    summary: '密码协作服务',
    type: 'card',
    appid: 'N1jMS6',
    //url: serverConfig.IM.FRONT_URL+ serverConfig.IM.AUTO_LOGIN,
    url: '/web3/crypto',
    preload: '/pages/group/imPreload.js',
    package: 'com.buaa.web3.crypto',
    theme_color: '#689aff',
    user_theme_color: '',
    create_time: Date.now(),
    update_time: Date.now(),
    account_avatar: '',
    order: 0,
    use_count: 0,
    attribute: JSON.stringify({
      isOffical: 1,
      integration: 2
    }),
    last_execute_time: Date.now(),
    settings: JSON.stringify({
      bounds: {
        width: 610,
        height: 500
      },
      showInSideBar: false
    }),
    is_new: true
  },
  // {
  //     nanoid: nanoid(8),
  //     name: '交易',
  //     theme_color: 'rgb(90,170,60)',
  //     author: '磐古软件',
  //     appid: '6g6SdP',
  //     site: 'http://apps.vip',
  //     logo: 'https://a.apps.vip/imageEditor/icon.svg',
  //     url: 'https://a.apps.vip/imageEditor/',
  //     package: 'com.thisky.imageEditor',
  //     attribute: JSON.stringify({
  //         isOffical: 1,
  //         integration: 2
  //     }),
  //     create_time: Date.now(),
  //     update_time: Date.now(),
  //     summary: '可以为您的图片增加相框、贴纸、文字、进行简单裁减、旋转，还可以添加滤镜。',
  //     is_new: true,
  //     settings: '[]',
  //     file_assign: ['image']
  // },
  // {
  //     nanoid: nanoid(8),
  //     name: '帮助教程',
  //     logo: 'https://up.apps.vip/logo/help.png',
  //     url: 'https://www.yuque.com/tswork/ngd5zk/iuguin',
  //     package: 'com.thisky.helper',
  //     theme_color: '#ff7b42',
  //     appid: 't3VLx3',
  //     attribute: JSON.stringify({
  //         isOffical: 1,
  //         integration: 2
  //     }),
  //     create_time: Date.now(),
  //     update_time: Date.now(),
  //     author: '磐古软件',
  //     site: 'https://apps.vip/',
  //     summary: '帮助手册，让你从零开始学会掌握磐古跨链客户端。',
  //     is_new: true,
  //     settings: JSON.stringify({
  //         bounds: {
  //             width: 1200,
  //             height: 800
  //         },
  //         alwaysTop: false,
  //         showInSideBar: false,
  //     }),
  // },
  // {
  //     nanoid: nanoid(8),
  //     name: '应用市场',
  //     logo: 'https://up.apps.vip/logo/favicon.svg',
  //     summary: '应用市场，助您发现更大的世界。',
  //     preload: '/pages/appStore/preload.js',
  //     type: 'web',
  //     appid: 'MiXNpK',
  //     package: 'com.thisky.appStore',
  //     url: 'https://a.apps.vip/appStore/index.html',
  //     theme_color: '#3c78d8',
  //     user_theme_color: '',
  //     create_time: Date.now(),
  //     update_time: Date.now(),
  //     account_avatar: '',
  //     order: 0,
  //     use_count: 0,
  //     attribute: JSON.stringify({
  //         isOffical: 1,
  //         integration: 2
  //     }),
  //     last_execute_time: Date.now(),
  //     settings: JSON.stringify({
  //         bounds: {
  //             width: 1180,
  //             height: 864
  //         },
  //         showInSideBar: true
  //     }),
  //     unread_count: 0,
  // }
]

const authBaseList = [
  {
    key: 'webSecure',
    name: 'base.webSecure',
    alias: '跨域',
    summary: '支持跨域发起请求，在服务器端未做任何设置的情况下都可发起api请求。',
    userSummary: '支持跨域发起请求，应用可以向任何网站发起请求。'
  },
  {
    key: 'node',
    name: 'base.node',
    alias: 'Node集成',
    summary: '高权限接口，支持启用Node集成，只有本地应用可开启，且此类权限开启后需要接受严格的审核。',
    userSummary: '高危权限，开启Node集成后，应用几乎无所不能，如果非绝对信任的应用，请勿授予此项权限。'
  },

]
const authApiList = [
  {
    disabled: true,
    key: 'runtime',
    name: 'tsbApi.runtime.*',
    alias: '运行时',
    summary: '包括API的运行状态，只要启用了API即可获得，区别是如果部分API未启用，则获取不到对应的信息。'
  },
  {
    disabled: true,
    key: 'util',
    name: 'tsbApi.util.*',
    alias: '工具类',
    summary: '包含一些辅助工具类，默认可使用。'
  },
  {
    key: 'window',
    name: 'tsbApi.window.*',
    alias: '窗体操作',
    summary: '窗体API，包括各种最大化、最小化、显示、隐藏、吸附等操作，用于模拟窗体按钮。'
  },
  {
    key: 'barrage',
    name: 'tsbApi.barrage.*',
    alias: '弹幕功能',
    summary: '支持通过api使用弹幕功能。'
  },
  {
    key: 'tabs',
    name: 'tsbApi.tabs.*',
    alias: '标签',
    summary: '可获取到当前的标签信息。'
  },
  {
    key: 'user',
    name: 'tsbApi.user.*',
    alias: '用户信息',
    summary: '可获取到当前的登录用户信息、手动触发用户登录。'
  },
  {
    key: 'notification',
    name: 'tsbApi.notification.*',
    alias: '系统消息提醒',
    summary: '通过系统的弹窗直接触发消息。'
  },
  {
    key: 'fs',
    name: 'tsbApi.fs.*',
    alias: '文件操作',
    summary: '可通过fs操作文件，此类API用户可能比较敏感，请谨慎开启。'
  },
  {
    key: 'system',
    name: 'tsbApi.system.*',
    alias: '系统便捷操作',
    summary: '包括一些常用的操作，例如设置壁纸。'
  }
]
const authAbilityList = [
  {
    key: 'offlinePush',
    name: 'offlinePush',
    alias: '离线消息',
    summary: '通过服务器向轻聊应用机器人发送消息。',
    needPackage: true
  },
  {
    key: 'robot',
    name: 'robot',
    alias: '群机器人',
    summary: '开通应用的群机器人，可以方便地与轻聊的群进行交互。',
    needPackage: true
  },
  {
    key: 'widget',
    name: 'widget',
    alias: '效率栏组件',
    summary: '启用效率栏小组件。',
    needPackage: true
  },
  {
    key: 'deskWidget',
    name: 'deskWidget',
    alias: '磐古桌面组件',
    summary: '启用磐古桌面小组件小组件。',
    needPackage: true
  },
  {
    key: 'cloudArchiving',
    name: '云存档',
    alias: '云存档',
    summary: '云存档，允许调用api进行云端数据存储和读取，方便实现云同步。',
    needPackage: true,
  }
]

module.exports = {
  defaultWeb3Apps,
  authBaseList,
  authApiList,
  authAbilityList
}
