(() => {
let walletWindow = null;
let walletWindowUrl = null;

function getWalletWindowBounds() {
  const display = electron.screen.getPrimaryDisplay();
  const workArea = display.workArea;
  const width = Math.min(420, Math.max(360, workArea.width - 80));
  const height = Math.min(720, Math.max(560, workArea.height - 80));

  return {
    width,
    height,
    x: Math.round(workArea.x + workArea.width - width - 32),
    y: Math.round(workArea.y + 48),
  };
}

function buildWalletErrorPage(error) {
  const details = String(error && (error.stack || error.message) ? error.stack || error.message : error)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return `data:text/html;charset=utf-8,${encodeURIComponent(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #101418;
        color: #eef3f8;
        font-family: Arial, sans-serif;
      }
      main {
        width: min(360px, calc(100vw - 40px));
        line-height: 1.5;
      }
      h1 {
        margin: 0 0 12px;
        font-size: 20px;
      }
      p {
        margin: 0 0 12px;
        color: #b8c4cf;
      }
      code {
        display: block;
        padding: 12px;
        border-radius: 8px;
        overflow: auto;
        white-space: pre-wrap;
        background: #1b232b;
        color: #f3b35b;
        font-size: 12px;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>PunkOS Wallet is not ready</h1>
      <p>Please build or export services/wallet-client first, then open the wallet again.</p>
      <code>${details}</code>
    </main>
  </body>
</html>`)}`;
}

async function resolveWalletUrl() {
  if (!global.serviceManager) {
    if (typeof ensureServiceManagerReady === 'function') {
      await ensureServiceManagerReady();
    }
  }

  if (!global.serviceManager) {
    throw new Error('Local service manager is not initialized');
  }

  return global.serviceManager.ensureServicePageUrl('wallet-client');
}

async function openWalletWindow() {
  if (walletWindow && !walletWindow.isDestroyed() && walletWindowUrl) {
    if (walletWindow.isMinimized()) {
      walletWindow.restore();
    }
    walletWindow.show();
    walletWindow.focus();
    return { opened: true, reused: true };
  }

  if (walletWindow && !walletWindow.isDestroyed()) {
    walletWindow.close();
    walletWindow = null;
  }

  const bounds = getWalletWindowBounds();
  walletWindow = new BrowserWindow({
    ...bounds,
    minWidth: 360,
    minHeight: 520,
    title: 'PunkOS Wallet',
    show: false,
    parent: null,
    modal: false,
    frame: true,
    resizable: true,
    movable: true,
    minimizable: true,
    maximizable: false,
    skipTaskbar: false,
    alwaysOnTop: true,
    backgroundColor: '#ffffff',
    webPreferences: {
      devTools: true,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      partition: 'persist:punkos-wallet-client',
    },
  });

  walletWindow.setMenu(null);
  walletWindow.setAlwaysOnTop(true, 'floating');
  walletWindow.on('closed', () => {
    walletWindow = null;
    walletWindowUrl = null;
  });
  walletWindow.on('ready-to-show', () => {
    if (!walletWindow || walletWindow.isDestroyed()) {
      return;
    }
    walletWindow.show();
    walletWindow.focus();
  });

  try {
    const walletUrl = await resolveWalletUrl();
    await walletWindow.loadURL(walletUrl);
    walletWindowUrl = walletUrl;
    return { opened: true, reused: false, url: walletUrl };
  } catch (error) {
    console.error('打开钱包小窗失败:', error);
    walletWindowUrl = null;
    if (walletWindow && !walletWindow.isDestroyed()) {
      await walletWindow.loadURL(buildWalletErrorPage(error));
      walletWindow.show();
      walletWindow.focus();
    }
    return { opened: false, error: error.message || String(error) };
  }
}

app.whenReady().then(() => {
  ipc.handle('wallet-window.open', async () => openWalletWindow());
  ipc.on('wallet-window.open', () => {
    openWalletWindow().catch((error) => {
      console.error('打开钱包小窗失败:', error);
    });
  });
});
})();
