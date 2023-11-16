<template>
  <Menu :menus="menus" :model="model" :start="menuState" fn="fn" name="name">
    <slot></slot>
  </Menu>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useWidgetStore } from '../card/store.ts'
import Menu from '../../ui/components/Menu/index.vue'

const props = defineProps({
  menus: {},
  model: {
    default: 'contextmenu',
  },
})
const widgetStore = useWidgetStore()

const { rightModel } = storeToRefs(widgetStore)
const menuState = computed(() => {
  return rightModel.value == 'follow'
})
</script>

<style lang="scss" scoped></style>
