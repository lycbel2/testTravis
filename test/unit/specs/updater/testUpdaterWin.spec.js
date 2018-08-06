// import GetRendererHelper from '../../../../src/main/update/RendererHelper.js';js
import UpdaterNotification from '@/components/UpdaterView/UpdaterNotification';
import { mount } from '@vue/test-utils';
import { ipcMain, ipcRenderer } from './ipcMock.js';
import { UpdaterMessage, UpdateInfo } from '../../../../src/main/update/Message.js';
// import sinon from 'sinon';
const originalPlatform = process.platform;
Object.defineProperty(process, 'platform', {
  value: 'win32',
});
let wrapper;
describe('UpdaterNotification.vue', () => {
  beforeEach(() => {
    wrapper = mount(UpdaterNotification);
    wrapper.vm.helper.ipc = ipcRenderer;
    wrapper.vm.helper.registerListener();
  });
  if (process.platform === 'win32') {
    it('loaded correct', () => {
      expect(wrapper.vm.helper).not.equal(null);
      expect(wrapper.vm.content).equal('');
      expect(wrapper.vm.buttons).eql([]);
      expect(wrapper.vm.linkProp['webkit-animation-name']).equal(null);
    });
    it('test for win start with previous installed update', (done) => {
      const um = new UpdaterMessage(UpdaterMessage.installedMessageLastRoundTitle, UpdateInfo.getFromUpdaterUpdateInfo(''));
      ipcMain.send('update-message', um.toString());
      expect(wrapper.vm.helper).not.equal(null);
      setTimeout(() => {
        console.log('llyc');
        expect(wrapper.vm.position.left).equal('20px');
        done();
      }, 1200);
    });
  }
});
Object.defineProperty(process, 'platform', {
  value: originalPlatform,
});
