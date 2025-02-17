import { BrowserView, app, ipcMain } from 'electron';
import { join } from 'path';
import { AppWindow } from '../windows';
import { platform } from 'os';

interface IOptions {
  name: string;
  devtools?: boolean;
  bounds?: IRectangle;
  hideTimeout?: number;
  customHide?: boolean;
}

interface IRectangle {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class Dialog extends BrowserView {
  public appWindow: AppWindow;

  public visible = false;

  public bounds: IRectangle = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };

  private timeout: any;
  private hideTimeout: number;
  private name: string;

  public constructor(
    appWindow: AppWindow,
    { bounds, name, devtools, hideTimeout }: IOptions,
  ) {
    super({
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    this.appWindow = appWindow;
    this.bounds = { ...this.bounds, ...bounds };
    this.hideTimeout = hideTimeout;
    this.name = name;

    setTimeout(() => {
      appWindow.addBrowserView(this);
    });

    this._hide();

    ipcMain.on(`hide-${this.webContents.id}`, () => {
      this.hide();
    });

    try {
        this.webContents.debugger.attach('1.1')
    } catch (err) {
        console.log('Failed to attach debugger', err)
    }
    
    this.webContents.debugger.on('detach', (event, reason) => {
        console.log('Debugger detached.', reason)
    })
    
    this.webContents.debugger.on('message', (event, method, params) => {
        if(method == 'Runtime.exceptionThrown') {
            console.log(`\x1b[31m${params.exceptionDetails.exception.className} in \x1b[1m[${this.name}]\x1b[0m`, params.exceptionDetails.exception.description)
        }
    })

    this.webContents.debugger.sendCommand('Runtime.enable')

    if (process.env.ENV === 'dev') {
      this.webContents.loadURL(`http://localhost:4444/${name}.html`);
      if (devtools) {
        this.webContents.openDevTools({ mode: 'detach' });
      }
    } else {
      this.webContents.loadURL(
        join('file://', app.getAppPath(), `build/${name}.html`),
      );
    }
  }

  public rearrange(rect: IRectangle = {}) {
    this.bounds = {
      height: rect.height || this.bounds.height,
      width: rect.width || this.bounds.width,
      x: rect.x || this.bounds.x,
      y: rect.y || this.bounds.y,
    };

    if (this.visible) {
      this.setBounds(this.bounds as any);
    }
  }

  public toggle() {
    if (!this.visible) this.show();
    else this.hide();
  }

  public show(focus = true) {
    this.visible = true;

    clearTimeout(this.timeout);

    if (platform() === 'darwin') {
      setTimeout(() => {
        this.bringToTop();
        if (focus) this.webContents.focus();
      });
    } else {
      this.bringToTop();
      if (focus) this.webContents.focus();
    }

    this.rearrange();
  }

  private _hide() {
    this.setBounds({
      height: this.bounds.height,
      width: 1,
      x: 0,
      y: -this.bounds.height + 1,
    });
  }

  public hide(bringToTop = true) {
    if (bringToTop) {
      // this.bringToTop();
    }

    clearTimeout(this.timeout);

    if (this.hideTimeout) {
      this.timeout = setTimeout(() => this._hide(), this.hideTimeout);
    } else {
      this._hide();
    }

    this.visible = false;
  }

  public bringToTop() {
    this.appWindow.removeBrowserView(this);
    this.appWindow.addBrowserView(this);
  }
}