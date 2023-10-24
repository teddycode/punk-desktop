import {BrowserWindow} from "electron";
import BaseWindow from "./baseWindow";
import {getPreloadFile} from "@main/config/staticPath";

class LoadingWindow extends BaseWindow {
  constructor(url: string) {
    super()
    this.url = url;
    this.width = 400;
    this.height = 600;
  }

  public create() {
    this.instance = new BrowserWindow({
      width: this.width,
      height: this.height,
      frame: false,
      skipTaskbar: true,
      transparent: true,
      resizable: false,
      webPreferences: {
        experimentalFeatures: true,
        preload: getPreloadFile("preload")
      }
    })

    this.instance.loadURL(this.url)
    this.instance.setAlwaysOnTop(true)
  }

  public show() {
    if (this.instance)
      this.instance.show();
  }

  public close() {
    if (this.instance)
      this.instance.close();
  }

}

export default LoadingWindow;

