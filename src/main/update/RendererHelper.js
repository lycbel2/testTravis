import { ipcRenderer } from 'electron'; // eslint-disable-line
import { UpdaterMessage as Message } from './Message.js';
class RendererHelper {
  constructor(vueObject) {
    this.ipc = ipcRenderer;
    this.vue = vueObject;
    this.registerListener();
    this.rendererReady();
  }
  learntHasInstalledUpdate() {
    this.vue.show();
    this.vue.setMessage(this.vue.$t('msg.update.updateInstalled'));
    this.vue.startDisappear(10000);
    this.vue.setBreathType('breatheSuccess');
  }
  registerListener() {
    this.ipc.on('update-message', (event, arg) => {
      this.handleMessage(arg);
    });
  }
  rendererReady() {
    const message = new Message(Message.rendererReadyTitle, 'void').toString();
    this.ipc.send('update-message', message);
  }
  handleMessage(arg) {
    console.log(arg);
    if (!arg) {
      return null;
    }
    const message = Message.getFromMessage(arg);
    console.log(message);
    switch (message.title) {
      case Message.installedMessageLastRoundTitle:
        this.learntHasInstalledUpdate(message);
        break;
      default:
        return message;
    }
    return null;
  }
}

export class RendererHelperForMac extends RendererHelper {
  learntHasInstalledUpdate() {
    super.learntHasInstalledUpdate();
    this.vue.onRightForMac();
  }
}

/* the child class for windows will send message to render
 * if there is update which can be installed within 2 sec
 */

export class RendererHelperForWin extends RendererHelper {
  constructor(vueObject) {
    super(vueObject);
    // will only listen restartOrNotToInstallUpdate selection for once
    this.alreadySentWillInstallUpdateReply = false;
  }
  learntHasInstalledUpdate() {
    super.learntHasInstalledUpdate();
    this.vue.onLeftForWin();
  }
  hasUpdateWaitingForInstall() {
    this.vue.show();
    const buttons = [{ text: this.vue.$t('msg.update.yes'), callBack: this.install, THIS: this }, { text: this.vue.$t('msg.update.no'), callBack: this.notInstall, THIS: this }];
    this.vue.registerCallBackButton(buttons);
    this.vue.onLeftForWin();
    this.vue.setMessage(this.vue.$t('msg.update.message'));
    this.vue.setBreathType('breatheAlert');
  }
  restartOrNotToInstallUpdate(yesOrNo) {
    if (this.alreadySentWillInstallUpdateReply) {
      return;
    }
    this.vue.startDisappear(500);
    this.alreadySentWillInstallUpdateReply = true;
    const message = new Message(
      Message.willInstallOrNotTitle,
      { [Message.willInstallOrNotTitle]: yesOrNo },
    );
    this.ipc.send('update-message', message.toString());
  }
  install() {
    this.restartOrNotToInstallUpdate(true);
  }
  notInstall() {
    this.restartOrNotToInstallUpdate(false);
  }
  handleMessage(arg) {
    console.log('dd'+arg); // eslint-disable-line
    const message = super.handleMessage(arg);
    if (!message) {
      return null;
    }
    switch (message.title) {
      case Message.toInstallMessageNowTitle:
        this.hasUpdateWaitingForInstall(message);
        break;
      default:
        break;
    }
    return null;
  }
}
function getHelper() {
  switch (process.platform) {
    case 'win32':
      return RendererHelperForWin;
    case 'darwin':
      return RendererHelperForMac;
    default:
      return RendererHelper;
  }
}
const GetHelper = getHelper();
export default GetHelper;
