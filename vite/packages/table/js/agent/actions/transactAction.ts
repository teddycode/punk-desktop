import type { TaskCard } from '../types';

/** MVP：链上交易占位，提示用户在小窗内完成签名 */
export async function runTransact(_router: unknown, task: TaskCard): Promise<string> {
  return `交易类任务「${task.title}」需在预览窗口内确认钱包签名（执行器待接入 Web3）。`;
}
