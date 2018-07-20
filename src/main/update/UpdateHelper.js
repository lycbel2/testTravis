const Promise = require('bluebird');
const storage = require('electron-json-storage');
Promise.promisifyAll(storage);
const defultStorageSetting = { autoCheck: true, askDownload: false, askQuitInstall: true };
function isUndefined(object) {
  return typeof object !== 'undefined';
}

export class UpdaterStrategy {
  constructor() {
    this.updateStrategy = null;
  }

  setStrategy(arg) {
    if (!arg) {
      return;
    }
    if (arg.autoCheck) {
      this.AutoCheck = arg.autoCheck;
    }
    if (arg.askDownload) {
      this.AskDownload = arg.askDownload;
    }
    if (arg.askQuitInstall) {
      this.AskQuitInstall = arg.askQuitInstall;
    }
  }
  toString() {
    return (`${JSON.stringify(this.updateStrategy)}`);
  }
  fromString(content) {
    this.updateStrategy = JSON.parse(content);
  }
  get IsUndefined() {
    return this.updateStrategy == null;
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
}


export class UpdateStrategyHelperForMain extends UpdaterStrategy {
  constructor(updaterStrategyString) {
    super();
    this.uss = updaterStrategyString;
    // in format {'autoCheck':bool,'askDownload':bool,'askQuitInstall':bool} default true,false,true
    this.updateStrategy = null;
  }
  getStrategyStorage() {
    return new Promise((resolve, reject) => {
      console.log('u suck');
      storage.get(this.uss, (err, data) => {
        if (err) {
          // todo when err maybe need a temp setting
          reject(err);
        } else if (isUndefined(data) || data == null) {
          console.log('lyc kyc');
          this.updateStrategy = defultStorageSetting;
          resolve();
        } else {
          this.updateStrategy = this.fromString(data);
          console.log('lyc kyc');
          resolve();
        }
      });
    });
  }


  storeToLocal() {
    return storage.setAsync(this.uss, JSON.stringify(this.updateStrategy));
  }
}
