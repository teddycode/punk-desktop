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
  <div @click.stop="enterAI" style="padding:0.6em !important;;position:relative;" >
    <emoji style="width: 52px;height:52px" icon="ai"></emoji>
  </div>
  </a-tooltip>
</template>

<style scoped lang="scss">

</style>
