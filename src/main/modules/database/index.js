const sqlite3 = require('sqlite3')
const path = require('path')
const {app} = require('electron')

let DB_PATH = path.join(app.getPath("userData"), '/data.db');

console.log('连接数据库路径：', app.getPath("userData"));
console.log('连接数据库路径：', DB_PATH);

//连接数据库
function connectDatabase() {
    return new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            console.error('连接数据库错误：' + err.message);
        }
        console.log('连接数据库成功')
    });
}

const db = connectDatabase();

//创建数据库,如果用户本地没有数据库的话就创建否则跳过
function initDBTables() {
    // 创建应用信息表
    try {
        db.serialize(function () {
            db.run('CREATE TABLE IF NOT EXISTS app_info (\n' +
                '    id INTEGER PRIMARY KEY AUTOINCREMENT,\n' +
                '    name TEXT NOT NULL,\n' +
                '    cmd TEXT,\n' +
                '    icon TEXT,\n' +
                '    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,\n' +
                '    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP\n' +
                ');');
        });
    }catch (e){
        console.log("error：",e);
    }
}

exports.connectDatabase = connectDatabase;
exports.initDBTables = initDBTables;
exports.db = db;