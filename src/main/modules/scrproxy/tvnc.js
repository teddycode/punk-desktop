const {runCommandSync} = require("../utils");
const {CMD_VNC_START, CMD_VNC_INSTALL, CMD_PATH_TIGHTVNC, CMD_VNC_CONTROL_SET} = require("./cmds");
const log = require('log4js').getLogger("initial")

function startTightVnc(isFirst) {
    // 首次需要安装
    if (isFirst) {
        // windows系统 TODO 驱动安装应集成到安装包
        if (process.platform === 'win32') {
            log.info("windows os, creating virtual screen...")
            let ret = runCommandSync(CMD_VNC_INSTALL, CMD_PATH_TIGHTVNC);
            if (ret == null) {
                log.error('vnc install failed.')
                // return false;
            }
            // 启动服务
            ret = runCommandSync(CMD_VNC_START, CMD_PATH_TIGHTVNC);
            if (ret === null) {
                log.error('vnc create failed.')
                // return false
            }
            // 配置服务
            ret = runCommandSync(CMD_VNC_CONTROL_SET, CMD_PATH_TIGHTVNC);
            if (ret === null) {
                log.error('vnc set failed.')
                return false
            }
        } else if (process.platform === 'linux') {
            log.info('Linux os, not support yet');
        } else if (process.platform === 'darwin') {
            log.info('OSX os, not support yet');
        }
    }
    // 启动访服务
}

module.exports = {
    startTightVnc,
}