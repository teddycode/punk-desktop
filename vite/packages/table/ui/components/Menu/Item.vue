<template>
  <div
      :class="{ item: isBg }"
      class="flex w-full cursor-pointer items-center h-10"
  >
    <xt-base-icon
        v-if="data?.icon"
        :icon="data.icon"
        :style="{ 'font-size': '20px' }"
        class="ml-3"
    />
    <xt-new-icon
        v-else-if="data?.newIcon"
        :icon="data.newIcon"
        class="ml-3"
        size="20"
    />
    <div
        :style="{
        color: data.color ? data.color : color,
      }"
        class="truncate w-full flex-1 pl-3 text-base"
    >

      {{ data[`${name}`] }}
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  data: {},
  isBg: {
    default: false,
  },
  color: {
    default: "var(--primary-text)",
  },
  name: {
    default: "name",
  },
});
</script>

<style lang="scss" scoped>
.item {
  &:hover {
    background: var(--active-secondary-bg);
    border-radius: 8px;
  }
}
</style>
