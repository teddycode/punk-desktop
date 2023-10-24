import {exec, execSync} from 'child_process';
import {join} from "path";
import iconv from 'iconv-lite';

const encoding = 'cp936';
const binaryEncoding = 'binary';

// asset路径
const ASSETS_PATH = join(__dirname, '../../assets/')

function convertToZhCN(data) {
  return iconv.decode(Buffer.from(data, binaryEncoding), encoding)
}

// 异步运行cmd命令
export function runCommand(command, cwd, callback) {
  exec(command, {cwd: cwd}, (error, stdout, stderr) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, stdout);
    }
  });
}

// 同步运行cmd命令
export function runCommandSync(command, cwd) {
  let dir = join(ASSETS_PATH, cwd);
  // l(dir);
  try {
    const output = execSync(command, {cwd: dir, encoding: binaryEncoding});
    // log.info(convertToZhCN(output.toString()));
    return output.toString();
  } catch (error) {
    // log.error("cmd fail: ", convertToZhCN(error.toString()))
    return null;
  }
}
