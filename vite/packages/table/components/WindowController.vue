<template>
  <div style="overflow: hidden">
    <div :class="{ active: alwaysTop }" class="flex pointer btn-top-active items-center no-drag" @click="fixed">
      <Icon icon="Pushpin" style="font-size: 1.2em; zoom: 1.1"></Icon>
    </div>
    <div class="flex items-center btn-top-active pointer no-drag" @click="minimize">
      <MinusOutlined style="font-size: 1.2em"></MinusOutlined>
    </div>

    <div class="flex pointer btn-top-active items-center no-drag" @click="maximize">
      <BorderOutlined style="font-size: 1.2em; zoom: 0.9"></BorderOutlined>
    </div>
    <div class="flex btn-top-active pointer items-center no-drag" @click="close">
      <Icon icon="guanbi" style="font-size: 1.2em"></Icon>
    </div>
  </div>
</template>

<script>
import { getSign, isMain } from '@js/common/screenUtils';

import { BorderOutlined, MinusOutlined } from '@ant-design/icons-vue';
import { appStore } from '@store';
import { notification } from 'ant-design-vue';

export default {
  name: 'WindowController',
  components: {
    MinusOutlined,
    BorderOutlined,
  },
  data() {
    return {
      full: false,
      alwaysTop: false,
    };
  },
  async mounted() {
    this.alwaysTop = await tsbApi.window.isAlwaysOnTop();
  },
  methods: {
    // 关闭按钮
    close() {
      if (isMain()) {
        ipc.send('exitTable');
      } else {
        ipc.send('closeScreen', { fullDomain: getSign() });
      }
    },
    // 窗口放大
    async maximize() {
      if (this.full) {
        tsbApi.window.setFullScreen(false);
        tsbApi.window.maximize();
        this.full = false;
      } else {
        tsbApi.window.setFullScreen(true);
        this.full = true;
      }
    },
    // 关闭窗口放大
    minimize() {
      tsbApi.window.minimize();
    },
    // 固定
    fixed() {
      this.alwaysTop = !this.alwaysTop;
      tsbApi.window.setAlwaysOnTop(this.alwaysTop);
    },
  },
};
</script>

<style lang="scss" scoped>
.pointer {
  // background: var(--primary-bg) !important;
  & svg {
    color: var(--primary-text) !important;
  }
}

.anticon {
  color: var(--primary-text) !important;
}

.btn-top-active {
  text-align: center;
  width: 55px;
  display: inline-block;
  padding: 8px;
  line-height: 20px;
  // background: var(--active-bg) ;

  &:hover {
    background: var(--active-bg) !important;
  }
}
</style>
