<template>
  <div v-if="taskQueue.length" class="agent-orch">
    <div class="agent-orch__panel">
      <div class="agent-orch__summary" v-if="summary">{{ summary }}</div>
      <div class="agent-orch__flow">
        <template v-for="(t, i) in taskQueue" :key="t.id">
          <TaskCardItem :task="t" />
          <span v-if="i < taskQueue.length - 1" class="agent-orch__arrow">→</span>
        </template>
      </div>
      <div v-if="punkClawCommandMode === 'agent'" class="agent-orch__actions">
        <XtButton type="theme" :loading="running" :h="32" :w="120" :radius="8" @click="confirmAll">确认执行全部</XtButton>
        <XtButton type="default" :disabled="running" :h="32" :w="96" :radius="8" @click="stepRun">逐步执行</XtButton>
        <XtButton type="default" :disabled="running" :h="32" :w="88" :radius="8" @click="clearPlan">取消方案</XtButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { agentStore } from '@store/agent';
import { executeAllConfirmed, executeTask } from '@js/agent/actionExecutor';
import TaskCardItem from './TaskCardItem.vue';

const router = useRouter();
const store = agentStore();
const { taskQueue, taskPlanSummary, punkClawCommandMode } = storeToRefs(store);

const summary = computed(() => taskPlanSummary.value || (taskQueue.value.length ? `${taskQueue.value.length} 步任务` : ''));

const running = ref(false);
let stepIndex = 0;

async function confirmAll() {
  running.value = true;
  store.bumpTaskStat('running', 1);
  try {
    await executeAllConfirmed(router, [...taskQueue.value]);
  } finally {
    running.value = false;
    store.bumpTaskStat('running', -1);
  }
}

async function stepRun() {
  const tasks = taskQueue.value;
  if (!tasks.length) return;
  if (stepIndex >= tasks.length) stepIndex = 0;
  running.value = true;
  try {
    const t = tasks[stepIndex];
    await executeTask(router, t);
    stepIndex += 1;
  } finally {
    running.value = false;
  }
}

function clearPlan() {
  stepIndex = 0;
  store.clearTaskQueue();
  store.pushLog({ level: 'info', message: '已取消当前任务方案' });
}
</script>

<style scoped>
.agent-orch {
  position: fixed;
  left: 50%;
  top: 48%;
  transform: translate(-50%, -50%);
  z-index: 600;
  pointer-events: auto;
  max-width: min(92vw, 900px);
}
.agent-orch__panel {
  padding: 16px 18px;
  border-radius: 14px;
  background: rgba(6, 12, 24, 0.92);
  border: 1px solid rgba(0, 200, 255, 0.25);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(16px);
}
.agent-orch__summary {
  font-size: 13px;
  color: #b3e5fc;
  margin-bottom: 12px;
}
.agent-orch__flow {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 14px;
}
.agent-orch__arrow {
  align-self: center;
  color: rgba(0, 200, 255, 0.5);
  font-size: 18px;
}
.agent-orch__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
