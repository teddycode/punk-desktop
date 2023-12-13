const authBaseList = [
  {
    key: 'webSecure',
    name: 'base.webSecure',
    alias: '跨域',
    summary: '支持跨域发起请求，在服务器端未做任何设置的情况下都可发起api请求。',
    userSummary: '支持跨域发起请求，应用可以向任何网站发起请求。',
  },
  {
    key: 'node',
    name: 'base.node',
    alias: 'Node集成',
    summary: '高权限接口，支持启用Node集成，只有本地应用可开启，且此类权限开启后需要接受严格的审核。',
    userSummary: '高危权限，开启Node集成后，应用几乎无所不能，如果非绝对信任的应用，请勿授予此项权限。',
  },
];
const authApiList = [
  {
    disabled: true,
    key: 'runtime',
    name: 'tsbApi.runtime.*',
    alias: '运行时',
    summary: '包括API的运行状态，只要启用了API即可获得，区别是如果部分API未启用，则获取不到对应的信息。',
  },
  {
    disabled: true,
    key: 'util',
    name: 'tsbApi.util.*',
    alias: '工具类',
    summary: '包含一些辅助工具类，默认可使用。',
  },
  {
    key: 'window',
    name: 'tsbApi.window.*',
    alias: '窗体操作',
    summary: '窗体API，包括各种最大化、最小化、显示、隐藏、吸附等操作，用于模拟窗体按钮。',
  },
  {
    key: 'barrage',
    name: 'tsbApi.barrage.*',
    alias: '弹幕功能',
    summary: '支持通过api使用弹幕功能。',
  },
  {
    key: 'tabs',
    name: 'tsbApi.tabs.*',
    alias: '标签',
    summary: '可获取到当前的标签信息。',
  },
  {
    key: 'user',
    name: 'tsbApi.user.*',
    alias: '用户信息',
    summary: '可获取到当前的登录用户信息、手动触发用户登录。',
  },
  {
    key: 'notification',
    name: 'tsbApi.notification.*',
    alias: '系统消息提醒',
    summary: '通过系统的弹窗直接触发消息。',
  },
  {
    key: 'fs',
    name: 'tsbApi.fs.*',
    alias: '文件操作',
    summary: '可通过fs操作文件，此类API用户可能比较敏感，请谨慎开启。',
  },
  {
    key: 'system',
    name: 'tsbApi.system.*',
    alias: '系统便捷操作',
    summary: '包括一些常用的操作，例如设置壁纸。',
  },
];
const authAbilityList = [
  {
    key: 'offlinePush',
    name: 'offlinePush',
    alias: '离线消息',
    summary: '通过服务器向轻聊应用机器人发送消息。',
    needPackage: true,
  },
  {
    key: 'robot',
    name: 'robot',
    alias: '群机器人',
    summary: '开通应用的群机器人，可以方便地与轻聊的群进行交互。',
    needPackage: true,
  },
  {
    key: 'widget',
    name: 'widget',
    alias: '效率栏组件',
    summary: '启用效率栏小组件。',
    needPackage: true,
  },
  {
    key: 'deskWidget',
    name: 'deskWidget',
    alias: '磐古桌面组件',
    summary: '启用磐古桌面小组件小组件。',
    needPackage: true,
  },
  {
    key: 'cloudArchiving',
    name: '云存档',
    alias: '云存档',
    summary: '云存档，允许调用api进行云端数据存储和读取，方便实现云同步。',
    needPackage: true,
  },
];

module.exports = {
  authBaseList,
  authApiList,
  authAbilityList,
};
