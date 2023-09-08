const {exec, execSync} = require('child_process');

/* TODO 用户从windows注册表获取App可执行文件的路径 */
function getAppExecutablePath(appName) {
    // 根据应用名称使用wmic命令获取应用信息
    const command = `.\scripts\launchApp.bat`;
    const output = execSync(command).toString();

    if (output === 'empty') {
        return null;
    }
    return output;
}

// console.log(getAppExecutablePath("word"))
function runAppByName(path, cmd) {
    // console.log("ready to launch: ",path,cmd)
    // TODO search app lnk by it's name
    exec(cmd, {cwd: path}, (error, stdout, stderr) => {
        if (error) {
            console.error(`执行命令出错: ${error}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
    });
}

module.exports = {
    runAppByName,
}