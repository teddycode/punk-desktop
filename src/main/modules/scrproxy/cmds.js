// 系统类型
const {join} = require("path");

const DEVINSTALLER = process.arch === 'x64' ? ' .\\deviceinstaller64.exe ' : ' .\\deviceinstaller64.exe ';

// 管理员身份运行
// const CMD_ADMIN_PREFIX = 'runas /user:Administrator ';
const CMD_ADMIN_PREFIX = ' ';
// 安装位驱动
const CMD_WIN_USBMMIDD_DRIVER_INSTALL = CMD_ADMIN_PREFIX + DEVINSTALLER + ' install usbmmidd.inf usbmmidd '

// 卸载驱动
const CMD_WIN_USBMMIDD_DRIVER_STOP = CMD_ADMIN_PREFIX + DEVINSTALLER + ' stop usbmmidd '
const CMD_WIN_USBMMIDD_DRIVER_REMOVE = CMD_ADMIN_PREFIX + DEVINSTALLER + ' remove usbmmidd '
const CMD_WIN_USBMMIDD_ADD_MONITOR = CMD_ADMIN_PREFIX + DEVINSTALLER + '  enableidd 1 '
const CMD_WIN_USBMMIDD_REMOVE_MONITOR = CMD_ADMIN_PREFIX + DEVINSTALLER + ' enableidd 0 '
const CMD_PATH_VIRTUAL_SCREEN = 'vscreen';
const CMD_PATH_TIGHTVNC = 'vncserver'
const CMD_PATH_WEBSOCKIFY = 'websockify'
const TVNSERVER = ' .\\tvnserver.exe'
const CMD_VNC_INSTALL = TVNSERVER + ' -install -silent ';
const CMD_VNC_START = TVNSERVER + ' -start ';
const CMD_VNC_STOP = TVNSERVER + ' -stop -silent ';
const CMD_VNC_CONTROL_SET = TVNSERVER + ' -controlservice -sharedisplay 1'

module.exports = {
    DEVINSTALLER,
    CMD_ADMIN_PREFIX,
    CMD_WIN_USBMMIDD_DRIVER_INSTALL,
    CMD_WIN_USBMMIDD_DRIVER_STOP,
    CMD_WIN_USBMMIDD_DRIVER_REMOVE,
    CMD_WIN_USBMMIDD_ADD_MONITOR,
    CMD_WIN_USBMMIDD_REMOVE_MONITOR,
    CMD_PATH_VIRTUAL_SCREEN,
    CMD_PATH_TIGHTVNC,
    CMD_PATH_WEBSOCKIFY,
    CMD_VNC_INSTALL,
    CMD_VNC_START,
    CMD_VNC_STOP,
    CMD_VNC_CONTROL_SET,
}