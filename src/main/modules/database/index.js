import Datastore from "nedb";
import path from "path";
import { app } from "electron";

// console.log('userData', remote.app.getPath('userData'))
let db = {};
let config = {
    autoload: true,
    timestampData: true,
};
let userDataPath = app.getPath("userData");

db.local = new Datastore({
    ...config,
    filename: path.join(userDataPath, "/local.db"),
});

export default db;
