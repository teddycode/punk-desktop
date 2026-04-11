import { defineStore } from 'pinia';
import dbStorage from './dbStorage';

declare interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
}

declare interface Screen {
  title: string;
  key: string;
  closable: boolean;
  running: boolean;
  settings: Record<string, any>;
  domain: string;
  fullDomain: string;
  active?: boolean;
  position?: Position;
}

function createTips() {
  return {
    single: {
      status: true,
      content: '当前版本仅支持主屏运行，分屏功能已移除。',
    },
  };
}

function createMainScreen(overrides: Partial<Screen> = {}): Screen {
  const screen = {
    title: '主屏',
    key: 'main',
    closable: false,
    running: true,
    domain: '',
    fullDomain: '',
    settings: {},
    active: true,
    ...overrides,
  };

  screen.title = '主屏';
  screen.key = 'main';
  screen.closable = false;
  screen.running = true;
  screen.domain = '';
  screen.fullDomain = '';
  screen.settings = {
    ...(screen.settings || {}),
  };
  screen.active = true;

  return screen;
}

// @ts-ignore
export const screenStore = defineStore('screen', {
  state: () => ({
    screens: [createMainScreen()] as Screen[],
    tips: createTips(),
    currentTip: 'single',
    taggingScreen: false,
    screenDetail: {} as Record<string, any>,
    timerTag: 0,
  }),
  actions: {
    ensureSingleScreenMode() {
      const currentMain = this.screens.find((screen) => screen.key === 'main');
      const normalizedMain = createMainScreen(currentMain || {});

      this.screens = [normalizedMain];
      this.taggingScreen = false;

      if (this.screenDetail && this.screenDetail.key && this.screenDetail.key !== 'main') {
        this.screenDetail = {};
      }

      return normalizedMain;
    },
    add() {
      return this.ensureSingleScreenMode();
    },
    bindSubIPC() {
      console.log('单屏模式，跳过副屏事件绑定');
      this.ensureSingleScreenMode();
    },
    bindMainIPC() {
      console.log('绑定主屏事件');
      this.ensureSingleScreenMode();
    },
    tagScreen() {
      this.ensureSingleScreenMode();
    },
    async onTableStarted() {
      this.ensureSingleScreenMode();
    },
    runAutoRun() {
      this.ensureSingleScreenMode();
    },
    getFullDomain() {
      return 'table.com';
    },
    generateDomain() {
      return '';
    },
    getScreen() {
      return this.ensureSingleScreenMode();
    },
    getScreenIndex(key) {
      return key === 'main' ? 0 : -1;
    },
    reset() {
      this.screens = [createMainScreen()];
      this.taggingScreen = false;
      this.screenDetail = {};
      this.currentTip = 'single';
    },
    resetTips() {
      this.tips = createTips();
      this.currentTip = 'single';
    },
    startupScreen() {
      this.ensureSingleScreenMode();
      return false;
    },
    stopScreen() {
      this.ensureSingleScreenMode();
      return false;
    },
  },
  persist: {
    enabled: true,
    strategies: [
      {
        storage: dbStorage,
      },
    ],
  },
});
