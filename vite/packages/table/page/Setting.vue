<template>

  <vue-custom-scrollbar :settings="scrollbarSettings"
                        style="position: relative; border-radius: 8px; width: 100%;height: 100%">
    <div class="setting-menu" style="display: flex; width: 100%;justify-content: center;justify-items: center">

      <!-- 快速搜索 快速开关功能 -->
      <div class="s-bg p-4" style="
            border-radius: 0.5em;
            width: 20em;
            display: inline-block;
            color: var(--primary-text);
            background: var(--primary-bg);
          ">
        <h3 style="color: var(--primary-text)">快速开关功能</h3>
        <a-row :gutter="[20, 20]" style="font-size: 1.2em; text-align: center">
          <a-col :span="12">
            <!-- TODO 修改设置内容 -->
            <div class="btn relative">
              弹幕
              <br/>
              <a-switch v-model:checked="settings.enableBarrage" @change="switchBarrage"></a-switch>
            </div>
          </a-col>

          <a-col :span="12">
            <div class="btn relative" style="cursor: help" @click="tipSaving">
              节能模式<br/>
              <a-switch v-model:checked="saving" @click.stop="() => { }"></a-switch>
            </div>
          </a-col>

          <a-col :span="12">
            <div class="btn relative">
              窗口控制<br/>
              <a-switch v-model:checked="showWindowController" @click.stop="() => { }"></a-switch>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="btn relative test">
              浅色模式<br/>
              <!-- <a-switch @click.native.stop="styleSwitch($event)" v-model:checked="styles"></a-switch> -->
              <a-switch v-model:checked="styles" @click="themeSwitch()"></a-switch>
            </div>
          </a-col>

          <a-col :span="12">
            <div class="btn relative">
              社交网络<br/>
              <a-switch v-model:checked="settings.enableChat"></a-switch>
            </div>
          </a-col>
          <a-col v-if="isMain()" :span="12">
            <div class="btn relative">
              消息免打扰<br/>
              <a-switch v-model:checked="settings.noticeEnable"></a-switch>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="btn relative" style="cursor: help" @click="tipSimple">
              极简模式<br/>
              <a-switch v-model:checked="simple" @click.stop="() => { }"></a-switch>
            </div>
          </a-col>
        </a-row>

        <div></div>
      </div>
      <div class="" style="display: inline-block; vertical-align: top">
        <div class="s-bg p-4 ml-4   menu-block">
          <h3 style="color: var(--primary-text)">常用</h3>
          <a-row style="font-size: 1.2em; text-align: center">
            <a-col v-if="isMain() && isWin()" :span="6">
              <div class="btn" @click="setTouch">
                <Icon icon="Touch" style="font-size: 2em"></Icon>
                <div>设置触摸屏</div>
              </div>
            </a-col>
            <a-col v-if="isMain() && isWin()" :span="6">
              <div class="btn" @click="setPen">
                <Icon icon="icon-checkin" style="font-size: 2em"></Icon>
                <div>设置笔</div>
              </div>
            </a-col>
            <a-col :span="6">
              <div class="btn" @click="chooseScreen">
                <Icon icon="touping" style="font-size: 2em"></Icon>
                <div>选择屏幕</div>
              </div>
            </a-col>
            <a-col :span="6">
              <div v-if="isMain()" class="btn" @click="subscreen">
                <Icon icon="pingmufenge02" style="font-size: 2em"></Icon>
                <div> 分屏设置</div>
              </div>
            </a-col>
            <a-col v-if="simple" :span="6">
              <MyAvatar :size="37"></MyAvatar>
            </a-col>
          </a-row>
          <div></div>
        </div>
        <div class="s-bg menu-block p-4 ml-4 mt-4">
          <h3 style="color: var(--primary-text)">其他</h3>
          <a-row :gutter="[10, 10]" style="font-size: 1.2em; text-align: center">
            <a-col v-if="isMain()" :span="6">
              <div class="btn" @click="editNavigationVisible = true">
                <Icon icon="Pushpin" style="font-size: 2em"></Icon>
                <div>导航栏编辑</div>
              </div>
            </a-col>
            <a-col v-if="isMain()" :span="6">
              <div class="btn" @click="goApps()">
                <Iconify icon="fluent:grid-16-regular" style="font-size: 2em"></Iconify>
                <div>应用管理</div>
              </div>
            </a-col>
            <a-col v-if="isMain()" :span="6">
              <div class="btn" @click="wizard">
                <Icon icon="jurassic_nav" style="font-size: 2em"></Icon>
                <div>配置向导</div>
              </div>
            </a-col>

            <a-col :span="6">
              <div class="btn" @click="papersSettings">
                <Icon icon="banner" style="font-size: 2em"></Icon>
                <div>壁纸</div>
              </div>
            </a-col>
            <a-col :span="6">
              <xt-task :modelValue="m04011" @cb="basic">
                <div class="btn" @click="basic">
                  <Icon icon="shezhi" style="font-size: 2em"></Icon>
                  <div>通用设置</div>
                </div>
              </xt-task>
            </a-col>

            <a-col :span="6">
              <xt-task :modelValue="m03011" @cb="styleVisible = true">
                <div class="btn" @click="styleVisible = true">
                  <Icon icon="yifu" style="font-size: 2em"></Icon>
                  <div>主题颜色</div>
                </div>
              </xt-task>
            </a-col>
            <!-- <a-col v-if="isMain()" :span="6">
              <div @click="invite" class="btn">
                <Icon icon="tianjiachengyuan" style="font-size: 2em"></Icon>
                <div>邀请</div>
              </div>
            </a-col>
            <a-col v-if="isMain()" :span="6">
              <div @click="verify" class="btn">
                <Icon icon="team" style="font-size: 2em"></Icon>
                <div>受邀</div>
              </div> -->
            <!-- </a-col> -->
            <a-col v-if="userInfo && userInfo.uid === 4 && isMain() && false" :span="6">
              <div class="btn" @click="createCodes">
                <Icon icon="shezhi" style="font-size: 2em"></Icon>
                <div>生成激活码</div>
              </div>
            </a-col>
            <a-col :span="6">
              <div class="btn" @click="power">
                <Icon icon="tuichu" style="font-size: 2em"></Icon>
                <div>电源</div>
              </div>
            </a-col>
          </a-row>
          <div></div>
        </div>
      </div>
    </div>
  </vue-custom-scrollbar>

  <div v-if="editNavigationVisible" class="home-blur fixed inset-0" style="z-index: 999">
    <EditNavigation @setQuick="editNavigationVisible = false"></EditNavigation>
  </div>
  <a-drawer v-if="styleVisible" v-model:visible="styleVisible" :width="500" placement="right" style="z-index: 9999999">
    <xt-task :modelValue="m03012"></xt-task>
    <XtColor v-model:color="bgColor" btnText="恢复默认主题颜色" title="主题" @onBtnClick="clearBgColor"></XtColor>
    <XtColor v-model:color="textColor" btnText="恢复默认文本颜色" title="文本" @onBtnClick="clearTextColor"></XtColor>
    <XtColor v-model:color="wallpaperColor" btnText="恢复默认壁纸颜色" title="背景"
             @onBtnClick="clearWallpaperColor"></XtColor>
  </a-drawer>

  <a-modal v-model:visible="visibleChooseScreen" :footer="null" :title="null" width="100%" wrap-class-name="full-modal"
           @ok="() => {
        this.visibleChooseScreen = false;
      }
      ">
    <div style="zoom: 1.5; font-size: 16px; padding-top: 5em; text-align: center">
      <div style="width: 500px; overflow: visible; display: inline-block">
        <ChooseScreen></ChooseScreen>
      </div>
    </div>
  </a-modal>
