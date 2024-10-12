<template>
  <div
    style="
      display: flex;
      height: 100vh;
      text-align: center;
      align-content: center;
      align-items: center;
      background: #333;
      justify-content: center;
    "
    class="drag"
  >
    <div v-if="launching" style="margin: auto">
      <div class="mb-5 animate-bounce">
        <a-avatar :size="60" src="/icons/logo128.png"></a-avatar>
      </div>
      <div style="font-size: 1.2em">
        <svg
          class="w-5 h-5 mr-3 -ml-1 text-white animate-spin"
          fill="none"
          style="vertical-align: text-bottom"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path
            class="opacity-75"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            fill="currentColor"
          ></path>
        </svg>
        <div style="color: #2eb9ce">
          {{ $t('welcome.hello') }}
        </div>
      </div>
    </div>
    <div v-else class="" style="background: #333; width: 100vw; height: auto">
      <div class="p-10 rounded-lg no-drag s-bg" style="width: 600px; margin: auto">
        <h3 style="text-align: center; font-size: 1.5em">
          <a-avatar src="/icons/logo128.png" style="vertical-align: top"></a-avatar>
          <div style="color: whitesmoke">
            {{ $t('appName') }}
          </div>
        </h3>
        <div style="color: #2eb9ce" class="mb-10 ml-40 text-center text-md">
          {{ $t('welcome.description') }}
        </div>
        <div v-if="!userInfo">
          <div class="mb-5 xt-text" style="font-size: 16px; color: whitesmoke">
            {{ $t('welcome.say1') }}
            <strong> {{ $t('welcome.say2') }} </strong><br />
          </div>
          <div class="mb-10 xt-text-2">{{ $t('welcome.netErr') }}</div>
          <a-row :gutter="10" class="w-full">
            <a-col flex="1">
              <xt-button size="mini" style="width: 100%" type="theme" @click="login">
                {{ $t('welcome.loginOrReg') }}</xt-button
              >
            </a-col>
            <a-col v-if="netError" flex="150px">
              <xt-button style="width: 100%" @click="getUserInfo">{{ $t('welcome.retry') }}</xt-button>
            </a-col>
          </a-row>
          <div class="mt-2 text-md text-gray">
            <a @click="onVisitorModel"> {{ $t('wellcome.visitorMode') }} </a>
          </div>
        </div>
        <div v-else class="text-center">
          <div class="inline-block mt-3 mb-3">
            <div>
              <a-avatar :size="68" :src="userInfo.avatar"></a-avatar>
            </div>
            <div style="color: orange" class="mt-4 text-lg">{{ $t('welcome.call') }}，{{ userInfo.nickname }}</div>
          </div>
          <div class="flex">
            <a-button block class="m-3" size="large" type="primary" @click="goDirect">{{ $t('startUsage') }}</a-button>
          </div>
          <div>
            <a @click="reLoginUser"> {{ $t('welcome.changeAcc') }}</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { message, Modal } from 'ant-design-vue';
import { appStore } from '@store';
import { mapWritableState, mapActions } from 'pinia';
import { codeStore } from '@store/code';
import { cardStore } from '@store/card';
import { deckStore } from '@apps/deck/store';
import { paperStore } from '@store/paper';
import { weatherStore } from '@store/weather';
import { screenStore } from '@store/screen';
import { isMain } from '@js/common/screenUtils';
import { inspectorStore } from '@store/inspector';
import { teamStore } from '@store/team';
import { steamUserStore } from '@store/steamUser';
import { captureStore } from '@store/capture';
import { navStore } from '@store/nav';
import { clipboardStore } from '@apps/clipboard/store';
import { browserStore } from '@store/browser';
import RayMedal from '../components/small/RayMedal.vue';
import { chatStore } from '@store/chat';
import navigationData from '../js/data/tableData';
import taskStore from '../page/app/todo/stores/task';
import cache from '../components/card/hooks/cache';
import { myIcons } from '@store/myIcons';
import { setBgColor, setSecondaryBgColor } from '@components/card/hooks/styleSwitch/setStyle';
import { useWeb3Modal, useWeb3ModalAccount, useDisconnect, createWeb3Modal } from '@web3modal/ethers5/vue';
import { useToast } from 'vue-toastification';
import { setupWalletListener } from './core/Wallets/events';
import { walletConfig } from '@store/wallet';
import { comStore } from '@store/com';
import { defaultUserInfo } from '@js/constants';
import { getUserCountryAndLanguage } from '@table/locale/location';
import { langs } from '@table/locale/helper';
import { watch } from 'vue';

