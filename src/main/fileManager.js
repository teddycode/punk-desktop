// fileManager.js

const { dialog } = require('electron');
const { exec } = require('child_process');
const {writeFileSync} = require("fs");

// 打开文件选择对话框并返回选择的文件路径
function openFile() {
    let filePaths = dialog.showOpenDialogSync({
        properties: ['openFile']
    });
    return filePaths ? filePaths[0] : null;
}

// 执行 .exe 文件或其他可执行文件
function runExecutable(filePath) {
    exec(`"${filePath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`执行的错误: ${error}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
    });
}

function saveFile(filePath, content) {
    writeFileSync(filePath, content, 'utf8');
}

module.exports = {
    openFile,
    runExecutable,
    saveFile
};
