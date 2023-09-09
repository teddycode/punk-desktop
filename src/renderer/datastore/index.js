import Datastore from "nedb";
import path from "path";
import {app} from "electron";

console.log('数据存储目录：userData', app.getPath('userData'))
let db = {};
let config = {
    autoload: true,
    timestampData: true,
};
let userDataPath = app.getPath("userData");
// 存储用户信息
db.users = new Datastore({
    ...config,
    filename: path.join(userDataPath, "/user.db"),
});
// 存储应用信息
db.apps = new Datastore({
    ...config,
    filename: path.join(userDataPath, "/apps.db"),
});

export default db;
