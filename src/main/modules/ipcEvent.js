const {ipcMain, dialog, app, BrowserWindow, shell} = require("electron");
const {openFile, runExecutable, saveFile} = require("../modules/fileManager");
const {readFileSync} = require("fs");
const {runAppByName} = require("./appLauncher");
const createSearchWindow = require("..//windows/searchWin");

module.exports = function () {

    ipcMain.on('toggle-fullscreen', () => {
        global.MainWindow.setFullScreen(!global.MainWindow.isFullScreen());
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

    // 响应搜索指令
    ipcMain.on('search', async (event, query) => {
        let searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        if (global.SearchWindow) {
            global.SearchWindow = createSearchWindow();
        }
        await global.SearchWindow.show();
        await global.SearchWindow.loadURL(searchUrl);
    });

    ipcMain.on('close-searchWindow', () => {
        if (global.SearchWindow) {
            global.SearchWindow.close();
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
}

