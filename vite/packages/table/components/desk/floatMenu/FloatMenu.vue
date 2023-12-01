<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useFreeLayoutStore } from '../freeLayout/store';
import Item from './Item.vue';
// 初始化操作
const freeLayoutStore: any = useFreeLayoutStore();
const { getFreeLayoutState }: any = storeToRefs(freeLayoutStore);

const emits = defineEmits(['scrollbarRedirect']);
const freeLayoutMenu = computed(() => {
  return [
    {
      icon: 'fluent:resize-large-16-regular',
      title: '回到中心点',
      fn: () => {
        emits('scrollbarRedirect');
      },
    },
    {
      icon: 'fluent:sub-grid-20-regular',
      type: getFreeLayoutState.value.line.isAuxLine ? 'theme' : 'default',
      title: getFreeLayoutState.value.line.isAuxLine ? '关闭网格线' : '打开网格线',
      fn: () => {
        getFreeLayoutState.value.line.isAuxLine = !getFreeLayoutState.value.line.isAuxLine;
      },
    },
    {
      icon: 'fluent:timeline-20-regular',
      title: '拖拽结束吸附于网格',
      type: getFreeLayoutState.value.afterDrop ? 'theme' : 'default',
      fn: () => {
        getFreeLayoutState.value.afterDrop = !getFreeLayoutState.value.afterDrop;
      },
    },
  ];
});

const canvasMenu = computed(() => {
  return [
    {
      icon: 'fluent:add-16-regular',
      type: 'default',
      title: '放大画布',
      fn: () => {
        getFreeLayoutState.value.canvas.zoom += 0.1;
      },
    },
    {
      icon: 'fluent:subtract-16-regular',
      title: '缩小画布',
      type: 'default',
      fn: () => {
        getFreeLayoutState.value.canvas.zoom -= 0.1;
      },
    },
    {
      icon: 'fluent:arrow-counterclockwise-20-filled',
      title: '还原画布',
      type: 'default',
      fn: () => {
        getFreeLayoutState.value.canvas.zoom = 1;
      },
    },
  ];
});
</script>

<template>
  <xt-drag
    boundary
    resetPosition
    v-model:y="getFreeLayoutState.system.floatMenu.top"
    v-model:x="getFreeLayoutState.system.floatMenu.left"
    v-if="getFreeLayoutState.system.isFloatMenu"
    :index="20000"
  >
    <div class="select-none cursor-move z-24 xt-modal rounded-xl p-3 no-drag" style="touch-action: none; width: 176px">
      <xt-text type="2">
        编辑桌面
        <template #right>
          <xt-button w="32" h="32" radius="8">
            <xt-new-icon
              icon="fluent:dismiss-16-filled"
              class="text-2"
              size="16"
              style="color: var(--secondary-text) !important"
            />
          </xt-button>
        </template>
      </xt-text>
      <xt-text type="2" class="my-3">自由布局</xt-text>
      <Item :menus="freeLayoutMenu"></Item>
      <div class="my-3">画布缩放</div>
      <Item :menus="canvasMenu"></Item>
      <div>👋</div>
    </div>
  </xt-drag>
</template>
