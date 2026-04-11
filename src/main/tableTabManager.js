const { ipcMain: ipc } = require('electron');
const { nanoid } = require('nanoid');
const { capture } = require('./captureHelper');

class TableTabManager {
  //运行中的tab
  runningTabs = [];
  tableWin = null; //方便调用
  runningTabsInstance = [];
  lastPosition = {};

  setTableWin(tableWin) {
    this.tableWin = tableWin;
  }

  /**
   * 获取一个tab的name，此name用于查找instance
   * @param id id，是一个自动生成的nanoid
   * @returns {string}
   */
  getName(id) {
    return 'table_tab_' + id;
  }

  /**
   * 确认运行，未运行则异步启动，直接返回当前状态
   * @returns {boolean} 返回执行命令时刻的应用运行状态
   * @param args 参数，需要提交app参数
   */
  ensureTab(args) {
    let appInstance = this.get(this.getName(args.id));
    if (!appInstance) {
      this.addTab({ url: args.url, silent: true }).then();
      return false; //告知未运行
    } else {
      return true;
    }
  }

  sendToBrowser(channel, args) {
    if (this.tableWin) {
      this.tableWin.webContents.send(channel, args);
    }
  }

  getUrl(url) {
    let protocolUrl;
    let dev = isDevelopmentMode; //调试开关
    protocolUrl = `tsbapp://./${url}`; //todo 需要验证正式环境的协议情况
    if (dev) {
      protocolUrl = `http://localhost:1600/html/${url}`;
    }
    return protocolUrl;
  }
  /**
   * 打开标签页
   * @param args
   * @returns {Promise<*>}
   */
  async addTab(args) {
    //app args silent静默
    let { url, position, silent, wallet, isLocalHtml } = args;
    console.log('[TableTabManager] addTab 调用:', { url, wallet, isLocalHtml });
    
    if (!position) {
      position = this.lastPosition;
    }
    
    // 处理本地 HTML 文件
    let finalUrl = url;
    if (isLocalHtml) {
      console.log('[TableTabManager] 检测到本地 HTML 文件:', url);
      finalUrl = this.getUrl(url);
      console.log('[TableTabManager] 转换后的 URL:', finalUrl);
    }
    
    let id = nanoid(4);
    let tab = {
      url: finalUrl,
      id: id,
      name: this.getName(id),
      wallet: wallet || false,
    };
    
    console.log('[TableTabManager] 创建标签页:', tab);
    
    // 构建 webPreferences
    const webPreferences = {
      sandbox: false,
      partition: 'persist:webcontent',
      nodeIntegration: false,
      webSecurity: true,
      contextIsolation: true,
      additionalArguments: [
        // '--app-type=table'//添加控制台参数
      ],
    };
    
    // 如果启用钱包功能，添加钱包 preload 脚本
    if (wallet) {
      const path = require('path');
      // 使用构建后的 walletPreload.js
      webPreferences.preload = path.join(__dirname, '../../dist/walletPreload.js');
      console.log('[TableTabManager] 🔐 钱包功能已启用，添加 preload:', webPreferences.preload);
    }
    
    let tabInstance = await global.windowManager.createView({
      name: tab.name,
      webPreferences: webPreferences,
      url: finalUrl,
    });
    
    console.log('[TableTabManager] ✅ 标签页创建成功, ID:', id);
    let view = tabInstance.view;
    view.webContents.on('before-input-event', (event, input) => {
      if (input.key.toLowerCase() === 'f12') {
        view.webContents.openDevTools({
          mode: 'detach',
        });
        event.preventDefault();
      } else if (input.key.toLowerCase() === 'f11') {
        view.webContents.executeJavaScript(`
        function toggleFullScreen() {
          if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen();
          } else {
            if (document.exitFullscreen) {
              document.exitFullscreen();
            }
          }
        }
        toggleFullScreen()
        `);
        event.preventDefault();
      }
    });

    view.webContents.on('page-title-updated', (event, title) => {
      tab.title = title;
      this.sendToBrowser('updateTabTitle', { id: id, title: title });
    });
    view.webContents.on('page-favicon-updated', (event, favicons) => {
      tab.favicons = favicons;
      this.sendToBrowser('updateTabFavicon', { id: id, favicons: favicons });
    });

    view.webContents.setWindowOpenHandler(async (details) => {
      const { url } = details;
      let result = await this.addTab({
        url: url,
      });
      let tab = result.tab;
      this.sendToBrowser('addedTableTab', {
        tab: tab,
      });
      return false;
    });
    // view.webContents.on('-add-new-contents',  async (e, webContents, disposition, _userGesture, _left, _top, _width, _height, url, frameName, referrer, rawFeatures, postData) => {
    //   e.preventDefault()
    //
    // })
    if (!silent) {
      //静默则不设置位置
      this.tableWin.setBrowserView(view); //置入app
      view.webContents.on('dom-ready', () => {
        this.setViewPos(tabInstance.view, position);
        this.lastPosition = position;
        setTimeout(() => {
          capture(view.webContents, undefined, 'tab_' + id).then((image) => {
            this.sendToBrowser('updateTabCapture', { id: tab.id, image: image });
          });
        }, 1000);
      });
    }
    this.runningTabs.push(tab);
    this.runningTabsInstance.push(tabInstance);

    return {
      tabInstance,
      tab,
    };
  }

