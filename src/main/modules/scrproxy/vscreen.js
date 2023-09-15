const {runCommandSync} = require("../utils");
const {
    CMD_WIN_USBMMIDD_DRIVER_INSTALL,
    CMD_WIN_USBMMIDD_ADD_MONITOR,
    CMD_PATH_VIRTUAL_SCREEN
} = require("./cmds");

const log = require('log4js').getLogger("initial")

function createVirtualScr(isFirst) {
    // 首次需要安装驱动
    if (isFirst) {
        // windows系统 TODO 驱动安装应集成到安装包中
        if (process.platform === 'win32') {
            log.info("windows os, creating virtual screen...")
            let ret = runCommandSync(CMD_WIN_USBMMIDD_DRIVER_INSTALL, CMD_PATH_VIRTUAL_SCREEN);
            if (ret == null) {
                log.error('creating failed.')
                // return false;
            }
            // 创建第一个虚拟屏幕
            ret = runCommandSync(CMD_WIN_USBMMIDD_ADD_MONITOR, CMD_PATH_VIRTUAL_SCREEN);
            if (ret === null) {
                log.error('creating failed.')
                return false
            }
        } else if (process.platform === 'linux') {
            log.info('Linux os, not support yet');
        } else if (process.platform === 'darwin') {
            log.info('OSX os, not support yet');
        }
    }
}

module.exports = {
    createVirtualScr
}