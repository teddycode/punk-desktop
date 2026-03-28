<template>
  <div class="agent-task-card" :class="'risk-' + task.riskLevel">
    <div class="agent-task-card__head">
      <span class="agent-task-card__type">{{ task.type }}</span>
      <span class="agent-task-card__badge" :class="'badge-' + statusTone">{{ statusText }}</span>
    </div>
    <div class="agent-task-card__title">{{ task.title }}</div>
    <div class="agent-task-card__desc">{{ task.description }}</div>
    <div v-if="task.estimatedResult" class="agent-task-card__est">
      预期：{{ task.estimatedResult }}
    </div>
    <div v-if="task.resultSummary" class="agent-task-card__result">结果：{{ task.resultSummary }}</div>
    <div v-if="task.errorMessage" class="agent-task-card__err">{{ task.errorMessage }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TaskCard } from '@js/agent/types';

const props = defineProps<{ task: TaskCard }>();

const statusText = computed(() => {
  const s = props.task.status;
  const map: Record<string, string> = {
    pending: '待执行',
    preview: '待确认',
    running: '执行中',
    success: '完成',
    failed: '失败',
    skipped: '跳过',
    cancelled: '取消',
  };
  return map[s] || s;
});

const statusTone = computed(() => {
  const s = props.task.status;
  if (s === 'success') return 'ok';
  if (s === 'failed') return 'err';
  if (s === 'running') return 'run';
  if (s === 'preview' || s === 'pending') return 'wait';
  return 'def';
});
</script>

<style scoped>
.agent-task-card {
  min-width: 200px;
  max-width: 240px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(15, 24, 42, 0.95);
  border: 1px solid rgba(0, 200, 255, 0.2);
}
.agent-task-card.risk-high {
  border-color: rgba(255, 82, 82, 0.45);
}
.agent-task-card.risk-medium {
  border-color: rgba(255, 171, 0, 0.35);
}
.agent-task-card__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.agent-task-card__type {
  font-size: 10px;
  text-transform: uppercase;
  color: #4fc3f7;
  letter-spacing: 0.06em;
}
.agent-task-card__badge {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 999px;
  font-weight: 600;
}
.badge-ok {
  background: rgba(105, 240, 174, 0.15);
  color: #69f0ae;
}
.badge-err {
  background: rgba(255, 138, 128, 0.15);
  color: #ff8a80;
}
.badge-run {
  background: rgba(79, 195, 247, 0.15);
  color: #4fc3f7;
}
.badge-wait {
  background: rgba(255, 224, 130, 0.12);
  color: #ffe082;
}
.badge-def {
  background: rgba(224, 247, 255, 0.08);
  color: rgba(224, 247, 255, 0.65);
}
.agent-task-card__title {
  font-weight: 600;
  color: #e0f7ff;
  margin-bottom: 4px;
}
.agent-task-card__desc {
  font-size: 12px;
  color: rgba(224, 247, 255, 0.65);
  line-height: 1.4;
}
.agent-task-card__est {
  margin-top: 8px;
  font-size: 11px;
  color: #81c784;
}
.agent-task-card__result {
  margin-top: 6px;
  font-size: 11px;
  color: #a5d6a7;
}
.agent-task-card__err {
  margin-top: 6px;
  font-size: 11px;
  color: #ef9a9a;
}
</style>
