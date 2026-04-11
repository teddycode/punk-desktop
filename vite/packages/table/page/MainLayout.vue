<template>
  <div
    class="main-layout-root"
    :class="{ 'punk-claw-mode': punkClawOpen }"
    style="
      display: flex;
      flex-direction: column;
      height: 100vh;
      flex-wrap: nowrap;
      align-content: stretch;
      align-items: stretch;
    "
  >
    <PunkClaw v-show="punkClawOpen" />
    <div style="height: auto; flex: 0">
      <!--顶部状态栏      -->
      <TopPanel v-if="!fullScreen && !punkClawOpen"></TopPanel>
    </div>
    <div
      :class="{ 'mt-3': !fullScreen && !punkClawOpen }"
      :style="{ margin: fullScreen ? 0 : '-3px', padding: fullScreen ? 0 : '8px' }"
      style="display: flex; flex-grow: 1; flex-shrink: 1; flex-basis: fit-content; overflow: hidden; height: 100%"
    >
      <div
        v-if="!fullScreen && !punkClawOpen && navigationToggle[0]"
        style="display: flex; align-content: center; align-items: center; height: 100%"
      >
        <!--左侧栏区域        -->
        <SidePanel
          :delNavList="removeSideNavigationList"
          :otherNavList1="rightNavigationList"
          :otherNavList2="footNavigationList"
          :otherSwitch1="navigationToggle[1]"
          :otherSwitch2="navigationToggle[2]"
          :sideNavigationList="sideNavigationList"
          :sortNavigationList="sortSideNavigationList"
          sortId="left"
          @getDelIcon="getDelIcon"
        ></SidePanel>
      </div>
      <div
        class="main-layout-router-host"
        :class="{ 'main-layout-router-host--preview': punkClawOpen }"
        :style="{ margin: fullScreen ? 0 : '-8px', padding: fullScreen ? 0 : '8px' }"
        style="
          flex-shrink: 1;
          flex-grow: 1;
          align-items: center;
          align-content: center;
          flex-direction: column;
          position: relative;
          overflow-x: hidden;
          overflow-y: auto;
        "
      >
        <!-- 子内容区域        -->
        <!--        一级页面模板 -->
        <keep-alive>
          <router-view></router-view>
        </keep-alive>
        <!-- 删除区域 -->
        <div v-show="delZone" id="delIcon2" class="del-icon">拖到此处删除图标</div>
      </div>
      <Transition name="bounce">
        <div
          v-if="teamVisible && !fullScreen && !punkClawOpen"
          class="h-100"
          style="
            height: auto;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 120;
          "
        >
          <TeamPanel></TeamPanel>
        </div>
      </Transition>
      <div v-if="!fullScreen && !punkClawOpen && navigationToggle[1]" style="display: flex; align-content: center; align-items: center">
        <!--右侧栏区域        -->
        <SidePanel
          :delNavList="removeRightNavigationList"
          :otherNavList1="leftNavigationList"
          :otherNavList2="footNavigationList"
          :otherSwitch1="navigationToggle[0]"
          :otherSwitch2="navigationToggle[2]"
          :sideNavigationList="rightNavigationList"
          :sortNavigationList="sortRightNavigationList"
          sortId="right"
          @getDelIcon="getDelIcon"
        ></SidePanel>
      </div>
    </div>
    <div style="flex: 0">
      <!-- 底部任务栏 -->
      <BottomPanel v-if="!fullScreen" :delZone="delZone" @getDelIcon="getDelIcon"></BottomPanel>
    </div>
  </div>
</template>

<script>
import SidePanel from '../components/SidePanel.vue';
import TopPanel from '../components/TopPanel.vue';
import BottomPanel from '../components/BottomPanel.vue';
import { mapActions, mapWritableState } from 'pinia';
import { appStore } from '@store';
import TeamPanel from '../components/team/TeamPanel.vue';
import { teamStore } from '@store/team';
import { isMain } from '@js/common/screenUtils';
import { navStore } from '@store/nav';
import { agentStore } from '@store/agent';
import PunkClaw from './core/PunkClaw/PunkClaw.vue';

