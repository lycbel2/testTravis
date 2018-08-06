import { MainHelperForWin, MainHelper } from '../../../../src/main/update/MainHelper.js';

class Updater {
  constructor(ipcMain) {
    this.win = { webContents: ipcMain };
  }
  quitAndInstall() {
    return this; // nothing here just a mock
  }
}

class MainHelperS extends MainHelper {
  constructor(ipcMain) {
    super(null);
    this.updater = new Updater(ipcMain);
    this.ipcMain = ipcMain;
    this.registerMessageReceiver();
  }
}
class MainHelperForWinS extends MainHelperForWin {
  constructor(ipcMain) {
    super(null);
    this.updater = new Updater(ipcMain);
    this.ipcMain = ipcMain;
    this.registerMessageReceiver();
  }
}
const getMainHelper = (platform, ipcMain) => {
  switch (platform) {
    case 'win32':
      return new MainHelperForWinS(ipcMain);
    case 'darwin':
      return new MainHelperS(ipcMain);
    default:
      return new MainHelperS(ipcMain);
  }
};
export default getMainHelper;
