import {dialog} from "electron";
import {exec} from "child_process";
import {writeFileSync} from "fs";

// 打开文件选择对话框并返回选择的文件路径
export function openFile() {
  let filePaths = dialog.showOpenDialogSync({
    properties: ['openFile']
  });
  return filePaths ? filePaths[0] : null;
}

// 执行 .exe 文件或其他可执行文件
export function runExecutable(filePath: string) {
  exec(`"${filePath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`执行的错误: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });
}

export function saveFile(filePath: string, content: any) {
  writeFileSync(filePath, content, 'utf8');
}

