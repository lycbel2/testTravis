import { UpdateStrategyHelperForMain as UpdateStrategyHelper } from './UpdateHelper.js';
import { ipcMain, dialog } from 'electron'; // eslint-disable-line
import { RenderNotifier } from './UpdateMessager';
const Promise = require('bluebird');
const { CancellationToken } = require('electron-builder-http');
const log = require('electron-log');
const { autoUpdater } = require('electron-updater');
const autoUpdateString = 'autoUpdatString_random_olapxsdf#@%';

function setAutoUpdater() {
  autoUpdater.autoDownload = true; // when the update is available, it will download automatically
  // if user does not install downloaded app, it will auto install when quit the app
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.allowDowngrade = false;
}

const UpdaterFactory = (function () {
  let instance = null;
  class Updater {
    constructor(window, app) {
      this.renderNotifier = new RenderNotifier(this);
      this.updateStrategyHelper = new UpdateStrategyHelper(autoUpdateString);
      this.alreadyInUpdate = false;
      this.menuallyStarted = false;
      this.cancellationToken = new CancellationToken();
      this.hasUpdate = null;
      // check if auto updater module available
      if (!autoUpdater) {
        return null;
      }
      this.win = window;
      this.app = app;
    }
    // it should be called when the app starts
    onStart() {
      return new Promise((resolve) => {
        setAutoUpdater();
        this.updateStrategyHelper.getStrategyStorage().then(() => {
          console.log(this.updateStrategyHelper.AutoCheck);
          if (this.updateStrategyHelper.AutoCheck) {
            resolve(this.startUpdateCheck());
          } else {
            resolve('did not check update');
          }
        });
      });
    }

    // it should be called when the app closes will return a promise
    onClose() {
      this.close = true;
      return this.updateStrategyHelper.storeToLocal();
    }
    // it should be called when user check update manually
    startUpdateManually() {
      return new Promise((resolve) => {
        this.menuallyStarted = true;
        resolve(this.startUpdateCheck());
      });
    }

    // todo for now no such concern
    cancelUpdate() {
      return autoUpdater.downloadUpdate(this.cancellationToken); // return promise
    }

    startUpdateCheck() {
      return new Promise((resolve, reject) => {
        if (this.alreadyInUpdate) {
          reject(new Error('already in use'));
        }
        this.alreadyInUpdate = true;
        autoUpdater.logger = log;
        autoUpdater.logger.transports.file.level = 'info';
        log.info('update checking started');
        this.registerHandlerOfMessageFromUpdater();
        this.registerMessageHandlerForIPCMain();
        resolve(autoUpdater.checkForUpdates());
      });
    }

    sendStatusToWindow(text) {
      if (this.win) {
        try {
          this.win.webContents.send('update-message', text);
        } catch (err) {
          // means window is closed
        }
      }
    }

    registerHandlerOfMessageFromUpdater() {
      autoUpdater.on('checking-for-update', () => {
        this.sendStatusToWindow('Checking for update...');
      });
      autoUpdater.on('update-available', (info) => {
        log.info(`update available ${JSON.stringify(info)}`);
        if (this.isUpdateProper(info)) {
          this.hasUpdate = true;
          this.sendStatusToWindow(`${JSON.stringify(info)}Update available.`);
        } else {
          this.hasUpdate = false;
        }
      });
      autoUpdater.on('update-not-available', (info) => {
        log.info(`update not available ${JSON.stringify(info)}`);
        this.hasUpdate = false;
        this.alreadyInUpdate = false;
        if (this.menuallyStarted) {
          this.sendStatusToWindow('update-not-available');
        }
      });
      autoUpdater.on('error', (err) => {
        log.info(`update error: ${err.stack}`);
        this.alreadyInUpdate = false;
        this.sendStatusToWindow(`error-in-auto-updater#${err}`);
      });
      autoUpdater.on('download-progress', (progressObj) => {
        let logMessage = `download-progress#download-speed:${progressObj.bytesPerSecond}`;
        logMessage = `${logMessage}&download-percentage:${progressObj.percent}%`;
        logMessage = `${logMessage}&download-total:${progressObj.total}`;
        this.sendStatusToWindow(logMessage);
      });
      autoUpdater.on('update-downloaded', () => {
        log.info('update downloaded');
        if (!this.updateStrategyHelper.AskQuitInstall) {
          autoUpdater.quitAndInstall(true, true);
        } else {
          // todo multi language
          dialog.showMessageBox({
            type: 'question',
            buttons: ['Yes', 'No'],
            title: 'restart app now',
            message: 'Unsaved data will be lost. Are you sure you want to quit?',
          }, (response) => {
            if (response === 0) { // Runs the following if 'Yes' is clicked
              this.app.showExitPrompt = false;
              autoUpdater.quitAndInstall(true, true);
            }
          });
        }
      });
    }

    setStrategy(arg) {
      if (!arg) {
        return;
      }
      if (arg.autoCheck) {
        this.updateStrategyHelper.AutoCheck = arg.autoCheck;
      }
      if (arg.askDownload) {
        this.updateStrategyHelper.AskDownload = arg.askDownload;
      }
      if (arg.askQuitInstall) {
        this.updateStrategyHelper.AskQuitInstall = arg.askQuitInstall;
      }
    }

    registerMessageHandlerForIPCMain() { // eslint-disable-line
      ipcMain.on('cancel-update', (event, arg) => {
        console.log(arg);
        this.cancelUpdate();
      });
      ipcMain.on('update-setting', (event, arg) => { // arg {'':bool,'':bool....}
        this.setStrategy(arg);
      });
      ipcMain.on('update-manually', (event, arg) => {
        console.log(arg);
        this.startUpdateManually().then((err) => {
          if (err.toString() === 'already in use') {
            this.sendStatusToWindow('update-manually#already-in-use');
          } else {
            this.sendStatusToWindow('update-manually#other-error');
          }
        });
      });
    }

    isUpdateProper(updateInfo) { // eslint-disable-line
      // todo
      updateInfo.toString();
      return true;
    }
    set Window(win) {
      this.win = win;
    }
    get Window() {
      return this.win;
    }
  }


  return {
    ulog(object) {
      log.info(object.toString());
    },
    getInstance(win, app) {
      if (instance) {
        if (win && app) {
          instance.app = app;
          instance.win = win;
        }
        return instance;
      }
      instance = new Updater(win, app);
      return instance;
    },
  };
}());
export { UpdaterFactory as default };
