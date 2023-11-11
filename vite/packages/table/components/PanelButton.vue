<template>

  <div :class="{'active':active}" class="item" @click="onClick">
    <template v-if="settings.showButtonTitle">
      <div style="height: 3em;vertical-align: baseline">
        <Icon :icon="icon"></Icon>
      </div>
      <div class="title">
        {{ title }}
      </div>
    </template>
    <template v-else>
      <div style="height: 2em;padding-top:.5em;vertical-align: baseline">
        <Icon :icon="icon" :style="this.iconStyle"></Icon>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import {mapWritableState} from 'pinia'
import {appStore} from '../store.ts'

export default {
  name: 'PanelButton',
  props: ['title', 'icon', 'active', 'iconStyle', 'onClick'],
  computed: {
    ...mapWritableState(appStore, ['settings'])
  }
}
</script>

<style scoped>

</style>
