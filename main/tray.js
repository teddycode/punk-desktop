const { Tray } = require('electron');
const baseApi = require('./src/api/baseApi.js');
var osu = require('node-os-utils');
const ToolboxManager = require('./src/main/toolboxManager');
// const {require} = require("@electron/remote");
// var viewMap = require('viewManager.js')

function sendIPCToTrayWindow(action, data) {
  // if there are no windows, create a new one
  if (trayWindow === null) {
    trayWindow = getTrayWindow();
  } else {
    trayWindow.webContents.send(action, data || {});
  }
}

async function getUserInfo() {
  try {
    await baseApi.init();
  } catch (e) {
    console.error(e);
  }
  return await baseApi.axios(
    '/app/getUserInfo',
    { fields: 'uid,fans,follow,grade,post_count,signature,nickname,avatar,frame' },
    'get',
  );
}

let trayWindow = null;

async function getTrayWindow() {
  if (trayWindow === null) {
    await createTrayWin();
  }
  return trayWindow;
}

async function getMemory() {
  const mem = await osu.mem.info();
  const info = {
    mem: mem,
  };
  return info;
}

async function createTrayWin() {
  const windowInstance = await windowManager.create({
    name: 'tray',
    windowOption: {
      frame: false,
      width: 400,
      height: 430,
      sandbox: false,
      // disableDialogs:true,
      resizable: false,
      autoHideMenuBar: true,
      show: false,
      focusable: true,
      acceptFirstMouse: true,
      transparent: true,
      backgroundColor: '#00000000',
      maximizable: false,
      skipTaskbar: true,
      alwaysOnTop: false, // 调整窗口层级
    },
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      sandbox: false,
      webSecurity: false,
      preload: __dirname + '/src/preload/trayPreload.js',
      additionalArguments: [
        '--user-data-path=' + app.getPath('userData'),
        '--app-version=' + app.getVersion(),
        '--app-name=' + app.getName(),
        ...(isDevelopmentMode ? ['--development-mode'] : []),
      ],
    },
  });
  trayWindow = windowInstance.window;
  trayWindow.webContents.loadURL(getUrl('tray.html'));
  trayWindow.on('ready-to-show', () => {
    trayWindow.show();
  });
  trayWindow.on('blur', () => {
    trayWindow.close();
    trayWindow = null;
  });
  trayWindow.on('closed', () => {
    trayWindow = null;
  });
}

function getUrl(url) {
  let protocolUrl;
  protocolUrl = `tsbapp://./${url}`; // todo 需要验证正式环境的协议情况
  if (isDevelopmentMode) {
    protocolUrl = `http://localhost:1600/${url}`;
  }
  return protocolUrl;
}

function openWorktable() {
  if (global.tableWin && !global.tableWin.window.isDestroyed()) {
    global.tableWin.window.show();
    global.tableWin.window.focus();
  } else {
    global.tableManager.init().then(() => {
      global.tableWin.window.show();
    });
  }
}

function openToolbox() {
  ToolboxManager.ensure();
  global.toolboxManager.open();
}

function openBrowser() {
  !mainWindow ? createWindow() : mainWindow.show();
}

