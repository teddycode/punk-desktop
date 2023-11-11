<template>
  <div class="message-merger">
    <div :data-value="data.message" class="merger-box">
      <p class="merger-title">{{ data.title }}</p>
      <p v-for="(item, index) in data.abstractList" :key="index" class="merger-text">
        {{ item }}
      </p>
    </div>
    <span class="merger-label"> 聊天记录</span>
  </div>
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

.message-merger {
  display: flex;
  flex-direction: column;

  .merger-label {
    border-top: 1px solid #dddddd;
    margin-top: 10px;
    padding-top: 5px;
  }
}
</style>
