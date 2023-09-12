const {app} = require('electron');
const {createDataTables} = require('./database');
const initIPCEvents = require("./modules/ipcEvent");
const createMainWindow = require("./windows/mainWin");
const createSearchWindow = require("./windows/searchWin");

const isDevelopment = process.env.NODE_ENV !== "production";

// 创建所有窗口
function createWindows() {
    global.MainWindow = createMainWindow();
    global.SearchWindow = createSearchWindow();
}

//  Electron 完成初始化时，发出一次
app.on('ready', async () => {
    // 创建本地数据库
    createDataTables();
    // 创建窗口
    createWindows();
    // 初始化进程之间事件监听
    initIPCEvents();
});

// Electron 的最后一个窗口被关闭时退出应用
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
    if (global.MainWindow === null){
        global.MainWindow = createMainWindow();
    }
});

// 开发模式下的优雅退出.
if (isDevelopment) {
    if (process.platform === "win32") {
        process.on("message", (data) => {
            if (data === "graceful-exit") {
                app.quit();
            }
        });
    } else {
        process.on("SIGTERM", () => {
            app.quit();
        });
    }
}
