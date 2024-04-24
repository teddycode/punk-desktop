<template>
  <!-- 快速搜索 应用 主页 -->
  <div style="display: flex; height: 100%; color: var(--primary-text)">
    <SecondPanel :search="true" :menus="menus" logo="https://up.apps.vip/logo/favicon.svg" @change-tab="changeTab">
    </SecondPanel>
    <!--  本地应用 -->
    <div
      v-show="currentIndex === 'my'"
      @dragover.prevent="dragOver"
      @drop.prevent="drop"
      class="app-content s-bg"
      style="margin: 1em; background: var(--primary-bg)"
    >
      <div v-if="myApps.length === 0" style="font-size: 2em; padding-top: 6em; text-align: center">
        <Icon style="font-size: 2em; vertical-align: middle" icon="line-dragdroptuofang"></Icon>
        将应用拖放到此处，即可用于快捷启动
      </div>
      <div v-if="myApps.length === 0" style="text-align: center">
        <div @click="loadDeskIconApps" class="btn" style="font-size: 1.5em; width: 8em">导入桌面应用</div>
      </div>
      <div style="margin: 1em">
        <MyApps @addIcons="addMyVisible = true" v-if="myApps.length > 0"></MyApps>
        <Teleport to="body">
          <AddIcon
            v-if="addMyVisible"
            @getSelectApps="getSelectApps"
            @close="addMyHide"
            navName="Desktop"
            :navList="[{ name: '桌面图标', component: 'Desktop' }]"
          >
          </AddIcon>
        </Teleport>
      </div>
    </div>
    <!--  web3 应用   -->
    <div v-if="currentIndex === 'web3'" class="app-content s-bg" style="margin: 1em; background: var(--primary-bg)">
      <QingApps />
    </div>
    <!--  小程序 应用   -->
    <div v-if="currentIndex === 'mini'" class="app-content s-bg" style="margin: 1em; background: var(--primary-bg)">
      <MiniApps @addIcons="miniStoreVisible = true" />
      <Teleport to="body">
        <MiniAppStore v-if="miniStoreVisible" @getSelectApps="getSelectApps" @close="miniStoreHide" navName="Desktop">
        </MiniAppStore>
      </Teleport>
    </div>
  </div>
</template>

<script>
import { mapWritableState, mapActions } from 'pinia';
import { appStore } from '@store';
import SecondPanel from '../components/SecondPanel.vue';
import QingApps from '../components/QingApps.vue';
import MiniApps from '../components/MiniApps.vue';
import MiniAppStore from '../components/miniStore/index.vue';
import MyApps from '../components/MyApps.vue';
import { appsStore } from '@store/apps';
import { message } from 'ant-design-vue';
import { runExec } from '@js/common/exec';
import Template from '../../user/pages/Template.vue';
import { NotificationOutlined, FolderOpenOutlined } from '@ant-design/icons-vue';
import browser from '../js/common/browser';
import AddIcon from '../page/app/addIcon/index.vue';
import Desktop from '../page/app/addIcon/modules/Desktop.vue';
import storeApps from '@js/data/storeAppData.js';
import pathLib from 'path';

