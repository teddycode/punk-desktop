const { WindowManager } = require(__dirname + '/src/main/windowManager.js');

app.whenReady().then(() => {
  global.windowManager = new WindowManager({});
  windowManager.init();
});
