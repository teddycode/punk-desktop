<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  name: "SaveImage",
  props: ['image']
})
</script>

<template>
  <img :src="image" alt="" class="rounded-lg" style="width:280px;border-radius: 10px">
  <div class="mt-2">已截图保存至截屏目录下</div>
</template>

<style lang="scss" scoped>

</style>
