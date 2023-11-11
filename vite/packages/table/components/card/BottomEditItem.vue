<template>
  <div
      class="w-24 h-24 mr-4 option"
      @click="
      () => {
        item.fn();
      }
    "
  >
    <xt-new-icon v-if="item.newIcon" :icon="item.newIcon" size="40"/>
    <Icon v-else-if="item.icon" :icon="item.icon" class="icon"></Icon>
    {{ item.title }}
  </div>
</template>

<script setup>
const props = defineProps({
  item: {},
});
</script>

<style lang="scss" scoped></style>
