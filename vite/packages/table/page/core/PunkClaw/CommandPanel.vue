<template>
  <aside class="agent-cmd">
    <div class="agent-cmd__title">指令</div>

    <div class="agent-cmd__suggest">
      <div class="agent-cmd__suggest-label">推荐</div>
      <div class="agent-cmd__chips">
        <button v-for="s in suggestions" :key="s" type="button" class="agent-suggest-item" @click="applySuggest(s)">
          {{ s }}
        </button>
      </div>
    </div>

    <div ref="histRef" class="agent-cmd__hist">
      <div
        v-for="m in conversationHistory"
        :key="m.id"
        class="agent-cmd__msg"
        :class="'role-' + m.role"
      >
        <span class="agent-cmd__role">{{ m.role === 'user' ? '你' : 'PunkClaw' }}</span>
        <div class="agent-cmd__text">{{ m.content }}<span v-if="m.streaming" class="agent-cmd__cursor">▋</span></div>
      </div>
    </div>

    <div class="agent-cmd__quick">
      <button
        v-for="q in quickTags"
        :key="q.label"
        type="button"
        class="agent-quick-tag"
        @click="applySuggest(q.text)"
      >
        {{ q.label }}
      </button>
    </div>

    <div class="agent-cmd__input-row">
      <XtTextarea
        v-model:data="input"
        :rows="3"
        :disabled="working"
        class="agent-cmd__textarea"
        border="xt-border"
        placeholder="用自然语言描述需求，Enter 发送，Shift+Enter 换行"
        @enter="onTextareaEnter"
      />
      <div class="agent-cmd__btns">
        <div class="agent-cmd__btns-inner">
          <div class="agent-cmd__toolbar-slot" title="Agent：需确认后执行；Ask：直接执行，不弹出确认">
            <XtSelect v-model="commandMode" class="agent-cmd__mode-select" size="small" :list="commandModeList" />
          </div>
          <XtButton
            type="theme"
            block
            class="agent-cmd__toolbar-btn"
            :loading="working"
            :h="TOOLBAR_CTRL_H"
            :radius="TOOLBAR_CTRL_R"
            @click="submit"
          >
            发送
          </XtButton>
          <XtButton
            type="default"
            block
            class="agent-cmd__toolbar-btn agent-cmd__toolbar-btn--muted"
            :disabled="working"
            :h="TOOLBAR_CTRL_H"
            :radius="TOOLBAR_CTRL_R"
            @click="stopStream"
          >
            停止
          </XtButton>
          <XtButton
            type="default"
            block
            class="agent-cmd__toolbar-btn agent-cmd__toolbar-btn--clear"
            :h="TOOLBAR_CTRL_H"
            :radius="TOOLBAR_CTRL_R"
            @click="clearChat"
          >
            清空
          </XtButton>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { agentStore } from '@store/agent';
import { parseUserIntent } from '@js/agent/intentParser';
import { presentTaskPlan } from '@js/agent/previewEngine';
import { streamChat } from '@js/agent/modelRouter';
import { executeAllConfirmed } from '@js/agent/actionExecutor';

const router = useRouter();
const store = agentStore();
const { conversationHistory, punkClawCommandMode } = storeToRefs(store);

const commandModeList = [
  { value: 'agent', name: 'Agent' },
  { value: 'ask', name: 'Ask' },
];

const commandMode = computed({
  get: () => store.punkClawCommandMode,
  set: (v: string) => store.setPunkClawCommandMode(v === 'ask' ? 'ask' : 'agent'),
});

/** 底部工具栏：模式 / 发送 / 停止 / 清空 统一高度与圆角 */
const TOOLBAR_CTRL_H = 36;
const TOOLBAR_CTRL_R = 8;

const input = ref('');
const working = ref(false);
const histRef = ref<HTMLElement | null>(null);
let abortCtl: AbortController | null = null;

const suggestions = ref(['打开 DApp 市场', '解释什么是质押', '打开我的钱包', '打开转账页面', '打开设置页面', '打开工作台']);

const quickTags = [
  { label: '钱包', text: '打开我的钱包' },
  { label: '市场', text: '打开 DApp 市场' },
  { label: '质押', text: '解释什么是质押' },
  { label: '转账', text: '打开转账页面' },
];

function scrollHist() {
  nextTick(() => {
    if (histRef.value) histRef.value.scrollTop = histRef.value.scrollHeight;
  });
}

watch(conversationHistory, scrollHist, { deep: true });

