<template>
  <div class="content-wrapper">
    <div class="dynamic-circle" :class="{ 'active': active }" @click="toggleAction(!active)"></div>

    <div class="switch-area">
      <div class="switch-label">
        {{ !active ? '点击启动' : '点击停止' }}
      </div>
      <div class="start-time" v-if="active">启动时间：{{ formattedTime }}</div>
    </div>
    <a-row class="info-row" :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
      <a-col :xs="24" :sm="12" :md="6">
        <a-card title="连接IP" hoverable class="info-card">
          {{ connectionIp }}
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="6">
        <a-card title="已用流量" hoverable class="info-card">
          {{ usedData }} MB
        </a-card>
      </a-col>
    </a-row>
    <a-row class="info-row" :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
      <a-col :xs="24" :sm="12" :md="6">
        <a-card title="下载速度" hoverable class="info-card">
          {{ downloadSpeed }} Mbps
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="6">
        <a-card title="上传速度" hoverable class="info-card">
          {{ uploadSpeed }} Mbps
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
// import { Layout, Header, Content, Row, Col, Card, Icon, Switch } from 'ant-design-vue';

const connectionIp = ref('0.0.0.0');
const downloadSpeed = ref('0');
const uploadSpeed = ref('0');
const usedData = ref('0');
const active = ref(false);

const apiUrl = "http://localhost:8080"

const toggleAction = (checked) => {
  if (checked) {
    fetch(`${apiUrl}/start`).then(res => res.json()).then(data => {
      console.log(data)
    })
  } else {
    fetch(`${apiUrl}/stop`).then(res => res.json()).then(data => {
      console.log(data)
    })
  }
  connectionIp.value = checked ? '150.228.230.35' : '0.0.0.0'
  downloadSpeed.value = checked ? '1.2' : '0'
  uploadSpeed.value = checked ? '0.8' : '0'
  usedData.value = checked ? '3.6' : '0'
  active.value = checked;
};
let timer = null; // 用于定时器的变量
const startTime = ref(0); // 开始时间戳
const runningTime = ref(0); // 运行时间（秒）

// 当VPN激活时开始计时
watch(active, (newValue) => {
  if (newValue) {
    startTime.value = Date.now();
    timer = setInterval(() => {
      runningTime.value = Math.floor((Date.now() - startTime.value) / 1000);
    }, 1000);
    // speedTimer = setInterval(() => {
    //   fetch(`${apiUrl}/speed`).then(res => res.json()).then(data => {
    //     downloadSpeed.value = data.downloadSpeed
    //     uploadSpeed.value = data.uploadSpeed
    //   })
    // }, 1000);
    // trafficTimer = setInterval(() => {
    //   fetch(`${apiUrl}/traffic`).then(res => res.json()).then(data => {
    //     usedData.value = data.usedData
    //   })
    // }, 1000);
  } else {
    clearInterval(timer);
    runningTime.value = 0; // 重置运行时间
  }
});

// 格式化显示时间
const formattedTime = computed(() => {
  const hours = Math.floor(runningTime.value / 3600);
  const minutes = Math.floor((runningTime.value % 3600) / 60);
  const seconds = runningTime.value % 60;
  // make sure the time is always displayed with two digits
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});
</script>

<style scoped>
.content-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.switch-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  height: 50px;
}

.switch-label {
  margin-bottom: 10px;
  text-align: center;
  display: flex;
  color: #00a2ae;
}

.start-time {
  margin-bottom: 10px;
  text-align: center;
  color: #00a2ae;
}

.switch-wrapper {
  display: flex;
  align-items: center;
  color: #00a2ae;
}

.info-row {
  width: 100%;
  display: flex;
  justify-content: center;
  max-width: 960px;
  margin-top: 20px;
}

.info-card {
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow .3s, transform .3s;
}

.info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.dynamic-circle {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #00a2ae;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  cursor: pointer;
}

.dynamic-circle.active {
  animation: rippleEffect 2s infinite ease-out;
}

@keyframes rippleEffect {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 162, 174, 0.7), 0 0 0 10px rgba(0, 162, 174, 0.5), 0 0 0 20px rgba(0, 162, 174, 0.3);
  }

  100% {
    box-shadow: 0 0 0 10px rgba(0, 162, 174, 0), 0 0 0 20px rgba(0, 162, 174, 0.5), 0 0 0 30px rgba(0, 162, 174, 0.3);
  }
}
</style>

