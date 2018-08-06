// import GetRendererHelper from '../../../../src/main/update/RendererHelper.js';js
import UpdaterNotification from '@/components/UpdaterView/UpdaterNotification';
import { mount } from '@vue/test-utils';
import { ipcMain, ipcRenderer } from './ipcMock.js';
import { UpdaterMessage } from '../../../../src/main/update/Message.js';
// import sinon from 'sinon';
const originalPlatform = process.platform;
Object.defineProperty(process, 'platform', {
  value: 'darwin',
});
describe('UpdaterNotification.vue', () => {
  it('loaded correct', () => {
    const wrapper = mount(UpdaterNotification);
    wrapper.vm.helper.ipc = ipcRenderer;
    expect(wrapper.vm.helper).not.equal(null);
    expect(wrapper.vm.content).equal('');
    expect(wrapper.vm.buttons).eql([]);
    expect(wrapper.vm.linkProp['webkit-animation-name']).equal(null);
  });
  it('test for win start with previous installed update', () => {
    const wrapper = mount(UpdaterNotification);
    wrapper.vm.helper.ipc = ipcRenderer;
    const um = new UpdaterMessage(UpdaterMessage.installedMessageLastRoundTitle, {});
    ipcMain.send('update-message', um.toString());
    expect(wrapper.vm.helper).not.equal(null);
    // setTimeout(() => {
    //   console.log('llyc');
    //   expect(wrapper.vm.position.left).equal('20px');
    //   done();
    // }, 200);
  });
});
Object.defineProperty(process, 'platform', {
  value: originalPlatform,
});
