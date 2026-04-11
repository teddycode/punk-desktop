<script lang="ts">
import { defineComponent } from 'vue';
import Emoji from '../comp/Emoji.vue';
import { agentStore } from '@store/agent';

export default defineComponent({
  name: 'AIButton',
  components: { Emoji },
  methods: {
    openPunkClaw() {
      agentStore().setPunkClawOpen(true);
    },
  },
});
</script>

<template>
  <a-tooltip title="PunkClaw（Ctrl+G）">
    <div style="padding: 0.6em !important; position: relative" @click.stop="openPunkClaw">
      <emoji icon="ai" style="width: 52px; height: 52px"></emoji>
    </div>
  </a-tooltip>
</template>

<style lang="scss" scoped></style>
