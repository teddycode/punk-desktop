const {app} = require('electron');
const initIPCEvents = require("./modules/initialize/ipcEvent");
const createMainWindow = require("./windows/mainWin");
const createSearchWindow = require("./windows/searchWin");
const {runInitTasks} = require("./modules/initialize");

const isDevelopment = process.env.NODE_ENV !== "production";


// 创建所有窗口
function createWindows() {
    global.MainWindow = createMainWindow();
    global.SearchWindow = createSearchWindow();
}

//  Electron 完成初始化时，发出一次
app.on('ready', async () => {
    // 1. 执行初始化任务
    runInitTasks();
    // 2. 创建窗口
    createWindows();
    // 3. 初始化进程之间事件监听
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
