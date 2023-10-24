<template>
  <MainBackground>
    <div class="vnc-view-container">
      <div class="view-header-info">
        <p v-if="name" style="color: white">当前运行软件：{{ name }}</p>
      </div>
      <div class="button-group">
        <el-button @click="onFreshView">刷新</el-button>
        <el-button @click="connect">连接</el-button>
      </div>
    </div>
    <div class="vnc-view-window">
      <VueVnc
        v-if="true"
        :url="'ws://localhost:5901'"
      ></VueVnc>
    </div>
  </MainBackground>
</template>

<script>
import MainBackground from "@renderer/components/MainBackground.vue";
import VueVnc from "./components/vue-vnc.vue";

export default {
  name: "AppView",
  components: {
    VueVnc,
    MainBackground,
  },
  data() {
    let params = this.$router.params;
    console.log("参数：", params);
    return {
      name: params?.name,
      path: params?.path,
      cmd: params?.cmd,
    }
  },
  mounted() {
    // 发送指令执行程序
    // window.electronAPI.onRunApplication(this.path,this.cmd);
  },
  methods: {
    connect() {
    },

    disconnect() {
    },
    onFreshView() {
      // 刷新vnc连接
      console.log('点击了刷新');
    },
  }
}
</script>

<style scoped>
.vnc-view-container {
  display: flex;
  justify-content: flex-end;
  padding: 10px;
}

.view-header-info {
  display: flex;
  height: 20px;
}

.button-group {
  display: flex;
  gap: 10px; /* 两个按钮之间的间距 */
}

.vnc-view-window {
  overflow: hidden;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
