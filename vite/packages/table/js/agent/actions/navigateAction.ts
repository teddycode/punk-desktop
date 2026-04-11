import type { Router } from 'vue-router';
import type { TaskCard } from '../types';

export async function runNavigate(router: Router, task: TaskCard): Promise<string> {
  const routeName = String(task.params.routeName || task.params.name || '');
  if (!routeName) {
    throw new Error('缺少 routeName 参数');
  }
  if (!router.hasRoute(routeName)) {
    throw new Error(`未知路由: ${routeName}`);
  }
  await router.push({ name: routeName as any, query: (task.params.query as any) || undefined });
  return `已导航到 ${routeName}`;
}
