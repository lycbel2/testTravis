import Promise from 'bluebird';
import storage from 'electron-json-storage';
import { UpdateInfo } from './Message.js';
Promise.promisifyAll(storage);
const updateInstalledString = 'updateInstalled#loloxdnkd';


export default class Storage {
  constructor() {
    this.storage = storage;
  }
  willInstall(info) {
    return new Promise((resolve) => {
      console.log(info.toString());
      resolve(this.storage.setAsync(updateInstalledString, info.toString()));
    });
  }

  installedInfoHasBeenNotified() {
    return new Promise((resolve) => {
      resolve(this.storage.setAsync(updateInstalledString, null));
    });
  }

  needToNotifyUpdateInstalledOrNot() {
    return new Promise((resolve) => {
      this.storage.getAsync(updateInstalledString).then((data) => {
        console.log(JSON.stringify(data));
        if (data && Object.keys(data).length !== 0) {
          resolve(UpdateInfo.getFromStorageString(data));
        } else {
          resolve(null);
        }
      });
    });
  }
}
