<template>
  <div
    style="display:flex;height: 100vh;text-align: center;align-content: center;align-items: center;background:#333;justify-content: center"
    class="drag">
    <div v-if="launching" style="margin: auto;">
      <div class="mb-5 animate-bounce ">
        <a-avatar :size="60" src="/icons/logo128.png"></a-avatar>
      </div>
      <div style="font-size: 1.2em;">
        <svg class="w-5 h-5 mr-3 -ml-1 text-white animate-spin" fill="none"
             style="vertical-align: text-bottom" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                fill="currentColor">
          </path>
        </svg>
        <div style="color: #2eb9ce">
          欢迎使用磐古跨链客户端，带你探索通往web3的新世界！
        </div>
      </div>
    </div>
    <div v-else class="" style="background: #333;width: 100vw;height:auto">
      <div class="p-10 rounded-lg no-drag s-bg" style="width: 600px;margin: auto">
        <h3 style="text-align: center;font-size: 1.5em">
          <a-avatar src="/icons/logo128.png" style="vertical-align: top"></a-avatar>
          <div style="color: whitesmoke">
           磐古跨链客户端
          </div>
        </h3>
        <div style="color: #2eb9ce" class="mb-10 ml-40 text-center text-md"> —— 连接web2与web3的一站式终端</div>
        <p v-if="!userInfo">
          <div class="mb-5 xt-text" style="font-size: 16px;color: whitesmoke">
            本客户端需要借助后端计算服务，<strong>请登录后使用。</strong><br>

          </div>
          <div class="mb-10 xt-text-2">如遇网络问题，请检查系统代理或耐心等待。</div>
          <a-row :gutter="10" class="w-full">
            <a-col flex="1">
              <xt-button size="mini" style="width: 100%" type="theme" @click="login">登录/注册账号</xt-button>
            </a-col>
            <a-col v-if="netError" flex="150px">
              <xt-button style="width: 100%" @click="getUserInfo">重试</xt-button>
            </a-col>
          </a-row>
        </p>
        <div v-else class="text-center">
          <div class="inline-block mt-3 mb-3">
            <div>
              <a-avatar :size="68" :src="userInfo.avatar"></a-avatar>
            </div>
            <div  style="color: orange" class="mt-4 text-lg">
              你好，{{ userInfo.nickname }}
            </div>
          </div>
        </div>
        <div class="flex">
          <a-button v-if="userInfo" block class="m-3" size="large" type="primary" @click="goDirect">开始使用</a-button>
        </div>
        <div v-if="userInfo" >
          <a @click="reLoginUser">切换账号</a>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
import {message, Modal, Spin} from 'ant-design-vue'
import { appStore } from '@store'
import { mapWritableState, mapActions } from 'pinia'
import { codeStore } from '@store/code'
import { cardStore } from '@store/card'
import { deckStore } from '@apps/deck/store'
import { paperStore } from '@store/paper'
import { weatherStore } from '@store/weather'
import { screenStore } from '@store/screen'
import { isMain } from '@js/common/screenUtils'
import { inspectorStore } from '@store/inspector'
import { teamStore } from '@store/team'
import { steamUserStore } from '@store/steamUser'
import { captureStore } from '@store/capture'
import { navStore } from '@store/nav'
import { clipboardStore } from '@apps/clipboard/store'
import { browserStore } from '@store/browser'
import RayMedal from '../components/small/RayMedal.vue'
import { chatStore } from '@store/chat'
import navigationData from '../js/data/tableData'
import taskStore from '../page/app/todo/stores/task'
import cache from "../components/card/hooks/cache";
import {myIcons} from "@store/myIcons";
import {
  setBgColor,
  setSecondaryBgColor,
} from '@components/card/hooks/styleSwitch/setStyle';
import {
  useWeb3Modal, useWeb3ModalAccount,
  useWeb3ModalEvents,
  useDisconnect, createWeb3Modal,
} from '@web3modal/ethers5/vue';
import {preHandle} from "@components/widgets/courier/courierTool";
import {useToast} from "vue-toastification";
import {signMessage} from "./core/Wallets/events";
import {walletConfig} from "@store/wallet";
import {watch,h} from "vue";
import {GetForLoginNonce, PostForAuthReq} from "@js/service/users";


