import { ipcMain, dialog } from 'electron'; // eslint-disable-line
const Promise = require('bluebird');
const { CancellationToken } = require('electron-builder-http');
const log = require('electron-log');
const { autoUpdater } = require('electron-updater');
const defultStorageSetting = { autoCheck: true, askDownload: false, askQuitInstall: true };
function setAutoUpdater() {
  autoUpdater.autoDownload = true; // when the update is available, it will download automatically
  // if user does not install downloaded app, it will auto install when quit the app
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.allowDowngrade = false;
}

const UpdaterFactory = (function () {
  function ulog(object) {
    log.info(object.toString());
  }
  let instance = null;
  class Updater {
    constructor(window, app) {
      this.currentUpdateInfo = null; // todo in future
      this.ipcMain = ipcMain;
      this.alreadyInUpdate = false;
      this.cancellationToken = new CancellationToken();
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
        ulog('checking-for-update');
      });
      autoUpdater.on('update-available', (info) => {
        ulog(`update available ${JSON.stringify(info)}`);
        if (this.checkUpdateInfo(info)) {
          this.sendStatusToWindow(JSON.stringify(info));
        } else {
          this.sendStatusToWindow('not proper update');
        }
      });

      autoUpdater.on('update-not-available', (info) => {
        ulog(`update not available ${JSON.stringify(info)}`);
        this.alreadyInUpdate = false;
        if (this.menuallyStarted) {
          this.updateMessageHelper.notifier.updateNotAvailable();
        }
      });
      autoUpdater.on('error', (err) => {
        ulog(`update error: ${err.stack}`);
        this.alreadyInUpdate = false;
        // as the onStart or startUpdateManually will throw the error; will not handle it here
      });
      autoUpdater.on('download-progress', (progressObj) => {
        this.updateMessageHelper.notifier.updateDownloadStatus(progressObj);
      });
      autoUpdater.on('update-downloaded', () => {
        ulog('update downloaded');
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

    /*
     * for the future maybe
     * distribute update partially
     * based on version and platform to decide update or not
     */
    checkUpdateInfo(updateInfo) { // eslint-disable-line
      // todo
      this.currentUpdateInfo = '';
      updateInfo.toString();
      // compare(this.currentUpdateInfo, updateInfo);
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
    log() {
      ulog();
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
