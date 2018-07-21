
/*
   * for the communication between render and main process within
   */

class RenderNotifier {
  constructor(messageHelper) {
    this.updater = messageHelper.updater;
  }

  updateAvailable(updateInfo) {
    this.updater.sendStatusToWindow(`AVB#${updateInfo}`);
  }

  updateNotAvailable() {
    this.updater.sendStatusToWindow('notAVB');
  }

  updateDownloaded() {
    this.updater.sendStatusToWindow('downloaded');
  }

  alreadyInUpdate() {
    this.updater.sendStatusToWindow('alreadyInUpdate');
  }

  manuallyUpdateOtherError() {
    this.updater.sendStatusToWindow('MupOtherErr');
  }

  updateDownloadStatus(progressObj) {
    let logMessage = `status#download-speed:${progressObj.bytesPerSecond}`;
    logMessage = `${logMessage}&download-percentage:${progressObj.percent}%`;
    logMessage = `${logMessage}&download-total:${progressObj.total}`;
    this.updater.sendStatusToWindow(`updateStatus#${logMessage}`);
  }

  sendUpdateStrategy(strategy) {
    this.updater.sendStatusToWindow(`updateStrategy#${strategy}`);
  }

  updateCancelled() {
    this.updater.sendStatusToWindow('updateCancelledSuccessfully');
  }

  updateCancelledUnSuccesfully(error) {
    this.updater.sendStatusToWindow(`updateCancelledUnsuccessfully#${error}`);
  }

  // for test lyc.1
  testStart() {
    this.updater.sendStatusToWindow('test');
  }
}

class RenderMessageReceiver {
  constructor(parent) {
    this.updater = parent.updater;
    this.notifier = parent.notifier;
  }

  receive(message) {
    const messageArray = message.split('#');
    switch (message) {
      // for test lyc.1
      case 'start-test':
        this.notifier.testStart();
        break;
      // end test lyc.1
      case 'cancel-update':
        this.updater.cancelUpdate();
        break;
      case 'ask-setting':
        this.notifier.sendUpdateStrategy(this.updater.updateStrategyHelper.toString());
        break;
      case 'update-manually':
        this.updater.startUpdateManually().then((err) => {
          if (err.toString() === 'already in use') {
            this.notifier.alreadyInUpdate();
          } else {
            this.notifier.manuallyUpdateOtherError();
          }
        });
        break;
      default:
        switch (messageArray[0]) {
          case 'set-update':
            this.updater.updateStrategyHelper.setStrategy(message.substring(11));
            break;
          default:
        }
    }
  }
}

export class UpdaterMessageHelper {
  constructor(updater) {
    this.updater = updater;
    this.ipcMain = updater.ipcMain;
    this.registerMessageHandlerForIPCMain();
    this.notifier = new RenderNotifier(this);
    this.receiver = new RenderMessageReceiver(this);
  }

  registerMessageHandlerForIPCMain() {
    this.ipcMain.on('update-message', (event, arg) => {
      this.receiver.receive(arg);
    });
  }
}

class UpdaterMessageReceiver {
  constructor(updaterInRender) {
    this.updater = updaterInRender;
    this.notifier = this.updaterInRender.notifier; // sometimes need to send message
  }

  receive(message) {
    const messageArray = message.split('#');
    let error;
    switch (message) {
      // for test lyc.1
      case 'test':
        break;
      // end test lyc.1
      case 'notAVB':
        this.updater.onNotAvailable();
        break;
      case 'downloaded':
        this.updater.onDownloaded();
        break;
      case 'alreadyInUpdate':
        this.updater.onAlreadyInUpdate();
        break;
      case 'MupOtherErr':
        this.updater.onManuallyUpdateOtherError();
        break;
      case 'updateCancelledSuccessfully':
        this.updater.onCancelUpdateSuccess();
        break;
      default:
        switch (messageArray[0]) {
          case 'AVB':
            this.updater.onAvailable(message.substring(4));
            break;
          case 'updateStatus':
            // todo
            this.updater.onGotProcessStatusString(message.substring(13));
            break;
          case 'updateStrategy':
            this.updater.onGotStrategyString(message.substring(15));
            break;
          case 'updateCancelledUnsuccessfully':
            error = message.substring('updateCancelledUnsuccessfully'.length + 1);
            this.updater.onCancelUpdateUnsuccessful(error);
            break;
          default:
            break;
        }
    }
  }
}


class UpdaterNotifier {
  constructor(messageHelper) {
    this.helper = messageHelper;
  }
  // for test lyc.1
  doTest() {
    this.helper.sendMessage('start-test');
  }
  askStrategy() {
    this.helper.sendMessage('ask-setting');
  }
  cancelUpdate() {
    this.helper.send('cancel-update');
  }
  startManuallyUpdateCheck() {
    this.helper.send('update-manually');
  }
  setStrategy() {
    this.helper.send(`set-update#${this.helper.Strategy}`);
  }
}

export class RenderMessageHelper {
  constructor(renderHelper) {
    this.renderHelper = renderHelper;
    this.ipcrender = this.renderHelper.ipcrender;
    this.notifier = new UpdaterNotifier(this);
    this.receiver = new UpdaterMessageReceiver(this);
    this.registerMessageListener();
  }
  sendMessage(message) {
    this.ipcrender.send('update-message', message);
  }
  registerMessageListener() {
    this.ipcrender.on('update-message', (event, arg) => {
      this.receiver.receive(arg);
    });
  }

  get Strategy() {
    return this.renderHelper.toString();
  }

  set Strategy(strategyString) {
    this.renderHelper.fromString(strategyString);
  }
}

