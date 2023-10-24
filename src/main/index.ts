'use strict'

import {app, session} from 'electron'
import DisableButton from './config/disableButton'
import config from '@config/index'
import windManager from "@main/windows/manage";
import services from "./services/index"

const installDevtool = () => {
  const {VUEJS3_DEVTOOLS} = require("electron-devtools-vendor");
  session.defaultSession.loadExtension(VUEJS3_DEVTOOLS, {
    allowFileAccess: true,
  });
  console.log('已安装: vue-devtools')
}

const onAppReadyInit = (): void => {
  // 初始化各个服务
  services.initialize();
  // 初始化窗口设置
  windManager.createWindows();
  // 禁用按键服务
  DisableButton.DisableF12()
  if (config.isDevMode) {
    installDevtool();
  }
}

app.whenReady().then(onAppReadyInit)
// 由于9.x版本问题，需要加入该配置关闭跨域问题
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors')

app.on('window-all-closed', () => {
  // 所有平台均为所有窗口关闭就退出软件
  app.quit()
})
app.on('browser-window-created', () => {
  console.log('window-created')
})

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.removeAsDefaultProtocolClient('electron-vue-template')
    console.log('由于框架特殊性开发环境下无法使用')
  }
} else {
  app.setAsDefaultProtocolClient('electron-vue-template')
}
