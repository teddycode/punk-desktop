import {BrowserWindow} from "electron";
import BaseWindow from "@main/windows/baseWindow";

class SearchWindow extends BaseWindow {
  public url: string;
  public instance: BrowserWindow;

  constructor(url: string = '') {
    super();
    // TODO 设置一个空的页面
    this.url = url;
    this.width = 800;
    this.height = 600;
  }

  public create() {
    this.instance = new BrowserWindow({
      width: this.width,
      height: this.height,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: true,
      },
      show: false
    });
    this.instance.on('closed', () => {
      this.instance = null;
    });
  }

  public setContent(url: string) {
    this.url = url;
    this.instance.loadURL(this.url);
  }

  public show() {
      this.instance?.show();
  }

  public close() {
      this.instance?.close();
  }
}

export default SearchWindow;