let { fs } = window.$models;
export default {
  name: 'Apps',
  components: {
    AddIcon,
    Desktop,
    Template,
    MyApps,
    MiniApps,
    QingApps,
    MiniAppStore,
    SecondPanel,
    NotificationOutlined,
    FolderOpenOutlined,
  },
  computed: {
    ...mapWritableState(appStore, ['appData']),
    ...mapWritableState(appsStore, ['myApps']),
  },
  data() {
    return {
      addMyVisible: false,
      miniStoreVisible: false,
      settings: {
        useBothWheelAxes: true,
        swipeEasing: true,
        suppressScrollY: false,
        suppressScrollX: true,
        wheelPropagation: true,
      },
      currentIndex: 'my',
      menus: [
        {
          title: '本地应用',
          index: 'my',
          icon: '',
        },
        {
          title: 'web3应用',
          index: 'web3',
        },
        {
          title: '小程序应用',
          icon: '',
          index: 'mini',
        },
      ],
      desktopApps: [],
      dropFiles: [],
      storeApps: storeApps,
    };
  },
  mounted() {
    if (window.$isOffline) {
      this.menus = this.menus.filter((i) => {
        return i.index !== 'store';
      });
    }
  },
  methods: {
    ...mapActions(appsStore, ['addApps']),
    getSelectApps(data) {
      this.addApps(data['default']);
    },
    executeApp(appData) {
      console.log('即将打开app:', appData);
      this.$router.push({
        name: 'app',
        query: appData,
      });
    },
    open(app) {
      require('electron').shell.openPath(app.path);
    },
    addMyHide() {
      this.addMyVisible = false;
    },
    miniStoreHide() {
      this.miniStoreVisible = false;
    },
    async loadDeskIconApps() {
      this.iconVisible = true;
      // const desktopApps = await ipc.sendSync('getDeskApps')
      // this.desktopApps = desktopApps
      // this.addApps(this.desktopApps)
    },
    dragOver() {},
    changeTab(data) {
      this.currentIndex = data.index;
    },
    checkInstalled(checkApp) {
      if (fs.existsSync(checkApp.installPath)) {
        return true;
      }
    },
    executeLocalApp(app) {
      runExec('"' + app.installPath + '"');
    },
    /**
     * 安装，区分静默与否
     * @param app
     * @param path
     * @param silent
     */
    setup(app, path, silent = true) {
      message.success({ content: '正在为您安装', key: 'install' });
      app.installing = true;
      if (silent) {
        runExec('start /wait ' + path + ' /S', require('path').dirname(path))
          .then(
            (rs) => {
              message.success({ content: '安装成功，并为您运行此软件', key: 'install' });
              this.executeLocalApp(app);
              app.installed = true;
            },
            (rs) => {
              message.error({ content: '安装失败', key: 'install' });
            },
          )
          .catch((err) => {
            message.error({ content: '安装错误', key: 'install' });
          })
          .finally(() => {
            app.installing = false;
          });
      } else {
        runExec('start /wait ' + path, require('path').dirname(path))
          .then(
            (rs) => {
              message.success({ content: '安装成功，并为您运行此软件', key: 'install' });
              this.executeLocalApp(app);
              app.installed = true;
            },
            (rs) => {
              message.error({ content: '安装失败', key: 'install' });
            },
          )
          .catch((err) => {
            message.error({ content: '安装错误', key: 'install' });
          })
          .finally(() => {
            app.installing = false;
          });
      }
    },
    becomeDeveloper() {
      browser.openInUserSelect('https://www.yuque.com/tswork/mqon1y/hugtrbdiax9863ug');
    },
    openDir() {
      require('electron').shell.openPath(require('path').join(window.globalArgs['user-data-dir'], 'download'));
    },
    install(app) {
      if (app.downloading) {
        return;
      }
      app.downloading = true;
      let downloadDir = require('path').join(window.globalArgs['user-data-dir'], 'download');

      fs.ensureDirSync(downloadDir);
      let basePath = require('path').join(downloadDir, require('path').basename(new URL(app.downloadUrl).pathname));
      if (fs.existsSync(basePath)) {
        app.downloading = false;
        this.setup(app, basePath);
        return;
      }

      let downloadPath = basePath + '.' + Date.now();

      console.log(downloadPath);
      tsbApi.download.start({
        url: app.downloadUrl,
        savePath: downloadPath,
        updated: (args) => {
          app.done = 1;
          app.percent = ((args.downloadInfo.receivedBytes / args.downloadInfo.totalBytes) * 100).toFixed(1);
          //https://www.electronjs.org/zh/docs/latest/api/download-item#%E4%BA%8B%E4%BB%B6%E5%90%8D-updated
        },
        done: (args) => {
          fs.renameSync(downloadPath, downloadPath.substring(0, downloadPath.lastIndexOf('.')));
          app.downloading = false;
          app.percent = 100;
          app.done = 1;
          this.setup(app, basePath);
        },
        willDownload: (args) => {},
      });
    },
    async drop(e) {
      let files = e.dataTransfer.files;

      let filesArr = [];
      const pathLib = require('path');
      console.log(files);
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          let path = files[i].path;
          let ext = pathLib.extname(path);
          let icon = ['.png', '.jpg', '.jpeg'].includes(ext)
            ? path
            : await tsbApi.system.extractFileIcon(files[i].path);
          filesArr.push({
            icon: icon,
            name: require('path').basename(files[i].path),
            path: path,
          });
          console.log('path:', files[i]);
        }
      }
      this.dropFiles = filesArr;
      this.addApps(this.dropFiles);
    },
  },
};
</script>

<style scoped lang="scss">
.btn {
  background: var(--secondary-bg);

  &:hover {
    color: var(--primary-text);
    background: var(--active-secondary-bg);
  }
}

.app-content {
  flex-shrink: 1;
  flex-grow: 1;
  border-radius: 8px;
  margin-left: 1em;
  margin-right: 1em;
}

.app-summary {
  -webkit-line-clamp: 2; //这里就是最大显示三行
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}
</style>
