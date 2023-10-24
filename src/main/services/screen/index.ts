import child_process from "child_process";
import {startTightVnc} from "./tvnc";
import {join} from "path";
import {createVirtualScr} from "./vscreen";
import {resource} from "@main/config/staticPath";

// 初始化本地基于noVnc的窗口转发服务
export default {
  initNoVncServer() {
    // 创建虚拟屏幕
    createVirtualScr();
    // 开启vnc服务
    startTightVnc();
    // 打开websocket 代理服务
    startWsProxyThread();
    // 测试连通性
    testSuccess();
  }
}

function startWsProxyThread() {
  const filePath = join(resource, './scripts/wsproxy.js');
  child_process.fork(filePath);
}


function testSuccess() {
  // TODO 检测vnc服务是否可用
}

