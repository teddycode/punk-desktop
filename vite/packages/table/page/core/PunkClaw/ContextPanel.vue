<template>
  <aside class="agent-ctx">
    <div class="agent-ctx__title">上下文</div>

    <div class="agent-ctx__block">
      <div class="agent-ctx__h">钱包</div>
      <div class="agent-ctx__mono">{{ walletLine }}</div>
      <div class="agent-ctx__sub">余额 {{ balanceHint }}</div>
    </div>

    <div class="agent-ctx__block">
      <div class="agent-ctx__h">网络</div>
      <div>{{ chainLine }}</div>
    </div>

    <div class="agent-ctx__block">
      <div class="agent-ctx__h">当前页面</div>
      <div>{{ pageLine }}</div>
    </div>

    <div v-if="conceptCards.length" class="agent-ctx__block">
      <div class="agent-ctx__h">概念解释</div>
      <div v-for="c in conceptCards" :key="c.id" class="agent-concept">
        <div class="agent-concept__term">{{ c.term }}</div>
        <div class="agent-concept__body">{{ c.explanation }}</div>
      </div>
    </div>

    <div v-if="recentActions.length" class="agent-ctx__block">
      <div class="agent-ctx__h">最近操作</div>
      <ul class="agent-ctx__list">
        <li v-for="a in recentActions" :key="a.id">{{ formatTs(a.ts) }} — {{ a.label }}</li>
      </ul>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { agentStore } from '@store/agent';

const store = agentStore();
const { contextSnapshot, conceptCards, recentActions } = storeToRefs(store);

const walletLine = computed(() => contextSnapshot.value.walletAddress || '未连接钱包');
const balanceHint = computed(() => contextSnapshot.value.balanceHint || '—');
const chainLine = computed(() => contextSnapshot.value.chainName || '—');
const pageLine = computed(() => {
  const t = contextSnapshot.value.currentRouteTitle;
  const n = contextSnapshot.value.currentRouteName;
  if (t && n) return `${t} (${n})`;
  return n || t || '—';
});

function formatTs(ts: number) {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}
</script>

<style scoped>
.agent-ctx {
  width: 260px;
  flex-shrink: 0;
  padding: 12px 14px;
  background: rgba(8, 14, 28, 0.88);
  border-right: 1px solid rgba(0, 200, 255, 0.12);
  overflow-y: auto;
  pointer-events: auto;
  color: rgba(224, 247, 255, 0.9);
}
.agent-ctx__title {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #4fc3f7;
  margin-bottom: 12px;
}
.agent-ctx__block {
  margin-bottom: 14px;
}
.agent-ctx__h {
  font-size: 11px;
  text-transform: uppercase;
  color: rgba(224, 247, 255, 0.45);
  margin-bottom: 4px;
}
.agent-ctx__mono {
  font-family: ui-monospace, monospace;
  font-size: 12px;
  word-break: break-all;
}
.agent-ctx__sub {
  font-size: 12px;
  color: rgba(224, 247, 255, 0.65);
  margin-top: 4px;
}
.agent-concept {
  background: rgba(0, 200, 255, 0.06);
  border: 1px solid rgba(0, 200, 255, 0.15);
  border-radius: 8px;
  padding: 8px;
  margin-bottom: 8px;
}
.agent-concept__term {
  font-weight: 600;
  color: #81d4fa;
  margin-bottom: 4px;
}
.agent-concept__body {
  font-size: 12px;
  line-height: 1.45;
  color: rgba(224, 247, 255, 0.8);
}
.agent-ctx__list {
  margin: 0;
  padding-left: 16px;
  font-size: 12px;
  color: rgba(224, 247, 255, 0.7);
}
</style>
