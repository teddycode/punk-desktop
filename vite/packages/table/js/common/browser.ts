const browser = {
  /**
   * 在用户选择的浏览器内打开，根据工作台设置自动选择浏览器
   * @param url
   */
  async openInUserSelect(url: string) {
    //获取到用户设置
    let settings = await tsbApi.settings.get('openUrlBrowser');
    if (settings === 'system') {
      browser.openInSystem(url);
    } else {
      browser.openInInner(url);
    }
  },
  /**
   * 在系统默认浏览器内打开
   */
  openInSystem(url: string) {
    console.log('在系统默认浏览器打开', url);
    require('electron').shell.openExternal(url);
  },
  /**
   * 在磐古跨链客户端内打开
   * @constructor
   */
  openInInner(url: string) {
    console.log('在磐古跨链客户端打开', url);
    ipc.send('addTab', { url: url });
  },
  /**
   * 在工作台内打开
   * @param url
   * @param options 带参数
   */
  async openInTable(url: string, options: { wallet?: Boolean }) {
    console.log('[Browser] openInTable 调用:', { url, options });

    // 检测 URL 类型
    const isLocalHtml = url.endsWith('.html') && !url.startsWith('http');
    console.log('[Browser] URL 类型:', isLocalHtml ? '本地 HTML' : '外部 URL');

    // 如果是本地 HTML 文件，添加 wallet 参数到 URL
    let finalUrl = url;
    if (isLocalHtml && options?.wallet) {
      const separator = url.includes('?') ? '&' : '?';
      finalUrl = `${url}${separator}wallet=true`;
      console.log('[Browser] 添加 wallet 参数:', finalUrl);
    }

    // 如果需要钱包功能
    if (options?.wallet) {
      console.log('[Browser] 钱包功能已启用，开始初始化...');
      try {
        // 动态导入钱包服务
        const { useWalletService } = await import('@table/composables/useWalletService');
        const walletService = useWalletService();
        console.log('[Browser] 钱包服务已获取');

        // 确保钱包已初始化
        if (!walletService.checkInitialized()) {
          console.log('[Browser] 钱包未初始化，正在初始化...');
          await walletService.initWallet();
          console.log('[Browser] ✅ 钱包初始化成功');
        } else {
          console.log('[Browser] 钱包已初始化');
        }

        // 如果未连接，提示用户连接钱包
        if (!walletService.isConnected.value) {
          console.log('[Browser] 钱包未连接，打开连接对话框...');
          const account = await walletService.openWallet();
          if (account) {
            console.log('[Browser] ✅ 钱包连接成功:', account);
          } else {
            console.log('[Browser] ⚠️ 用户取消连接或连接超时');
          }
        } else {
          console.log('[Browser] 钱包已连接:', walletService.address.value);
        }
      } catch (e) {
        console.error('[Browser] ❌ 钱包初始化失败:', e);
      }
    }

    console.log('[Browser] 跳转到浏览器页面:', finalUrl);
    window.$app.$router.push({
      name: 'browser',
      params: {
        url: finalUrl,
        wallet: options?.wallet || false,
        isLocalHtml: isLocalHtml,
        ...options,
      },
    });
  },
};

export default browser;
