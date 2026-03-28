<template>
  <a-drawer
    class="model-settings-drawer"
    :open="modelSettingsOpen"
    title="PunkClaw 模型 API"
    placement="right"
    width="420"
    @close="close"
  >
    <div class="drawer-stack">
      <div class="drawer-info xt-bg-2 rounded-xl p-3 xt-text text-sm leading-relaxed">
        支持 OpenAI 兼容接口（/v1/chat/completions）。密钥仅保存在本机浏览器存储中。
      </div>

      <div>
        <div class="drawer-h">快速模板</div>
        <div class="drawer-row-btns">
          <XtButton type="default" :h="32" :w="100" :radius="8" @click="applyTpl('openai')">OpenAI</XtButton>
          <XtButton type="default" :h="32" :w="100" :radius="8" @click="applyTpl('deepseek')">DeepSeek</XtButton>
          <XtButton type="default" :h="32" :w="108" :radius="8" @click="applyTpl('ollama')">Ollama 本地</XtButton>
        </div>
      </div>

      <XtDivider />

      <div class="drawer-section-title">已配置模型</div>

      <div v-for="m in modelProviders" :key="m.id" class="model-card xt-bg-2 rounded-xl">
        <div class="model-card__head">
          <div class="model-card__title xt-text">
            <span>{{ m.name }}</span>
            <span v-if="m.id === activeModelId" class="model-card__pill">当前</span>
          </div>
          <div class="model-card__actions">
            <XtButton type="link" :plain="true" :h="26" :w="52" :radius="6" @click="activate(m.id)">激活</XtButton>
            <XtButton type="error" :plain="true" :h="26" :w="52" :radius="6" @click="remove(m.id)">删除</XtButton>
          </div>
        </div>
        <div class="model-meta">{{ m.baseUrl }}</div>
        <div class="model-meta">model: {{ m.modelName }}</div>
        <div class="model-meta">状态: {{ m.status }}</div>
        <XtButton
          type="theme"
          class="mt-2"
          :loading="testingId === m.id"
          :h="32"
          :w="120"
          :radius="8"
          @click="testConn(m)"
        >
          测试连通
        </XtButton>
      </div>

      <XtDivider />

      <div class="drawer-section-title">添加模型</div>

      <div class="drawer-form">
        <label class="drawer-label">显示名称</label>
        <div class="drawer-field h-10">
          <XtInput v-model="form.name" placeholder="如 DeepSeek-V3" />
        </div>

        <label class="drawer-label">API Base URL</label>
        <div class="drawer-field h-10">
          <XtInput v-model="form.baseUrl" placeholder="https://api.deepseek.com" />
        </div>

        <label class="drawer-label">API Key</label>
        <div class="drawer-field drawer-field--native h-10">
          <input
            v-model="form.apiKey"
            type="password"
            autocomplete="off"
            placeholder="sk-..."
            class="drawer-native-input xt-text"
          />
        </div>

        <label class="drawer-label">模型名</label>
        <div class="drawer-field h-10">
          <XtInput v-model="form.modelName" placeholder="deepseek-chat" />
        </div>

        <label class="drawer-label">Temperature {{ form.temperature }}</label>
        <div class="drawer-slider">
          <a-slider v-model:value="form.temperature" :min="0" :max="2" :step="0.1" />
        </div>

        <label class="drawer-label">Max tokens</label>
        <div class="drawer-field drawer-field--native h-10">
          <input
            v-model.number="form.maxTokens"
            type="number"
            min="256"
            max="128000"
            class="drawer-native-input xt-text"
          />
        </div>

        <XtButton type="theme" block :h="44" :radius="10" @click="addModel">添加</XtButton>
      </div>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { message } from 'ant-design-vue';
import { agentStore } from '@store/agent';
import { testModelConnection } from '@js/agent/modelRouter';
import type { ModelProvider } from '@js/agent/types';

const store = agentStore();
const { modelSettingsOpen, modelProviders, activeModelId } = storeToRefs(store);

const form = reactive({
  name: '',
  baseUrl: '',
  apiKey: '',
  modelName: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 4096,
});

const testingId = ref('');

