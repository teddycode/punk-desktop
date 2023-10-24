// 系统类型
import {join} from "path";

export const DEVINSTALLER = process.arch === 'x64' ? ' .\\deviceinstaller64.exe ' : ' .\\deviceinstaller64.exe ';

// 管理员身份运行
// const CMD_ADMIN_PREFIX = 'runas /user:Administrator ';
export const CMD_ADMIN_PREFIX = ' ';
// 安装位驱动
export const CMD_WIN_USBMMIDD_DRIVER_INSTALL = CMD_ADMIN_PREFIX + DEVINSTALLER + ' install usbmmidd.inf usbmmidd '

// 卸载驱动
export const CMD_WIN_USBMMIDD_DRIVER_STOP = CMD_ADMIN_PREFIX + DEVINSTALLER + ' stop usbmmidd '
export const CMD_WIN_USBMMIDD_DRIVER_REMOVE = CMD_ADMIN_PREFIX + DEVINSTALLER + ' remove usbmmidd '
export const CMD_WIN_USBMMIDD_ADD_MONITOR = CMD_ADMIN_PREFIX + DEVINSTALLER + '  enableidd 1 '
export const CMD_WIN_USBMMIDD_REMOVE_MONITOR = CMD_ADMIN_PREFIX + DEVINSTALLER + ' enableidd 0 '
export const CMD_PATH_VIRTUAL_SCREEN = 'vscreen';
export const CMD_PATH_TIGHTVNC = 'vncserver'
export const CMD_PATH_WEBSOCKIFY = 'websockify'
export const TVNSERVER = ' .\\tvnserver.exe'
export const CMD_VNC_INSTALL = TVNSERVER + ' -install -silent ';
export const CMD_VNC_START = TVNSERVER + ' -start ';
export const CMD_VNC_STOP = TVNSERVER + ' -stop -silent ';
export const CMD_VNC_CONTROL_SET = TVNSERVER + ' -controlservice -sharedisplay 1'

