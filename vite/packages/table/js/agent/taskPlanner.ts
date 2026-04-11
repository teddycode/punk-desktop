import { nanoid } from 'nanoid';
import type { ActionType, ParsedTaskPlanPayload, RiskLevel, TaskCard, TaskPlan } from './types';

const VALID_TYPES: ActionType[] = ['navigate', 'query', 'transact', 'explain', 'manage', 'composite'];

function normalizeType(t: string): ActionType {
  const s = String(t || '').toLowerCase();
  if (VALID_TYPES.includes(s as ActionType)) return s as ActionType;
  return 'query';
}

function normalizeRisk(r: string | undefined): RiskLevel {
  const s = String(r || 'low').toLowerCase();
  if (s === 'medium' || s === 'high' || s === 'low') return s;
  return 'low';
}

/** 将 LLM JSON 或本地结构转为标准 TaskPlan */
export function planFromPayload(payload: ParsedTaskPlanPayload | null | undefined): TaskPlan | null {
  if (!payload || !Array.isArray(payload.tasks) || !payload.tasks.length) {
    return null;
  }

  const tasks: TaskCard[] = payload.tasks.map((t) => ({
    id: nanoid(),
    type: normalizeType(t.type),
    title: String(t.title || '未命名任务'),
    description: String(t.description || ''),
    params: (t.params && typeof t.params === 'object' ? t.params : {}) as Record<string, unknown>,
    riskLevel: normalizeRisk(t.riskLevel),
    estimatedResult: String(t.estimatedResult || ''),
    status: 'preview',
  }));

  return {
    tasks,
    summary: String(payload.summary || ''),
  };
}