let tray = null;
app.whenReady().then(() => {
  ipc.on('getMemory', (event, args) => {
    var obj = Object.keys(viewMap);
    var pageCount = obj.map((key) => viewMap[key]).length;
    var appCount = appManager.saApps.length;
    getMemory().then((info) => {
      const data = {
        mem: info,
        pageCount: pageCount,
        appCount: appCount,
      };
      event.reply('getMemory', data);
    });
  });
  ipc.on('openBrowser', (event, args) => {
    if (!mainWindow) {
      if (args?.url) {
        console.log('没有窗体，新建并添加tab', args);
        global.URLToOpen = args.url;
        createWindow(() => {
          setTimeout(() => {
            // 窗体初始化完成后打开
            console.log('延时打开浏览器窗体');
            openTabInWindow(global.URLToOpen);
            global.URLToOpen = '';
          }, 1000);
        });
      }
    } else if (!mainWindow.isVisible()) {
      console.log('存在窗体，显示并添加tab', args);
      mainWindow.show();
      if (args?.url) {
        openTabInWindow(args.url);
      }
    }
  });
  ipc.handle('saveUserToDB', async (event, args) => {
    console.log('saving userInfo:', args);
    if (args) {
      const userInfo = {
        uid: args?.id,
        code: args?.token,
        token: args?.token,
        user_info: args,
        refresh_token: args.token,
        expire_time: new Date().getTime() + 7 * 24 * 3600 * 1000,
        refresh_expire_time: new Date().getTime() + 7 * 24 * 3600 * 1000,
        last_login_time: Date.now(),
        is_current: true,
      };
      await userModel.setCurrent(userInfo);
    }
  });
  ipc.on('getDetailUserInfo', async (event, args) => {
    console.log('查询用户信息详情：', args);
    const isLogged = await userModel.isLogged();
    if (isLogged) {
      getUserInfo()
        .then((result) => {
          console.log('get detail success:', result);
          if (result.data.data.uid) {
            event.reply('userInfo', result.data);
          } else {
            event.reply('userInfo', { data: { uid: -2 } }); // -2代表异常
          }
        })
        .catch(() => {
          console.log('get detail failed:', result);
          event.reply('userInfo', { data: { uid: -2 } }); // -2代表异常
        });
    } else {
      event.reply('userInfo', {
        data: { uid: -1 }, // -1代表未登录
      });
    }
  });

  ipc.handle('direct-logout', async (event, args) => {
    console.log('ready to delete userinfo:', args);
    try {
      await userModel.logout();
      global.appManager.sendIPCToApp('com.thisky.group', 'imLogout'); // 通知
      mainWindow?.webContents.send('logout', {});
    } catch (e) {
      console.error('登出失败：', e);
      return false;
    }
    return true;
  });

  ipc.on('resizeTray', (event, args) => {
    if (trayWindow) {
      trayWindow.setSize(args.width, args.height);
    }
  });

  if (process.platform === 'darwin') {
    tray = new Tray(path.join(__dirname, '/icons/tray/mac/tray.png'));
  } else {
    tray = new Tray(path.join(__dirname, '/icons/logowin.ico'));
  }
  tray.setToolTip('磐古跨链客户端');
  // 任务栏点击事件
  let timeCount = 0;
  tray.on('click', async function (event, position) {
    setTimeout(async () => {
      if (timeCount === 0) {
        await getTrayWindow();
        const bounds = trayWindow.getBounds();
        trayWindow.setPosition(position.x - bounds.width, position.y - bounds.height);
        timeCount = 0;
      }
    }, 300);
  });

  tray.on('double-click', (event) => {
    timeCount = 1;
    //兼容新的设置项目
    let open = settings.get('trayOpen');
    if (open === 'browser') {
      openBrowser();
    } else {
      openWorktable();
    }
  });

  tray.on('right-click', () => {
    let tableRunning = global.tableWin && !global.tableWin.window.isDestroyed();
    const keyM = global.keyMapManager;
    const tool = keyM.getKeyMap('superTools', true);
    const table = keyM.getKeyMap('table', true);
    const globalSearch = keyM.getKeyMap('globalSearch', true);
    let tpl = [
      {
        label: '打开客户端 ' + '         ' + table,
        Accelerator: table,
        click: () => {
          openWorktable();
        },
      },
      {
        label: '打开工具箱 ' + '         ' + tool,
        Accelerator: tool,
        click: () => {
          openToolbox();
        },
      },
      {
        label: '重置工作台窗口位置(找回)',
        click: () => {
          if (global.tableWin && !global.tableWin.window.isDestroyed()) {
            global.tableWin.close();
            setTimeout(() => {
              settings.set('tableWinSetting', undefined);
              global.tableManager.init().then(() => {
                global.tableWin.window.show();
              });
            }, 500);
          } else {
            settings.set('tableWinSetting', undefined);
            global.tableManager.init().then(() => {
              global.tableWin.window.show();
            });
          }
        },
      },
      {
        type: 'separator',
      },
      {
        label: '打开浏览器',
        click: () => {
          openBrowser();
        },
      },
      {
        label: '浏览器全局搜索' + '    ' + globalSearch,
        click: () => {
          globalSearchMod.init();
          // statsh 点击打开全局搜索
          if (global.globalSearch && global.globalSearch.isFocused()) {
            statsh.do({
              action: 'increase',
              key: 'globalSearchBaseClickOpen',
              value: 1,
            });
          }
        },
      },
      {
        type: 'separator',
      },

      // {
      //   label: '切换账号空间',
      //   click: () => {
      //     showUserWindow();
      //   },
      // },

      // {
      //   type: 'separator',
      // },
    ];

    tpl.push(
      // {
      //   label: '社区和反馈',
      //   click() {
      //     require('electron').shell.openPath(userDataPath);
      //   },
      //   submenu: [
      //     {
      //       label: '打开官网',
      //       click() {
      //         require('electron').shell.openExternal('https://www.apps.vip');
      //       },
      //     },
      //     {
      //       label: '产品社区',
      //       click() {
      //         require('electron').shell.openExternal('https://s.apps.vip');
      //       },
      //     },
      //     {
      //       label: '提交bug和建议',
      //       click() {
      //         require('electron').shell.openExternal('https://s.apps.vip/forum?id=100304');
      //       },
      //     },
      //   ],
      // },
      {
        label: '打开数据目录',
        click() {
          require('electron').shell.showItemInFolder(userDataPath);
        },
      },
      {
        label: '全部退出',
        click() {
          global.trayExit = true;
          app.exit();
        },
      },
    );
    if (tableRunning) {
      tpl.splice(tpl.length - 1, 0, {
        label: '退出客户端',
        click() {
          global.tableManager.close();
        },
      });
    }
    const contextMenu = Menu.buildFromTemplate(tpl);
    tray.popUpContextMenu(contextMenu);
  });
});
