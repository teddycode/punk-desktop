<template>
  <header class="agent-dash">
    <div class="agent-dash__left">
      <span class="agent-dot" :class="statusClass" :title="connectionTitle" />
      <span class="agent-dash__label">PunkClaw</span>
      <XtSelect
        v-if="modelProviders.length"
        v-model="activeId"
        class="agent-model-select"
        size="small"
        popup-class-name="agent-dash-model-dropdown"
        :list="modelSelectList"
      />
      <span v-else class="agent-dash__muted">未配置模型</span>
      <span class="agent-dash__muted">Token {{ tokenUsed }} / {{ tokenTotal }}</span>
      <div class="agent-token-bar" :title="`Token ${tokenPercent}%`">
        <div class="agent-token-bar__fill" :style="{ width: tokenPercent + '%' }" />
      </div>
      <span class="agent-dash__muted">质量 {{ serviceMetrics.successRate }}%</span>
      <span class="agent-dash__muted">延迟 {{ serviceMetrics.avgLatencyMs || '—' }}ms</span>
      <span class="agent-dash__muted">
        今日 {{ serviceMetrics.tasksToday.done }}/{{ serviceMetrics.tasksToday.running }}/{{ serviceMetrics.tasksToday.failed }}
      </span>
    </div>
    <div class="agent-dash__right">
      <XtButton type="default" :plain="true" :h="30" :w="118" :radius="8" class="agent-dash__xtbtn" @click="openSettings">
        <span class="agent-dash__btn-inner">
          <SettingOutlined />
          模型设置
        </span>
      </XtButton>
      <XtButton type="error" :plain="true" :h="30" :w="132" :radius="8" class="agent-dash__xtbtn" @click="closePunkClaw">
        隐藏
      </XtButton>
    </div>
  </header>
</template>

<script setup lang="ts">
import { SettingOutlined } from '@ant-design/icons-vue';
import { agentStore } from '@store/agent';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

const store = agentStore();
const { connectionStatus, modelProviders, activeModelId, tokenUsage, serviceMetrics } = storeToRefs(store);

const activeId = computed({
  get: () => activeModelId.value || modelProviders.value[0]?.id || '',
  set: (v: string) => store.setActiveModelId(v),
});

const modelSelectList = computed(() =>
  modelProviders.value.map((m) => ({
    value: m.id,
    name: `${m.name} (${m.modelName})`,
  }))
);

const tokenUsed = computed(() => tokenUsage.value.used);
const tokenTotal = computed(() => tokenUsage.value.total || 1);
const tokenPercent = computed(() => Math.min(100, Math.round((tokenUsed.value / tokenTotal.value) * 100)));

const statusClass = computed(() => ({
  'is-online': connectionStatus.value === 'online',
  'is-off': connectionStatus.value === 'offline',
  'is-warn': connectionStatus.value === 'reconnecting',
}));

const connectionTitle = computed(() => {
  if (connectionStatus.value === 'online') return '在线';
  if (connectionStatus.value === 'reconnecting') return '重连中';
  return '离线';
});

function openSettings() {
  store.openModelSettings(true);
}

function closePunkClaw() {
  store.setPunkClawOpen(false);
}
</script>

<style scoped>
.agent-dash {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 52px;
  padding: 0 16px;
  background: linear-gradient(180deg, rgba(12, 18, 32, 0.96), rgba(8, 12, 24, 0.92));
  border-bottom: 1px solid rgba(0, 200, 255, 0.2);
  backdrop-filter: blur(12px);
  pointer-events: auto;
}
.agent-dash__left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.agent-dash__right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.agent-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #666;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.2);
}
.agent-dot.is-online {
  background: #00e676;
  box-shadow: 0 0 10px rgba(0, 230, 118, 0.6);
}
.agent-dot.is-off {
  background: #ff5252;
}
.agent-dot.is-warn {
  background: #ffab00;
}
.agent-dash__label {
  font-weight: 700;
  color: #e0f7ff;
  letter-spacing: 0.06em;
}
.agent-dash__muted {
  font-size: 12px;
  color: rgba(224, 247, 255, 0.55);
}
.agent-model-select {
  min-width: 160px;
  max-width: 280px;
}
.agent-model-select :deep(.ant-select) {
  width: 100% !important;
  min-width: 0 !important;
}
.agent-model-select :deep(.ant-select-selector) {
  box-sizing: border-box !important;
  height: 30px !important;
  min-height: 30px !important;
  border-radius: 8px !important;
  padding: 0 10px !important;
  background: rgba(12, 22, 40, 0.92) !important;
  border: 1px solid rgba(79, 195, 247, 0.28) !important;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.2);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}
.agent-model-select :deep(.ant-select:hover .ant-select-selector) {
  border-color: rgba(79, 195, 247, 0.45) !important;
}
.agent-model-select :deep(.ant-select-focused .ant-select-selector) {
  border-color: rgba(79, 195, 247, 0.65) !important;
  box-shadow: 0 0 0 1px rgba(79, 195, 247, 0.2);
}
.agent-model-select :deep(.ant-select-selection-item),
.agent-model-select :deep(.ant-select-selection-placeholder) {
  line-height: 28px !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  color: rgba(224, 247, 255, 0.92) !important;
}
.agent-model-select :deep(.ant-select-arrow) {
  color: rgba(129, 212, 250, 0.75) !important;
}
.agent-token-bar {
  width: 100px;
  height: 6px;
  margin: 0 4px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}
.agent-token-bar__fill {
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, rgba(79, 195, 247, 0.9), rgba(0, 230, 118, 0.85));
  transition: width 0.25s ease;
}
.agent-dash__btn-inner {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(224, 247, 255, 0.9);
}
.agent-dash__xtbtn :deep(.xt-default-plain-btn),
.agent-dash__xtbtn :deep(.xt-error-plain-btn) {
  font-size: 12px;
}
</style>

<!-- 下拉挂载在 body，需独立全局类名 -->
<style>
.agent-dash-model-dropdown.ant-select-dropdown {
  padding: 6px !important;
  background: rgba(6, 12, 24, 0.98) !important;
  border: 1px solid rgba(79, 195, 247, 0.32) !important;
  border-radius: 10px !important;
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.55),
    0 0 24px rgba(0, 200, 255, 0.06) !important;
  backdrop-filter: blur(12px);
}
.agent-dash-model-dropdown .ant-select-item {
  color: rgba(224, 247, 255, 0.88) !important;
  border-radius: 6px !important;
  font-size: 12px !important;
}
.agent-dash-model-dropdown .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
  background: rgba(79, 195, 247, 0.14) !important;
}
.agent-dash-model-dropdown .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
  background: rgba(79, 195, 247, 0.24) !important;
  color: #e1f5fe !important;
  font-weight: 600 !important;
}
</style>
