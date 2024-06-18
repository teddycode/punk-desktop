<template>
  <div class="flex items-center justify-between w-full top-panel drag" style="width: calc(100%)">
    <div class="flex flex-row items-center no-drag" @contextmenu.stop="toggleAppStats">
      <a-tooltip v-if="enable" title="剪切板监听中，点击进入应用，右键查看全部">
        <div class="mr-2 cursor-pointer no-drag" @click="enterClipboard">
          <icon icon="xiangmu" style="font-size: 24px; vertical-align: text-top"></icon>
        </div>
      </a-tooltip>

      <div
        v-if="runningGame.appid"
        class="pointer no-drag text-more"
        style="display: inline-block"
        @click="enterGameDesk(runningGame.appid)"
      >
        <a-avatar :size="22" :src="getClientIcon(this.runningGame.appid, this.runningGame.clientIcon)"></a-avatar>
        {{ runningGame.chineseName }}
      </div>
      <a-tooltip
        v-else-if="status.music.playing && status.music.title && status.music"
        title="音乐播放中，点击进入应用，右键查看全部"
      >
        <div
          class="pointer no-drag text-more"
          style="display: inline-block; color: var(--primary-text)"
          @click="enterMusic"
        >
          <a-avatar :size="22" :src="status.music.cover" style="margin-right: 0.5em"></a-avatar>
          {{ status.music.title }} {{ status.music.singer }}
        </div>
      </a-tooltip>
      <!--  当前钱包   -->
      <!--      <TopCourier />-->
    </div>
    <div class="flex max-search" hidden="">
      <div
        class="inline-block input-box no-drag pointer"
        hidden=""
        style="background: var(--primary-bg); color: var(--secondary-text); width: 320px"
        @click="openGlobalSearch"
      >
        <Icon icon="sousuo"></Icon>
      </div>
    </div>
    <div class="flex items-end justify-end flex-1 right-area align-items-end xt-text" style="position: relative">
      <div class="top-state">
        <!-- 番茄钟 -->
        <TopTomato />
        <TopClockTimer v-if="topClockTimerVisible" />
      </div>

      <div
        v-if="status.show && hasChat"
        class="flex items-center no-drag pointer"
        style="color: var(--primary-text)"
        @click="messageAlert"
      >
        <div
          class="flex items-center justify-center notification"
          style="width: 20px; height: 20px; position: relative"
        >
          <img class="object-cover w-full h-full" src="/icons/logo128.png" />
          <div class="new-message-tag"></div>
        </div>
        <div class="pl-1 primary-title pointer" style="color: var(--primary-text)">新消息</div>
        <a-divider style="height: 18px; width: 1px; background: var(--primary-text); opacity: 0.2" type="vertical" />
      </div>

      <div
        v-else
        class="flex items-center justify-center pr-3 no-drag pointer"
        style="color: var(--primary-text)"
        @click="messageAlert"
      >
        <Icon icon="notification" style="font-size: 1.5em"></Icon>
      </div>

      <div
        class="mr-2"
        style="
          text-align: right;
          display: flex;
          flex-direction: row;
          align-items: flex-end;
          justify-content: flex-end;
          color: var(--primary-text);
        "
      >
        <div v-if="!loading" class="truncate no-drag">
          <span v-if="settings.tipLock && this.showLockTip" hidden style="font-size: 0.8em; margin-right: 1em">
            <!-- {{ lockTimeoutDisplay }}后锁屏 -->
          </span>
          <span v-if="appSettings.showTopbarTime">
            {{ dateTime.month }}/{{ dateTime.day }} {{ dateTime.hours }}:{{ dateTime.minutes }}
            {{ dateTime.week }}
          </span>

          <span v-if="hasWeather && city.now && appSettings.showTopbarWeather">
            <i :class="'qi-' + city.now.icon + '-fill'" style=""></i> {{ city.now.temp }}℃
          </span>
        </div>
      </div>
    </div>
    <div
      v-if="showWindowController"
      id="windowController"
      class="flex rounded-bl-lg s-item s-bg btn-container"
      style="background: var(--primary-bg) !important; margin-top: -11px; overflow: hidden"
    >
      <WindowController></WindowController>
    </div>
  </div>

  <a-drawer
    v-model:open="messageDrawer"
    :bodyStyle="{ padding: '12px 12px 12px 0 ', overflow: 'hidden !important' }"
    :closable="false"
    :width="500"
    placement="right"
    style="z-index: 1000"
    @closeMessage="messageDrawer = false"
  >
    <MessagePopup @closeMessage="messageDrawer = false"></MessagePopup>
  </a-drawer>
  <a-drawer v-model:open="appStats" placement="left">
    <div class="app-stats">
      <div v-if="enable" class="cursor-pointer app" @click="enterClipboard">
        <a-row>
          <a-col :span="5">
            <icon icon="xiangmu" style="font-size: 48px; vertical-align: text-top"></icon>
          </a-col>
          <a-col>
            <div class="font-bold app-title">剪切板</div>
            <div class="app-des xt-text-2">剪切板监听中…</div>
          </a-col>
        </a-row>
      </div>
      <div v-if="status.music.playing && status.music.title && status.music" class="app" @click="enterMusic">
        <a-row>
          <a-col :span="5">
            <a-avatar :size="48" :src="status.music.cover" style="margin-right: 0.5em"></a-avatar>
          </a-col>
          <a-col>
            <div class="font-bold app-title">网易云音乐</div>
            <div class="app-des xt-text-2">{{ status.music.title }} {{ status.music.singer }}</div>
          </a-col>
        </a-row>
      </div>
    </div>
  </a-drawer>