onMounted(() => {
  store.ensureDefaultProviders();
  store.setConnectionStatus('offline');
});

function applySuggest(text: string) {
  input.value = text;
}

function onTextareaEnter() {
  submit();
}

function buildChatMessages() {
  const system =
    '你是 PunkOS 磐古客户端里的 PunkClaw 智能助手，回答简洁，可结合区块链、钱包、DApp 场景。用户正在使用带预览窗口的 PunkClaw。';
  const msgs: { role: 'system' | 'user' | 'assistant'; content: string }[] = [{ role: 'system', content: system }];
  const recent = conversationHistory.value.slice(-16);
  recent.forEach((m) => {
    if (m.role === 'user' || m.role === 'assistant') {
      msgs.push({ role: m.role, content: m.content });
    }
  });
  return msgs;
}

async function runStreamChat() {
  abortCtl = new AbortController();
  store.pushConversation({ role: 'assistant', content: '', streaming: true });
  let buf = '';
  try {
    for await (const chunk of streamChat(buildChatMessages(), abortCtl.signal)) {
      if (chunk.error) {
        buf += `\n[错误] ${chunk.error}`;
        break;
      }
      if (chunk.content) {
        buf += chunk.content;
        store.updateLastConversation({ content: buf, streaming: true });
      }
    }
    store.updateLastConversation({ content: buf || '（无输出）', streaming: false });
    store.setConnectionStatus('online');
  } catch (e: any) {
    if (e?.name !== 'AbortError') {
      store.updateLastConversation({ content: buf + `\n${String(e?.message || e)}`, streaming: false });
    } else {
      store.updateLastConversation({ content: buf, streaming: false });
    }
  } finally {
    abortCtl = null;
  }
}

async function submit() {
  const text = input.value.trim();
  if (!text || working.value) return;
  input.value = '';
  store.pushConversation({ role: 'user', content: text });
  working.value = true;
  store.setAgentWorking(true);
  try {
    const result = await parseUserIntent(text);
    if (result.kind === 'task_plan' && result.plan) {
      presentTaskPlan(result.plan);
      if (punkClawCommandMode.value === 'ask') {
        store.bumpTaskStat('running', 1);
        try {
          const tasks = [...store.taskQueue];
          await executeAllConfirmed(router, tasks);
          store.pushConversation({
            role: 'assistant',
            content: `已直接执行：${result.plan.summary || ''}（Ask 模式）`,
          });
        } finally {
          store.bumpTaskStat('running', -1);
        }
        store.setConnectionStatus('online');
      } else {
        store.pushConversation({
          role: 'assistant',
          content: `已生成任务方案：${result.plan.summary || ''}\n请在 PunkClaw 预览窗口上方确认任务卡片后点击「确认执行全部」。`,
        });
        store.setConnectionStatus('online');
      }
    } else if (result.kind === 'reply' && result.reply) {
      store.pushConversation({ role: 'assistant', content: result.reply });
    } else {
      await runStreamChat();
    }
  } finally {
    working.value = false;
    store.setAgentWorking(false);
    scrollHist();
  }
}

function stopStream() {
  abortCtl?.abort();
  abortCtl = null;
}

function clearChat() {
  stopStream();
  store.clearConversation();
}

defineExpose({
  focusInput() {
    /* textarea focus via ref if needed */
  },
});
</script>

