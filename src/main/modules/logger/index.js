const log4js = require('log4js');

function initLogger() {
    log4js.configure({
        appenders: {
            fileout: {type: "file", filename: "./logs/fileout.log"},
            datafileout: {
                type: "dateFile",
                filename: "datafileout.log",
                pattern: ".yyyy-MM-dd-hh-mm-ss-SSS"
            },
            consoleout: {type: "console"},
        },
        categories: {
            default: {appenders: ["fileout", "consoleout"], level: "debug"},
            anything: {appenders: ["consoleout"], level: "debug"}
        }
    });
}

module.exports = {
    initLogger,
}