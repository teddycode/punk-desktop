/** PunkClaw 自动代理 — 类型定义 */

export type ActionType = 'navigate' | 'query' | 'transact' | 'explain' | 'manage' | 'composite';

export type RiskLevel = 'low' | 'medium' | 'high';

export type AgentConnectionStatus = 'online' | 'offline' | 'reconnecting';

export type TaskStatus = 'pending' | 'preview' | 'running' | 'success' | 'failed' | 'skipped' | 'cancelled';

export type ModelProviderStatus = 'untested' | 'connected' | 'failed';

export interface ModelProvider {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  modelName: string;
  maxTokens: number;
  temperature: number;
  status: ModelProviderStatus;
  lastTestTime?: number;
}

export interface TaskCard {
  id: string;
  type: ActionType;
  title: string;
  description: string;
  params: Record<string, unknown>;
  riskLevel: RiskLevel;
  estimatedResult: string;
  status: TaskStatus;
  errorMessage?: string;
  /** 执行结果摘要 */
  resultSummary?: string;
}

export interface TaskPlan {
  tasks: TaskCard[];
  summary: string;
}

export interface LogEntry {
  id: string;
  ts: number;
  level: 'info' | 'success' | 'warn' | 'error';
  message: string;
  detail?: string;
}

export interface AgentContextSnapshot {
  walletAddress: string | null;
  chainName: string | null;
  chainId: string | number | null;
  balanceHint: string | null;
  currentRouteName: string | null;
  currentRouteTitle: string | null;
}

export interface ProactiveAlert {
  id: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  ts: number;
}

export interface ConceptCard {
  id: string;
  term: string;
  explanation: string;
  ts: number;
}

export type ConversationRole = 'user' | 'assistant' | 'system';

export interface ConversationMessage {
  id: string;
  role: ConversationRole;
  content: string;
  ts: number;
  /** 是否为流式未完成 */
  streaming?: boolean;
}

/** LLM 返回的结构化计划（解析前） */
export interface ParsedTaskPlanPayload {
  tasks: Array<{
    type: string;
    title: string;
    description: string;
    params?: Record<string, unknown>;
    riskLevel?: string;
    estimatedResult?: string;
  }>;
  summary?: string;
}

/** 本地规则 / 解析器产出的动作 */
export interface IntentResult {
  kind: 'task_plan' | 'reply' | 'stream_chat';
  plan?: TaskPlan;
  reply?: string;
  /** 需要走流式闲聊 */
  useStream?: boolean;
}
