const { app, BrowserWindow, Menu, ipcMain, screen, dialog, BrowserView } = require('electron');

let mainWindow;
let searchView; // 添加一个 BrowserView 实例用于显示搜索结果
const path = require('path');

function createWindow() {
    const mainScreen = screen.getPrimaryDisplay();
    const { width, height } = mainScreen.size;
    mainWindow = new BrowserWindow({
        width: width,
        height: height,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
        fullscreen: true,
    });

    mainWindow.loadURL('http://localhost:8081');

    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.executeJavaScript(`
            document.body.style.overflow = 'hidden';
        `);
    });

    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function() {
        mainWindow = null;
        searchView = null;
    });
}

app.on('ready', async () => {
    Menu.setApplicationMenu(null);
    createWindow();
});

app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function() {
    if (mainWindow === null) createWindow();
});

ipcMain.on('toggle-fullscreen', () => {
    if (mainWindow.isFullScreen()) {
        mainWindow.setFullScreen(false);
    } else {
        mainWindow.setFullScreen(true);
    }
});

ipcMain.on('show-custom-alert', (event, message) => {
    const options = {
        type: 'warning',
        buttons: ["OK"],
        defaultId: 0,
        cancelId: 0,
        detail: message,
        message: ''
    };
    dialog.showMessageBoxSync(options);
});


let searchWindow;
ipcMain.on('search', (event, query) => {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

    // 如果已经有一个搜索窗口打开，先关闭它
    if (searchWindow) {
        searchWindow.close();
    }

    searchWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
        show: false
    });

    searchWindow.loadURL(searchUrl);

    searchWindow.once('ready-to-show', () => {
        searchWindow.show();
    });

    searchWindow.on('closed', () => {
        searchWindow = null;
    });
});

ipcMain.on('close-searchWindow', () => {
    if (searchWindow) {
        searchWindow.close();
    }
});
