<template>
  <a-modal
    v-model:open="open"
    title="节点连接"
    width="560px"
    :confirm-loading="saving"
    @ok="handleSave"
    @cancel="handleCancel"
  >
    <a-form layout="vertical" class="connection-form">
      <a-form-item label="API 地址">
        <a-input v-model:value="form.apiBaseUrl" placeholder="/api" @change="handleApiChange" />
      </a-form-item>

      <a-form-item label="WebSocket 地址">
        <a-input v-model:value="form.wsUrl" placeholder="ws://127.0.0.1:10000/api/ws" />
      </a-form-item>

      <a-form-item>
        <a-checkbox v-model:checked="form.useMock">浏览器 Mock 数据</a-checkbox>
      </a-form-item>

      <div class="connection-actions">
        <a-space>
          <a-button @click="handleReset">恢复默认</a-button>
          <a-button :loading="testing" @click="handleTest">测试连接</a-button>
        </a-space>
        <span v-if="testMessage" :class="['test-message', testStatus]">
          {{ testMessage }}
        </span>
      </div>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import {
  deriveWebSocketUrl,
  getConnectionConfig,
  getDefaultConnectionConfig,
  resetConnectionConfig,
  saveConnectionConfig,
} from '@/services/connection'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (event: 'update:visible', value: boolean): void
  (event: 'saved'): void
}>()

const open = ref(props.visible)
const saving = ref(false)
const testing = ref(false)
const testMessage = ref('')
const testStatus = ref<'success' | 'error' | ''>('')
const form = reactive({
  apiBaseUrl: '/api',
  wsUrl: '',
  useMock: false,
})

function loadConfig() {
  const config = getConnectionConfig()
  form.apiBaseUrl = config.apiBaseUrl
  form.wsUrl = config.wsUrl
  form.useMock = config.useMock
  testMessage.value = ''
  testStatus.value = ''
}

function handleApiChange() {
  form.wsUrl = deriveWebSocketUrl(form.apiBaseUrl)
}

function handleCancel() {
  emit('update:visible', false)
}

async function handleSave() {
  saving.value = true
  try {
    saveConnectionConfig({
      apiBaseUrl: form.apiBaseUrl,
      wsUrl: form.wsUrl,
      useMock: form.useMock,
    })
    message.success('节点连接配置已保存')
    emit('saved')
    emit('update:visible', false)
  } finally {
    saving.value = false
  }
}

function handleReset() {
  const defaults = getDefaultConnectionConfig()
  form.apiBaseUrl = defaults.apiBaseUrl
  form.wsUrl = defaults.wsUrl
  form.useMock = defaults.useMock
  resetConnectionConfig()
  testMessage.value = '已恢复默认配置'
  testStatus.value = 'success'
}

async function handleTest() {
  testMessage.value = ''
  testStatus.value = ''

  if (form.useMock) {
    testMessage.value = '浏览器 Mock 可用'
    testStatus.value = 'success'
    return
  }

  testing.value = true
  try {
    const healthUrl = new URL(`${form.apiBaseUrl.replace(/\/$/, '')}/health`, window.location.origin)
    const response = await fetch(healthUrl.toString(), { headers: { Accept: 'application/json' } })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    const payload = await response.json()
    if (!payload || payload.status !== 'ok') {
      throw new Error('健康检查未通过')
    }
    testMessage.value = `连接正常: ${payload.service || 'pot-api'}`
    testStatus.value = 'success'
  } catch (error: any) {
    testMessage.value = error?.message || '连接失败'
    testStatus.value = 'error'
  } finally {
    testing.value = false
  }
}

watch(
  () => props.visible,
  (visible) => {
    open.value = visible
    if (visible) {
      loadConfig()
    }
  }
)

watch(open, (visible) => emit('update:visible', visible))
</script>

<style scoped>
.connection-form {
  padding-top: 8px;
}

.connection-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.test-message {
  font-size: 13px;
}

.test-message.success {
  color: #16a34a;
}

.test-message.error {
  color: #dc2626;
}
</style>
