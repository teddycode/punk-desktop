<template>
  <a-config-provider :component-size="modulesSize" :prefixCls="themes ? 'custom-dark' : 'ant'" :locale="locale">
    <a-spin :spinning="loading" :delay="500" tip="飞速加载中...">
      <div class="common-layout">
        <a-layout>
          <a-layout-header style="background: #fff; padding: 0">
            <layoutHeader :style="fixedTop ? 'position: fixed;zIndex:10;width:100%;' : ''"> </layoutHeader>
          </a-layout-header>
          <a-layout>
            <a-layout-sider v-if="isMenu">
              <layoutAside :style="fixedTop ? 'position: fixed;width: 200px;' : ''"></layoutAside>
            </a-layout-sider>
            <a-layout-content>
              <!--              <pathBar v-if="isPathbar" :style="fixedTop?{position:'fixed',zIndex: 10}:null"></pathBar>-->
              <breadcrumb
                v-if="isBreadcrumb"
                :style="
                  fixedTop
                    ? { position: 'fixed', zIndex: 10, width: '100%', marginTop: isPathbar ? '40px' : '0' }
                    : null
                "
              ></breadcrumb>
              <div class="content background" :style="maxHeidht">
                <router-view></router-view>
              </div>
            </a-layout-content>
          </a-layout>
        </a-layout>
        <baseInfo></baseInfo>
      </div>
    </a-spin>
  </a-config-provider>
</template>

<script setup lang="ts">
import layoutHeader from './components/layout-header.vue';
import layoutAside from './components/layout-Aside.vue';
import breadcrumb from './components/breadcrumb.vue';
import baseInfo from './components/baseInfo.vue';
import { computed, nextTick, provide, ref, watch } from 'vue';
import { useLayoutStore } from '@store/baseSettings.ts'; // 导入你的 Pinia store
import { useRouter } from 'vue-router';
import { ConfigProvider } from 'ant-design-vue';
import enUS from 'ant-design-vue/es/locale/en_US';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import dayjs from 'dayjs';

const router = useRouter();
const store = useLayoutStore(); // 使用 Pinia store

// 页面刷新
const loading = ref(false);
const isRouterAlive = ref(true);
const reload = () => {
  loading.value = true;
  isRouterAlive.value = false;
  nextTick(() => {
    isRouterAlive.value = true;
    loading.value = false;
  });
};
provide('reload', reload);

const isBreadcrumb = computed(() => store.isBreadcrumb);
const isPathbar = computed(() => store.isPathbar);
const fixedTop = computed(() => store.fixedTop);
const isMenu = computed(() => store.isMenu);
const maxHeidht = computed(() => {
  let height = 80;
  height -= isPathbar.value ? 0 : 45;
  height -= isBreadcrumb.value ? 0 : 25;
  return `margin:${fixedTop.value ? height : 10}px 10px 10px 10px;`;
});

// element-plus 国际化
const locale = computed(() => {
  let a = store.locales == 'zh-cn' ? zhCN : enUS;
  dayjs.locale(a);
  return a;
});
const modulesSize = computed(() => store.modulesSize);
const themes = computed(() => store.themes);
const themesColor = computed(() => store.themesColor);
ConfigProvider.config({
  theme: themesColor.value,
});
//  页面切换效果 左---右
const tagView = computed(() => store.tagView);
const transitionNames = ref('slide-right');
watch(
  () => router.currentRoute.value,
  (to, from) => {
    if (tagView.value.some((x) => x.path === from.path)) {
      if (tagView.value.findIndex((x) => x.path === to.path) < tagView.value.findIndex((x) => x.path === from.path)) {
        transitionNames.value = 'slide-left';
      } else {
        transitionNames.value = 'slide-right';
      }
    } else {
      transitionNames.value = 'slide-right';
    }
  },
);
</script>
<style scoped>
.common-layout >>> .ant-layout-sider-has-trigger {
  padding-bottom: 0 !important;
}
</style>
<style scoped>
.content {
  /* background:var(--ran-content-bg); */
  position: relative; /* 确保子元素的定位是相对于该容器的 */
  overflow: hidden; /* 隐藏超出容器范围的子元素 */
  background: #fff;
  box-sizing: border-box;
  min-height: calc(100vh - 80px - 64px - 12px);
  box-sizing: border-box;
  padding: 10px;
}

.background {
  background: #fff;
  border-color: #ccc;
}

.layoutheader {
  background: #12a3f5;
  padding: 0;
  margin: 0;
}

.homeMainBox {
  background: #f0f1f5;
  width: 100%;
  overflow: hidden;
}

.homeMain {
  background: var(--ran-content-border);
  width: 100%;
  overflow-y: scroll;
  overflow-y: overlay;
  box-sizing: border-box;
}

.layout-body {
  margin: 80px 10px 10px 10px;
}

.slide_left-enter-active,
.slide_left-leave-active,
.slide_right-enter-active,
.slide_right-leave-active {
  transition: all 0.3s;
  position: absolute !important;
  background-color: white;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1;
}

.slide_left-enter-from,
.slide_right-leave-to {
  opacity: 1;
  transform: translateX(100%);
}

.slide_right-enter-from,
.slide_left-leave-to {
  opacity: 1;
  transform: translateX(-100%);
}

.slide_left-leave-to,
.slide_right-leave-to {
  opacity: 0.3;
}
</style>
