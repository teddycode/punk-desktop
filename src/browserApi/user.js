const { ipcRenderer } = require('electron');
const ipc = ipcRenderer;
let apiUserInfo = {};
const { api } = require('../../server-config');

const user = {
  get: async () => {
    return await ipc.invoke('user.get');
  },
  login: (callback) => {
    ipc.once('loginCallback', (event, args) => {
      apiUserInfo = args.data;
      callback(args.data.userInfo);
      console.info('第一步成功:', args);
    });
    console.info('登录第一步');
    ipc.send('login');
  },
  /**
   * 钱包认证请求
   * @param callback
   */
  walletAuth: (callback) => {
    ipc.removeAllListeners('wallet-auth-callback');
    ipc.once('wallet-auth-callback', (event, args) => {
      callback(args);
    });
    console.info('认证第一步');
    ipc.send('wallet-auth');
  },
  /**
   *
   * @param uid 0则为自己
   * @param type 类型app为应用内打开，web为网页打开
   */
  openSpace(uid = 0, type = 'app') {
    //todo 自己的逻辑
    let uidStr = uid === 0 ? '' : '?uid=' + uid;
    let url = api.getUrl(api.API_URL.user.space) + uidStr;
    console.log(url);
    if (type === 'app') {
      ipc.send('handleTsbProtocol', { url: 'tsb://app/redirect/?package=com.thisky.com&url=' + url });
    } else {
      ipc.send('addTab', { url: url });
    }
  },
};
module.exports = user;
