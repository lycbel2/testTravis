import { app, BrowserWindow } from 'electron' // eslint-disable-line
import Updater from './update/updater.js';
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\') // eslint-disable-line
}

let mainWindow;
let updater;


if (!app.requestSingleInstanceLock()) {
  app.quit();
}
app.on('second-instance', () => {
  if (mainWindow) {
    try {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    } catch (err) {
      // pass
    }
  }
});

const winURL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:9080'
  : `file://${__dirname}/index.html`;

function createWindow() {
  /**
   * Initial window options
   */
  if (process.platform === 'win32') {
    mainWindow = new BrowserWindow({
      height: 432,
      useContentSize: true,
      width: 768,
      frame: false,
      titleBarStyle: 'none',
      minWidth: 427,
      minHeight: 240,
      webPreferences: {
        webSecurity: false,
        experimentalFeatures: true,
      },
      // See https://github.com/electron/electron/blob/master/docs/api/browser-window.md#showing-window-gracefully
      backgroundColor: '#802e2c29',
      show: false,
    });
  } else {
    mainWindow = new BrowserWindow({
      height: 432,
      useContentSize: true,
      width: 768,
      frame: false,
      titleBarStyle: 'none',
      minWidth: 427,
      minHeight: 240,
      transparent: true,
      webPreferences: {
        webSecurity: false,
        experimentalFeatures: true,
      },
      // See https://github.com/electron/electron/blob/master/docs/api/browser-window.md#showing-window-gracefully
      backgroundColor: '#802e2c29',
      show: false,
    });
  }

  mainWindow.loadURL(winURL);
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

app.on('ready', () => {
  app.setName('SPlayerX');
  createWindow();
  updater = Updater.getInstance(mainWindow, app);
  updater.onStart().then((message) => { console.log(message); });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
// note it will not be called when windows restarts all shuts down
app.on('quit', () => {
  app.releaseSingleInstanceLock();
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
    updater.win = mainWindow;
  }
});