export default {
  name: 'MainLayout',
  components: { TeamPanel, BottomPanel, TopPanel, SidePanel, PunkClaw },
  mounted() {
    this.$router.afterEach((to, from) => {
      this.routeUpdateTime = Date.now();
      this.schedulePunkClawAutoOpen();
    });
    this.schedulePunkClawAutoOpen();
    window.addEventListener('keydown', this.onPunkClawHotkey);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.onPunkClawHotkey);
  },
  computed: {
    ...mapWritableState(agentStore, ['punkClawOpen']),
    ...mapWritableState(appStore, ['routeUpdateTime', 'fullScreen', 'settings', 'init']),
    ...mapWritableState(teamStore, ['teamVisible']),
    ...mapWritableState(navStore, [
      'sideNavigationList',
      'leftNavigationList',
      'rightNavigationList',
      'navigationToggle',
      'footNavigationList',
    ]),
    isMain,
  },
  data() {
    return {
      scrollbarSettings: {
        useBothWheelAxes: true,
        swipeEasing: true,
        suppressScrollY: true,
        suppressScrollX: false,
        wheelPropagation: true,
      },
      delZone: false,
    };
  },
  methods: {
    marginLeft() {
      return marginLeft;
    },
    ...mapActions(navStore, [
      'sortSideNavigationList',
      'removeSideNavigationList',
      'sortRightNavigationList',
      'removeRightNavigationList',
    ]),
    getDelIcon(val) {
      this.delZone = val;
    },
    schedulePunkClawAutoOpen() {
      const store = agentStore();
      if (!store.consumeDesktopAutoOpen()) return;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!['splash', 'lock', 'power'].includes(String(this.$route?.name || ''))) {
            store.setPunkClawOpen(true);
          }
        });
      });
    },
    onPunkClawHotkey(e) {
      if (e.ctrlKey && (e.key === 'g' || e.key === 'G') && !e.repeat) {
        e.preventDefault();
        agentStore().togglePunkClaw();
      }
      if (e.key === 'Escape' && agentStore().punkClawOpen) {
        agentStore().setPunkClawOpen(false);
      }
    },
  },
};
</script>

<style>
.bounce-enter-active {
  animation: bounce-in 0.5s;
}

.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}

@keyframes bounce-in {
  0% {
    transform: scale(0);
  }

  50% {
    transform: scale(1.25);
  }

  100% {
    transform: scale(1);
  }
}
</style>
<style lang="scss" scoped>
.main-layout-root.punk-claw-mode {
  position: relative;
  --punk-claw-ctx-width: 260px;
  --punk-claw-cmd-width: 328px;
  --punk-claw-dash-height: 52px;
  --punk-claw-log-height: 108px;
  --punk-claw-preview-gap: 12px;
  --punk-claw-preview-scale: 0.74;
  --punk-claw-preview-center-x: calc((100vw + var(--punk-claw-ctx-width) - var(--punk-claw-cmd-width)) / 2);
  --punk-claw-preview-center-y: calc((100vh + var(--punk-claw-dash-height) - var(--punk-claw-log-height)) / 2);
  --punk-claw-preview-width: calc(
    (100vw - var(--punk-claw-ctx-width) - var(--punk-claw-cmd-width) - (var(--punk-claw-preview-gap) * 2)) /
      var(--punk-claw-preview-scale)
  );
  --punk-claw-preview-height: calc(
    (100vh - var(--punk-claw-dash-height) - var(--punk-claw-log-height) - (var(--punk-claw-preview-gap) * 2)) /
      var(--punk-claw-preview-scale)
  );
}
.main-layout-router-host--preview {
  position: fixed !important;
  left: var(--punk-claw-preview-center-x) !important;
  top: var(--punk-claw-preview-center-y) !important;
  transform: translate(-50%, -50%) scale(var(--punk-claw-preview-scale)) !important;
  width: var(--punk-claw-preview-width) !important;
  height: var(--punk-claw-preview-height) !important;
  max-height: var(--punk-claw-preview-height) !important;
  /* 低于 PunkClaw 覆盖层，中央留空区域可穿透点击预览；侧栏/顶栏/日志在驾驶舱内盖住预览边缘 */
  z-index: 480 !important;
  margin: 0 !important;
  padding: 8px !important;
  border-radius: 14px !important;
  overflow: hidden !important;
  box-shadow: 0 8px 48px rgba(0, 200, 255, 0.18) !important;
  border: 1px solid rgba(0, 200, 255, 0.25) !important;
  transition:
    transform 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.35s ease;
  background: var(--primary-bg, #0d1117);
}

@media (max-width: 1600px) {
  .main-layout-root.punk-claw-mode {
    --punk-claw-preview-scale: 0.7;
  }
}

@media (max-width: 1366px) {
  .main-layout-root.punk-claw-mode {
    --punk-claw-preview-gap: 10px;
    --punk-claw-preview-scale: 0.64;
  }
}

@media (max-width: 1200px) {
  .main-layout-root.punk-claw-mode {
    --punk-claw-preview-gap: 8px;
    --punk-claw-preview-scale: 0.58;
  }
}

.del-icon {
  width: 100%;
  height: 100%;
  // opacity: 0.5;
  background: var(--secondary-bg);
  backdrop-filter: blur(8px);
  border: 1px dashed rgba(255, 255, 255, 0.4);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: var(--primary-text);
  font-weight: 500;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 9;
}
</style>
