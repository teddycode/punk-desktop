import { agentStore } from '@store/agent';
import type { TaskCard } from '../types';

export async function runExplain(_router: unknown, task: TaskCard): Promise<string> {
  const term = String(task.params.term || task.title || '说明');
  const text = String(task.params.text || task.description || task.estimatedResult || '暂无详细说明');
  agentStore().pushConceptCard(term, text);
  return `已在左侧展示「${term}」说明`;
}
