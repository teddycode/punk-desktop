const { app, BrowserWindow, Menu,ipcMain,screen,dialog, } = require('electron');

let mainWindow;
const path = require('path');

function createWindow() {
    const mainScreen = screen.getPrimaryDisplay();
    const { width, height } = mainScreen.size;
    console.log("width: " + width + "height" + height);
    mainWindow = new BrowserWindow({
        width: width,
        height: height,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
        fullscreen:true,
    });
    // 指定你的Vue项目构建后的index.html的路径
    // mainWindow.loadFile('dist/index.html');
    mainWindow.loadURL('http://localhost:8081');

    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.executeJavaScript(`
            document.body.style.overflow = 'hidden';
        `);
    });
    // 打开开发者工具
    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function() {
        mainWindow = null;
    });
}

app.on('ready', async () => {
    // 这里是新添加的代码，隐藏所有窗口的菜单
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