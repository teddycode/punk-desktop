// 初始化本地基于noVnc的窗口转发服务

const child_process = require("child_process");
const {createVirtualScr} = require("./vscreen");
const {startTightVnc} = require("./tvnc");
const {join} = require("path");
const {runCommand} = require("../utils");
const {startWebsockRelay} = require("./wsproxy");

function initNoVncServer() {
    let isFirst = false;
    // 创建虚拟屏幕
    createVirtualScr(isFirst);
    // 开启vnc服务
    startTightVnc(isFirst);
    // 打开websocket 代理服务
    startWsProxyThread();
    // 测试连通性
    testSuccess();
}

function startWsProxyThread() {
    child_process.fork(join(__dirname, './wsproxy.js'));
}


function testSuccess() {
    // TODO
}

module.exports = {
    initNoVncServer,
}