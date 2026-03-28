import type { Router } from 'vue-router';
import { agentStore } from '@store/agent';
import type { TaskCard } from './types';
import { runNavigate } from './actions/navigateAction';
import { runQuery } from './actions/queryAction';
import { runTransact } from './actions/transactAction';
import { runExplain } from './actions/explainAction';
import { runManage } from './actions/manageAction';

export async function executeTask(router: Router, task: TaskCard): Promise<string> {
  const store = agentStore();
  store.updateTask(task.id, { status: 'running' });
  try {
    let msg: string;
    switch (task.type) {
      case 'navigate':
        msg = await runNavigate(router, task);
        break;
      case 'query':
        msg = await runQuery(router, task);
        break;
      case 'transact':
        msg = await runTransact(router, task);
        break;
      case 'explain':
        msg = await runExplain(router, task);
        break;
      case 'manage':
        msg = await runManage(router, task);
        break;
      case 'composite':
        msg = await runQuery(router, task);
        break;
      default:
        msg = await runQuery(router, task);
    }
    store.updateTask(task.id, { status: 'success', resultSummary: msg });
    store.pushLog({ level: 'success', message: `${task.title}：${msg}` });
    store.pushRecentAction(task.title);
    store.bumpTaskStat('done', 1);
    return msg;
  } catch (e: any) {
    const err = String(e?.message || e);
    store.updateTask(task.id, { status: 'failed', errorMessage: err });
    store.pushLog({ level: 'error', message: `${task.title} 失败：${err}` });
    store.bumpTaskStat('failed', 1);
    throw e;
  }
}

export async function executeAllConfirmed(router: Router, tasks: TaskCard[]) {
  const store = agentStore();
  for (const t of tasks) {
    if (t.status === 'cancelled' || t.status === 'skipped') continue;
    // eslint-disable-next-line no-await-in-loop
    await executeTask(router, t);
  }
  store.pushLog({ level: 'info', message: '本轮任务已全部执行完毕' });
  store.clearTaskQueue();
}
