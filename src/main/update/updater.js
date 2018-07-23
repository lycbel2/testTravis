import { ipcMain, dialog } from 'electron'; // eslint-disable-line
const Promise = require('bluebird');
const log = require('electron-log');
const { autoUpdater } = require('electron-updater');
function setAutoUpdater() {
  autoUpdater.autoDownload = true; // when the update is available, it will download automatically
  // if user does not install downloaded app, it will auto install when quit the app
  autoUpdater.autoInstallOnAppQuit = false;
  autoUpdater.allowDowngrade = false;
}

const UpdaterFactory = (function () {
  let instance = null;
  class Updater {
    constructor(window, app) {
      this.currentUpdateInfo = null; // todo in future
      this.alreadyInUpdate = false;
      // check if auto updater module available
      if (!autoUpdater) {
        return null;
      }
      this.win = window;
      this.app = app;
    }
    // it should be called when the app starts
    onStart() {
      return new Promise((resolve, reject) => {
        if (this.alreadyInUpdate) {
          this.ulog('already');
          reject(new Error('alreadyInUpdate'));
        } else {
          this.alreadyInUpdate = true;
          setAutoUpdater();
          this.startUpdate().then((message) => {
            this.alreadyInUpdate = false;
            resolve(message);
          });
        }
      });
    }

    startUpdate() {
      return new Promise((resolve) => {
        autoUpdater.logger = log;
        autoUpdater.logger.transports.file.level = 'info';
        this.ulog('update checking started');
        this.doUpdate().catch(() => { resolve('updateUnsuccessful'); }).then((info) => { resolve(info); });
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

    doUpdate() {
      return new Promise((resolve, reject) => {
        const handleRejection = (err) => {
          this.ulog(err);
          reject(err);
        };
        autoUpdater.on('checking-for-update', () => {
          this.ulog('checking-for-update');
        });
        autoUpdater.on('update-available', (info) => {
          this.ulog(`update available ${JSON.stringify(info)}`);
          if (this.checkUpdateInfo(info)) {
            autoUpdater.downloadUpdate().catch(handleRejection);
          } else {
            this.ulog('not proper update');
            resolve('updateNotAvailable');
          }
        });

        autoUpdater.on('update-not-available', (info) => {
          resolve('updateNotAvailable');
          this.ulog(`update not available ${JSON.stringify(info)}`);
        });
        autoUpdater.on('error', (err) => {
          console.log(err);
          this.ulog(`update error: ${err.stack}\n `);
        });
        autoUpdater.on('download-progress', (progressObj) => {
          let logMessage = `Download speed: ${progressObj.bytesPerSecond}`;
          logMessage = `${logMessage} - Downloaded ${progressObj.percent}%`;
          logMessage = `${logMessage} (${progressObj.transferred}/${progressObj.total})`;
          this.sendStatusToWindow(logMessage);
        });
        autoUpdater.on('update-downloaded', () => {
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
              resolve('restart');
            } else {
              resolve('wait');
            }
          });
        });
        autoUpdater.checkForUpdates().catch();
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
    ulog(object) {
      this.sendStatusToWindow(object.toString());
      log.info(object.toString());
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
