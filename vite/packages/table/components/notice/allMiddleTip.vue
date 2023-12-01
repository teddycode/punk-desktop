<template>
  <div class="flex justify-between mb-3" style="color: var(--primary-text)">
    <div class="flex items-center">
      <div class="flex items-center justify-center" style="width: 32px; height: 32px">
        <img alt="" class="w-full h-full" src="/icons/logo128.png" />
      </div>
      <span class="pl-2 font-400" style="color: var(--primary-text)">系统</span>
      <div
        v-if="list.length !== 0"
        class="font-14 w-6 h-6 rounded-md ml-2 flex items-center justify-center"
        style="color: var(--active-bg); background: var(--active-secondary-bg)"
      >
        {{ list.length }}
      </div>
    </div>

    <NoticeDropDown></NoticeDropDown>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import NoticeDropDown from './noticeDropDown.vue';

export default defineComponent({
  props: ['list'],
  components: { NoticeDropDown },
});
</script>

<style lang="scss" scoped></style>
