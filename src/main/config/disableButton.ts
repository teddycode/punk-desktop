import {globalShortcut} from 'electron'
import config from '@config/index'

export default {
  DisableF12() {
    if (!config.isDevMode && config.DisableF12) {
      globalShortcut.register('f12', () => {
        console.log('用户试图启动控制台')
      })
    }
  }
}



