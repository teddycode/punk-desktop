<template>
  <div class="pot-visualization-page">
    <div v-if="loading" class="pot-visualization-state">
      <a-spin size="large" />
      <span>正在启动 POT 可视化服务...</span>
    </div>

    <a-result
      v-else-if="error"
      status="warning"
      title="POT 可视化服务暂不可用"
      :sub-title="error"
    >
      <template #extra>
        <a-button type="primary" @click="loadServicePage">重试</a-button>
      </template>
    </a-result>

    <iframe
      v-else
      class="pot-visualization-frame"
      :src="pageUrl"
      title="POT 共识状态可视化"
      allow="fullscreen"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

const pageUrl = ref('');
const loading = ref(true);
const error = ref('');

async function loadServicePage() {
  loading.value = true;
  error.value = '';

  try {
    const ipc = (window as any).ipc || (window as any).ipcRenderer;
    if (!ipc || typeof ipc.invoke !== 'function') {
      throw new Error('当前环境无法访问本地服务管理器');
    }

    const service = await ipc.invoke('services.resolvePage', 'pot-mock');
    if (!service?.pageUrl) {
      throw new Error(service?.error || '未能解析 POT 可视化页面地址');
    }

    pageUrl.value = service.pageUrl;
  } catch (err: any) {
    error.value = err?.message || '启动 POT 可视化服务失败';
  } finally {
    loading.value = false;
  }
}

onMounted(loadServicePage);
</script>

<style scoped>
.pot-visualization-page {
  width: 100%;
  min-height: calc(100vh - 128px);
  background: #080d24;
}

.pot-visualization-state {
  min-height: calc(100vh - 128px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  color: #ffffff;
}

.pot-visualization-frame {
  display: block;
  width: 100%;
  height: calc(100vh - 128px);
  border: 0;
  background: #080d24;
}
</style>
