import { RenderMessageHelper } from './UpdateMessagerHelper';
const autoUpdateString = 'autoUpdatString_random_olapxsdf#@%';
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
    if (content == null || content === 'null') {
      return;
    }
    this.updateStrategy = JSON.parse(content);
  }
  get IsUndefined() {
    return this.updateStrategy == null;
  }
  get AutoCheck() {
    return (this.IsUndefined ? null : this.updateStrategy.autoCheck);
  }
  get AskDownload() {
    return (this.IsUndefined ? null : this.updateStrategy.askDownload);
  }
  get AskQuitInstall() {
    return (this.IsUndefined ? null : this.updateStrategy.askQuitInstall);
  }

  set AutoCheck(bool) {
    if (!this.IsUndefined) {
      this.updateStrategy.autoCheck = bool;
    }
  }
  set AskDownload(bool) {
    if (!this.IsUndefined) {
      this.updateStrategy.askDownload = bool;
    }
  }
  set AskQuitInstall(bool) {
    if (!this.IsUndefined) {
      this.updateStrategy.askQuitInstall = bool;
    }
  }
}


export class UpdateStrategyHelperForMain extends UpdaterStrategy {
  constructor(updater) {
    super();
    this.updater = updater;
  }
  getStrategyStorage() {
    return new Promise((resolve, reject) => {
      storage.get(autoUpdateString, (err, data) => {
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
  setStrategy(arg) {
    return new Promise((resolve) => {
      super.setStrategy(arg);
      resolve(this.storeToLocal());
    });
  }

  storeToLocal() {
    return storage.setAsync(autoUpdateString, JSON.stringify(this.updateStrategy));
  }
}


export class UpdaterInRender extends UpdaterStrategy {
  constructor(IpcRender, vueObject) {
    super();
    this.ipcrender = IpcRender;
    this.vueObject = vueObject;
    this.updateMessageHelper = new RenderMessageHelper(this); // need check lyc
  }

  /*
   * ask will be called in the render process
   */
  askStrategy() {
    this.updateMessageHelper.notifier.askStrategy();
  }

  askSetStrategy() {
    this.updateMessageHelper.notifier.setStrategy();
  }

  askCancelUpdate() {
    this.updateMessageHelper.notifier.cancelUpdate();
  }

  askStartManuallyUpdate() {
    this.updateMessageHelper.notifier.startManuallyUpdateCheck();
  }

  /*
   * on will be called by the event listener in messageHelper
   * for the vue object control only need to manipulate this part
   */
  onNotAvailable() {

  }

  onAvailable(updateInfo) {

  }

  onCancelUpdateSuccess() {

  }

  onCancelUpdateUnsuccessful(error) {

  }

  onDownloaded() {

  }

  onGotStrategyString(strategyString) {
    this.fromString(strategyString);
  }

  onGotProcessStatusString(statusString) {

  }

  onAlreadyInUpdate(){

  }

  onManuallyUpdateOtherError(){

  }
}
