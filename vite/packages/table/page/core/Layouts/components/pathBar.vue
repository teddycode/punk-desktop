<template>
  <div class="pathBar background scrollBox ">
    <div style="display:flex" class="pointer">
      <a-tag size="Default" :color="value.path !==activeTagView?'green':'cyan'"
             style="background-color:var(--ant-primary-1)" v-for="(value,index) in tagView"
             :key="value.path + index">
        <template #icon>
          <sync-outlined :spin="true" v-if="value.path ===  activeTagView" @click="Refresh"/>
          <close-circle-outlined @click="deleteTag(index)"/>
        </template>
        <span @click="changeTag(value)"> {{ $t(`menu.${value.path}`) }}</span>

      </a-tag>
    </div>
  </div>

</template>
<script>
import { computed, inject, } from 'vue'
import { useRouter } from 'vue-router'
import { useLayoutStore } from '@store/baseSettings'
import { CloseCircleOutlined, SyncOutlined, } from '@ant-design/icons-vue'

export default {
  components: {
    SyncOutlined,
    CloseCircleOutlined

  },
  setup () {
    const router = useRouter()
    const store = useLayoutStore()
    // 刷新页面
    const Refresh = inject('reload')
    // 监听获取选中菜单
    const activeTagView = computed(() => store.activeTagView)
    // 监听获取历史菜单路由列表
    const tagView = computed(() => store.tagView)
    // 点击历史菜单
    const changeTag = (item) => {
      router.push(item.path)
    }
    // 删除历史菜单
    const deleteTag = (index) => {
      store.deleteTagView(index)
    }
    return {
      tagView,
      activeTagView,
      changeTag,
      Refresh,
      deleteTag,
    }
  },
}
</script>
<style scoped lang="less">
.pathBar {
  width: 100%;
  overflow-x: scroll;
  height: 40px !important;
  padding: 10px 10px;

}
</style>
