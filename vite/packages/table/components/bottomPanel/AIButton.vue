<script lang="ts">
import {defineComponent} from 'vue'
import Emoji from "../comp/Emoji.vue";

export default defineComponent({
  name: "AIButton",
  components: {Emoji},
  methods: {
    enterAI() {
      this.$router.push({name: 'ai'})
    },
  }
})
</script>

<template>
  <a-tooltip title="AI助手">
    <div style="padding:0.6em !important;;position:relative;" @click.stop="enterAI">
      <emoji icon="ai" style="width: 52px;height:52px"></emoji>
    </div>
  </a-tooltip>
</template>

<style lang="scss" scoped>

</style>
