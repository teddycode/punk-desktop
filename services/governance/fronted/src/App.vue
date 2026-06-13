<template>
  <div class="app-layout" :class="{ 'app-layout--full': isFullBleed }">
    <router-view></router-view>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isFullBleed = computed(() => route.name === 'Home')
</script>

<style>
body {
  margin: 0;
  background-color: #F8F9FB;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
.app-layout {
  min-height: 100vh;
  padding: 40px;
  display: flex;
  justify-content: center;
}
.app-layout--full {
  padding: 0;
  display: block;
}
</style>
