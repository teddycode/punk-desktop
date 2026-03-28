<template>
  <footer class="agent-log">
    <div class="agent-log__head">
      <div class="agent-log__title-row">
        <span class="agent-log__title">执行日志</span>
        <span class="agent-log__filter-caption" title="按级别筛选下方日志">筛选</span>
      </div>
      <div class="agent-log__filter" role="tablist" aria-label="执行日志筛选">
        <button
          v-for="opt in filterOptions"
          :key="opt.value"
          type="button"
          role="tab"
          :aria-selected="filter === opt.value"
          class="agent-log__pill"
          :class="{ 'agent-log__pill--active': filter === opt.value }"
          @click="setFilter(opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>
    <div ref="scrollRef" class="agent-log__body">
      <div
        v-for="e in filtered"
        :key="e.id"
        class="agent-log__row"
        :class="'lvl-' + e.level"
        @click="toggleExpand(e.id)"
      >
        <span class="agent-log__ts">{{ formatTs(e.ts) }}</span>
        <span class="agent-log__msg">{{ e.message }}</span>
        <pre v-if="expanded[e.id] && e.detail" class="agent-log__detail">{{ e.detail }}</pre>
      </div>
      <div v-if="!filtered.length" class="agent-log__empty">暂无日志</div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { agentStore } from '@store/agent';

const store = agentStore();
const { executionLog } = storeToRefs(store);

const filter = ref<'all' | 'success' | 'error' | 'info'>('all');
const expanded = ref<Record<string, boolean>>({});
const scrollRef = ref<HTMLElement | null>(null);

const filterOptions = [
  { value: 'all' as const, label: '全部' },
  { value: 'success' as const, label: '成功' },
  { value: 'error' as const, label: '失败' },
  { value: 'info' as const, label: '信息' },
];

function setFilter(v: 'all' | 'success' | 'error' | 'info') {
  filter.value = v;
}

const filtered = computed(() => {
  const list = executionLog.value;
  if (filter.value === 'all') return list;
  if (filter.value === 'success') return list.filter((x) => x.level === 'success');
  if (filter.value === 'error') return list.filter((x) => x.level === 'error');
  return list.filter((x) => x.level === 'info' || x.level === 'warn');
});

watch(
  () => executionLog.value.length,
  () => {
    requestAnimationFrame(() => {
      if (scrollRef.value) scrollRef.value.scrollTop = 0;
    });
  }
);

function formatTs(ts: number) {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d
    .getSeconds()
    .toString()
    .padStart(2, '0')}`;
}

function toggleExpand(id: string) {
  expanded.value = { ...expanded.value, [id]: !expanded.value[id] };
}
</script>

<style scoped>
.agent-log {
  height: 108px;
  flex-shrink: 0;
  background: rgba(6, 10, 20, 0.94);
  border-top: 1px solid rgba(0, 200, 255, 0.15);
  display: flex;
  flex-direction: column;
  pointer-events: auto;
}
.agent-log__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px 4px;
  gap: 10px;
  flex-wrap: wrap;
  border-bottom: 1px solid rgba(0, 200, 255, 0.08);
}
.agent-log__title-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.agent-log__title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: rgba(224, 247, 255, 0.75);
}
.agent-log__filter-caption {
  font-size: 10px;
  color: rgba(224, 247, 255, 0.38);
}
.agent-log__filter {
  display: inline-flex;
  flex-wrap: nowrap;
  gap: 4px;
  align-items: center;
  padding: 2px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(0, 200, 255, 0.12);
}
.agent-log__pill {
  margin: 0;
  padding: 3px 10px;
  border: none;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  background: transparent;
  color: rgba(224, 247, 255, 0.55);
  white-space: nowrap;
  transition:
    background 0.12s ease,
    color 0.12s ease;
}
.agent-log__pill:hover {
  color: rgba(224, 247, 255, 0.9);
  background: rgba(255, 255, 255, 0.06);
}
.agent-log__pill--active {
  background: rgba(79, 195, 247, 0.22);
  color: #e0f7ff;
  box-shadow: 0 0 0 1px rgba(79, 195, 247, 0.35);
}
.agent-log__body {
  flex: 1;
  overflow-y: auto;
  padding: 4px 12px 6px;
  font-size: 12px;
}
.agent-log__row {
  padding: 2px 0;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}
.agent-log__row.lvl-success .agent-log__msg {
  color: #69f0ae;
}
.agent-log__row.lvl-error .agent-log__msg {
  color: #ff8a80;
}
.agent-log__row.lvl-warn .agent-log__msg {
  color: #ffe082;
}
.agent-log__ts {
  color: rgba(224, 247, 255, 0.35);
  margin-right: 8px;
  font-family: ui-monospace, monospace;
}
.agent-log__msg {
  color: rgba(224, 247, 255, 0.75);
}
.agent-log__detail {
  margin: 4px 0 0;
  font-size: 11px;
  color: rgba(224, 247, 255, 0.5);
  white-space: pre-wrap;
}
.agent-log__empty {
  color: rgba(224, 247, 255, 0.35);
  padding: 8px 0;
}
</style>
