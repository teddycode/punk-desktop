import { defineStore } from 'pinia';
import { nanoid } from 'nanoid';
import type {
  AgentConnectionStatus,
  AgentContextSnapshot,
  ConceptCard,
  ConversationMessage,
  LogEntry,
  ModelProvider,
  ProactiveAlert,
  TaskCard,
} from '@js/agent/types';
import { aiStore } from './ai';

const STORAGE_KEY_MAPPINGS = 'punkos.agent.routeMappings.v1';

export interface RouteMappingItem {
  alias: string;
  routeName: string;
}

function defaultModelFromAiStore(): ModelProvider {
  const ai = aiStore();
  return {
    id: 'default-from-aistore',
    name: '默认（来自 AI 设置）',
    baseUrl: String(ai.url || '').replace(/\/$/, '') || 'https://api.openai.com',
    apiKey: String(ai.key || ''),
    modelName: String(ai.gpt || 'gpt-3.5-turbo'),
    maxTokens: 4096,
    temperature: typeof ai.temperature === 'number' ? ai.temperature : 0.7,
    status: 'untested',
  };
}

export const agentStore = defineStore('agentStore', {
  state: () => ({
    punkClawOpen: false,
    modelSettingsOpen: false,
    connectionStatus: 'offline' as AgentConnectionStatus,
    modelProviders: [] as ModelProvider[],
    activeModelId: '' as string,
    /** 估算的 token 用量（本地累计，非精确） */
    tokenUsage: {
      used: 0,
      remaining: 100000,
      total: 100000,
    },
    serviceMetrics: {
      avgLatencyMs: 0,
      successRate: 100,
      tasksToday: { done: 0, running: 0, failed: 0 },
    },
    taskQueue: [] as TaskCard[],
    executionLog: [] as LogEntry[],
    contextSnapshot: {
      walletAddress: null,
      chainName: null,
      chainId: null,
      balanceHint: null,
      currentRouteName: null,
      currentRouteTitle: null,
    } as AgentContextSnapshot,
    proactiveAlerts: [] as ProactiveAlert[],
    conceptCards: [] as ConceptCard[],
    conversationHistory: [] as ConversationMessage[],
    recentActions: [] as { id: string; label: string; ts: number }[],
    routeMappings: [] as RouteMappingItem[],
    /** 流式输出缓冲区（由 CommandPanel 消费） */
    streamBuffer: '',
    isAgentWorking: false,
    /** 当前方案摘要（中央任务区展示） */
    taskPlanSummary: '' as string,
    /** 指令模式：agent 需确认后执行；ask 生成方案后直接执行，不询问 */
    punkClawCommandMode: 'agent' as 'agent' | 'ask',
  }),

  getters: {
    activeModel(state): ModelProvider | null {
      if (state.activeModelId) {
        const found = state.modelProviders.find((m) => m.id === state.activeModelId);
        if (found) return found;
      }
      if (state.modelProviders.length) {
        return state.modelProviders[0];
      }
      return null;
    },
  },

  actions: {
    togglePunkClaw() {
      this.punkClawOpen = !this.punkClawOpen;
    },
    setPunkClawOpen(open: boolean) {
      this.punkClawOpen = open;
    },
    openModelSettings(open = true) {
      this.modelSettingsOpen = open;
    },

    ensureDefaultProviders() {
      if (!this.modelProviders.length) {
        const m = defaultModelFromAiStore();
        this.modelProviders = [m];
        this.activeModelId = m.id;
      } else if (!this.activeModelId) {
        this.activeModelId = this.modelProviders[0].id;
      }
    },

    addModelProvider(payload: Omit<ModelProvider, 'id' | 'status'> & Partial<Pick<ModelProvider, 'id' | 'status'>>) {
      const id = payload.id || nanoid();
      const p: ModelProvider = {
        id,
        name: payload.name,
        baseUrl: String(payload.baseUrl || '').replace(/\/$/, ''),
        apiKey: payload.apiKey || '',
        modelName: payload.modelName || 'gpt-3.5-turbo',
        maxTokens: payload.maxTokens ?? 4096,
        temperature: payload.temperature ?? 0.7,
        status: payload.status || 'untested',
        lastTestTime: payload.lastTestTime,
      };
      this.modelProviders.push(p);
      if (!this.activeModelId) this.activeModelId = id;
    },

    removeModelProvider(id: string) {
      this.modelProviders = this.modelProviders.filter((m) => m.id !== id);
      if (this.activeModelId === id) {
        this.activeModelId = this.modelProviders[0]?.id || '';
      }
    },

    updateModelProvider(id: string, patch: Partial<ModelProvider>) {
      const i = this.modelProviders.findIndex((m) => m.id === id);
      if (i >= 0) {
        this.modelProviders[i] = { ...this.modelProviders[i], ...patch };
      }
    },

    setActiveModelId(id: string) {
      if (this.modelProviders.some((m) => m.id === id)) {
        this.activeModelId = id;
      }
    },

    setConnectionStatus(s: AgentConnectionStatus) {
      this.connectionStatus = s;
    },

    bumpTokenUsage(delta: number) {
      this.tokenUsage.used += Math.max(0, delta);
    },

    recordLatency(ms: number) {
      const prev = this.serviceMetrics.avgLatencyMs;
      this.serviceMetrics.avgLatencyMs = prev ? Math.round(prev * 0.7 + ms * 0.3) : ms;
    },

    bumpTaskStat(kind: 'done' | 'running' | 'failed', delta: number) {
      this.serviceMetrics.tasksToday[kind] = Math.max(0, this.serviceMetrics.tasksToday[kind] + delta);
    },

    setTaskQueue(tasks: TaskCard[]) {
      this.taskQueue = tasks;
    },

    setTaskPlanSummary(s: string) {
      this.taskPlanSummary = s;
    },

    clearTaskQueue() {
      this.taskQueue = [];
      this.taskPlanSummary = '';
    },

    updateTask(id: string, patch: Partial<TaskCard>) {
      const i = this.taskQueue.findIndex((t) => t.id === id);
      if (i >= 0) {
        this.taskQueue[i] = { ...this.taskQueue[i], ...patch };
      }
    },

    pushLog(entry: Omit<LogEntry, 'id' | 'ts'> & Partial<Pick<LogEntry, 'id' | 'ts'>>) {
      const log: LogEntry = {
        id: entry.id || nanoid(),
        ts: entry.ts ?? Date.now(),
        level: entry.level,
        message: entry.message,
        detail: entry.detail,
      };
      this.executionLog.unshift(log);
      if (this.executionLog.length > 200) {
        this.executionLog.length = 200;
      }
    },

    setContextSnapshot(patch: Partial<AgentContextSnapshot>) {
      this.contextSnapshot = { ...this.contextSnapshot, ...patch };
    },

    pushConceptCard(term: string, explanation: string) {
      this.conceptCards.unshift({
        id: nanoid(),
        term,
        explanation,
        ts: Date.now(),
      });
      if (this.conceptCards.length > 8) this.conceptCards.pop();
    },

    clearConceptCards() {
      this.conceptCards = [];
    },

    pushConversation(msg: Omit<ConversationMessage, 'id' | 'ts'> & Partial<Pick<ConversationMessage, 'id' | 'ts'>>) {
      this.conversationHistory.push({
        id: msg.id || nanoid(),
        ts: msg.ts ?? Date.now(),
        role: msg.role,
        content: msg.content,
        streaming: msg.streaming,
      });
      if (this.conversationHistory.length > 100) {
        this.conversationHistory.splice(0, this.conversationHistory.length - 100);
      }
    },

    updateLastConversation(patch: Partial<ConversationMessage>) {
      const n = this.conversationHistory.length;
      if (n === 0) return;
      this.conversationHistory[n - 1] = { ...this.conversationHistory[n - 1], ...patch };
    },

    clearConversation() {
      this.conversationHistory = [];
    },

    pushRecentAction(label: string) {
      this.recentActions.unshift({ id: nanoid(), label, ts: Date.now() });
      if (this.recentActions.length > 10) this.recentActions.pop();
    },

    loadRouteMappingsFromStorage() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_MAPPINGS);
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            this.routeMappings = list.filter((x: any) => x.alias && x.routeName);
            return;
          }
        }
      } catch {
        /* ignore */
      }
      this.routeMappings = [];
    },

    saveRouteMappings() {
      localStorage.setItem(STORAGE_KEY_MAPPINGS, JSON.stringify(this.routeMappings));
    },

    setRouteMappings(list: RouteMappingItem[]) {
      this.routeMappings = list;
      this.saveRouteMappings();
    },

    setStreamBuffer(s: string) {
      this.streamBuffer = s;
    },

    setAgentWorking(w: boolean) {
      this.isAgentWorking = w;
    },

    setPunkClawCommandMode(mode: 'agent' | 'ask') {
      this.punkClawCommandMode = mode;
    },
  },

  persist: {
    enabled: true,
    strategies: [
      {
        key: 'agentStore',
        storage: localStorage,
        paths: [
          'punkClawOpen',
          'punkClawCommandMode',
          'modelProviders',
          'activeModelId',
          'tokenUsage',
          'routeMappings',
        ],
      },
    ],
  },
});
