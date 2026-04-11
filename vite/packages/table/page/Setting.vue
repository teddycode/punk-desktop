<template>
  <vue-custom-scrollbar
    :settings="scrollbarSettings"
    style="position: relative; border-radius: 8px; width: 100%; height: 100%"
  >
    <div class="setting-menu" style="display: flex; width: 100%; justify-content: center; justify-items: center">
      <!-- 快速搜索 快速开关功能 -->
      <div
        class="p-4 s-bg"
        style="
          border-radius: 0.5em;
          width: 20em;
          display: inline-block;
          color: var(--primary-text);
          background: var(--primary-bg);
        "
      >
        <h3 style="color: var(--primary-text)">{{ $t('settings.switch') }}</h3>
        <a-row :gutter="[20, 20]" style="font-size: 1.2em; text-align: center">
          <a-col :span="12" v-if="!this.isOffline">
            <div class="relative btn">
              {{ $t('settings.account') }}
              <br />
              <a-switch @change="switchBarrage" v-model:checked="settings.enableBarrage"></a-switch>
            </div>
          </a-col>

          <a-col :span="12">
            <div style="cursor: help" @click="tipSaving" class="relative btn">
              {{ $t('settings.save') }} <br />
              <a-switch @click.stop="() => {}" v-model:checked="saving"></a-switch>
            </div>
          </a-col>

          <a-col :span="12">
            <div class="relative btn">
              {{ $t('settings.window') }}<br />
              <a-switch @click.stop="() => {}" v-model:checked="showWindowController"></a-switch>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="relative btn test">
              {{ $t('settings.dark') }}<br />
              <!-- <a-switch @click.native.stop="styleSwitch($event)" v-model:checked="styles"></a-switch> -->
              <a-switch @click="themeSwitch()" v-model:checked="styles"></a-switch>
            </div>
          </a-col>

          <a-col :span="12" v-if="!this.isOffline">
            <div class="relative btn">
              {{ $t('settings.social') }} <br />
              <a-switch v-model:checked="settings.enableChat"></a-switch>
            </div>
          </a-col>
          <a-col v-if="isMain()" :span="12">
            <div class="relative btn">
              {{ $t('settings.quiet') }} <br />
              <a-switch v-model:checked="settings.noticeEnable"></a-switch>
            </div>
          </a-col>
          <a-col :span="12" v-if="!this.isOffline">
            <div style="cursor: help" @click="tipSimple" class="relative btn">
              {{ $t('settings.simple') }}<br />
              <a-switch @click.stop="() => {}" v-model:checked="simple"></a-switch>
            </div>
          </a-col>
          <a-col :span="12">
            <div @click="tipOffline" class="relative btn">
              {{ $t('settings.offline') }} <br />
              <a-switch @click="this.changeOffline" v-model:checked="isOffline"></a-switch>
            </div>
          </a-col>
        </a-row>

        <div></div>
      </div>
      <div class="" style="display: inline-block; vertical-align: top">
        <div class="p-4 ml-4 s-bg menu-block">
          <h3 style="color: var(--primary-text)">{{ $t('settings.common') }}</h3>
          <a-row style="font-size: 1.2em; text-align: center">
            <a-col v-if="isMain() && isWin()" :span="6">
              <div @click="setTouch" class="btn">
                <!-- <Icon icon="Touch" style="font-size: 2em"></Icon> -->
                <Iconify icon="fluent:hand-draw-16-regular" style="font-size: 2em" />
                <div>{{ $t('settings.touch') }}</div>
              </div>
            </a-col>
            <a-col :span="6">
              <div @click="onOpenLangModal" class="btn">
                <Iconify icon="la:language" style="font-size: 2em" />
                <div>{{ $t('settings.language') }}</div>
              </div>
            </a-col>
            <a-col :span="6">
              <div @click="chooseScreen" class="btn">
                <!-- <Icon icon="touping" style="font-size: 2em"></Icon> -->
                <Iconify icon="majesticons:monitor-line" style="font-size: 2em" />
                <div>{{ $t('settings.chooseScr') }}</div>
              </div>
            </a-col>
            <a-col v-if="simple && !this.isOffline" :span="6">
              <MyAvatar :size="37"></MyAvatar>
            </a-col>
          </a-row>
          <div></div>
        </div>
        <div class="p-4 mt-4 ml-4 s-bg menu-block">
          <h3 style="color: var(--primary-text)">{{ $t('settings.others') }}</h3>
          <a-row style="font-size: 1.2em; text-align: center" :gutter="[10, 10]">
            <a-col v-if="isMain()" :span="6">
              <div @click="editNavigationVisible = true" class="btn">
                <!-- <Icon icon="Pushpin" style="font-size: 2em"></Icon> -->
                <Iconify icon="fluent:tablet-16-regular" style="font-size: 2em" />
                <div>{{ $t('settings.guideBar') }}</div>
              </div>
            </a-col>
            <a-col :span="6">
              <xt-task :modelValue="m04011" @cb="basic">
                <div @click="basic" class="btn">
                  <!-- <Icon icon="shezhi" style="font-size: 2em"></Icon> -->
                  <Iconify icon="fluent:settings-16-regular" style="font-size: 2em" />
                  <div>{{ $t('settings.general') }}</div>
                </div>
              </xt-task>
            </a-col>
            <a-col v-if="isMain()" :span="6">
              <div @click="goApps()" class="btn">
                <Iconify icon="fluent:grid-16-regular" style="font-size: 2em"></Iconify>
                <div>{{ $t('settings.appManage') }}</div>
              </div>
            </a-col>
            <!--              <a-col v-if="isMain()" :span="6">-->
            <!--                <div @click="wizard" class="btn">-->
            <!--                  <Icon icon="jurassic_nav" style="font-size: 2em"></Icon>-->
            <!--                  <Iconify icon="fluent:star-settings-24-regular" style="font-size: 2em" />-->
            <!--                  <div>配置向导</div>-->
            <!--                </div>-->
            <!--              </a-col>-->

            <a-col :span="6">
              <div @click="papersSettings" class="btn">
                <!-- <Icon icon="banner" style="font-size: 2em"></Icon> -->
                <Iconify icon="fluent:image-multiple-16-regular" style="font-size: 2em" />
                <div>{{ $t('settings.wallpaper') }}</div>
              </div>
            </a-col>

            <a-col :span="6">
              <xt-task :modelValue="m03011" @cb="styleVisible = true">
                <div @click="styleVisible = true" class="btn">
                  <!-- <Icon icon="yifu" style="font-size: 2em"></Icon> -->
                  <Iconify icon="fluent:color-24-regular" style="font-size: 2em" />
                  <div>{{ $t('settings.themeColor') }}</div>
                </div>
              </xt-task>
            </a-col>
            <a-col v-if="isMain() && !this.isOffline" :span="6">
              <div @click="invite" class="btn">
                <!-- <Icon icon="tianjiachengyuan" style="font-size: 2em"></Icon> -->
                <Iconify icon="fluent:people-add-16-regular" style="font-size: 2em" />
                <div>邀请</div>
              </div>
            </a-col>
            <a-col v-if="isMain() && !this.isOffline" :span="6">
              <div @click="verify" class="btn">
                <!-- <Icon icon="team" style="font-size: 2em"></Icon> -->
                <Iconify icon="fluent:people-16-regular" style="font-size: 2em" />
                <div>受邀</div>
              </div>
            </a-col>
            <a-col :span="6">
              <div @click="power" class="btn">
                <!-- <Icon icon="tuichu" style="font-size: 2em"></Icon> -->
                <Iconify icon="fluent:power-20-filled" style="font-size: 2em" />
                <div>{{ $t('settings.power') }}</div>
              </div>
            </a-col>
          </a-row>
          <div></div>
        </div>
      </div>
    </div>
  </vue-custom-scrollbar>

  <div class="fixed inset-0 home-blur" style="z-index: 999" v-if="editNavigationVisible">
    <EditNavigation @setQuick="editNavigationVisible = false"></EditNavigation>
  </div>
  <a-drawer :width="500" v-if="styleVisible" v-model:open="styleVisible" placement="right" style="z-index: 9999999">
    <xt-task :modelValue="m03012"></xt-task>
    <XtColor
      v-model:color="bgColor"
      title="{{ $t('settings.theme') }}"
      btnText="{{ $t('btn.recoverThemeColor') }}"
      @onBtnClick="clearBgColor"
    ></XtColor>
    <XtColor
      v-model:color="textColor"
      title="{{ $t('settings.text') }}"
      btnText="{{ $t('btn.recoverTextColor') }}"
      @onBtnClick="clearTextColor"
    ></XtColor>
    <XtColor
      v-model:color="wallpaperColor"
      title="{{ $t('backgroud') }}"
      @onBtnClick="clearWallpaperColor"
      btnText="{{ $t('btn.wallpapperColor') }}"
    ></XtColor>
  </a-drawer>

  <a-modal
    v-model:open="visibleChooseScreen"
    :title="null"
    width="100%"
    :footer="null"
    wrap-class-name="full-modal"
    @ok="
      () => {
        this.visibleChooseScreen = false;
      }
    "
  >
    <div style="zoom: 1.5; font-size: 16px; padding-top: 5em; text-align: center">
      <div style="width: 500px; overflow: visible; display: inline-block">
        <ChooseScreen></ChooseScreen>
      </div>
    </div>
  </a-modal>
  <a-modal
    v-model:open="openLangModal"
    :title="this.$t('chooseLang')"
    width="300px"
    height="300px"
    :okText="this.$t('btn.change')"
    centered
    @ok="handleChangeLang"
  >
    <div>
      <a-flex justify="center">
        <a-row>
          <a-col span="24">
            根据您当前所在位置：{{ location.countryName }}，建议您选择语言{{ location.langName }}
          </a-col>
          <a-col>
            <a-select ref="select" v-model:value="settings.language" style="width: 200px" :options="langOptions">
            </a-select>
          </a-col>
        </a-row>
      </a-flex>
    </div>
  </a-modal>
