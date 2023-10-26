<template>
  <dv-border-box10 class="desktop-box">
    <div class="desktop-header">
      <router-link class="desktop-title-link" to="/FileEdit">
        <div class="desktop-title">桌面管理</div>
      </router-link>
      <el-switch v-model="isOn" active-color="#13ce66" inactive-color="#ff4949"/>
    </div>
    <div v-if="isOn" class="desktop-content">
      <div v-for="item in items" :key="item.id" class="desktop-item">
        <img :src="`/images/desktop/${item.name}.png`" alt="" class="icon" @click="handleRunLocalAppClick(item)">
        <div class="desktop-item-name">{{ item.name }}</div>
      </div>
    </div>
    <div v-else class="desktop-content">
      <div class="main-left-bottom-tip">
        <font-awesome-icon class="tip-icon" icon="exclamation-circle"/>
        您没有打开桌面管理器！
      </div>
    </div>
  </dv-border-box10>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue'
import {RouterLink, useRouter} from 'vue-router'

export default defineComponent({
  name: "MainLeftBottom",
  components: {
    RouterLink,
  },
  setup() {
    const isOn = ref(true)
    const items = ref([
      {id: 1, name: 'word', path: 'C:\\Program Files\\Microsoft Office\\root\\Office16\\', cmd: 'WINWORD.EXE'},
      {id: 2, name: 'wps', path: '', cmd: 'notepad.exe'},
      {id: 3, name: 'steam', path: '', cmd: 'notepad.exe'},
      {id: 4, name: 'Typora', path: '', cmd: 'notepad.exe'},
      {
        id: 5,
        name: 'wechat',
        path: 'C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs\\微信\\',
        cmd: '微信.lnk'
      },
      {
        id: 6,
        name: 'QQ',
        path: 'C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs\\腾讯软件\\QQ\\',
        cmd: '腾讯QQ.lnk'
      },
    ])
    const router = useRouter();
    const handleRunLocalAppClick = (app: { name: string, path: string, cmd: string }) => {
      // 打开新窗口并跳转
      router.push({
        name: "AppView",
        params: {
          name: app?.name,
          path: app?.path,
          cmd: app?.cmd,
        }
      })
    }

    return {isOn, items, handleRunLocalAppClick}
  },
})
</script>


<style scoped>
.desktop-box {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 120%;
  height: 100%;
}

.desktop-header {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.desktop-title {
  margin-top: 6px;
  color: #5ab1ef;
  font-size: x-large;
  text-align: center;
}

.desktop-title-link {
  text-decoration: none;
}

.desktop-header .el-switch {
  position: absolute;
  right: 10px;
}

.desktop-content {
  padding-top: 4px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  height: 80%;
}

.desktop-item {
  width: 33.33%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.icon {
  width: 50px;
  height: 50px;
}

.main-left-bottom-tip {
  height: 30%;
  font-size: x-large;
  margin-bottom: 20px;
  color: white;
  text-align: center;
}

.tip-icon {
  color: deepskyblue;
}

.desktop-item-name {
  color: white;
}
</style>
