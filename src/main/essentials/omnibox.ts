import { BrowserWindow, app, nativeImage, screen } from 'electron';
import { appWindow } from '~/renderer/app';
import { resolve } from 'path';
import { Tab } from '~/renderer/app/models';

export class Omnibox extends BrowserWindow {
  constructor(public appWindow: any) {
    super({
      width: 1000,
      height: 50,
      title: 'Omnibox Host',
      frame: false,
      resizable: false,
      maximizable: false,
      show: false,
      fullscreenable: false,
      skipTaskbar: true,
      transparent: true,
      closable: false,
      minHeight: 0,
      webPreferences: {
        plugins: true,
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    this.setParentWindow(this.appWindow);

    this.webContents.loadURL('http://localhost:4444/search.html');

    if (process.env.ENV == 'dev') {
      this.webContents.openDevTools({ mode: 'detach' });
    }
  }

  public open(tab: Tab) {
    this.show();

    this.webContents.send('tab-content', tab);
  }
}