</template>

<script>
import {
  delBgColor,
  delSecondaryBgColor,
  delTextColor,
  delWallpaperColor,
} from '@components/card/hooks/styleSwitch/delStyle';
import { getBgColor, getTextColor, getWallpaperColor } from '@components/card/hooks/styleSwitch/getStyle';
import {
  setBgColor,
  setSecondaryBgColor,
  setTextColor,
  setWallpaperColor,
} from '@components/card/hooks/styleSwitch/setStyle';
import { setThemeSwitch } from '@components/card/hooks/themeSwitch';
import ChooseScreen from './ChooseScreen.vue';
import { appStore } from '@store';
import { mapWritableState } from 'pinia';
import { Modal } from 'ant-design-vue';
import { mapActions } from 'pinia';
import { codeStore } from '@store/code';
import SecondPanel from '../components/SecondPanel.vue';
import GradeSmallTip from '../components/GradeSmallTip.vue';
import { isMain, isWin } from '@js/common/screenUtils';
import MyAvatar from '../components/small/MyAvatar.vue';
import EditNavigation from '../components/bottomPanel/EditNavigation.vue';
import { taskStore } from '@apps/task/store';
import { offlineStore } from '@js/common/offline';
import { Icon as Iconify } from '@iconify/vue';
import cp from 'child_process';
import { getLangList } from '@table/locale/helper';
import { getUserCountryAndLanguage } from '@table/locale/location';
export default {
  name: 'Setting',
  components: { EditNavigation, MyAvatar, SecondPanel, ChooseScreen, GradeSmallTip, Iconify },
  data() {
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
      openLangModal: false,
      langOptions: [],
      location: {
        countryName: '',
        languageName: '',
      },
    };
  },
  watch: {
    bgColor(newV) {
      if (!newV) return;
      setBgColor(newV);
      setSecondaryBgColor(newV);
    },
    textColor(newV) {
      if (!newV) return;
      setTextColor(newV);
    },
    wallpaperColor(newV) {
      setWallpaperColor(newV);
    },
  },
  mounted() {
    this.bgColor = getBgColor();
    this.textColor = getTextColor();
    this.wallpaperColor = getWallpaperColor();
    this.langOptions = getLangList();
  },
  computed: {
    ...mapWritableState(appStore, ['settings', 'saving', 'simple', 'styles', 'style', 'showWindowController']),
    ...mapWritableState(appStore, ['userInfo']),
    ...mapWritableState(taskStore, ['taskID', 'step']),
    ...mapWritableState(offlineStore, ['isOffline']),

    m03011() {
      return this.taskID === 'M0301' && this.step === 1;
    },
    m03012() {
      return this.taskID === 'M0301' && this.step === 2;
    },
    m04011() {
      return this.taskID === 'M0401' && this.step === 1;
    },
  },
  methods: {
    ...mapActions(codeStore, ['verify', 'create', 'myCode']),
    ...mapActions(offlineStore, ['changeOffline']),
    isMain: isMain,
    isWin,
    goApps() {
      this.$router.push({
        name: 'apps',
      });
    },
    editNavigation() {
      this.editNavigationVisible = true;
    },
    clearBgColor() {
      delBgColor();
      delSecondaryBgColor();
    },
    clearTextColor() {
      delTextColor();
    },
    clearWallpaperColor() {
      delWallpaperColor();
    },
    themeSwitch() {
      setThemeSwitch(this.styles);
    },

    tipSaving() {
      Modal.info({
        content: this.$t('settings.msg.save'),
        centered: true,
      });
    },
    tipSimple() {
      Modal.info({
        content: this.$t('message.teamTip'),
        centered: true,
      });
    },
    tipOffline() {
      Modal.info({
        content: this.$t('message.offlineTip'),
        centered: true,
      });
    },
    power() {
      this.$router.push({ path: '/power' });
    },

    invite() {
      this.$router.push({
        name: 'invite',
      });
    },
    verify() {
      this.$router.push({
        name: 'invite',
        params: {
          tab: 'verify',
        },
      });
    },

    async setTouch() {
      await tsbApi.window.setAlwaysOnTop(false);
      let cp = require('child_process');
      cp.exec('MultiDigiMon.exe -touch', async (err) => {
        await tsbApi.window.setAlwaysOnTop(true);
      });
    },
    async handleChangeLang() {
      this.$i18n.locale = this.settings.language;
      this.openLangModal = false;
    },
    async setPen() {
      await tsbApi.window.setAlwaysOnTop(false);
      let cp = require('child_process');
      cp.exec('MultiDigiMon.exe -pen', async (err) => {
        await tsbApi.window.setAlwaysOnTop(true);
      });
    },
    chooseScreen() {
      this.visibleChooseScreen = true;
    },
    wizard() {
      this.$router.push('/wizard');
    },
    barrage() {
      this.$router.push({
        name: 'barrageSetting',
      });
    },
    papersSettings() {
      this.$router.push({
        name: 'my',
      });
    },
    basic() {
      this.$router.push({
        name: 'common',
      });
    },
    switchBarrage(value) {
      if (value) {
        window.$manager.show();
      } else {
        window.$manager.hidden();
      }
    },
    async onOpenLangModal() {
      const result = await getUserCountryAndLanguage();
      const langName = this.langOptions.find((item) => item.label === location.languageCode);
      console.log('finded:', langName);
      this.location = {
        countryName: result.countryName,
        languageName: langName || 'unknown',
      };
      this.openLangModal = true;
    },
  },
};
</script>

<style scoped lang="scss">
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
