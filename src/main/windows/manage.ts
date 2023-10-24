import config from "@config/index";
import MainWindow from "@main/windows/mainWind";
import SearchWindow from "@main/windows/searchWind";
import {loadingURL, winURL} from "@main/config/staticPath";
import LoadingWindow from "@main/windows/loadingWind";

var mainWindInstance: MainWindow = null;
var loadingWindInstane: LoadingWindow = null;
var searchWindInstance: SearchWindow = null;

export default {
  createWindows() {
    mainWindInstance = new MainWindow(winURL);
    searchWindInstance = new SearchWindow(null);
    if (config.UseStartupChart) {
      loadingWindInstane = new LoadingWindow(loadingURL);
      loadingWindInstane.create();
      loadingWindInstane.show();
      setTimeout(() => {
        console.log("Loading finished!")
        loadingWindInstane.close();
        mainWindInstance.create();
        mainWindInstance.show();
      }, 1500)
    } else {
      mainWindInstance.create();
      mainWindInstance.show();
    }
  }
}

export {
  mainWindInstance,
  loadingWindInstane,
  searchWindInstance,
} ;
