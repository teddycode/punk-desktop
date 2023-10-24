import * as process from "process";

export default {
  build: {
    hotPublishUrl: "",
    hotPublishConfigName: "update-config",
  },
  dev: {
    removeElectronJunk: true,
    chineseLog: false,
    port: 8080,
  },
  DisableF12: false,
  DllFolder: "libs",
  HotUpdateFolder: "update",
  resourceFolder: "resource",
  UseStartupChart: false,
  IsUseSysTitle: false,
  BuiltInServerPort: 25565,
  isDevMode: process.env.NODE_ENV === 'development'
};