function close(e?: Event) {
  // #region agent log
  const t = e?.target as HTMLElement | undefined;
  fetch('http://127.0.0.1:7513/ingest/7561b8d2-246a-4c56-90ba-f39d8b169e79', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '9c9d52' },
    body: JSON.stringify({
      sessionId: '9c9d52',
      runId: 'post-fix',
      hypothesisId: 'H1-z-mask-above-panel',
      location: 'ModelSettingsDrawer.vue:close',
      message: 'drawer @close fired',
      data: {
        eventType: e?.type ?? null,
        targetTag: t?.tagName ?? null,
        targetClass: typeof t?.className === 'string' ? t.className : null,
        isMask: !!t?.closest?.('.ant-drawer-mask'),
        isDrawerContent: !!t?.closest?.('.ant-drawer-content'),
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  store.openModelSettings(false);
}

function activate(id: string) {
  store.setActiveModelId(id);
  message.success('已切换当前模型');
}

function remove(id: string) {
  store.removeModelProvider(id);
}

async function testConn(m: ModelProvider) {
  testingId.value = m.id;
  const r = await testModelConnection(m);
  testingId.value = '';
  store.updateModelProvider(m.id, { status: r.ok ? 'connected' : 'failed', lastTestTime: Date.now() });
  message[r.ok ? 'success' : 'error'](r.message);
}

function addModel() {
  if (!form.name || !form.baseUrl || !form.apiKey) {
    message.warning('请填写名称、地址与密钥');
    return;
  }
  const id = `mp-${Date.now()}`;
  store.addModelProvider({
    id,
    name: form.name,
    baseUrl: form.baseUrl,
    apiKey: form.apiKey,
    modelName: form.modelName,
    temperature: form.temperature,
    maxTokens: form.maxTokens,
  });
  store.setActiveModelId(id);
  message.success('已添加并设为当前模型');
  form.name = '';
  form.apiKey = '';
}

function applyTpl(kind: string) {
  if (kind === 'openai') {
    form.baseUrl = 'https://api.openai.com';
    form.modelName = 'gpt-4o-mini';
    form.name = 'OpenAI';
  } else if (kind === 'deepseek') {
    form.baseUrl = 'https://api.deepseek.com';
    form.modelName = 'deepseek-chat';
    form.name = 'DeepSeek';
  } else if (kind === 'ollama') {
    form.baseUrl = 'http://127.0.0.1:11434/v1';
    form.modelName = 'llama3.2';
    form.name = 'Ollama';
  }
}
</script>

<style scoped>
.drawer-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.drawer-h {
  font-size: 12px;
  color: var(--secondary-text);
  margin-bottom: 8px;
}
.drawer-row-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.drawer-section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--primary-text);
}
.model-card {
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.model-card__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}
.model-card__title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}
.model-card__pill {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(79, 195, 247, 0.2);
  color: #4fc3f7;
}
.model-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  flex-shrink: 0;
}
.model-meta {
  font-size: 12px;
  color: var(--secondary-text);
  word-break: break-all;
}
.mt-2 {
  margin-top: 8px;
}
.drawer-form {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.drawer-label {
  font-size: 12px;
  color: var(--secondary-text);
  margin-top: 8px;
}
.drawer-label:first-of-type {
  margin-top: 0;
}
.drawer-field {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: var(--secondary-bg);
}
.drawer-field--native {
  display: flex;
  align-items: center;
  padding: 0 12px;
}
.drawer-native-input {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
}
.drawer-native-input::placeholder {
  color: var(--secondary-text);
}
.drawer-slider {
  padding: 4px 0 8px;
}
.drawer-slider :deep(.ant-slider-rail) {
  background: rgba(255, 255, 255, 0.1);
}
.drawer-slider :deep(.ant-slider-track) {
  background: var(--active-bg);
}
.drawer-slider :deep(.ant-slider-handle)::after {
  box-shadow: 0 0 0 2px var(--active-bg);
}
</style>

<style>
/* 抽屉本体随主题，避免 Ant Design 默认浅色内容区 */
.model-settings-drawer .ant-drawer-content {
  background: var(--secondary-bg) !important;
}
.model-settings-drawer .ant-drawer-header {
  background: var(--secondary-bg) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
}
.model-settings-drawer .ant-drawer-title {
  color: var(--primary-text) !important;
}
.model-settings-drawer .ant-drawer-close {
  color: var(--secondary-text) !important;
}
</style>
