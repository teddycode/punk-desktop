const {BrowserWindow, Menu, screen} = require("electron");
const path = require("path");

function createMainWindow() {
    let mainWindow = null;
    let hostScreen = screen.getPrimaryDisplay();
    const {width, height} = hostScreen.size;
    mainWindow = new BrowserWindow({
        width: width,
        height: height,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            nodeIntegrationInWorker: true, // 启用多线程
            preload: [
                path.join(__dirname, '../modules/initialize/preload.js'),
                path.join(__dirname, '../modules/initialize/wsproxy.js'),
            ]
        },
        fullscreen: true,
    });

    mainWindow.loadURL('http://localhost:8080');

    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.executeJavaScript(`
            document.body.style.overflow = 'hidden';
        `);
    });

    mainWindow.on("closed", () => {
        mainWindow = null;
    });

    if (!process.env.IS_TEST) {
        // 开发环境下打开
        mainWindow.webContents.openDevTools();
    }

    Menu.setApplicationMenu(null);
    return mainWindow;
}

module.exports = createMainWindow