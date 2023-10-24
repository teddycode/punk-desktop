import Datastore from "nedb";
import path from "path";
import {app} from "electron";

let userDataPath = app.getPath("userData");

console.log('userData', userDataPath)
let db: { local: Datastore } = {local: {} as Datastore};

let config: {
  autoload: boolean,
  timestampData: boolean
} = {
  autoload: true,
  timestampData: true,
};

db.local = new Datastore({
  ...config,
  filename: path.join(userDataPath, "/local.db"),
});

export default db;
