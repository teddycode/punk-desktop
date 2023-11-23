<template>
  <div class="background">
    <div :class="fixedTop?'a-menu-vertical-demo scrollBox':'' ">
      <a-menu mode="inline"
              @select="selectChange"
              v-model:selectedKeys="selectedKeys" v-model:openKeys="openKeys">
        <template v-for="(value,index) in munePath" :key="index">
          <template v-if="value && value.children">
            <a-sub-menu :key="value.path">
              <template #title>
                            <span class="anticon anticon-desktop">
<!--                                <svgView :svg="value.icon"></svgView>-->
                            </span>
                <span>{{ $t(`menu.${value.path}`) }}</span>
              </template>
              <a-menu-item v-for="(item) in value.children" :key="item.path">
                            <span class="anticon anticon-desktop">
<!--                            <svgView :svg="item.icon"></svgView>-->
                        </span>
                <span>{{ $t(`menu.${item.path}`) }}</span>
              </a-menu-item>
            </a-sub-menu>
          </template>
          <template v-else>
            <a-menu-item :key="value.path">
                        <span class="anticon anticon-desktop">
<!--                            <svgView :svg="value.icon"></svgView>-->
                        </span>
              <span>{{ $t(`menu.${value.path}`) }}</span>
            </a-menu-item>
          </template>
        </template>
      </a-menu>
    </div>
  </div>
</template>
<script lang="ts">
import {computed, defineComponent, ref} from 'vue'
import {useLayoutStore} from '@store/baseSettings'
import {onBeforeRouteUpdate, useRouter} from 'vue-router'

export default defineComponent({
  components: {
  },
  setup() {
    const store = useLayoutStore()
    const router = useRouter()

    const selectedKeys = ref<string[]>([])
    const openKeys = ref<string[]>([])
    const activeTagView = computed(() => store.activeTagView)
    selectedKeys.value = [activeTagView.value]

    // 获取父亲路由所有的平行路由作为菜单列表
    const munePath = computed(() => {
      const currentRoute = router.currentRoute.value;
      if (currentRoute.matched.length < 2) return [];
      const parentRoute = currentRoute.matched[currentRoute.matched.length - 2];
      return parentRoute ? parentRoute.children : [];
    })

    const isCollapse = ref(false)
    openKeys.value = [router.currentRoute.value.matched[1].path]

    const fixedTop = computed(() => store.fixedTop)

    const selectChange = (item: { key: string }) => {
      router.push(item.key)
    }

    // 监听路由变化
    onBeforeRouteUpdate((to, from) => {
      selectedKeys.value = [to.path]
      openKeys.value = [to.matched[1].path]
    })

    return {
      munePath,
      isCollapse,
      selectedKeys,
      openKeys,
      fixedTop,
      selectChange,
    }
  },
})
</script>
<style>
.layout-Aside {
  /* height: 100%;
  position: fixed; */
}

.a-menu-vertical-demo {

  max-height: calc(100vh - 60px);
  height: calc(100vh - 60px);
  overflow-y: hidden;
  background: var(--a-fill-color-blank);
}

body .ant-layout-sider-children .ant-menu.ant-menu-inline-collapsed {
  width: 80px !important;
}
</style>
