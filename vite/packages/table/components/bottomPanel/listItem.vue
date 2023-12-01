<template>
  <div class="flex flex-row items-center w-full h-16 p-3 mb-2 pointer">
    <div
      v-if="item.type === 'systemApp'"
      class="flex items-center justify-center w-10 h-10 rounded-lg xt-bg xt-text"
      style="background: rgb(80, 80, 80)"
    >
      <navIcon :icon="item.icon" class="w-10 h-10" style="font-size: 24px"></navIcon>
    </div>
    <a-avatar v-else :size="40" :src="renderIcon(item.icon)" shape="square"></a-avatar>

    <div class="flex flex-col items-start w-10/12 m-3">
      <div class="font-medium xt-text">{{ item.name }}</div>
      <div v-if="item.summary !== ''" class="text-xs text-left text-more xt-text" style="width: calc(100%)">
        {{ item.summary }}
      </div>
    </div>
  </div>
</template>

<script>
import { Icon as navIcon } from '@iconify/vue';
import { renderIcon } from '../../js/common/common';

export default {
  name: 'listItem',
  props: {
    item: {
      type: Object,
      default: () => {},
    },
  },
  components: {
    navIcon,
  },
  methods: {
    renderIcon,
  },
};
</script>

<style scoped></style>