  /**
   * 同步位置
   * @param id
   * @param position
   */
  setBounds(id, position) {
    let tabInstance = this.get(this.getName(id));
    if (tabInstance) {
      this.setViewPos(tabInstance.view, position);
      this.lastPosition = {};
    } else {
      console.error('不存在的tableTab', id);
    }
  }

  /**
   * 设置网页缩放
   * @param name
   * @param scale
   */
  setScale(id, scale) {
    this.get(this.getName(id)).view.webContents.setZoomFactor(Number((Number(scale) / 100).toFixed(2)));
  }

  refresh(id) {
    this.get(this.getName(id)).view.webContents.reload();
  }

  setViewPos(view, position) {
    view.setBackgroundColor('#ccc');
    view.setBounds(position);
    view.setAutoResize({
      height: true,
      width: true,
    });
  }

  hideTab(id) {
    let instance = this.get(id);
    if (instance) {
      this.tableWin.removeBrowserView(instance.view);
    }
  }

  goBackTab(id) {
    let instance = this.get(id);
    instance.view.webContents.goBack();
  }
  goForwardTab(id) {
    let instance = this.get(id);
    instance.view.webContents.goForward();
  }
  closeAllTab() {
    this.runningTabs.forEach((app) => {
      this.closeTab(this.getName(app.name));
    });
    console.log(this.runningTabsInstance);
    console.log(this.runningTabs);
  }

  closeTab(id) {
    //先移除，以避免移除过程中数据被移除的情况
    let instance = this.get(id);
    let index = this.getIndex(id);
    this.runningTabsInstance.splice(index, 1);
    this.runningTabs.splice(index, 1);
    if (instance) {
      if (this.tableWin && !this.tableWin.isDestroyed()) {
        this.tableWin.removeBrowserView(instance.view);
      }
      instance.close();
    }
  }

  showTab(id, position) {
    //实现还存在问题，需要去获取到最新的位置再重置
    let instance = this.get(this.getName(id));
    if (instance) {
      this.tableWin.setBrowserView(instance.view);
      this.setViewPos(instance.view, position);
    }
  }

  get(name) {
    return this.runningTabsInstance.find((instance) => {
      return instance.name === name;
    });
  }

  getIndex(id) {
    return this.runningTabsInstance.findIndex((instance) => {
      return instance.id === id;
    });
  }

  send(id, channel, args) {
    let appInstance = this.get(this.getName(id));
    if (appInstance) {
      appInstance.view.webContents.send(channel, args);
    }
  }

  /**
   * 获取到全部运行中的应用
   * @returns {{instances: *[], apps: *[]}}
   */
  getRunningTabs() {
    return {
      tabs: this.runningTabs,
      instances: this.runningTabsInstance,
    };
  }

