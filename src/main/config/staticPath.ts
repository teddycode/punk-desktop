// 这里定义了静态文件路径的位置
import {join} from 'path'
import config from '@config/index'
import {app} from 'electron'
import * as process from "process";

function joinAppPath(...subPath: string[]) {
  return join(app.getAppPath(), ...subPath);
}

function getAppRootPath(path: string) {
  return config.isDevMode ? join(__dirname, '..', '..', '..', path).replace(/\\/g, '\\\\')
    : join(__dirname, '..', '..', '..', '..', path).replace(/\\/g, '\\\\')
}

const filePath = {
  winURL: {
    development: `http://localhost:${process.env.PORT}`,
    production: `file://${joinAppPath("dist", "electron", 'renderer', 'index.html')}`
  },
  loadingURL: {
    development: `http://localhost:${process.env.PORT}/loader.html`,
    production: `file://${joinAppPath("dist", "electron", 'renderer', 'loader.html')}`
  },
  getPreloadFile(fileName: string) {
    return config.isDevMode ? joinAppPath(`${fileName}.js`)
      : joinAppPath("dist", "electron", "main", `${fileName}.js`);
  }
}

if (!config.isDevMode) process.env.__static = joinAppPath("dist", "electron", 'renderer').replace(/\\/g, '\\\\');


process.env.__lib = getAppRootPath(config.DllFolder)
process.env.__updateFolder = getAppRootPath(config.HotUpdateFolder)
process.env.__resourceFolder = getAppRootPath(config.resourceFolder)

export const winURL = filePath.winURL[process.env.NODE_ENV]
export const loadingURL = filePath.loadingURL[process.env.NODE_ENV]
export const lib = process.env.__lib
export const resource = process.env.__resourceFolder
export const updateFolder = process.env.__updateFolder
export const getPreloadFile = filePath.getPreloadFile
