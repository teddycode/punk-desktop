import {app, BrowserWindow, dialog, Menu, screen} from "electron";
import config from "@config/index";
import {getPreloadFile} from "@main/config/staticPath";
import * as process from "process";
import menuConfig from "@main/config/headerMenu";
import BaseWindow from "./baseWindow";
import MessageBoxOptions = Electron.MessageBoxOptions;


class MainWindow extends BaseWindow {
  constructor(url: string) {
    super()
    let hostScreen = screen.getPrimaryDisplay();
    this.width = hostScreen.size.width;
    this.height = hostScreen.size.height;
    this.url = url;
    if (config.isDevMode) {
      menuConfig.push({
        label: '开发者设置',
        submenu: [{
          label: '切换到开发者模式',
          accelerator: 'CmdOrCtrl+I',
          role: 'toggledevtools'
        }]
      })
    }
  }

  public create() {
    this.instance = new BrowserWindow({
      width: this.width,
      height: this.height,
      show: false,
      webPreferences: {
        sandbox: false,
        webSecurity: false,
        // 如果是开发模式可以使用devTools
        devTools: config.isDevMode,
        nodeIntegration: true,
        contextIsolation: true,
        // 启用多线程
        nodeIntegrationInWorker: true,
        // 在macos中启用橡皮动画
        scrollBounce: process.platform === 'darwin',
        preload: getPreloadFile('preload')
      },
      fullscreen: true,
    });

    // 赋予模板
    const menu = Menu.buildFromTemplate(menuConfig as any)

    Menu.setApplicationMenu(null);

    this.instance.loadURL(this.url);

    // dom-ready之后显示界面
    this.instance.once('ready-to-show', () => {
      this.instance.show()
    })

    this.instance.webContents.on("did-finish-load", () => {
      this.instance.webContents.executeJavaScript(`
            document.body.style.overflow = 'hidden';
        `);
    });

    this.instance.on("closed", () => this.instance = null);
    // 开发模式下自动开启devtools
    if (config.isDevMode) {
      this.instance.webContents.openDevTools({mode: 'bottom', activate: true})
    }

    this.onRenderCrashListener();
    this.onChildCrashListener();
    this.onMainCrashListener();
  }

  public show() {
    if (this.instance)
      this.instance.show();
  }

  // 显示提示框
  private showMsg(info: MessageBoxOptions, callback: CallableFunction) {

    dialog.showMessageBox(this.instance, info)
      .then(res => callback(res))
  }

  private onRenderCrashListener() {
    app.on('render-process-gone',
      (
        event: Electron.Event,
        webContents: Electron.WebContents,
        details: Electron.RenderProcessGoneDetails) => {
        let warnMsg: MessageBoxOptions = {message: ""};
        Object.assign(warnMsg, this.defaultWarnMsg);
        switch (details.reason) {
          case 'crashed':
            warnMsg.message = "图形化进程崩溃，是否进行软重启？"
            break;
          case 'killed':
            warnMsg.message = "未知原因导致图形化进程被终止，是否进行软重启？"
            break;
          case 'oom':
            warnMsg.message = "内存不足，是否软重启释放内存？"
            break;
          default:
            warnMsg.message = "原因：" + details.reason + "，是否尝试软重启？"
            break;
        }
        this.showMsg(warnMsg, (res) => {
          if (res.response === 0) this.instance.reload()
          else this.instance.close()
        })
      })
  }

  private onChildCrashListener() {
    app.on('child-process-gone', (event, details) => {
      let warnMsg: MessageBoxOptions = {message: ""};
      Object.assign(warnMsg, this.defaultWarnMsg);
      switch (details.type) {
        case 'GPU':
          switch (details.reason) {
            case 'crashed':
              warnMsg.message = "硬件加速进程已崩溃，是否关闭硬件加速并重启？";
              break;
            case 'killed':
              warnMsg.message = "硬件加速进程被意外终止，是否关闭硬件加速并重启？";
              break;
            default:
              warnMsg.message = "原因：" + details.reason + "，是否尝试软重启？"
              break;
          }
          break;
        default:
          break;
      }
      this.showMsg(warnMsg, (res) => {
        // 当显卡出现崩溃现象时使用该设置禁用显卡加速模式。
        if (res.response === 0) {
          if (details.type === 'GPU') app.disableHardwareAcceleration();
          this.instance.reload()
        } else {
          this.instance.close()
        }
      })
    })

  }

  private onMainCrashListener() {
    this.instance.on('unresponsive', () => {
      this.showMsg({
        type: 'warning',
        title: '警告',
        buttons: ['重载', '退出'],
        message: '图形化进程失去响应，是否等待其恢复？',
        noLink: true
      }, (res) => {
        // 当显卡出现崩溃现象时使用该设置禁用显卡加速模式。
        if (res.response === 0) {
          this.instance.reload()
        } else {
          this.instance.close()
        }
      })
    })
  }
}

export default MainWindow;

