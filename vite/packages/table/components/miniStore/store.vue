<script>
import browser from '@js/common/browser';
import { runExec } from '@js/common/exec';

let { fs } = window.$models;

export default {
  name: 'miniAppStore',
  components: {},
  data() {
    return {
      settings: {
        useBothWheelAxes: true,
        swipeEasing: true,
        suppressScrollY: false,
        suppressScrollX: true,
        wheelPropagation: true,
      },
    };
  },
  methods: {
    becomeDeveloper() {
      browser.openInUserSelect('https://www.yuque.com/tswork/mqon1y/hugtrbdiax9863ug');
    },
    openDir() {
      require('electron').shell.openPath(require('path').join(window.globalArgs['user-data-dir'], 'download'));
    },
    checkInstalled(checkApp) {
      if (fs.existsSync(checkApp.installPath)) {
        return true;
      }
    },
    executeApp(appData) {
      console.log('即将打开app:', appData);
      this.$router.push({
        name: 'app',
        query: appData,
      });
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
    executeLocalApp(app) {
      runExec('"' + app.installPath + '"');
    },
  },
};
</script>

<template>
  <!-- 应用市场   -->
  <div class="app-content s-bg" style="margin: 1em; padding: 1em; background: var(--primary-bg)">
    <vue-custom-scrollbar :settings="settings" style="position: relative; height: 100%; border-radius: 8px">
      <div style="margin: auto; width: 100%; height: auto; margin-bottom: 1em; text-align: center">
        <div style="margin-bottom: 1em; font-size: 1.5em">
          <div @click="becomeDeveloper" class="pointer" style="float: left; font-size: 0.8em">
            <notification-outlined />
            入驻成为开发者
          </div>
          共 {{ storeApps.length }} 应用
          <div class="pointer" @click="openDir" style="font-size: 0.8em; float: right">
            <FolderOpenOutlined />
            下载目录
          </div>
        </div>
        <a-row :gutter="[30, 20]">
          <template v-for="app in storeApps">
            <a-col :span="3">
              <div class="text-left" style="position: absolute; z-index: 9">
                <a-tag color="#ff5500cc" v-if="app.data.type === 'system'">系统</a-tag>
                <a-tag color="#87d068cc" v-else-if="app.needInstall">软件</a-tag>
                <a-tag color="black" v-else-if="app.data.type === 'game'">游戏</a-tag>
                <a-tag color="#108ee9cc" v-else>网页</a-tag>
              </div>
              <a-avatar shape="square" :src="app.icon" style="margin-top: 10px" :size="60"> </a-avatar>
            </a-col>
            <a-col :span="5">
              <div
                class="app-name font-bold text-white"
                style="text-align: left"
                :style="{ color: 'var(--font-color)' }"
              >
                {{ app.name }}
              </div>

              <div class="app-summary" :title="app.summary" style="text-align: left">
                {{ app.summary }}
              </div>
            </a-col>
            <a-col :span="4">
              <template v-if="app.needInstall">
                <div v-if="!checkInstalled(app)" @click="install(app)" class="btn">
                  <template v-if="app.downloading">
                    <svg
                      style="vertical-align: text-bottom"
                      class="ml-1 animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>{{ app.percent }} %</span>
                  </template>
                  <template v-else-if="app.installing">
                    <svg
                      style="vertical-align: text-bottom"
                      class="ml-1 animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    安装中
                  </template>
                  <template v-else>
                    <span>下载安装</span>
                  </template>
                </div>
                <div v-else @click="executeLocalApp(app)" class="btn">运行软件</div>
              </template>
              <template v-else>
                <div @click="executeApp(app.data)" class="btn">打开</div>
              </template>
            </a-col>
          </template>
        </a-row>
      </div>
    </vue-custom-scrollbar>
  </div>
</template>

<style scoped lang="scss"></style>
