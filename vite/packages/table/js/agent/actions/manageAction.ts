import type { Router } from 'vue-router';
import type { TaskCard } from '../types';

/** 系统管理类：如打开设置 */
export async function runManage(router: Router, task: TaskCard): Promise<string> {
  const action = String(task.params.action || '');
  if (action === 'open_settings' && router.hasRoute('setting')) {
    await router.push({ name: 'setting' });
    return '已打开设置';
  }
  return `管理动作「${task.title}」已记录（${action || '未指定'}）`;
}
