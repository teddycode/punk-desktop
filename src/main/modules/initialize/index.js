const {initDBTables} = require('../database');
const {initLogger} = require('../logger')
const {initNoVncServer} = require("../scrproxy");

//  初始化任务
function runInitTasks() {
    // 日志模块初始化
    initLogger();
    // 数据表初始化
    initDBTables();
    // 虚拟显示器服务
    initNoVncServer();
    // 初始化应用程序列表
    initLocalAppList();
}

// 初始化应用程序列表
function initLocalAppList() {

}


module.exports = {
    runInitTasks
}