</template>

<script>
import {
  delBgColor,
  delSecondaryBgColor,
  delTextColor,
  delWallpaperColor,
} from './../components/card/hooks/styleSwitch/delStyle'
import { getBgColor, getTextColor, getWallpaperColor, } from './../components/card/hooks/styleSwitch/getStyle'
import {
  setBgColor,
  setSecondaryBgColor,
  setTextColor,
  setWallpaperColor,
} from './../components/card/hooks/styleSwitch/setStyle'
import { setThemeSwitch } from './../components/card/hooks/themeSwitch/'
import ChooseScreen from './ChooseScreen.vue'
import { appStore } from '../store'
import { mapActions, mapWritableState } from 'pinia'
import { message, Modal } from 'ant-design-vue'
import { codeStore } from '../store/code'
import SecondPanel from '../components/SecondPanel.vue'
import GradeSmallTip from '../components/GradeSmallTip.vue'
import { isMain, isWin } from '../js/common/screenUtils'
import MyAvatar from '../components/small/MyAvatar.vue'
import { noticeStore } from '../store/notice'
import EditNavigation from '../components/bottomPanel/EditNavigation.vue'
import { taskStore } from '../apps/task/store'
import { Icon as Iconify } from '@iconify/vue'

export default {
  name: 'Setting',
  components: { EditNavigation, MyAvatar, SecondPanel, ChooseScreen, GradeSmallTip, Iconify },
  data () {
    return {
      bgColor: '',
      textColor: '',
      wallpaperColor: '',
      styleVisible: false,
      visibleChooseScreen: false,
      scrollbarSettings: {
        useBothWheelAxes: true,
        swipeEasing: true,
        suppressScrollY: false,
        suppressScrollX: true,
        wheelPropagation: true,
      },
      editNavigationVisible: false,
    }
  },
  watch: {
    bgColor (newV) {
      if (!newV) return
      setBgColor(newV)
      setSecondaryBgColor(newV)
    },
    textColor (newV) {
      if (!newV) return
      setTextColor(newV)
    },
    wallpaperColor (newV) {
      setWallpaperColor(newV)
    },
  },
  mounted () {
    this.bgColor = getBgColor()
    this.textColor = getTextColor()
    this.wallpaperColor = getWallpaperColor()
  },
  computed: {
    ...mapWritableState(appStore, [
      'settings',
      'saving',
      'simple',
      'styles',
      'style',
      'showWindowController',
    ]),
    ...mapWritableState(appStore, ['userInfo']),
    ...mapWritableState(noticeStore, ['noticeSettings']),
    ...mapWritableState(taskStore, ['taskID', 'step']),

    m03011 () {
      return this.taskID == 'M0301' && this.step == 1
    },
    m03012 () {
      return this.taskID == 'M0301' && this.step == 2
    },
    m04011 () {
      return this.taskID == 'M0401' && this.step == 1
    },
  },
  methods: {
    ...mapActions(noticeStore, ['setNoticeOnOff']),
    ...mapActions(codeStore, ['verify', 'create', 'myCode']),
    isMain: isMain, isWin,
    goApps () {
      this.$router.push({
        name: 'apps'
      })
    },
    editNavigation () {
      this.editNavigationVisible = true
    },
    clearBgColor () {
      delBgColor()
      delSecondaryBgColor()
    },
    clearTextColor () {
      delTextColor()
    },
    clearWallpaperColor () {
      delWallpaperColor()
    },
    themeSwitch () {
      setThemeSwitch(this.styles)
    },

    tipSaving () {
      Modal.info({
        content:
            '使用性能模式后，将关闭各种界面动画，同时尽可能清理掉滞留内存中的进程。可能导致打开界面效果折损或者应用切换缓慢。但可以显著降低内存、CPU、GPU占用。',
        centered: true,
      })
    },
    tipSimple () {
      Modal.info({
        content:
            '使用极简模式后，将隐藏部分娱乐、社交类的功能，例如小队功能。',
        centered: true,
      })
    },
    power () {
      this.$router.push({ path: '/power' })
    },

    invite () {
      this.$router.push({
        name: 'invite',
      })
    },
    verify () {
      this.$router.push({
        name: 'invite',
        params: {
          tab: 'verify',
        },
      })
    },

    async verifyCode () {
      if (!this.myCode) {
        Modal.confirm({
          content:
              '您还没有通过邀请码受邀，点击“接受邀请”，进入验证邀请码界面。',
          okText: '接受邀请',
          centered: true,
          onOk: () => {
            this.$router.push({
              name: 'invite',
              params: {
                tab: 'verify',
              },
            })
          },
        })
        return
      }
      let rs = await this.verify(this.userInfo.uid)
      if (rs) {
        Modal.info({
          content: '验证邀请码成功。您可在小队个人信息界面查收勋章。',
          centered: true,
        })
      } else {
        Modal.error({
          content: '邀请码已失效。',
          centered: true,
        })
      }
    },
    async createCodes () {
      this.create().then((rs) => {
        message.success('生成激活码10个')
      })
    },
    async setTouch () {
      await tsbApi.window.setAlwaysOnTop(false)
      let cp = require('child_process')
      cp.exec('MultiDigiMon.exe -touch', async (err) => {
        await tsbApi.window.setAlwaysOnTop(true)
      })
    },
    async setPen () {
      await tsbApi.window.setAlwaysOnTop(false)
      let cp = require('child_process')
      cp.exec('MultiDigiMon.exe -pen', async (err) => {
        await tsbApi.window.setAlwaysOnTop(true)
      })
    },
    subscreen () {
      this.$router.push({ name: 'subscreen' })
    },
    chooseScreen () {
      this.visibleChooseScreen = true
    },
    wizard () {
      this.$router.push('/wizard')
    },
    barrage () {
      this.$router.push({
        name: 'barrageSetting',
      })
    },
    papersSettings () {
      this.$router.push({
        name: 'my',
      })
    },
    basic () {
      this.$router.push({
        name: 'common',
      })
    },
    switchBarrage (value) {
      if (value) {
        window.$manager.show()
      } else {
        window.$manager.hidden()
      }
    },
  },
}
</script>

<style lang="scss" scoped>
:deep(.zs-color-picker-btn) {
  // width: 455px;
  // height: 100px;
}

.menu-block {
  border-radius: 0.5em;
  width: 40em;
  color: var(--primary-text);
  background: var(--primary-bg);
}

</style>
