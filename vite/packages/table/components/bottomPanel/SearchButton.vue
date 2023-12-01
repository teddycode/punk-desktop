<!--
 * @Author: teddycode 1055334354@qq.com
 * @Date: 2023-11-08 15:40:41
 * @LastEditors: teddycode 1055334354@qq.com
 * @LastEditTime: 2023-11-08 19:08:59
 * @Description:
 *
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved.
-->
<script lang="ts">
import { defineComponent } from 'vue';
import Emoji from '../comp/Emoji.vue';

export default defineComponent({
  name: 'SearchButton',
  components: { Emoji },
  methods: {
    openSearch() {
      ipc.send('openGlobalSearch');
    },
  },
});
</script>

<template>
  <a-tooltip title="全局搜索">
    <div style="padding: 0.6em !important; position: relative" @click.stop="openSearch">
      <emoji icon="search" style="width: 52px; height: 52px"></emoji>
    </div>
  </a-tooltip>
</template>

<style lang="scss" scoped></style>
