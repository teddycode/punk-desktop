const { ipcMain: ipc } = require('electron');

function sendToTable(event, args) {
  global.tableManager.send(event, args);
}

/**
 * 历史屏幕管理器。为兼容既有 IPC 保留，但单屏模式下不再创建副屏窗口。
 */
class TableScreenManager {
  //运行中的屏幕
  runningScreens = {};

  /**
   * 兼容保留，单屏模式下无实际用途
   */
  getUrl() {}

  /**
   * 设置bounds设置项
   * @param window
   * @param key
   */
  saveBounds(window, key) {
    let tableWinSetting = {
      bounds: window.getBounds(),
      isMaximized: window.isMaximized(),
    };
    settings.set('tableWinSetting_' + key, tableWinSetting);
  }

  /**
   * 获取到bounds的设置
   * @param key
   * @returns {*}
   */
  getBounds(key) {
    return settings.get('tableWinSetting_' + key);
  }

  /**
   * 绑定存储位置的事件组
   * @param window
   * @param key
   */
  bindSaveBoundsEvent(window, key) {
    window.on('close', () => {
      this.saveBounds(window, key);
    });

    window.on('resized', () => {
      this.saveBounds(window, key);
    });

    window.on('enter-html-full-screen', () => {
      this.saveBounds(window, key);
    });

    window.on('leave-html-full-screen', () => {
      this.saveBounds(window, key);
    });

    window.on('blur', () => {
      this.saveBounds(window, key);
    });

    window.on('content-bounds-updated', () => {
      this.saveBounds(window, key);
    });

    window.on('session-end', () => {
      this.saveBounds(window, key);
    });

    window.on('moved', () => {
      this.saveBounds(window, key);
    });
    window.on('leave-full-screen', () => {
      this.saveBounds(window, key);
    });
    window.on('enter-full-screen', () => {
      this.saveBounds(window, key);
    });
  }

  closeByDomain(domain) {
    let key = Object.keys(this.runningScreens).find((key) => {
      return this.runningScreens[key].fullDomain === domain;
    });
    let screen = this.runningScreens[key];
    if (screen) {
      screen.window.close();
      delete this.runningScreens[key];
    }
  }

  /**
   * 兼容旧调用，单屏模式下始终不启动额外屏幕
   * @param screen
   */
  async startupScreen(screen) {
    return false;
  }

  /**
   * 关闭历史副屏实例
   * @param screen
   */
  stopScreen(screen) {
    if (!screen || screen.key === 'main') {
      return false;
    }

    let runningScreen = this.runningScreens[screen.key];
    if (runningScreen) {
      if (!runningScreen.window.isDestroyed()) {
        runningScreen.window.close();
      }
    }
  }

  bindIPC() {
    ipc.on('startupScreen', async (event, args) => {
      await this.startupScreen(args.screen);
    });

    ipc.on('stopScreen', async (event, args) => {
      await this.stopScreen(args.screen);
    });

    ipc.on('closeScreen', (event, args) => {
      let fullDomain = args.fullDomain;
      this.closeByDomain(fullDomain);
      sendToTable('closeScreen');
    });

    ipc.on('sendToSubs', (event, argsOrigin) => {
      const { channel, args } = argsOrigin;
      Object.keys(this.runningScreens).forEach((sub) => {
        this.runningScreens[sub].window.webContents.send(channel, args);
      });
    });
    ipc.on('sendToSub', (event, argsOrigin) => {
      const { key, channel, args } = argsOrigin;
      Object.keys(this.runningScreens).forEach((sub) => {
        if (this.runningScreens[sub].screen.key === key) {
          this.runningScreens[sub].window.webContents.send(channel, args);
        }
      });
    });
  }
}

module.exports = TableScreenManager;
