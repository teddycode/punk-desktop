import type { TaskCard } from '../types';

/** MVP：占位查询，后续可接钱包余额、DApp API */
export async function runQuery(_router: unknown, task: TaskCard): Promise<string> {
  const q = String(task.params.queryType || 'generic');
  if (q === 'wallet_address') {
    return '请连接钱包后在上下文面板查看地址（查询能力待接入链上数据）。';
  }
  return `已执行查询类任务「${task.title}」：${task.description || '（暂无后端数据）'}`;
}