<style scoped>
.agent-cmd {
  width: 328px;
  flex-shrink: 0;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  background: rgba(8, 14, 28, 0.88);
  border-left: 1px solid rgba(0, 200, 255, 0.12);
  pointer-events: auto;
  color: rgba(224, 247, 255, 0.9);
  min-height: 0;
}
.agent-cmd__title {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #4fc3f7;
  margin-bottom: 10px;
}
.agent-cmd__suggest-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: rgba(179, 229, 252, 0.88);
  margin-bottom: 6px;
}
.agent-cmd__chips {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
}
.agent-suggest-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid rgba(79, 195, 247, 0.35);
  background: rgba(79, 195, 247, 0.1);
  color: #e0f7ff;
  font-size: 12px;
  line-height: 1.35;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
}
.agent-suggest-item:hover {
  background: rgba(79, 195, 247, 0.2);
  border-color: rgba(79, 195, 247, 0.55);
  color: #fff;
}
.agent-cmd__hist {
  flex: 1;
  min-height: 120px;
  overflow-y: auto;
  margin-bottom: 10px;
  border: 1px solid rgba(0, 200, 255, 0.1);
  border-radius: 8px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.2);
}
.agent-cmd__msg {
  margin-bottom: 10px;
  font-size: 13px;
}
.agent-cmd__role {
  font-size: 10px;
  color: rgba(224, 247, 255, 0.4);
  display: block;
  margin-bottom: 2px;
}
.agent-cmd__text {
  white-space: pre-wrap;
  line-height: 1.45;
  color: rgba(224, 247, 255, 0.88);
}
.role-user .agent-cmd__text {
  color: #b3e5fc;
}
.agent-cmd__cursor {
  animation: blink 1s step-end infinite;
}
@keyframes blink {
  50% {
    opacity: 0;
  }
}
.agent-cmd__quick {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 6px;
  width: 100%;
  margin-bottom: 8px;
}
.agent-quick-tag {
  flex: 1 1 0;
  min-width: 0;
  height: 30px;
  padding: 0 4px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(224, 247, 255, 0.92);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
}
.agent-quick-tag:hover {
  background: rgba(79, 195, 247, 0.18);
  border-color: rgba(79, 195, 247, 0.4);
  color: #fff;
}
.agent-cmd__input-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.agent-cmd__textarea {
  min-height: 72px;
}
.agent-cmd__textarea :deep(textarea) {
  min-height: 72px;
  line-height: 1.45;
  font-size: 13px;
}
.agent-cmd__btns {
  width: 100%;
  min-width: 0;
}
.agent-cmd__btns-inner {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  align-items: stretch;
  width: 100%;
  min-width: 0;
}
.agent-cmd__toolbar-slot {
  display: flex;
  align-items: stretch;
  min-width: 0;
}
.agent-cmd__mode-select {
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: stretch;
}
.agent-cmd__mode-select :deep(.ant-select) {
  width: 100% !important;
  min-width: 0 !important;
  display: flex !important;
  align-items: stretch !important;
}
.agent-cmd__mode-select :deep(.ant-select-selector) {
  box-sizing: border-box;
  height: 36px !important;
  min-height: 36px !important;
  border-radius: 8px !important;
  padding: 0 10px !important;
  background: rgba(12, 22, 40, 0.92) !important;
  border: 1px solid rgba(79, 195, 247, 0.28) !important;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.2);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}
.agent-cmd__mode-select :deep(.ant-select:hover .ant-select-selector) {
  border-color: rgba(79, 195, 247, 0.45) !important;
}
.agent-cmd__mode-select :deep(.ant-select-focused .ant-select-selector) {
  border-color: rgba(79, 195, 247, 0.65) !important;
  box-shadow: 0 0 0 1px rgba(79, 195, 247, 0.2);
}
.agent-cmd__mode-select :deep(.ant-select-selection-item),
.agent-cmd__mode-select :deep(.ant-select-selection-placeholder) {
  line-height: 34px !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  color: rgba(224, 247, 255, 0.92) !important;
}
.agent-cmd__mode-select :deep(.ant-select-arrow) {
  color: rgba(129, 212, 250, 0.75) !important;
}
.agent-cmd__btns-inner :deep(.agent-cmd__toolbar-btn) {
  box-sizing: border-box;
  font-size: 12px !important;
  font-weight: 600 !important;
  letter-spacing: 0.02em;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.22);
}
.agent-cmd__btns-inner :deep(.agent-cmd__toolbar-btn--muted) {
  background: rgba(12, 22, 40, 0.92) !important;
  color: rgba(224, 247, 255, 0.9) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}
.agent-cmd__btns-inner :deep(.agent-cmd__toolbar-btn--muted:hover:not(:disabled)) {
  background: rgba(20, 32, 52, 0.95) !important;
  border-color: rgba(79, 195, 247, 0.25) !important;
}
.agent-cmd__btns-inner :deep(.agent-cmd__toolbar-btn--clear) {
  background: linear-gradient(180deg, rgba(52, 20, 24, 0.96), rgba(34, 14, 18, 0.98)) !important;
  color: #e8a0a4 !important;
  border: 1px solid rgba(183, 28, 28, 0.42) !important;
}
.agent-cmd__btns-inner :deep(.agent-cmd__toolbar-btn--clear:hover:not(:disabled)) {
  background: linear-gradient(180deg, rgba(68, 28, 32, 0.98), rgba(44, 18, 22, 0.99)) !important;
  color: #ffcdd2 !important;
  border-color: rgba(229, 115, 115, 0.5) !important;
}
.agent-cmd__btns-inner :deep(.agent-cmd__toolbar-btn--clear:active:not(:disabled)) {
  filter: brightness(0.95);
}
</style>
