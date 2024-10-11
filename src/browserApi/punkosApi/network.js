const { execFile } = require('child_process')
const path = require('path');
let serverProcess;
const network = {
  runServer(){
    const exePath = path.join(__dirname, 'res/wg_server.exe');
    serverProcess = execFile(exePath, (error, stdout, stderr) => {
      if (error) {
        console.error(`执行错误: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    });
    console.log("wg_server已运行:",serverProcess)
  },
  stopServer(){
    if(serverProcess){
      serverProcess.kill();
      console.log("wg_server已终止")
    }
  }
}
module.exports = network;
