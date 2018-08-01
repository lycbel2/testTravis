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
    this.vue.topCenter();
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
    const message = Message.getFromMessage(arg);
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
/* the child class for windows will send message to render
 * if there is update which can be installed within 2 sec
 */

class RendererHelperForWin extends RendererHelper {
  readyToInstallUpdate() {
    this.vue.show();
    const buttons = [{ text: this.vue.$t('msg.update.yes'), callBack: this.install, THIS: this }, { text: this.vue.$t('msg.update.no'), callBack: this.notInstall, THIS: this }];
    this.vue.registerCallBackButton(buttons);
    this.vue.onRight();
    this.vue.setMessage(this.vue.$t('msg.update.message'));
    this.vue.setBreathType('breatheAlert');
  }
  installOrNot(yesOrNo) {
    const message = new Message(
      Message.willInstallOrNotTitle,
      { [Message.willInstallOrNotTitle]: yesOrNo },
    );
    this.ipc.send('update-message', message.toString());
  }
  install() {
    this.installOrNot(true);
  }
  notInstall() {
    this.vue.startDisappear(2000);
    this.installOrNot(false);
  }
  handleMessage(arg) {
    const message = super.handleMessage(arg);
    switch (message.title) {
      case Message.toInstallMessageNowTitle:
        this.readyToInstallUpdate(message);
        break;
      default:
        break;
    }
  }
}
function getHelper() {
  switch (process.platform) {
    case 'win32':
      return RendererHelperForWin;
    case 'darwin':
      return RendererHelper;
    default:
      return RendererHelper;
  }
}
const GetHelper = getHelper();
export default GetHelper;
