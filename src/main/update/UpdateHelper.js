const Promise = require('bluebird');
const storage = require('electron-json-storage');
Promise.promisifyAll(storage);
const defultStorageSetting = { autoCheck: true, askDownload: false, askQuitInstall: true };
function isUndefined(object) {
  return typeof object !== 'undefined';
}

export default class UpdateStrategyHelper {
  constructor(updaterStrategyString) {
    this.uss = updaterStrategyString;
    // in format {'autoCheck':bool,'askDownload':bool,'askQuitInstall':bool} default true,false,true
    this.updateStrategy = null;
  }
  get AutoCheck() {
    return this.updateStrategy.autoCheck;
  }
  get AskDownload() {
    return this.updateStrategy.askDownload;
  }
  get AskQuitInstall() {
    return this.updateStrategy.askQuitInstall;
  }

  set AutoCheck(bool) {
    this.updateStrategy.autoCheck = bool;
  }
  set AskDownload(bool) {
    this.updateStrategy.askDownload = bool;
  }
  set AskQuitInstall(bool) {
    this.updateStrategy.askQuitInstall = bool;
  }

  getStrategyStorage() {
    const backOb = this;
    return new Promise((resolve, reject) => {
      storage.get(this.uss, (err, data) => {
        if (err) {
          const logMessage = `Download speed: ${this.uss}`;
          console.log(logMessage);
          // todo when err maybe need a temp setting
          reject(err);
        } else if (isUndefined(data) || data == null) {
          backOb.updateStrategy = defultStorageSetting;
          resolve();
        } else {
          backOb.updateStrategy = UpdateStrategyHelper.getStrategyFromString(data);
          resolve();
        }
      });
    });
  }

  static getStrategyFromString(strategyString) {
    return JSON.parse(strategyString);
  }
  storeToLocal() {
    return storage.setAsync(this.uss, JSON.stringify(this.updateStrategy));
  }
}

