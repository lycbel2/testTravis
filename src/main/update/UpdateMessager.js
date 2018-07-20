
/*
   * for the communication between render and main process within
   */

export class RenderNotifier {
  constructor(messageHelper) {
    this.updater = messageHelper.updater;
  }

  updateAvailable() {
    this.updater.sendStatusToWindow('AVB');
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
  constructor(renderMessageHelper) {
    this.helper = renderMessageHelper;
    this.render = this.helper.render;
    this.notifier = this.helper.notifier;
    this.vueObject = this.helper.vueObject;
  }

  receive(message) {
    const messageArray = message.split('#');
    switch (message) {
      // for test lyc.1
      case 'test':
        this.vueObject.changeHello(555);
        break;
      // end test lyc.1
      case 'AVB':
        break;
      case 'notAVB':
        break;
      case 'downloaded':
        break;
      case 'alreadyInUpdate':
        break;
      case 'MupOtherErr':
        break;
      default:
        switch (messageArray[0]) {
          case 'updateStatus':
            // todo
            break;
          case 'updateStrategy':
            this.helper.Strategy = message.substring(15);
            this.vueObject.changeHello(this.helper.Strategy.toString());
            break;
          default:
            break;
        }
    }
  }
}


class UpdaterNotifier {
  constructor(messageHelper, vueObject) {
    this.helper = messageHelper;
    this.vueObject = vueObject;
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
    this.vueObject = this.renderHelper.vueObject;
    this.notifier = new UpdaterNotifier(this, this.vueObject);
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

