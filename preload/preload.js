window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }

    for (const dependency of ['chrome', 'node', 'electron']) {
        replaceText(`${dependency}-version`, process.versions[dependency])
    }

    const { contextBridge, ipcRenderer } = require('electron');

    let fileSelectedCallback = null;

    ipcRenderer.on('file-selected', (event, filePath, content) => {
        if (fileSelectedCallback) {
            fileSelectedCallback(filePath, content);
        }
    });

    contextBridge.exposeInMainWorld('electronAPI', {
        toggleFullScreen: () => {
            ipcRenderer.send('toggle-fullscreen');
        },
        customAlert: (str) => {
            ipcRenderer.send('show-custom-alert', str);
        },
        sendSearchQuery: (query) => {
            ipcRenderer.send('search', query);
        },
        closeSearchWindow: () => {
            ipcRenderer.send('close-searchWindow')
        },
        requestFileOpen: () => {
            ipcRenderer.send('request-file-open');
        },
        saveFileContent: (filePath, content) => {
            ipcRenderer.send('save-file-content', filePath, content);
        },
        onFileSelected: (callback) => {
            fileSelectedCallback = callback;
        }
    });

    console.log('DOMContentLoaded event fired, setting up electronAPI');
});
