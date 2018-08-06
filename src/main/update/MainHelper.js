import { ipcMain } from 'electron' // eslint-disable-line
import Storage from './Updatestorage.js';
import { UpdaterMessage as Message, UpdateInfo } from './Message.js';
export class MainHelper {
  constructor(updater) {
    this.rendererReady = false;
    this.updater = updater;
    this.notifyWait = 200;
    this.updateInfo = null;
    this.storage = new Storage();
    this.hasNotifiedUpdateInstall = false;
    this.ipcMain = ipcMain;
  }
  onStart() {
    this.registerMessageReceiver();
    // check if installed update last round, if yes just notify renderer
    this.storage.needToNotifyUpdateInstalledOrNot().then((back) => {
      if (back) {
        this.updateInfo = back;
        this.hasNotifiedUpdateInstall = true;
        this.notifyRendererUpdateHasInstalled();
      }
    });
  }
  // will be overwrite by win
  // for mac if it downloaded the update it will install it
  onUpdateDownloaded(info) {
    return new Promise(() => {
      const infop = UpdateInfo.getFromUpdaterUpdateInfo(info);
      this.willInstallUpdateNextRound(infop);
    });
  }

  notifyRendererUpdateHasInstalled() {
    const message = new Message(Message.installedMessageLastRoundTitle, this.updateInfo);
    this.sendStatusToWindow(message.toString());
    this.storage.installedInfoHasBeenNotified();
  }
  // this is only for mac
  willInstallUpdateNextRound(info) {
    console.log('installed');
    this.storage.willInstall(info);
  }

  /* as main process will be ready before renderer it will wait
   * until renderer notify it is ready, this method is used in the place
   * where will send renderer messages
   */
  waitForRenderer() {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (this.rendererReady) {
          resolve('okay');
        } else {
          resolve(this.waitForRenderer());
        }
      }, this.notifyWait);
    });
  }
  registerMessageReceiver() {
    this.ipcMain.on('update-message', (event, arg) => {
      if (arg) {
        this.handleMessage(arg);
      }
    });
  }
  handleMessage(arg) {
    const message = Message.getFromMessage(arg);
    switch (message.title) {
      case Message.rendererReadyTitle:
        this.rendererReady = true;
        break;
      default:
        return message; // the returned message will be used by windows
    }
    return null;
  }
  sendStatusToWindow(text) {
    // wait for renderer is ready
    this.waitForRenderer().then(() => {
      if (this.updater.win) {
        try {
          console.log('sent');
          this.updater.win.webContents.send('update-message', text);
        } catch (err) {
          // means window is closed
        }
      }
    });
  }
}


export class MainHelperForWin extends MainHelper {
  constructor(updater) {
    super(updater);
    // if get downloaded message within 3s will assume this is a start install
    this.startIndicateTime = 2000;
    this.canInstall = true;
    setTimeout(() => { this.canInstall = false; }, this.startIndicateTime);
  }
  // overWrite
  // info is in updater's format
  onUpdateDownloaded(info) {
    return new Promise((resolve) => {
      if (!this.hasNotifiedUpdateInstall) {
        if (this.canInstall) {
          this.notifyRendererUpdateNeedInstall();
          this.updateInfo = UpdateInfo.getFromUpdaterUpdateInfo(info);
          resolve(true);
        } else {
          resolve(false);
        }
      }
    });
  }
  notifyRendererUpdateNeedInstall() {
    const message = new Message(Message.toInstallMessageNowTitle, this.updateInfo);
    this.sendStatusToWindow(message.toString());
  }
  getReplyAboutInstallUpdateOrNot(message) {
    if (message.body[Message.willInstallOrNotTitle]) {
      this.storage.willInstall(this.updateInfo).catch((err) => {
        console.log(err);
      });
      this.updater.quitAndInstall();
    }
  }
  handleMessage(arg) {
    const message = super.handleMessage(arg);
    if (!message) return;
    switch (message.title) {
      case Message.willInstallOrNotTitle:
        this.getReplyAboutInstallUpdateOrNot(message);
        break;
      default:
        break;
    }
  }
}

function MainHelperFactory() {
  switch (process.platform) {
    case 'win32':
      return MainHelperForWin;
    case 'darwin':
      return MainHelper;
    default:
      return MainHelper;
  }
}
const GetMainHelper = MainHelperFactory();
export default GetMainHelper;