export default {
  name: 'Splash',
  components: { RayMedal },
  data () {
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
    }
  },
  computed: {
    ...mapWritableState(codeStore, ['myCode', 'serialHash']),
    ...mapWritableState(appStore, ['settings', 'routeUpdateTime', 'userInfo', 'init', 'lvInfo', 'backgroundImage', 'style']),
    ...mapWritableState(navStore, ['sideNavigationList', 'footNavigationList', 'rightNavigationList']),
    ...mapWritableState(myIcons, ['iconOption', 'iconList']),
  },
  async mounted () {
    // 后端服务器状态监测
    // setTimeout(() => {
    //   if (window.$isOffline && this.init) {
    //     this.$router.replace({ name: 'home' })
    //     this.launching = false
    //     // 暂时还没有排查到卡顿原因
    //
    //   }
    // }, 3000)
    // this.timeout()

    // 創建钱包连接对话框
    createWeb3Modal(walletConfig());
    // 设置钱包事件监听器
    this.setupWalletListener();

    //启动检测项的store，必须已经载入的项目，如果这边不写，就不确保必须载入完成
    //注意，此处的第二个参数，必须和此store同名，尤其注意有些命名里带了store的
    this.initStore(appStore, 'appStore')
    this.initStore(codeStore, 'code')
    this.initStore(cardStore, 'cardStore')
    this.initStore(weatherStore, 'weather')
    this.initStore(paperStore, 'paper')
    this.initStore(deckStore, 'deck')
    this.initStore(screenStore, 'screen')
    this.initStore(teamStore, 'teamStore')
    this.initStore(inspectorStore, 'inspectorStore')
    this.initStore(navStore, 'nav')
    this.initStore(taskStore, 'task')
    // this.initStore(browserStore,'browserStore')
    browserStore().bindIPC()
    captureStore()//仅触发一下载入
    clipboardStore()
    if (isMain()) {
      this.bindMainIPC()
    } else {
      this.bindSubIPC()
    }

    window.loadedStore['userInfo'] = false

    this.bindUserInfoResponse()

    setTimeout(() => {
      this.storeReadyTimer = setInterval(() => {
        if (!this.launching) {
          return
        }
        let haventOk=Object.keys(window.loadedStore).filter(key => {
          let check = !window.loadedStore[key]
          if (window.loadedStore[key] === false)
            return check
        })
        if (haventOk.length) {
          //未全部搞定
          console.log(haventOk)
          return
        } else {
          //已经全部搞定
          clearInterval(this.storeReadyTimer)
          this.afterLaunch()
        }
      }, 1000)
    }, 100)

    this.getUserInfo()
    this.sortClock()
  },
  methods: {
    ...mapActions(cardStore, ['sortClock', 'sortCountdown','getCurrentDesk','removeCards','addCards','switchToDesk']),
    ...mapActions(screenStore, ['bindMainIPC', 'bindSubIPC', 'onTableStarted']),
    ...mapActions(codeStore, ['active', 'getSerialHash', 'verify']),
    ...mapActions(appStore, ['getUserInfo', 'setUser', 'finishWizard','deleteUserInfo']),
    ...mapActions(steamUserStore, ['bindClientEvents']),
    ...mapActions(captureStore, ['bindCaptureIPC']),
    ...mapActions(appStore, ['setBackgroundImage']),
    ...mapActions(paperStore,['setPaperSavePath','addToMyPaper','addToActive']),
    timeout () {
      this.timeoutHandler = setTimeout(() => {
        Modal.error({
          content: '服务器连接超时。可能服务器正在维护，请稍后再试。',
          key: 'error',
          okText: '重试',
          centered: true,
          onOk: () => {
            window.location.reload()
          }
        })
      }, 5000)
    },
    //直接进入工作台选择界面
    goDirect () {
      this.doDefaultSettings();
      this.$router.replace({ name: 'home' })
    },
    enter () {
      clearTimeout(this.timeoutHandler)//清理掉超时提示
      chatStore().login()
      tsbApi.window.setFullScreen(true) // default fullscreen when app launched
      const currentRoute = appStore().currentRoute
      if (currentRoute) {
        if (['lock', 'power'].includes(currentRoute.name)) {
          //阻止lock、power页面的自动跳转
          this.$router.replace({ name: 'home' })
        } else {
          this.$router.replace(currentRoute)
        }
      } else {
        this.$router.replace({ name: 'home' })
      }
    },
    bindUserInfoResponse () {
      ipc.removeAllListeners('userInfo')
      ipc.on('userInfo', async (event, args) => {
        console.log('splash接收到登录参数:', JSON.stringify(args))
        if (args.data.uid === -2) {
          this.netError = true
          message.error({
            content: '网络错误，请重试', key: 'net'
          })
        }
        this.tipped = false
        this.loading = false
        if (args.data.uid <= 0) {
          window.loadedStore['userInfo'] = true
          return
        }

        const userInfo = args.data

        let lvInfo = this.lvInfo
        lvInfo.lv = userInfo.onlineGradeExtra.lv
        let current = this.gradeTableGenerate(64)[lvInfo.lv]
        let section = this.gradeTableGenerate(64)[lvInfo.lv + 1]
        let remain = section[0] * 60 - (userInfo.onlineGradeExtra.minutes)
        lvInfo.remainHour = Math.floor(remain / 60)
        lvInfo.remainMinute = remain - (Math.floor(remain / 60) * 60)
        lvInfo.minute = userInfo.onlineGradeExtra.minutes
        lvInfo.percentage = ((lvInfo.minute - current[0] * 60) / ((current[1] - current[0]) * 60)) * 100
        //this.lvInfo = lvInfo
        window.loadedStore['userInfo'] = true
        console.info('更新了用户信息:', JSON.stringify(userInfo))
        this.setUser(userInfo)
        if (this.$route.name === 'splash') {
          this.enter()
        }
      })
    },
    initStore (store, name) {
      if (!window.loadedStore) {
        window.loadedStore = {}
      }
      if (typeof window.loadedStore[name] === 'undefined') {
        window.loadedStore[name] = false
      }
      store()
    },

    async afterLaunch () {
      this.bindCaptureIPC()
      this.bindClientEvents()

      clipboardStore().prepare()
      clipboardStore().start()

      // 设置默认壁纸
      this.setDefaultWallpaper();
      // 加载桌面图标
      this.loadAppIconToDesk();
      // 设置主题颜色
      setBgColor('#FFB342');

      //执行分屏的启动操作
      this.onTableStarted().then()
      if (!this.settings.zoomFactor) {
        this.settings.zoomFactor = 100
      }
      await tsbApi.window.setZoomFactor(+this.settings.zoomFactor / 100)//根据设置进行缩放比的强制调整
      if (this.settings.darkMod) {
        // if( this.backgroundImage.path===''&&!this.backgroundImage.runpath) {
        //   document.body.style.background = '#191919'
        //
        //
        // }else if(this.backgroundImage.runpath){
        //
        // }else{
        //   document.body.style.background=  ''
        //   document.body.style.backgroundImage = "url(" + this.backgroundImage.path + ")"
        // }
      }
      this.launching = false
      if (!this.userInfo) {
        //如果个人信息不存在，则直接返回
        return
      } else {
        this.enter()
      }
    },

    gradeTableGenerate (num) {
      let lvSys = {}
      for (let i = 0; i < num + 1; i++) {
        let arrLef = 0
        let arrRg = 0
        for (let j = 0; j < i; j++) {
          arrLef += 10 * (j + 2)
        }
        for (let k = 0; k < i + 1; k++) {
          arrRg += 10 * (k + 2)
        }
        arrRg -= 1
        lvSys[`${i}`] = [arrLef, arrRg]
      }
      delete lvSys['lv0']
      return lvSys
    },
    login () {
      // 打开登录对话框
      const toast = useToast();
      let modal = useWeb3Modal();
      modal.open().then(()=>{
        let account = useWeb3ModalAccount();
        if (account.isConnected.value){
          toast.success("钱包已连接，正在登录...");
          setTimeout(()=>{
            modal.close();
          },2000);
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
      localStorage.setItem('wizarded', 1)
      this.finishWizard();
      this.settings.zoomFactor = (await tsbApi.window.getZoomFactor()) * 100;
    },
    //   切换账户
    async reLoginUser() {
      await this.deleteUserInfo();
      let res = await ipc.invoke('direct-logout', this.userInfo?.uid);
      if (res) {
        message.success('帐号退出成功,请重新登录');
        useDisconnect().disconnect().then(()=>{
          this.login();
        });
      } else {
        message.error('账号退出失败，请重试！');
      }
    },
    // 默认壁纸
    async setDefaultWallpaper() {
      try{
        const filePath  = await ipc.sendSync('getPersistPath',{ folder: 'wallpaper'});
        console.log("获取存储路径：",filePath);
        if (filePath){
          this.setPaperSavePath(filePath);
          let img = require('path').join(filePath,'default_wallpaper.jpg');
          this.addToMyPaper({src: img});
          this.addToActive({src:img});
          this.setBackgroundImage({path:img});
        }
      }catch (e){
        console.error("设置默认壁纸错误：",e);
      }
    },
    // 加载图标到默认本地桌面
    async loadAppIconToDesk(){
      console.log("正在加载桌面图标...")
      async function getDesktopAppList(option){
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
          },);
        }
        return iconList;
      }
      try{
        await this.switchToDesk(0);
        let desk = this.getCurrentDesk();
        await this.removeCards(desk);
        let iconList = await getDesktopAppList(this.iconOption);
        console.log("处理前：",iconList);
        this.addCards(iconList,desk);
      }catch (e) {
        console.error("加载图标失败：",e);
      }
      console.log("加载成功.")
    },
    async processUserInfo(data){
        const userInfo = {
            ...data?.userInfo,
            uid: data.userInfo.id,
            "fans": 100,
            "follow": 10,
            "grade": {
                "id": 2,
                "name": "6级",
                "new_name": "6级",
                "grade": 6,
                "diff": 26,
                "next": 50,
                "icon": "https://jxxt-1257689580.cos.ap-chengdu.myqcloud.com/ef3c43f233adc069819fa367032238a3.png?upload_type",
                "pc_icon": "https://jxxt-1257689580.cos.ap-chengdu.myqcloud.com/ef3c43f233adc069819fa367032238a3.png?imageMogr2/crop/64x32/gravity/center",
                "image": "https://jxxt-1257689580.cos.ap-chengdu.myqcloud.com/ef3c43f233adc069819fa367032238a3.png?upload_type",
                "now": 20,
                "true_id": 2
            },
            "post_count": 0,
            "signature": "",
            "frame": "",
            "onlineGrade": {
                "crown": 0,
                "sun": 0,
                "moon": 1,
                "star": 0
            },
            "onlineGradeExtra": {
                "cumulativeHours": 171,
                "lv": 4,
                "minutes": 10269,
                "rank": 3469,
                "distance": 2,
                "percentage": 0.8569602507009731
            }
        }
        this.setUser(userInfo)
        if (this.$route.name === 'splash') {
            this.enter();
        }
        // ipc.send('userInfo', {
        //     data: {
        //         ...data?.userInfo,
        //         uid: data.userInfo?.id,
        //     },
        // });
    },
    async setupWalletListener(){
      const toast = useToast();
      // 监听钱包事件
      const w3mEvent = useWeb3ModalEvents();
      watch(w3mEvent, () => {
        switch (w3mEvent.data.event) {
          case 'MODAL_OPEN':
            console.log('测试事件响应：打开了窗口');
            break;
          case 'SELECT_WALLET':
            console.log('测试事件响应：选择了钱包');
            break;
          case 'CONNECT_ERROR':
            console.log('测试事件响应：连接失败');
            toast.error('钱包连接失败，请重试！', null);
            break;
          case 'CONNECT_SUCCESS': // TODO Bug here, no events emitted when connect or disconnect
            console.log('钱包连接成功');
            toast.success('钱包连接成功！', this);
            break;
          case 'DISCONNECT_SUCCESS':
            console.log('测试事件响应：断开成功');
            break;
          case 'MODAL_CLOSE': // 只能通过监听close事件实现
            const w3mAccount = useWeb3ModalAccount();
            let connectStatus = w3mAccount.isConnected.value;
            console.log('测试事件响应：关闭了窗口');
            if (this.userInfo) {
              console.log('登录后的钱包操作');
              if (connectStatus) {
                  console.log('还是处于登录状态！');
              } else {
                  console.log('已经断开钱包连接了！');
              }
            } else {
              if (connectStatus) {
                  console.log('钱包连接成功了');
                toast.success('钱包连接成功');
                // 向后端请求一个随机数
                GetForLoginNonce(useWeb3ModalAccount().address.value).then((res) => {
                  console.log('获取后端数据：', res);
                  if (res === undefined || res === null) {
                    message.error('认证失败，请稍后重试');
                    return;
                  }
                  // 向钱包请求签名
                  toast.success('正在请求签名');
                  const modal = Modal.info({
                    title:"正在请求认证...",
                    centered: true,
                    content: h('div', {
                      style: { display: 'flex', justifyContent: 'center', alignItems: 'center' } },
                        h(Spin, { size: 'large' })),
                  });
                  signMessage(res?.data).then((data) => {
                    console.log('获取返回数据：', data);
                    // 返回签名到后端并获取登录结果
                    toast.success('请求验证');
                    PostForAuthReq(data).then((resp) => {
                      console.log('登录认证返回的数据：', resp);
                      if (resp?.code === 200 && resp?.data !== null) {
                          message.success('认证成功！');
                          this.processUserInfo(resp?.data);
                      } else {
                          message.error('认证失败：', resp?.msg);
                      }
                      modal.destroy();
                    });
                  })
                .catch((error) => {
                    if (error?.code === 5000) {
                        message.error('用户拒绝认证请求！');
                    }
                    modal.destroy();
                  });
                });
              } else {
                console.log('连接失败了，请重试');
              }
            }
            break;
          default:
              break;
    }
      });
    }
  },
}
</script>

<style>
.ant-modal-body {
  -webkit-app-region: no-drag;
}
</style>
