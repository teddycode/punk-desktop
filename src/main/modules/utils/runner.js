const {exec, execSync} = require('child_process');
const {join} = require("path");
const iconv = require('iconv-lite');

const log = require("log4js").getLogger();

const encoding = 'cp936';
const binaryEncoding = 'binary';

// asset路径
const ASSETS_PATH = join(__dirname, '../../assets/')

function convertToZhCN(data) {
    return iconv.decode(Buffer.from(data, binaryEncoding), encoding)
}

module.exports = {
    // 异步运行cmd命令
    runCommand: function (command, cwd, callback) {
        exec(command, {cwd: cwd}, (error, stdout, stderr) => {
            if (error) {
                callback(error, null);
            } else {
                callback(null, stdout);
            }
        });
    },

    // 同步运行cmd命令
    runCommandSync: function (command, cwd) {
        let dir = join(ASSETS_PATH, cwd);
        log.debug(dir);
        try {
            const output = execSync(command, {cwd: dir, encoding: binaryEncoding});
            log.info(convertToZhCN(output.toString()));
            return output.toString();
        } catch (error) {
            log.error("cmd fail: ", convertToZhCN(error.toString()))
            return null;
        }
    }
};