  bindIPC() {
    ipc.on('getRunningTableTabs', (event, args) => {
      let data = this.getRunningTabs();
      event.reply('updateRunningTableTabs', { tabs: data.tabs });
    });

    ipc.on('syncTableTabBounds', (e, a) => {
      this.setBounds(a.tab.id, a.bounds);
    });

    ipc.on('setTableTabScale', (e, a) => {
      this.setScale(a.tab.id, a.scale);
    });

    ipc.on('addTableTab', async (event, args) => {
      console.log('[TableTabManager] 收到 addTableTab 消息:', args);
      let tab = {};
      try {
        let result = await this.addTab({ 
          url: args.url, 
          position: args.position,
          wallet: args.wallet || false,
          isLocalHtml: args.isLocalHtml || false,
        });
        tab = result.tab;
        console.log('[TableTabManager] ✅ 标签页添加完成:', tab);
        
        // 如果启用了钱包，发送初始化消息
        if (args.wallet) {
          console.log('[TableTabManager] 钱包功能已启用，准备发送初始化消息');
          // 等待页面加载完成后发送
          setTimeout(() => {
            if (result.tabInstance && result.tabInstance.view) {
              console.log('[TableTabManager] 发送钱包初始化消息到页面');
              result.tabInstance.view.webContents.send('init-wallet', {
                enabled: true
              });
            }
          }, 1000);
        }
        
        this.sendToBrowser('addedTableTab', {
          tab: tab,
        });
      } catch (e) {
        console.error('[TableTabManager] ❌ 创建标签页出错:', e);
      }
    });

    ipc.on('ensureTableTab', async (event, args) => {
      try {
        event.returnValue = this.ensureTab({ tab: args.tab });
      } catch (e) {
        event.returnValue = false;
      }
    });
    ipc.on('refreshTableTab', (e, a) => {
      this.refresh(a.tab.id);
    });

    ipc.on('closeTableTab', (event, args) => {
      this.closeTab(this.getName(args.tab.id));
    });
    ipc.on('hideTableTab', (event, args) => {
      this.hideTab(this.getName(args.tab.id));
    });
    ipc.on('goBackTableTab', (event, args) => {
      this.goBackTab(this.getName(args.tab.id));
    });
    ipc.on('goForwardTableTab', (event, args) => {
      this.goForwardTab(this.getName(args.tab.id));
    });
    ipc.on('updateRunningTabsCapture', (event, args) => {
      this.runningTabs.forEach((tab, index) => {
        capture(this.runningTabsInstance[index].view.webContents, undefined, 'tab_' + tab.id).then((image) => {
          event.reply('updateTabCapture', { id: tab.id, image: image });
        });
      });
    });

    /**
     * 更新单个网页的截图
     */
    ipc.on('updateTabCapture', (event, args) => {
      this.runningTabs.forEach((tab, index) => {
        if (tab.id === args.id) {
          capture(this.runningTabsInstance[index].view.webContents, undefined, 'tab_' + tab.id).then((image) => {
            event.reply('updateTabCapture', { id: tab.id, image: image });
          });
        }
      });
    });

    ipc.on('showTableTab', (event, args) => {
      this.showTab(args.id, args.position);
    });

    // ========== 钱包相关 IPC 处理器 ==========
    
    /**
     * 聚焦主窗口（用于显示 Web3Modal 弹窗）
     */
    ipc.handle('focus-main-window', async (event) => {
      console.log('[TableTabManager IPC] 收到聚焦主窗口请求');
      try {
        if (this.tableWin && !this.tableWin.isDestroyed()) {
          // 临时移除所有 BrowserView，避免遮挡 Web3Modal 弹窗
          const currentBrowserViews = this.tableWin.getBrowserViews();
          console.log('[TableTabManager IPC] 临时移除', currentBrowserViews.length, '个 BrowserView');
          
          currentBrowserViews.forEach(view => {
            this.tableWin.removeBrowserView(view);
          });
          
          // 显示窗口（如果最小化）
          if (this.tableWin.isMinimized()) {
            this.tableWin.restore();
          }
          
          // 将窗口置于最前
          this.tableWin.show();
          this.tableWin.focus();
          
          console.log('[TableTabManager IPC] ✅ 主窗口已聚焦，BrowserView 已隐藏');
          
          // 保存 BrowserView 引用，以便后续恢复
          this._hiddenBrowserViews = currentBrowserViews;
          
          return { success: true };
        } else {
          console.error('[TableTabManager IPC] ❌ 主窗口不存在或已销毁');
          return { success: false, error: '主窗口不可用' };
        }
      } catch (error) {
        console.error('[TableTabManager IPC] ❌ 聚焦主窗口错误:', error);
        return { success: false, error: error.message };
      }
    });
    
    /**
     * 恢复 BrowserView（钱包连接完成后调用）
     */
    ipc.handle('restore-browser-views', async (event) => {
      console.log('[TableTabManager IPC] 收到恢复 BrowserView 请求');
      try {
        if (this.tableWin && !this.tableWin.isDestroyed() && this._hiddenBrowserViews) {
          console.log('[TableTabManager IPC] 恢复', this._hiddenBrowserViews.length, '个 BrowserView');
          
          this._hiddenBrowserViews.forEach(view => {
            this.tableWin.addBrowserView(view);
          });
          
          this._hiddenBrowserViews = null;
          
          console.log('[TableTabManager IPC] ✅ BrowserView 已恢复');
          return { success: true };
        } else {
          console.log('[TableTabManager IPC] 没有需要恢复的 BrowserView');
          return { success: true };
        }
      } catch (error) {
        console.error('[TableTabManager IPC] ❌ 恢复 BrowserView 错误:', error);
        return { success: false, error: error.message };
      }
    });
    
    /**
     * 钱包初始化
     */
    ipc.handle('wallet-init', async (event) => {
      console.log('[TableTabManager IPC] wallet-init 调用');
      try {
        if (!this.tableWin || this.tableWin.isDestroyed()) {
          return { success: false, error: '桌面窗口不可用' };
        }

        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            ipc.off('wallet-init-complete', listener);
            reject(new Error('初始化超时'));
          }, 10000); // 10秒超时

          const listener = (e, result) => {
            clearTimeout(timeout);
            ipc.off('wallet-init-complete', listener);
            console.log('[TableTabManager IPC] wallet-init 响应:', result);
            resolve(result);
          };

          ipc.once('wallet-init-complete', listener);

          this.tableWin.webContents.send('wallet-init-request', {
            requestId: Date.now(),
          });
        });
      } catch (error) {
        console.error('[TableTabManager IPC] wallet-init 错误:', error);
        return {
          success: false,
          error: error.message,
        };
      }
    });

    /**
     * 钱包连接
     */
    ipc.handle('wallet-connect', async (event) => {
      console.log('[TableTabManager IPC] wallet-connect 调用');
      try {
        if (!this.tableWin || this.tableWin.isDestroyed()) {
          return { success: false, error: '桌面窗口不可用' };
        }

        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            ipc.off('wallet-connect-complete', listener);
            reject(new Error('连接超时'));
          }, 60000); // 60秒超时（用户需要时间扫码）

          const listener = (e, result) => {
            clearTimeout(timeout);
            ipc.off('wallet-connect-complete', listener);
            console.log('[TableTabManager IPC] wallet-connect 响应:', result);
            resolve(result);
          };

          ipc.once('wallet-connect-complete', listener);

          this.tableWin.webContents.send('wallet-connect-request', {
            requestId: Date.now(),
          });
        });
      } catch (error) {
        console.error('[TableTabManager IPC] wallet-connect 错误:', error);
        return {
          success: false,
          error: error.message,
        };
      }
    });

    /**
     * 钱包断开连接
     */
    ipc.handle('wallet-disconnect', async (event) => {
      console.log('[TableTabManager IPC] wallet-disconnect 调用');
      try {
        if (!this.tableWin || this.tableWin.isDestroyed()) {
          return { success: false, error: '桌面窗口不可用' };
        }

        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            ipc.off('wallet-disconnect-complete', listener);
            reject(new Error('断开超时'));
          }, 10000); // 10秒超时

          const listener = (e, result) => {
            clearTimeout(timeout);
            ipc.off('wallet-disconnect-complete', listener);
            console.log('[TableTabManager IPC] wallet-disconnect 响应:', result);
            resolve(result);
          };

          ipc.once('wallet-disconnect-complete', listener);

          this.tableWin.webContents.send('wallet-disconnect-request', {
            requestId: Date.now(),
          });
        });
      } catch (error) {
        console.error('[TableTabManager IPC] wallet-disconnect 错误:', error);
        return {
          success: false,
          error: error.message,
        };
      }
    });

    /**
     * 获取钱包状态
     */
    ipc.handle('wallet-get-state', async (event) => {
      console.log('[TableTabManager IPC] wallet-get-state 调用');
      try {
        if (!this.tableWin || this.tableWin.isDestroyed()) {
          return { success: false, error: '桌面窗口不可用' };
        }

        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            ipc.off('wallet-get-state-complete', listener);
            reject(new Error('获取状态超时'));
          }, 5000); // 5秒超时

          const listener = (e, result) => {
            clearTimeout(timeout);
            ipc.off('wallet-get-state-complete', listener);
            console.log('[TableTabManager IPC] wallet-get-state 响应:', result);
            resolve(result);
          };

          ipc.once('wallet-get-state-complete', listener);

          this.tableWin.webContents.send('wallet-get-state-request', {
            requestId: Date.now(),
          });
        });
      } catch (error) {
        console.error('[TableTabManager IPC] wallet-get-state 错误:', error);
        return {
          success: false,
          error: error.message,
        };
      }
    });

    console.log('[TableTabManager] ✅ 钱包 IPC 处理器注册完成');

    // ========== 高级功能：合约调用相关 IPC 处理器 ==========

    /**
     * 获取 WalletProvider
     */
    ipc.handle('wallet-get-provider', async (event) => {
      console.log('[TableTabManager IPC] wallet-get-provider 调用');
      try {
        if (!this.tableWin || this.tableWin.isDestroyed()) {
          return { success: false, error: '桌面窗口不可用' };
        }

        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            ipc.off('wallet-get-provider-complete', listener);
            reject(new Error('获取 Provider 超时'));
          }, 5000);

          const listener = (e, result) => {
            clearTimeout(timeout);
            ipc.off('wallet-get-provider-complete', listener);
            console.log('[TableTabManager IPC] wallet-get-provider 响应:', result);
            resolve(result);
          };

          ipc.once('wallet-get-provider-complete', listener);

          this.tableWin.webContents.send('wallet-get-provider-request', {
            requestId: Date.now(),
          });
        });
      } catch (error) {
        console.error('[TableTabManager IPC] wallet-get-provider 错误:', error);
        return {
          success: false,
          error: error.message,
        };
      }
    });

    /**
     * 查询合约（只读）
     */
    ipc.handle('wallet-query-contract', async (event, args) => {
      console.log('[TableTabManager IPC] wallet-query-contract 调用:', args);
      try {
        if (!this.tableWin || this.tableWin.isDestroyed()) {
          return { success: false, error: '桌面窗口不可用' };
        }

        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            ipc.off('wallet-query-contract-complete', listener);
            reject(new Error('查询合约超时'));
          }, 30000); // 30秒超时

          const listener = (e, result) => {
            clearTimeout(timeout);
            ipc.off('wallet-query-contract-complete', listener);
            console.log('[TableTabManager IPC] wallet-query-contract 响应:', result);
            resolve(result);
          };

          ipc.once('wallet-query-contract-complete', listener);

          this.tableWin.webContents.send('wallet-query-contract-request', {
            requestId: Date.now(),
            ...args,
          });
        });
      } catch (error) {
        console.error('[TableTabManager IPC] wallet-query-contract 错误:', error);
        return {
          success: false,
          error: error.message,
        };
      }
    });

    /**
     * 调用合约（写操作）
     */
    ipc.handle('wallet-invoke-contract', async (event, args) => {
      console.log('[TableTabManager IPC] wallet-invoke-contract 调用:', args);
      try {
        if (!this.tableWin || this.tableWin.isDestroyed()) {
          return { success: false, error: '桌面窗口不可用' };
        }

        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            ipc.off('wallet-invoke-contract-complete', listener);
            reject(new Error('调用合约超时'));
          }, 60000); // 60秒超时（用户可能需要时间确认交易）

          const listener = (e, result) => {
            clearTimeout(timeout);
            ipc.off('wallet-invoke-contract-complete', listener);
            console.log('[TableTabManager IPC] wallet-invoke-contract 响应:', result);
            resolve(result);
          };

          ipc.once('wallet-invoke-contract-complete', listener);

          this.tableWin.webContents.send('wallet-invoke-contract-request', {
            requestId: Date.now(),
            ...args,
          });
        });
      } catch (error) {
        console.error('[TableTabManager IPC] wallet-invoke-contract 错误:', error);
        return {
          success: false,
          error: error.message,
        };
      }
    });

    /**
     * 部署合约
     */
    ipc.handle('wallet-deploy-contract', async (event, args) => {
      console.log('[TableTabManager IPC] wallet-deploy-contract 调用:', args);
      try {
        if (!this.tableWin || this.tableWin.isDestroyed()) {
          return { success: false, error: '桌面窗口不可用' };
        }

        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            ipc.off('wallet-deploy-contract-complete', listener);
            reject(new Error('部署合约超时'));
          }, 120000); // 120秒超时（部署需要更长时间）

          const listener = (e, result) => {
            clearTimeout(timeout);
            ipc.off('wallet-deploy-contract-complete', listener);
            console.log('[TableTabManager IPC] wallet-deploy-contract 响应:', result);
            resolve(result);
          };

          ipc.once('wallet-deploy-contract-complete', listener);

          this.tableWin.webContents.send('wallet-deploy-contract-request', {
            requestId: Date.now(),
            ...args,
          });
        });
      } catch (error) {
        console.error('[TableTabManager IPC] wallet-deploy-contract 错误:', error);
        return {
          success: false,
          error: error.message,
        };
      }
    });

    /**
     * 签名消息
     */
    ipc.handle('wallet-sign-message', async (event, args) => {
      console.log('[TableTabManager IPC] wallet-sign-message 调用:', args);
      try {
        if (!this.tableWin || this.tableWin.isDestroyed()) {
          return { success: false, error: '桌面窗口不可用' };
        }

        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            ipc.off('wallet-sign-message-complete', listener);
            reject(new Error('签名消息超时'));
          }, 60000);

          const listener = (e, result) => {
            clearTimeout(timeout);
            ipc.off('wallet-sign-message-complete', listener);
            console.log('[TableTabManager IPC] wallet-sign-message 响应:', result);
            resolve(result);
          };

          ipc.once('wallet-sign-message-complete', listener);

          this.tableWin.webContents.send('wallet-sign-message-request', {
            requestId: Date.now(),
            ...args,
          });
        });
      } catch (error) {
        console.error('[TableTabManager IPC] wallet-sign-message 错误:', error);
        return {
          success: false,
          error: error.message,
        };
      }
    });

    /**
     * 发送交易
     */
    ipc.handle('wallet-send-transaction', async (event, args) => {
      console.log('[TableTabManager IPC] wallet-send-transaction 调用:', args);
      try {
        if (!this.tableWin || this.tableWin.isDestroyed()) {
          return { success: false, error: '桌面窗口不可用' };
        }

        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            ipc.off('wallet-send-transaction-complete', listener);
            reject(new Error('发送交易超时'));
          }, 60000);

          const listener = (e, result) => {
            clearTimeout(timeout);
            ipc.off('wallet-send-transaction-complete', listener);
            console.log('[TableTabManager IPC] wallet-send-transaction 响应:', result);
            resolve(result);
          };

          ipc.once('wallet-send-transaction-complete', listener);

          this.tableWin.webContents.send('wallet-send-transaction-request', {
            requestId: Date.now(),
            ...args,
          });
        });
      } catch (error) {
        console.error('[TableTabManager IPC] wallet-send-transaction 错误:', error);
        return {
          success: false,
          error: error.message,
        };
      }
    });

    /**
     * 获取网络信息
     */
    ipc.handle('wallet-get-network', async (event) => {
      console.log('[TableTabManager IPC] wallet-get-network 调用');
      try {
        if (!this.tableWin || this.tableWin.isDestroyed()) {
          return { success: false, error: '桌面窗口不可用' };
        }

        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            ipc.off('wallet-get-network-complete', listener);
            reject(new Error('获取网络信息超时'));
          }, 5000);

          const listener = (e, result) => {
            clearTimeout(timeout);
            ipc.off('wallet-get-network-complete', listener);
            console.log('[TableTabManager IPC] wallet-get-network 响应:', result);
            resolve(result);
          };

          ipc.once('wallet-get-network-complete', listener);

          this.tableWin.webContents.send('wallet-get-network-request', {
            requestId: Date.now(),
          });
        });
      } catch (error) {
        console.error('[TableTabManager IPC] wallet-get-network 错误:', error);
        return {
          success: false,
          error: error.message,
        };
      }
    });

    console.log('[TableTabManager] ✅ 钱包高级功能 IPC 处理器注册完成');
  }
}

module.exports = TableTabManager;