</template>

<script>
import { countDownStore } from '@store/countDown';
import { getDateTime } from '../../../src/util/dateTime';
import { appStore } from '@store';
import { cardStore } from '@store/card';
import { topClockSettingStore } from '@store/topClockSetting';
import { mapActions, mapState, mapWritableState } from 'pinia';
import { paperStore } from '@store/paper';
import { weatherStore } from '@store/weather';
import { isMain } from '@js/common/screenUtils';
import { timerStore } from '@store/timer';
import WindowController from './WindowController.vue';
import MessagePopup from '../page/notice/noticeIndex.vue';
import { steamUserStore } from '@store/steamUser';
import { getClientIcon, getCover, getIcon } from '@js/common/game';
import { clipboardStore } from '@apps/clipboard/store';
import { noticeStore } from '@store/notice';
import TopTomato from '../../table/apps/tomato/widget/TopTomato.vue';
import TopClockTimer from './widgets/TopClockTimer.vue';
import TopCourier from './widgets/courier/TopCourier.vue';

export default {
  name: 'TopPanel',
  components: {
    WindowController,
    MessagePopup,
    TopTomato,
    TopCourier,
    TopClockTimer,
  },
  data() {
    return {
      loading: true,
      dateTime: {},
      timer: null,
      lockTimer: null,
      showLockTip: false,
      messageDrawer: false,
      appStats: false,
      topClockTimerVisible: false,
    };
  },
  computed: {
    ...mapWritableState(countDownStore, ['countDowndate', 'countDowntime']),
    ...mapWritableState(cardStore, [
      'countdownDay',
      'appDate',
      'clockEvent',
      'filterClockEvent',
      'clockTag',
      'chooseType',
    ]),
    ...mapWritableState(appStore, ['status', 'showWindowController']),
    ...mapWritableState(appStore, {
      appSettings: 'settings',
    }),
    ...mapState(weatherStore, ['cities']),
    ...mapWritableState(paperStore, ['settings']),
    ...mapWritableState(timerStore, ['lockTimeout']),
    ...mapWritableState(steamUserStore, ['runningGame']),
    ...mapState(clipboardStore, ['enable']),
    ...mapState(noticeStore, ['noticeSettings']),
    ...mapWritableState(topClockSettingStore, ['checkTopClock']),
    isMain,
    lockTimeoutDisplay() {
      // if(this.lockTimeout>=60){
      //   return ((this.lockTimeout/60).toFixed(0)-1)+'分'+this.lockTimeout % 60+'秒'
      // }else{
      //   return this.lockTimeout+'秒'
      // }
      function secTotime(s) {
        var t = '';
        if (s > -1) {
          var hour = Math.floor(s / 3600);
          var min = Math.floor(s / 60) % 60;
          var sec = s % 60;
          if (hour === 0) t = '';
          else if (hour < 10) {
            t = '0' + hour + '小时';
          } else {
            t = hour + '小时';
          }
          if (min < 10) {
            t += '0';
          }
          t += min + '分';
          if (sec < 10) {
            t += '0';
          }
          t += sec.toFixed(0) + '秒';
        }
        return t;
      }

      return secTotime(this.lockTimeout);
    },
    city() {
      if (this.cities[0]) {
        return this.cities[0];
      } else {
        return {};
      }
    },
    hasWeather() {
      return this.cities.length > 0;
    },

    hasChat() {
      return this.$route.path !== '/chat';
    },
  },
  async mounted() {
    window.onblur = () => {
      this.setLockTimer();
    };
    window.onfocus = () => {
      this.clearLockTimer();
    };
    this.loading = false;
    if (!this.timer) {
      setInterval(this.getTime, 1000);
    }
    this.filterClock(this.clockTag);
  },
  created() {
    this.getTime();
  },
  methods: {
    getClientIcon,
    getIcon,
    getCover,
    ...mapActions(cardStore, ['setAppDate', 'filterClock']),
    ...mapActions(noticeStore, ['loadNoticeDB']),
    ...mapActions(appStore, ['hideNoticeEntry']),
    clearLockTimer() {
      if (this.lockTimer) {
        clearInterval(this.lockTimer);
        this.lockTimer = null;
        this.lockTimeout = this.settings.lockTimeout;
        this.showLockTip = false;
      }
    },
    toggleAppStats() {
      this.appStats = !this.appStats;
    },
    enterClipboard() {
      this.$router.push({
        name: 'clipboard',
      });
    },
    setLockTimer() {
      if (this.settings.enable) {
        //只有启用了锁屏才会触发这个效果
        if (this.lockTimer) {
          this.lockTimeout = (this.settings.lockTimeout || 300) - 1;
        } else {
          this.lockTimeout = (this.settings.lockTimeout || 300) - 1;
          this.showLockTip = true;
          this.lockTimer = setInterval(() => {
            this.lockTimeout--;
            if (this.lockTimeout === 0) {
              this.clearLockTimer();
              this.$router.push('/lock');
            }
          }, 1000);
        }
      }
    },
    openGlobalSearch() {
      ipc.send('openGlobalSearch');
    },
    getTime() {
      this.dateTime = getDateTime();
      this.setAppDate(this.dateTime);
    },
    enterMusic() {
      this.$router.push({
        name: 'music',
      });
    },
    enterGameDesk(appid) {
      this.$router.push({
        name: 'gameIndex',
        params: {
          appid: appid,
        },
      });
    },
    messageAlert() {
      this.messageDrawer = true;
      this.$nextTick(async () => {
        await this.loadNoticeDB();
      });
      this.hideNoticeEntry();
    },
    topClockTimerVisibleSetting() {
      this.filterClock(this.clockTag, this.chooseType);
      if (this.checkTopClock === true) {
        if (this.filterClockEvent.length > 0) {
          // console.log(this.filterClockEvent.length);
          this.topClockTimerVisible = true;
        } else if (this.countDowntime.seconds !== undefined) {
          // console.log(this.countDowndate);
          this.topClockTimerVisible = true;
        } else {
          // console.log(this.countDowndate,this.clockEvent);
          this.topClockTimerVisible = false;
        }
      } else {
        this.topClockTimerVisible = false;
      }
      // console.log(this.clockTag);
    },
  },
  beforeUpdate() {
    this.topClockTimerVisibleSetting();
  },
};
</script>

