//这个预载入文件用于与服务器进行交互，仅适用于项目路径
const { config } = require('../../server-config');
const ipc = require('electron').ipcRenderer;
let href = window.location.href;
const tools = require('../util/util').tools;
tools.getWindowArgs(window);

const strFlg = '/html/auth/loading.html?code=';

async function walletAuth() {
  console.log('URL是：', href);
  const index = href.indexOf(strFlg);
  console.log('idex是：', index);
  if (index !== -1) {
    const code = href.substring(index + strFlg.length);
    console.log('获取code：', code);
    try {
      if (window.globalArgs['callWindow']) {
        ipc.sendTo(Number(window.globalArgs['callWindow']), 'wallet-auth-callback', { data: code });
      }
    } catch (e) {
      console.log('出错了：', e);
    }
    setTimeout(() => {
      window.close();
    }, 1500);
  }
}

walletAuth();