export default {
  name: 'Splash',
  components: { RayMedal },
  data() {
    return {
      showTip: false,
      loading: false,
      netError: false,
      code: '',
      launching: true,
      storeReadyTimer: null,
      launched: false,
      modal: null,
      reloginFlg: false,
      timeoutHandler: null,
      version: tsbApi.runtime.appVersion,
    };
  },
  computed: {
    ...mapWritableState(codeStore, ['myCode', 'serialHash']),
    ...mapWritableState(appStore, [
      'settings',
      'routeUpdateTime',
      'userInfo',
      'init',
      'lvInfo',
      'backgroundImage',
      'style',
    ]),
    ...mapWritableState(navStore, ['sideNavigationList', 'footNavigationList', 'rightNavigationList']),
    ...mapWritableState(myIcons, ['iconOption', 'iconList']),
  },

  async mounted() {
    // 后端服务器状态监测
    // setTimeout(() => {
    //   if (window.$isVisitor && this.init) {
    //     this.$router.replace({ name: 'home' })
    //     this.launching = false
    //     // 暂时还没有排查到卡顿原因
    //   }
    // }, 3000)
    // this.timeout()

    //启动检测项的store，必须已经载入的项目，如果这边不写，就不确保必须载入完成
    //注意，此处的第二个参数，必须和此store同名，尤其注意有些命名里带了store的
    this.initStore(appStore, 'appStore');
    this.initStore(codeStore, 'code');
    this.initStore(cardStore, 'cardStore');
    this.initStore(weatherStore, 'weather');
    this.initStore(paperStore, 'paper');
    this.initStore(deckStore, 'deck');
    this.initStore(screenStore, 'screen');
    this.initStore(teamStore, 'teamStore');
    this.initStore(inspectorStore, 'inspectorStore');
    this.initStore(navStore, 'nav');
    this.initStore(taskStore, 'task');
    // this.initStore(browserStore,'browserStore')
    browserStore().bindIPC();
    captureStore(); //仅触发一下载入
    clipboardStore();
    if (isMain()) {
      this.bindMainIPC();
    } else {
      this.bindSubIPC();
    }

    // 初始化钱包
    this.initWallet();

    window.loadedStore['userInfo'] = false;

    this.bindUserInfoResponse();

    setTimeout(() => {
      this.storeReadyTimer = setInterval(() => {
        if (!this.launching) {
          return;
        }
        let haventOk = Object.keys(window.loadedStore).filter((key) => {
          let check = !window.loadedStore[key];
          if (window.loadedStore[key] === false) return check;
        });
        if (haventOk.length) {
          //未全部搞定
          console.log(haventOk);
          return;
        } else {
          //已经全部搞定
          clearInterval(this.storeReadyTimer);
          this.afterLaunch();
        }
      }, 1000);
    }, 100);

    this.getUserInfo();
    this.sortClock();
  },
  methods: {
    ...mapActions(cardStore, [
      'sortClock',
      'sortCountdown',
      'getCurrentDesk',
      'removeCards',
      'addCards',
      'switchToDesk',
      'getUserDappDesk',
    ]),
    ...mapActions(screenStore, ['bindMainIPC', 'bindSubIPC', 'onTableStarted']),
    ...mapActions(codeStore, ['active', 'getSerialHash', 'verify']),
    ...mapActions(appStore, ['getUserInfo', 'settings', 'setUser', 'finishWizard', 'deleteUserInfo']),
    ...mapActions(steamUserStore, ['bindClientEvents']),
    ...mapActions(captureStore, ['bindCaptureIPC']),
    ...mapActions(appStore, ['setBackgroundImage']),
    ...mapActions(paperStore, ['setPaperSavePath', 'addToMyPaper', 'addToActive']),
    timeout() {
      this.timeoutHandler = setTimeout(() => {
        Modal.error({
          content: this.$t('message.serverTimeout'),
          key: 'error',
          okText: this.$t('welcome.retry'),
          centered: true,
          onOk: () => {
            window.location.reload();
          },
        });
      }, 5000);
    },
    //直接进入工作台选择界面
    async goDirect() {
      await this.doDefaultSettings();
      this.$router.replace({ name: 'home' });
    },
    enter() {
      clearTimeout(this.timeoutHandler); //清理掉超时提示
      try {
        chatStore().login();
      } catch (e) {
        console.log(e);
      }
      tsbApi.window.setFullScreen(true); // default fullscreen when app launched
      const currentRoute = appStore().currentRoute;
      if (currentRoute) {
        if (['lock', 'power'].includes(currentRoute.name)) {
          //阻止lock、power页面的自动跳转
          this.$router.replace({ name: 'home' });
        } else {
          this.$router.replace(currentRoute);
        }
      } else {
        this.$router.replace({ name: 'home' });
      }
    },
    bindUserInfoResponse() {
      ipc.removeAllListeners('userInfo');
      ipc.on('userInfo', async (event, args) => {
        console.log('splash接收到参数:', JSON.stringify(args));
        if (args.data.uid === -2) {
          this.netError = true;
          message.error({
            content: this.$t('network.retry'),
            key: 'net',
          });
        }
        this.tipped = false;
        this.loading = false;
        if (args.data.uid <= 0) {
          window.loadedStore['userInfo'] = true;
          return;
        }

        const userInfo = args.data;

        // let lvInfo = this.lvInfo
        // lvInfo.lv = userInfo.onlineGradeExtra.lv
        // let current = this.gradeTableGenerate(64)[lvInfo.lv]
        // let section = this.gradeTableGenerate(64)[lvInfo.lv + 1]
        // let remain = section[0] * 60 - (userInfo.onlineGradeExtra.minutes)
        // lvInfo.remainHour = Math.floor(remain / 60)
        // lvInfo.remainMinute = remain - (Math.floor(remain / 60) * 60)
        // lvInfo.minute = userInfo.onlineGradeExtra.minutes
        // lvInfo.percentage = ((lvInfo.minute - current[0] * 60) / ((current[1] - current[0]) * 60)) * 100
        //this.lvInfo = lvInfo
        window.loadedStore['userInfo'] = true;
        console.info('更新了用户信息:', JSON.stringify(userInfo));
        comStore()._updateUserInfo(userInfo.uid); //更新社交网络用户
        this.getUserDappDesk(userInfo.uid); //获取用户小程序桌面
        this.setUser(userInfo);
        if (this.$route.name === 'splash') {
          this.enter();
        }
      });
    },
    initStore(store, name) {
      if (!window.loadedStore) {
        window.loadedStore = {};
      }
      if (typeof window.loadedStore[name] === 'undefined') {
        window.loadedStore[name] = false;
      }
      store();
    },

    async afterLaunch() {
      this.bindCaptureIPC();
      this.bindClientEvents();

      clipboardStore().prepare();
      clipboardStore().start();
      // 设置默认语言
      this.setLocaleLang();
      // 设置默认壁纸
      this.setDefaultWallpaper();
      // 加载桌面图标
      this.loadAppIconToDesk();
      // 设置主题颜色
      setBgColor('#FFB342');

      //执行分屏的启动操作
      this.onTableStarted().then();
      if (!this.settings.zoomFactor) {
        this.settings.zoomFactor = 100;
      }
      await tsbApi.window.setZoomFactor(+this.settings.zoomFactor / 100); //根据设置进行缩放比的强制调整
      if (this.settings.darkMod) {
        this.settings.darkMode = false;
      }
      this.launching = false;
      if (!this.userInfo) {
        //如果个人信息不存在，则直接返回
        return;
      } else {
        this.enter();
      }
    },

    gradeTableGenerate(num) {
      let lvSys = {};
      for (let i = 1; i <= num; i++) {
        let arrLef = 10 * i * (i + 1);
        let arrRg = 10 * (i + 1) * (i + 2) - 1;
        lvSys[`${i}`] = [arrLef, arrRg];
      }
      return lvSys;
    },
    login() {
      // 打开登录对话框
      const toast = useToast();
      let modal = useWeb3Modal();
      modal.open().then(() => {
        let account = useWeb3ModalAccount();
        if (account.isConnected.value) {
          toast.success(this.$t('toast.walletConnected'));
          setTimeout(() => {
            modal.close();
          }, 3000);
        }
      });

      // tsbApi.user.login((data) => {
      //   this.getUserInfo()
      // })
    },
    replaceIcon() {
      navigationData.systemAppList.forEach((item) => {
        this.sideNavigationList.forEach((i) => {
          if (item.name === i.name) {
            i.icon = item.icon;
          }
        });
      });
      navigationData.systemAppList.forEach((item) => {
        this.rightNavigationList.forEach((i) => {
          if (item.name === i.name) {
            i.icon = item.icon;
          }
        });
      });
      navigationData.systemAppList.forEach((item) => {
        this.footNavigationList.forEach((i) => {
          if (item.name === i.name) {
            i.icon = item.icon;
          }
        });
      });
    },
    // 执行默认快捷键设置
    async doDefaultSettings() {
      this.replaceIcon();
      localStorage.setItem('wizarded', 1);
      // this.finishWizard();
      this.settings.zoomFactor = (await tsbApi.window.getZoomFactor()) * 100;
    },
    //  切换账户
    async reLoginUser() {
      await this.deleteUserInfo();
      let res = await ipc.invoke('direct-logout', this.userInfo?.uid);
      if (res) {
        message.success(this.$t('message.logoutSuccess'));
        useDisconnect()
          .disconnect()
          .then(() => {
            this.login();
          });
      } else {
        message.error(this.$t('message.logoutFail'));
      }
    },
    // 默认壁纸
    async setDefaultWallpaper() {
      try {
        const filePath = await ipc.sendSync('getPersistPath', { folder: 'wallpaper' });
        console.log('获取存储路径：', filePath);
        if (filePath) {
          this.setPaperSavePath(filePath);
          let img = require('path').join(filePath, 'default_wallpaper.jpg');
          this.addToMyPaper({ src: img });
          this.addToActive({ src: img });
          this.setBackgroundImage({ path: img });
        }
      } catch (e) {
        console.error('设置默认壁纸错误：', e);
      }
    },
    // 加载图标到默认本地桌面
    async loadAppIconToDesk() {
      console.log('正在加载桌面图标...');
      async function getDesktopAppList(option) {
        let iconList = [];
        const apps = await ipc.sendSync('getDeskApps');
        for (const app of apps) {
          let newIcon = { ...option };
          newIcon.titleValue = app.name;
          newIcon.link = app.link || 'fast';
          newIcon.src = app.icon;
          newIcon.open = {
            type: 'tableApp',
            value: app.path,
            name: app.name,
          };
          let random = Math.floor(Math.random() * 50) * Math.floor(Math.random() * 100);
          iconList.push({
            name: 'myIcons',
            id: Date.now() - random,
            customData: { iconList: [newIcon] },
          });
        }
        return iconList;
      }
      try {
        await this.switchToDesk(0);
        let desk = this.getCurrentDesk();
        await this.removeCards(desk);
        let iconList = await getDesktopAppList(this.iconOption);
        this.addCards(iconList, desk);
      } catch (e) {
        console.error('加载图标失败：', e);
      }
      console.log('加载成功.');
    },
    // 处理用户信息
    async processUserInfo(data) {
      const userInfo = {
        ...defaultUserInfo,
        ...data?.userInfo,
        uid: data.userInfo.id,
      };
      window.loadedStore['userInfo'] = true;
      console.log('等待存入数据库。。。');
      ipc.invoke('saveUserToDB', userInfo).then((res) => {
        console.log('存入数据库成功，唤起用户数据读取：', res);
        this.getUserInfo();
      });
    },
    // 启用访客模式
    async onVisitorModel() {
      this.visitor = true;
      this.userInfo = {
        ...defaultUserInfo,
        uid: null,
        avatar: '/emoji/unlogin.png',
        gender: 1,
        nickname: this.$t('welcome.visitorUser'),
      };
    },
    // 初始化钱包
    async initWallet() {
      // 創建钱包连接对话框
      try {
        await createWeb3Modal(walletConfig());
        // 设置钱包事件监听器
        setupWalletListener(this.processUserInfo, this.userInfo);
      } catch (e) {
        console.log('创建钱包错误：', e.toString());
      }
    },
    // 初始化地区语言
    async setLocaleLang() {
      // 监听变化并赋值全局变量
      watch(this.settings.language, (newVal) => {
        console.log('语言变了：', this.settings.language, newVal);
        global.userLanguage = newVal;
      });
      getUserCountryAndLanguage().then((location) => {
        const toast = useToast();
        console.log('位置信息：', location);
        const lang = location.languageCode;
        console.log(this.settings.language);
        if (lang in langs) {
          if (lang !== this.settings.language) {
            this.settings.language = lang;
            this.$i18n.locale = lang;
            toast.info(this.$t('settings.langTips') + location.countryName);
          } else {
            this.$i18n.locale = lang;
            toast.info(this.$t('settings.region') + location.countryName);
          }
        }
        global.userLanguage = this.settings.language;
      });
    },
  },
};
</script>

<style>
.ant-modal-body {
  -webkit-app-region: no-drag;
}
</style>
