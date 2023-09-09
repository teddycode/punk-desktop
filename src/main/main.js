const {app, BrowserWindow, Menu, ipcMain, screen, dialog} = require('electron');
const path = require('path');
const {openFile, runExecutable, saveFile} = require("./fileManager");
const {readFileSync} = require("fs");
const {runAppByName} = require("./app-launcher");
const {createDataTable} = require('./datastore');

let mainWindow;
let searchView;
function createWindow() {
    const mainScreen = screen.getPrimaryDisplay();
    const {width, height} = mainScreen.size;
    mainWindow = new BrowserWindow({
        width: width,
        height: height,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            nodeIntegrationInWorker: true, // 启用多线程
            preload: path.join(__dirname, './modules/preload.js'),
        },
        fullscreen: true,
    });

    mainWindow.loadURL('http://localhost:8080');

    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.executeJavaScript(`
            document.body.style.overflow = 'hidden';
        `);
    });

    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function () {
        mainWindow = null;
        searchView = null;
    });

    // 创建本地数据库
    createDataTable();
}

app.on('ready', async () => {
    Menu.setApplicationMenu(null);
    createWindow();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
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
            nodeIntegration: true,
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