<style lang="scss" scoped>
.top-panel {
  padding: 0.8em 0 0 0.8em;
  display: flex;
}

.input-box {
  height: 2em;
  border-radius: 100px;
  border: 1px solid #c4c4c4;
}

.new-message {
  position: fixed;
  top: 11px;
  left: 71.5%;
}

.primary-title {
  font-size: 14px;
  font-weight: 500;
}

.max-search {
  width: 320px;
}

@media screen and (max-width: 840px) {
  .max-search {
    width: 60px !important;
  }
}

@media screen and (min-width: 1050px) {
  .max-search {
    width: 320px !important;
  }
}

.app-stats {
  .app {
    background: var(--secondary-bg);
    padding: 20px;
    border-radius: 10px;
    font-size: 16px;
    margin-bottom: 10px;
    cursor: pointer;

    &:hover {
      opacity: 0.9;
    }
  }
}

.new-message-tag::after {
  content: '';
  display: block;
  width: 7px;
  height: 7px;
  background-color: var(--error);
  border-radius: 50%;
  position: absolute;
  top: 0px;
  right: 0px;
}

.notification {
  //禁用闪烁特效，减少gpu占用
  //animation: blink 1s infinite;
  //
  //@keyframes blink {
  //  0% {
  //    opacity: 0;
  //  }
  //
  //  50% {
  //    opacity: 1;
  //  }
  //
  //  100% {
  //    opacity: 0;
  //  }
  //}
}

.top-state {
  display: flex;
  // position: relative;
}

.right-area {
  display: flex;
  align-items: center;
  height: 25px;
}
</style>
