import vncService from "./screen";
import ipcService from './events/ipcMain'
import appService from './apps/index'

export default {
  initialize(): void {
    // 初始化noVNC服务
    vncService.initNoVncServer();
    // 初始化主程序监听服务
    ipcService.setupHandlers();
    // 本地应用程序管理
    appService.loadLocalApps();
  }
}
