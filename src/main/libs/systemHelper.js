const path = require('path')
const fs = require('fs-extra')
const {app} = require('electron')
const {exec} = require('child_process')
const iconv = require('iconv-lite')
const os = require('os')

function getResPath() {
    const isDevelopmentMode = process.argv.some(arg => arg === '--development-mode')
    if (isDevelopmentMode) {
        return __dirname + `/../../../res`
    } else {
        return path.dirname(__dirname) + `/../../../res`
    }
}

/**
 * 获取到res目录，并拼接
 * @param paths
 */
function getResPathJoin(...paths) {
    return path.join(getResPath(), ...paths)
}

/**
 * 执行一个cmd命令
 * @param cmdStr
 * @param cmdPath
 */
async function runExec(cmdStr, cmdPath) {
    let promise = new Promise((resolve, reject) => {
        // 执行命令行，如果命令不需要路径，或就是项目根目录，则不需要cwd参数：
        let workerProcess = exec(cmdStr, {cwd: cmdPath, encoding: 'buffer'})
        // 不受child_process默认的缓冲区大小的使用方法，没参数也要写上{}：workerProcess = exec(cmdStr, {})

        // 打印正常的后台可执行程序输出
        workerProcess.stdout.on('data', function (data) {
            console.log('stdout: ' + iconv.decode(Buffer.from(data, 'binary'), 'GBK'))
            resolve(iconv.decode(Buffer.from(data, 'binary'), 'GBK'))
        })
//退出之后的输出
        workerProcess.on('close', function (code) {
            resolve(code)
            console.log('out code：' + code)
        })

        // 打印错误的后台可执行程序输出
        workerProcess.stderr.on('data', function (data) {
            console.log('stderr: ' + iconv.decode(Buffer.from(data, 'binary'), 'GBK'))
            reject(iconv.decode(Buffer.from(data, 'binary'), 'GBK'))
        })
    })
    return promise

}

module.exports = class SystemHelper {
    /**
     * 获取桌面上的图标
     * @returns {Promise<*[]>}
     */
    static async getDeskFiles(withIcon = true) {

        let apps = []

        function getDesktopFiles(_dir) {
            const fs = require('fs')
            var filepaths = []
            //read directory
            let files = fs.readdirSync(_dir)
            console.info("files:", files);
            files.forEach(_file => {
                let _p = _dir + '/' + _file
                //changes slashing for file paths
                let _path = _p.replace(/\\\\/g, '/')
                let name = path.parse(_path).name
                if (_path.endsWith('.lnk')) {  // 屏蔽其他文件
                    try {
                        _path = require('electron').shell.readShortcutLink(_path).target
                    } catch (e) {
                        console.warn('存在失败的图标：', _path)
                        _path = '/icons/winapp.png'
                    }
                    filepaths.push({
                        name: name,
                        path: _path,
                        ext: path.parse(_path).ext
                    })
                }
            })
            return filepaths
        }


        let filepaths = getDesktopFiles(app.getPath('desktop'))
        if (os.platform() === 'win32') { // 公共用户的应用图标
            try {
                let publicDesktop = app.getPath('desktop').replace(os.userInfo().username, 'public')
                let publicFilepaths = getDesktopFiles(publicDesktop)
                filepaths = Array.from(
                    filepaths.concat(publicFilepaths).reduce((map, obj) => map.set(obj.name, obj), new Map()).values()
                )
            } catch (e) {
                console.warn("获取公共桌面图标错误：", e)
            }
        }

        for (let file of filepaths) {
            try {
                let icon = ''
                if (withIcon) {
                    icon = await SystemHelper.extractFileIcon(file.path)
                    apps.push({
                        name: file.name,
                        ext: file.ext,
                        path: file.path,
                        icon: icon
                    })
                } else {
                    apps.push({
                        name: file.name,
                        ext: file.ext,
                        path: file.path,
                        icon: ''
                    })
                }
            } catch (e) {
                console.warn('存在导入失败的', e, file)
            }
        }
        return apps
    }

    // 保存图标到用户数据
    static async extractFileIcon(uri) {
        let savePath = path.join(app.getPath('userData'), 'icons')
        fs.ensureDirSync(savePath)
        let hash = SystemHelper.sha(uri)
        let filePath = path.join(savePath, hash + '.png')
        if (fs.existsSync(filePath)) {
            return filePath
        }
        let error = false
        if (os.platform() === 'win32') {
            try {
                // let icon = fileIcon.getFileIcon(uri,256)  //await require('electron').app.getFileIcon(uri)
                const exePath = getResPathJoin('extracticon.exe')
                const cmd = `"${exePath}" "${uri}" "${filePath}"`
                console.log(cmd, '输出的cmd')
                await runExec(cmd)
            } catch (e) {
                console.error('意外报错', e)
                error = true
            }
        }

        if (!fs.existsSync(filePath) || error) {
            let icon = await app.getFileIcon(uri)
            if (!icon) {
                return ''
            }
            fs.writeFileSync(filePath, icon.toPNG())
        }
        return filePath
    }

    static sha(text) {
        const crypto = require('crypto')
        const sha = crypto.createHash('sha1')
        sha.update(text)
        return sha.digest('hex')
    }
}
