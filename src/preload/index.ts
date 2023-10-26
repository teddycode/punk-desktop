import {contextBridge, ipcRenderer, IpcRendererEvent, shell} from "electron"
import {arch, platform, release} from 'os'

contextBridge.exposeInMainWorld("ipcRenderer", {
  send: (channel: string, args?: any) => ipcRenderer.send(channel, args),
  sendSync: (channel: string, args?: any) => ipcRenderer.sendSync(channel, args),
  on: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) =>
    ipcRenderer.on(channel, listener),
  once: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) =>
    ipcRenderer.once(channel, listener),
  invoke: (channel: string, args: any) => ipcRenderer.invoke(channel, args),
  removeAllListeners: (channel: string) => ipcRenderer.removeAllListeners(channel)
});

contextBridge.exposeInMainWorld("systemInfo", {
  platform: platform(),
  release: release(),
  arch: arch()
})

contextBridge.exposeInMainWorld("shell", {
  shell: shell
})

contextBridge.exposeInMainWorld("crash", {
  start: () => {
    process.crash()
  }
})

let fileSelectedCallback = null;

ipcRenderer.on('file-selected', (event, filePath: String, content: any) => {
  if (fileSelectedCallback) {
    fileSelectedCallback(filePath, content);
  }
});

// 使用 contextBridge API 来选择要从预加载脚本中暴露哪些 API
contextBridge.exposeInMainWorld('electronAPI', {
  requestFileOpen: () => {
    ipcRenderer.send('request-file-open');
  },
  saveFileContent: (filePath: string, content: any) => {
    ipcRenderer.send('save-file-content', filePath, content);
  },
  onFileSelected: (callback: CallableFunction) => {
    fileSelectedCallback = callback;
    //   TODO 是否可以改成ipMain.handle
  },
  onRunApplication: (path: string, cmd: String) => {
    ipcRenderer.send('run-application', path, cmd)
  },
  // TODO declare render2Main api here
});
