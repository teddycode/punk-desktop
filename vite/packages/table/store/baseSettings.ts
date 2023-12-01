// 导入需要的库和插件
import { defineStore } from 'pinia';
import { RouteRecordRaw, useRouter } from 'vue-router';

const router = useRouter();

// @ts-ignore
export const useLayoutStore = defineStore('layoutStore', {
  state: () => ({
    appId: process.env.VUE_APP_ID,
    appName: process.env.VUE_APP_NAME,
    locales: 'zh-cn',
    isMenu: false,
    themes: false,
    themesColor: {
      primaryColor: '#1890ff',
      errorColor: '#ff4d4f',
      warningColor: '#faad14',
      successColor: '#52c41a',
      infoColor: '#909399',
    },
    isBreadcrumb: true,
    isPathbar: true,
    direction: true,
    modulesSize: 'large',
    allloading: false,
    fixedTop: false,
    tagView: [],
    activeTagView: '',
    authority: [],
    menus: [],
  }),
  actions: {
    setIsMenu(all: boolean) {
      this.isMenu = all;
    },
    setIsBreadcrumb(all: boolean) {
      this.isBreadcrumb = all;
    },
    setIsPathBar(all: boolean) {
      this.isPathbar = all;
    },
    setDirection(all: boolean) {
      this.direction = all;
    },
    setLocales(all: string) {
      this.locales = all;
    },
    setThemes(all: boolean) {
      this.themes = all;
    },
    setThemesColor(all: object) {
      this.themesColor = all;
    },
    setModulesSize(all: string) {
      this.modulesSize = all;
    },
    setAllLoading(all: boolean) {
      this.allloading = all;
    },
    setAuthority(all: Array<string>) {
      this.authority = all;
    },
    setFixedTop(all: boolean) {
      this.fixedTop = all;
    },
    setMenus(r: any) {
      this.menus = r;
    },
    addTagView(tag: RouteRecordRaw) {
      this.activeTagView = tag.path;
      if (tag.path != '/') {
        if (!this.tagView.some((x: any) => x.path == tag.path)) {
          this.tagView.push(tag);
        }
      }
    },
    editTagView(tag: RouteRecordRaw) {
      if (this.tagView.some((x: any) => x.path == tag.path)) {
        this.activeTagView = tag.path;
        this.tagView = this.tagView.filter((x: any) => x.path != tag.path);
      }
      this.activeTagView = tag.path;
      this.tagView.push(tag);
    },
    deleteTagView(index: number) {
      if (this.tagView.length <= 1) return;
      this.tagView.splice(index, 1);
      if (index >= 1 && index <= this.tagView.length) {
        if (index == 0) index = 1;
        this.activeTagView = this.tagView[index - 1].path;
        router.push(this.activeTagView);
      }
    },
    clearTagView() {
      this.tagView = [];
      this.activeTagView = '';
    },
  },
  persist: {
    enabled: true,
    strategies: [
      {
        paths: [
          'appId',
          'appName',
          'locales',
          'isMenu',
          'themes',
          'themesColor',
          'isBreadcrumb',
          'isPathbar',
          'direction',
          'modulesSize',
          'allloading',
          'fixedTop',
          'tagView',
          'activeTagView',
          'authority',
          'menus',
        ],
        storage: localStorage,
      },
    ],
  },
});
