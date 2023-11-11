<template>
  <div class="w-full h-full">
    <xt-left-menu :index="index" :list="leftMenu" class="w-full" end="1" last="2">
      <div class="w-full">
        <router-view></router-view>
      </div>
    </xt-left-menu>
  </div>
</template>

<script lang='ts' setup>
import {ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'

const route = useRoute()
const router = useRouter()
const leftMenu = ref([
  {
    // icon: 'message',
    newIcon: 'fluent:star-12-regular',
    tab: 'channelsIndex',
    route: {name: 'channelsIndex'},
    callBack: () => {
      router.push({name: 'channelsIndex'})
    }
  },
  {
    // icon: 'message',
    newIcon: 'eva:compass-outline',
    tab: 'circle',
    route: {name: 'circle'},
    callBack: () => {
      router.push({name: 'circle'})
    }
  },
  {
    // newIcon:'fluent:full-screen-maximize-16-filled',
    full: true
  }
])
</script>
<style lang='scss' scoped></style>
