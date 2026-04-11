<template>
  <div class="punk-claw" aria-label="PunkClaw">
    <StatusDashboard />
    <div class="punk-claw__mid">
      <ContextPanel />
      <div class="punk-claw__center-gap" aria-hidden="true">
        <CockpitAmbient />
      </div>
      <CommandPanel ref="cmdRef" />
    </div>
    <ExecutionLog />
    <TaskOrchestration />
    <ModelSettingsDrawer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { agentStore } from '@store/agent';
import { walletStore } from '@store/wallet';
import { useWeb3ModalAccount } from '@punkos/ethers5/vue';
import { ensureAgentRouteMappings } from '@js/agent/syncRouteMappings';
import StatusDashboard from './StatusDashboard.vue';
import ContextPanel from './ContextPanel.vue';
import CommandPanel from './CommandPanel.vue';
import ExecutionLog from './ExecutionLog.vue';
import TaskOrchestration from './TaskOrchestration.vue';
import ModelSettingsDrawer from './ModelSettingsDrawer.vue';
import CockpitAmbient from './CockpitAmbient.vue';

const store = agentStore();
const route = useRoute();
const router = useRouter();
const w = walletStore();
const account = useWeb3ModalAccount();
const { punkClawOpen } = storeToRefs(store);

const cmdRef = ref<InstanceType<typeof CommandPanel> | null>(null);

const walletConnected = computed(() => Boolean(account?.isConnected?.value));
const liveAddress = computed(() => (walletConnected.value ? account?.address?.value || '' : ''));
const liveChainId = computed(() => (walletConnected.value ? account?.chainId?.value || 0 : 0));

function syncContext() {
  const meta: any = route.meta || {};
  const title = typeof meta.title === 'string' ? meta.title : '';

  const walletAddress = liveAddress.value || '';
  const walletChainId = liveChainId.value || 0;
  const chainName = walletConnected.value ? w.chainName || null : null;
  const balanceHint = walletConnected.value ? (w.balance ? String(w.balance) : null) : null;

  store.setContextSnapshot({
    walletAddress: walletAddress || null,
    chainName,
    chainId: walletChainId || null,
    balanceHint,
    currentRouteName: route.name ? String(route.name) : null,
    currentRouteTitle: title || null,
  });
}

onMounted(() => {
  store.ensureDefaultProviders();
  ensureAgentRouteMappings(router);
  syncContext();
});

watch(() => route.fullPath, syncContext);
watch(
  () => [walletConnected.value, liveAddress.value, liveChainId.value, w.chainName, w.balance],
  () => syncContext(),
  { deep: true }
);

watch(punkClawOpen, (open) => {
  if (open) {
    syncContext();
    store.pushLog({ level: 'info', message: 'PunkClaw 已展开（Ctrl+G 收回）' });
  }
});
</script>

<style scoped>
.punk-claw {
  position: fixed;
  inset: 0;
  /* 高于预览窗口，保证顶栏/左右栏/执行日志叠在预览之上；根节点无背景，中部透明区穿透到预览 */
  z-index: 520;
  display: flex;
  flex-direction: column;
  pointer-events: none;
}
.punk-claw__mid {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: row;
  pointer-events: none;
}
.punk-claw__center-gap {
  flex: 1;
  min-width: 0;
  pointer-events: none;
  position: relative;
}
</style>
