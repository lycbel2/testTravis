import { dialog } from 'electron'; // eslint-disable-line
const Promise = require('bluebird');
const log = require('electron-log');
const { autoUpdater } = require('electron-updater');
function setAutoUpdater() {
  autoUpdater.autoDownload = false; // when the update is available, it will download automatically
  // if user does not install downloaded app, it will auto install when quit the app
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.allowDowngrade = false;
}

const UpdaterFactory = (function () {
  let instance = null;
  class Updater {
    constructor(window, app) {
      console.log('update one one one lls');
      this.currentUpdateInfo = null; // todo in future
      this.alreadyInUpdate = false;
      // check if auto updater module available
      if (!autoUpdater) {
        return null;
      }
      autoUpdater.logger = log;
      autoUpdater.logger.transports.file.level = 'info';
      this.win = window;
      this.app = app;
    }
    // it should be called when the app starts
    onStart() {
      return new Promise((resolve) => {
        this.startUpdate().then((message) => {
          if (message === 'Err:Connect Error') {
            setTimeout(() => { resolve(this.onStart()); }, 300000); // 5min check for once
          } else {
            resolve(message);
          }
        });
      });
    }

    startUpdate() {
      return new Promise((resolve) => {
        const handelResolve = (message) => {
          this.alreadyInUpdate = false;
          resolve(message);
        };
        if (this.alreadyInUpdate) {
          this.ulog('already');
          handelResolve('Err:alreadyInUpdate');
        } else {
          this.alreadyInUpdate = true;
          setAutoUpdater();
          this.ulog('update checking started');
          this.doUpdate().catch((err) => {
            switch (err.toString()) {
              case 'Error: net::ERR_INTERNET_DISCONNECTED':
                handelResolve('Err:Connect Error');
                break;
              case 'Error: net::ERR_NETWORK_CHANGED':
                handelResolve('Err:Connect Error');
                break;
              case 'Error: net::ERR_CONNECTION_RESET':
                handelResolve('Err:Connect Error');
                break;
              default:
                handelResolve('Err:updateUnsuccessful');
                break;
            }
          }).then((info) => {
            handelResolve(info);
          });
        }
      });
    }


    doUpdate() {
      return new Promise((resolve, reject) => {
        const handleRejection = (err) => {
          this.ulog(`update error at rejection: ${err.stack}\n `);
          autoUpdater.removeAllListeners();
          reject(err);
        };
        const handleResolve = (message) => {
          this.ulog(message);
          autoUpdater.removeAllListeners();
          resolve(message);
        };
        autoUpdater.on('checking-for-update', () => {
          this.ulog('checking-for-update');
        });
        process.on('uncaughtException', handleRejection);
        autoUpdater.on('update-available', (info) => {
          this.ulog(`update available ${JSON.stringify(info)}`);
          if (this.checkUpdateInfo(info)) {
            autoUpdater.downloadUpdate().catch(handleRejection);
          } else {
            handleResolve('updateNotAvailable');
          }
        });

        autoUpdater.on('update-not-available', () => {
          handleResolve('updateNotAvailable');
        });
        autoUpdater.on('error', (err) => {
          console.log(`error at listener${err}`);
          this.ulog(`update error at listener: ${err.stack}\n `);
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
              handleResolve('restart');
            } else {
              handleResolve('wait');
            }
          });
        });
        autoUpdater.checkForUpdates().catch(handleRejection);
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
