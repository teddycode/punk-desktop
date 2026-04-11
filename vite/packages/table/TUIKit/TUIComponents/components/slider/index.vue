<template>
  <div class="slider-box" :class="[open && 'slider-open']" @click="toggle">
    <span class="slider-block"></span>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, watchEffect, toRefs } from 'vue';

export default defineComponent({
  props: {
    open: {
      type: Boolean,
      default: () => false,
    },
  },
  setup(props: any, ctx: any) {
    const data = reactive({
      open: false,
    });

    watchEffect(() => {
      data.open = props.open;
    });

    const toggle = () => {
      data.open = !data.open;
      ctx.emit('change', data.open);
    };

    return {
      ...toRefs(data),
      toggle,
    };
  },
});
</script>

<style lang="scss" scoped>
@use '../../styles/common.scss';
@use '../../styles/icon.scss';
.slider {
  &-box {
    display: flex;
    align-items: center;
    width: 34px;
    height: 20px;
    border-radius: 10px;
    background: #e1e1e3;
  }
  &-open {
    background: #006eff !important;
    justify-content: flex-end;
  }
  &-block {
    display: inline-block;
    width: 16px;
    height: 16px;
    border-radius: 8px;
    margin: 0 2px;
    background: #ffffff;
    border: 0 solid rgba(0, 0, 0, 0.85);
    box-shadow: 0 2px 4px 0 #d1d1d1;
  }
}
</style>
