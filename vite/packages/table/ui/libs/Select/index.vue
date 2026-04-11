<template>
  <a-select
    style="z-index: 99999999; position: relative"
    :value="modelValue"
    class="no-drag w-full rounded-xl xt-select-inner"
    :size="size"
    @change="onUpdate"
    :dropdown-style="{
      zIndex: 999999999999,
      backgroundColor: 'var(--secondary-bg)',
    }"
  >
    <a-select-option v-for="item in list" :key="String(item.value)" class="no-drag" :value="item.value">
      {{ item.name }}
    </a-select-option>
  </a-select>
</template>

<script setup lang="ts">
defineProps({
  modelValue: {
    default: undefined,
  },
  list: {
    type: Array,
    default: () => [
      { value: '默认排序', name: '默认排序' },
      { value: '下载次数', name: '下载次数' },
      { value: '更新时间', name: '更新时间' },
    ],
  },
  size: {
    type: String,
    default: 'middle',
  },
});

const emit = defineEmits(['update:modelValue']);

function onUpdate(value: unknown) {
  emit('update:modelValue', value);
}
</script>

<style lang="scss" scoped>
:deep(.ant-select-selector) {
  background: var(--secondary-bg) !important;
  border-color: rgba(255, 255, 255, 0.12) !important;
  color: var(--primary-text) !important;
}
:deep(.ant-select-selection-item),
:deep(.ant-select-selection-placeholder) {
  color: var(--primary-text) !important;
}
:deep(.ant-select-arrow) {
  color: var(--secondary-text) !important;
}
</style>
