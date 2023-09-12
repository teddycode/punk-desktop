const {BrowserWindow} = require("electron");

function createSearchWindow() {

    let searchWindow = null;

    searchWindow = new BrowserWindow({
        width: 800,
        height: 600, // TODO 调整大小
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
        },
        show: false
    });

    searchWindow.on('closed', () => {
        searchWindow = null;
    });
    return searchWindow;
}

module.exports = createSearchWindow
