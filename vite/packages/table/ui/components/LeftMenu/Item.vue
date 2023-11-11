<template>
  <div>
    <!-- <xt-new-icon icon='fluent:full-screen-maximize-16-filled'/> -->
    <!-- antd插槽 -->
    <div
        v-if="item.slot"
        class="xt-bg-2 xt-base-btn"
        style="width: 40px; height: 40px; border-radius: 10px"
    >
      <slot :name="item.slot"></slot>
    </div>
    <!-- 图片 -->
    <!-- :class="{ 'xt-bg-2': !item.noBg }" -->
    <div
        v-else-if="item.img"
        class="xt-base-btn"
        style="width: 40px; height: 40px"
    >
      <img
          :src="item.img"
          :style="[imgSize]"
          style="border-radius: 10px; object-fit: cover"
      />
    </div>
    <!-- icon -->
    <xt-icon
        v-else-if="item.icon"
        :icon="item.icon"
        :type="type"
        radius="10"
        size="20"
        w="40"
    />
    <xt-new-icon
        v-else
        :bgStyle="bg"
        :icon="item.full ? full : item.newIcon"
        :type="newType"
        radius="10"
        size="20"
        w="40"
        @click="itemClick()"
    />
  </div>
</template>

<script setup>
import {computed, ref} from "vue";
import {storeToRefs} from "pinia";
import {appStore} from "../../../store";

const store = appStore();
const {fullScreen} = storeToRefs(store);
const props = defineProps({
  item: {},
  id: {},
  flag: {
    default: false,
  },
  w: {
    default: 20,
  },
  type: {
    default: "default",
  },
  newType: {
    default: "base",
  },
  bg: {
    default: "var(--secondary-bg)",
  },
  full: {},
});

// 图片大小
const imgSize = computed(() => {
  return {
    width: props.w + "px",
    height: props.w + "px",
  };
});

// 全屏控制
const data = ref(false);
const full = computed(() => {
  fullScreen.value = data.value ? true : false;
  return data.value
      ? "fluent:full-screen-minimize-16-filled"
      : "fluent:full-screen-maximize-16-filled";
});
const itemClick = () => {
  if (props.item.full) {
    data.value = !data.value;
  }
};

// const route = useRoute();
// const currentPage = ref(route.path);
// watch(route, (newRoute) => {
//   if ( props.item.full && currentPage !== newRoute.path) data.value = false;
// });
</script>

<style lang="scss" scoped></style>
