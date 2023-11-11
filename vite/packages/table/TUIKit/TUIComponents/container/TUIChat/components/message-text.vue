<template>
  <template v-for="(item, index) in data.text" :key="index">
    <span v-if="item.name === 'text'" class="text-box">{{ item.text }}</span>
    <img v-else-if="item.name === 'img'" :src="item.src" class="text-img"/>
  </template>
</template>

<script lang="ts">
import {defineComponent, reactive, toRefs, watchEffect} from 'vue';

export default defineComponent({
  props: {
    data: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props: any, ctx: any) {
    const data = reactive({
      data: {},
    });

    watchEffect(() => {
      data.data = props.data;
    });
    return {
      ...toRefs(data),
    };
  },
});
</script>
<style lang="scss" scoped>
@import url('../../../styles/common.scss');
@import url('../../../styles/icon.scss');

.text-img {
  width: 20px;
  height: 20px;
}

.text-box {
  white-space: pre-wrap;
  font-size: inherit;
  word-break: break-word;
  font-size: 14px;
  /**
  text-size-adjust: none;
  **/
}
</style>
