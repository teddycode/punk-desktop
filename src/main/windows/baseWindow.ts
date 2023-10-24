import {BrowserWindow} from "electron";
import MessageBoxOptions = Electron.MessageBoxOptions;

// 这是一个基础窗口类，用于创建Electron应用程序的窗口。它包含了窗口的URL、实例、宽度和高度属性。
class BaseWindow {

  public url: string;
  public instance: BrowserWindow;
  public width: number;
  public height: number;

  public defaultWarnMsg: MessageBoxOptions = {
    message: "",
    type: 'warning',
    title: "警告",
    buttons: ['确定', '退出'],
    noLink: true
  };

  public defaultErrMsg: MessageBoxOptions = {
    message: "",
    type: 'error',
    title: "错误",
    buttons: ['确定', '退出'],
    noLink: true
  };
}

export default BaseWindow;
