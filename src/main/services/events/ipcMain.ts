import {app, BrowserWindow, dialog, ipcMain} from 'electron'
import {winURL} from '../../config/staticPath'
import Update from '../update/checkUpdate'
import {updater} from '../update/hotUpdater'
import DownloadFile from '../update/downloadFile'
import {join} from 'path'
import config from '@config/index'
import {readFileSync} from "fs";
import {mainWindInstance, searchWindInstance} from "../../windows/manage";
import {openFile, runExecutable, saveFile} from "../utils/files";
import {runAppByName} from "../apps/launcher";
import MessageBoxSyncOptions = Electron.MessageBoxSyncOptions;

export default {
  // TODO 分模块处理
  setupHandlers() {
    const allUpdater = new Update()
    ipcMain.handle('IsUseSysTitle', async () => {
      return config.IsUseSysTitle
    })
    ipcMain.handle('app-close', (event, args) => {
      app.quit()
    })
    ipcMain.handle('check-update', (event) => {
      allUpdater.checkUpdate(BrowserWindow.fromWebContents(event.sender))
    })
    ipcMain.handle('confirm-update', () => {
      allUpdater.quitAndInstall()
    })
    ipcMain.handle('open-messagebox', async (event, arg) => {
      const res = await dialog.showMessageBox(BrowserWindow.fromWebContents(event.sender), {
        type: arg.type || 'info',
        title: arg.title || '',
        buttons: arg.buttons || [],
        message: arg.message || '',
        noLink: arg.noLink || true
      })
      return res
    })
    ipcMain.handle('open-errorbox', (event, arg) => {
      dialog.showErrorBox(
        arg.title,
        arg.message
      )
    })
    ipcMain.handle('start-server', async () => {
      try {
        // const serveStatus = await Server.StatrServer()
        // console.log(serveStatus)
        // return serveStatus
      } catch (error) {
        dialog.showErrorBox(
          '错误',
          error
        )
      }
    })
    ipcMain.handle('stop-server', async (event, arg) => {
      try {
        // return await Server.StopServer()
      } catch (error) {
        dialog.showErrorBox(
          '错误',
          error
        )
      }
    })
    ipcMain.handle('hot-update', (event, arg) => {
      updater(BrowserWindow.fromWebContents(event.sender))
    })
    ipcMain.handle('start-download', (event, msg) => {
      new DownloadFile(BrowserWindow.fromWebContents(event.sender), msg.downloadUrl).start()
    })
    ipcMain.handle('open-win', (event, arg) => {
      const ChildWin = new BrowserWindow({
        titleBarStyle: config.IsUseSysTitle ? 'default' : 'hidden',
        height: 595,
        useContentSize: true,
        width: 1140,
        autoHideMenuBar: true,
        minWidth: 842,
        frame: config.IsUseSysTitle,
        show: false,
        webPreferences: {
          sandbox: false,
          webSecurity: false,
          // 如果是开发模式可以使用devTools
          devTools: config.isDevMode,
          // 在macos中启用橡皮动画
          scrollBounce: process.platform === 'darwin',
          preload: config.isDevMode
            ? join(app.getAppPath(), 'preload.js')
            : join(app.getAppPath(), 'dist', 'electron', 'main', 'preload.js')
        }
      })
      // 开发模式下自动开启devtools
      if (config.isDevMode) {
        ChildWin.webContents.openDevTools({mode: 'undocked', activate: true})
      }
      ChildWin.loadURL(winURL + `#${arg.url}`)
      ChildWin.once('ready-to-show', () => {
        ChildWin.show()
        if (arg.IsPay) {
          // 检查支付时候自动关闭小窗口
          const testUrl = setInterval(() => {
            const Url = ChildWin.webContents.getURL()
            if (Url.includes(arg.PayUrl)) {
              ChildWin.close()
            }
          }, 1200)
          ChildWin.on('close', () => {
            clearInterval(testUrl)
          })
        }
      })
      // 渲染进程显示时触发
      ChildWin.once("show", () => {
        ChildWin.webContents.send('send-data', arg.sendData)
      })
    })

    //  handle用于返回结果，on用于监听事件
    ipcMain.on('toggle-fullscreen', () => {
      if (mainWindInstance && mainWindInstance.instance) {
        mainWindInstance.instance.setFullScreen(!mainWindInstance.instance.isFullScreen());
      }
    });

    ipcMain.on('show-main-alert', (event, message) => {
      const options: MessageBoxSyncOptions = {
        type: 'warning',
        buttons: ["OK"],
        defaultId: 0,
        cancelId: 0,
        detail: message,
        message: ''
      };
      dialog.showMessageBoxSync(options);
    });

    // 响应搜索指令
    ipcMain.on('open-search-window', async (event, query) => {
      console.log("query params:", query);
      let searchUrl = `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`;
      console.log("Searching Url:", searchUrl)
        if (!searchWindInstance.instance) {
          searchWindInstance.create();
        }
      searchWindInstance.setContent(searchUrl);
      searchWindInstance.show();
    });

    ipcMain.on('close-search-window', () => {
      if (searchWindInstance.instance) {
        searchWindInstance.close();
      }
    });

    ipcMain.on('request-file-open', (event) => {
      const filePath = openFile();
      if (filePath) {
        const content = readFileSync(filePath, 'utf8'); // 需要读取文件内容
        event.sender.send('file-selected', filePath, content); // 同时发送filePath和content
      }
    });

    ipcMain.on('run-exe', (event, filePath) => {
      runExecutable(filePath);
    });

    // 主进程监听渲染进程的应用打开消息
    ipcMain.on('run-application', (event, path, cmd) => {
      runAppByName(path, cmd);
    });

    ipcMain.on('save-file-content', (event, filePath, content) => {
      saveFile(filePath, content);
      event.sender.send('file-saved');
    });

    ipcMain.on('create-database', async (event, arg) => {
      // 处理请求并返回结果
      let dbPath = app.getPath("userData");
      event.sender.send('create-database-finish', dbPath);
    });
  }
}
