import { agentStore } from '@store/agent';
import type { TaskPlan } from './types';

/** 将规划结果写入队列，供中央区展示「预期效果」 */
export function presentTaskPlan(plan: TaskPlan) {
  const store = agentStore();
  store.setTaskPlanSummary(plan.summary || `${plan.tasks.length} 个步骤`);
  store.setTaskQueue(plan.tasks);
  store.pushLog({
    level: 'info',
    message: `已生成方案：${plan.summary || `${plan.tasks.length} 个步骤`}`,
  });
}

export function clearPreview() {
  agentStore().clearTaskQueue();
}
