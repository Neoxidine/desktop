import * as React from 'react';
import { observable } from 'mobx';

import { TabsStore } from './tabs';
import { TabGroupsStore } from './tab-groups';
import { AddTabStore } from './add-tab';
import { ipcRenderer, remote, IpcRendererEvent } from 'electron';
import { OverlayStore } from './overlay';
import { HistoryStore } from './history';
import { FaviconsStore } from './favicons';
import { SuggestionsStore } from './suggestions';
import { ExtensionsStore } from './extensions';
import { NotifsStore } from './notifications';
import { extname } from 'path';
import { BookmarksStore } from './bookmarks';
import { readFileSync, writeFile } from 'fs';
import { getPath } from '../../../shared/utils/paths';
import { Settings } from '../models/settings';
import { DotOptions } from '../../app/models/dotoptions';
import { DownloadsStore } from './downloads';
import { LocaleStore } from './locale';
import { AutofillStore } from './autofill';
import { AbStore } from './adblockwindow';
import { OptionsStore } from './settings';
import { WeatherStore } from './weather';
import { NewsStore } from './news';
import { UserStore } from './user';
import { existsSync, writeFileSync } from 'fs';
import console = require('console');

if (!existsSync(getPath('settings.json'))) {
  writeFileSync(
    getPath('settings.json'),
    JSON.stringify({
      dialType: 'top-sites',
      toggleDotLauncher: true,
    } as Settings),
  );
}

if (!existsSync(getPath('dot-options.json'))) {
  writeFileSync(
    getPath('dot-options.json'),
    JSON.stringify({
      toggleDotLauncher: true,
      searchEngine: 'google'
    } as DotOptions),
  );
}

export class Store {
  public history = new HistoryStore();
  public bookmarks = new BookmarksStore();
  public suggestions = new SuggestionsStore();
  public favicons = new FaviconsStore();
  public addTab = new AddTabStore();
  public tabGroups = new TabGroupsStore();
  public tabs = new TabsStore();
  public overlay = new OverlayStore();
  public extensions = new ExtensionsStore();
  public downloads = new DownloadsStore();
  public adblockwindow = new AbStore();
  public options = new OptionsStore();
  public weather = new WeatherStore();
  public user = new UserStore();
  public locale = new LocaleStore();
  public news = new NewsStore();
  public notifications = new NotifsStore();
  public autofill = new AutofillStore();

  // Special stores
  public app = require("electron").app;
  public remoteApp = require("electron").remote.app;
  public remote = require("electron").remote;
  public ipcMsg = require("electron").ipcRenderer;
  public ipcRec = require("electron").ipcMain;

  @observable
  public isFullscreen = false;

  @observable
  public isHTMLFullscreen = false;

  @observable
  public quickMenuVisible: boolean = false;

  @observable
  public menuBounds: {} = {};

  @observable
  public updateInfo = {
    available: false,
    version: '',
  };

  @observable
  public navigationState = {
    canGoBack: false,
    canGoForward: false,
  };

  @observable
  public settings: Settings = {
    dialType: 'top-sites'
  };

  public async init() {
    const data = await fetch('https://api.dotbrowser.me/api/v0/version');
    const json = await data.json();

    this.api = json.api;

    this.weather.load()
    this.news.load();
    this.notifications.loadAll();
    this.notifications.showPermissionWindow();

    this.loadedAPI = true;

    
  }

  public api: number;

  public loadedAPI: boolean;

  public findInputRef = React.createRef<HTMLInputElement>();

  public canToggleMenu = false;

  @observable
  public theme: number = 1 | 0;

  @observable
  public isMaximized: boolean;

  public mouse = {
    x: 0,
    y: 0,
  };

  constructor() {

    this.init()

    ipcRenderer.on(
      'update-navigation-state',
      (e: IpcRendererEvent, data: any) => {
        this.navigationState = data;
      },
    );

    ipcRenderer.once('visible', (e: IpcRendererEvent, flag: any) => {
      this.quickMenuVisible = flag;
    });

    ipcRenderer.on('fullscreen', (e: any, fullscreen: boolean) => {
      this.isFullscreen = fullscreen;
    });

    ipcRenderer.on('html-fullscreen', (e: any, fullscreen: boolean) => {
      this.isHTMLFullscreen = fullscreen;
    });

    ipcRenderer.on(
      'update-available',
      (e: IpcRendererEvent, version: string) => {
        this.updateInfo.version = version;
        this.updateInfo.available = true;
      },
    );

    ipcRenderer.on(
      'url-arguments-applied',
      (e: IpcRendererEvent, url: string) => {
        
        this.tabs.addTab({ url, active: true })
        this.overlay.visible = false;
      },
    );

    ipcRenderer.on(
      'api-tabs-query',
      (e: IpcRendererEvent, webContentsId: number) => {
        const sender = remote.webContents.fromId(webContentsId);

        sender.send(
          'api-tabs-query',
          this.tabs.list.map(tab => tab.getApiTab()),
        );
      },
    );

    ipcRenderer.on(
      'api-browserAction-setBadgeText',
      (
        e: IpcRendererEvent,
        senderId: number,
        extensionId: string,
        details: chrome.browserAction.BadgeTextDetails,
      ) => {
        if (details.tabId) {
          const browserAction = this.extensions.queryBrowserAction({
            extensionId,
            tabId: details.tabId,
          })[0];

          if (browserAction) {
            browserAction.badgeText = details.text;
          }
        } else {
          this.extensions
            .queryBrowserAction({
              extensionId,
            })
            .forEach(item => {
              item.badgeText = details.text;
            });
        }
        const contents = remote.webContents.fromId(senderId);
        contents.send('api-browserAction-setBadgeText');
      },
    );

    ipcRenderer.on('find', () => {
      if (this.tabs.selectedTab) {
        this.tabs.selectedTab.findVisible = true;
      }
    });

    ipcRenderer.send('update-check');

    requestAnimationFrame(() => {
      if (remote.process.argv.length > 1) {
        const path = "test"//remote.process.argv[1];
        const ext = extname(path);

        if (ext === '.html') {
          setTimeout(function(this: any) {
            this.tabs.addTab({ url: `file:///${path}`, active: true });
          }, 4000);
         
        }
      }
    });

    this.settings = {
      ...this.settings,
      ...JSON.parse(readFileSync(getPath('settings.json'), 'utf8')),
    };
  }

  public saveSettings() {
    writeFile(getPath('settings.json'), JSON.stringify(this.settings), err => {
      if (err) console.error(err);
    });
  }
}

export default new Store();
