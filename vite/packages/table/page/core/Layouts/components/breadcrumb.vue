<template>
  <div class="breadcrumb background">
    <a-breadcrumb>
      <template v-for="(value) in breadcrumb" :key="value.path">
        <a-breadcrumb-item :to="{ path:value.path}">
          {{ $t(`menu.${value.path}`) }}
        </a-breadcrumb-item>
      </template>
    </a-breadcrumb>
  </div>
</template>
<script>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

export default {
  components: {},
  setup () {
    const router = useRouter()
    const breadcrumb = computed(() => {
      // 返回从core开始的匹配记录
      const matchedRoutes = router.currentRoute.value.matched
      const startIndex = matchedRoutes.findIndex(route => route.name === 'core')
      if (startIndex !== -1) {
        return matchedRoutes.slice(startIndex)
      }
      return []
    })
    return {
      breadcrumb,
    }
  },
}
</script>
<style scoped>
.breadcrumb {
  height: 30px;
  line-height: 30px;
  padding: 0 10px;
  overflow: hidden;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ccc;
}

.custom-dark .breadcrumb {
  border-bottom: 1px solid #303030;
}
</style>
