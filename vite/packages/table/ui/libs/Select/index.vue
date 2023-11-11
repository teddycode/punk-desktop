<template>
  <a-select
      v-model:value="data"
      :dropdownStyle="{
      'z-index': 999999999999,
      backgroundColor: 'var(--secondary-bg)',
    }"
      class="no-drag w-full rounded-xl"
      size="large"
      style="z-index: 99999999; position: relative"
      @change="handleChange"
  >
    <a-select-option v-for="item in list" :value="item.value" class="no-drag"
    >{{ item.name }}
    </a-select-option>
  </a-select>
</template>

<script setup>
import {reactive, watch} from "vue";

const props = defineProps({
  modelValue: {
    default: "默认排序",
  },
  list: {
    default: () => {
      return [
        {value: "默认排序", name: "默认排序"},
        {value: "下载次数", name: "下载次数"},
        {value: "更新时间", name: "更新时间"},
      ];
    },
  },
});

let data = reactive(props.modelValue);
const emits = defineEmits(["update:modelValue"]);

const handleChange = (value) => {
  emits("update:modelValue", value);
};

watch(
    () => props.modelValue,
    (newV) => {
      // data = newV;
      data = newV;
    }
);
</script>

<style lang="scss" scoped></style>
