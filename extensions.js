const { ipcMain, BrowserWindow } = require('electron');

const METAMASK_ID = 'nkbihfbeogaeaoehlefnkodbefgpgknn';

const createPopup = (file) => {
    return new BrowserWindow({
        title: 'MetaMask',
        width: 360,
        height: 520,
        type: 'popup',
        resizable: false
    });
};

const closePopup = (popup) => {
    if(popup && !popup.isDestroyed()) popup.close();
};

const loadMetamask = (window) => {
    let metamaskPopup;
    let metamaskNotification;
    let mainWindow = window;

    ipcMain.on('open-metamask-popup', (event, arg) => {
        if(metamaskPopup && !metamaskPopup.isDestroyed()) metamaskPopup.close();

        metamaskPopup = createPopup();
        metamaskPopup.loadURL(`chrome-extension://${METAMASK_ID}/popup.html`);
    });

    ipcMain.on('open-metamask-notification', (event, arg) => {
        if(metamaskNotification && !metamaskNotification.isDestroyed()) metamaskNotification.close();

        metamaskNotification = createPopup();
        metamaskNotification.loadURL(`chrome-extension://${METAMASK_ID}/notification.html`);
    });

    ipcMain.on('close-metamask-popup', (event, arg) => {
        closePopup(metamaskPopup);
    });

    ipcMain.on('close-metamask-notification', (event, arg) => {
        closePopup(metamaskNotification);
    });
};

module.exports = {
    loadMetamask
};
