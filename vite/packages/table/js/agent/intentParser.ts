import type { Router } from 'vue-router';
import { agentStore } from '@store/agent';
import { chatCompletion } from './modelRouter';
import { planFromPayload } from './taskPlanner';
import type { IntentResult, ParsedTaskPlanPayload } from './types';

export function extractJsonFromText(content: string): ParsedTaskPlanPayload | null {
  const text = String(content || '').trim();
  if (!text) return null;

  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;

  try {
    return JSON.parse(candidate) as ParsedTaskPlanPayload;
  } catch {
    const first = candidate.indexOf('{');
    const last = candidate.lastIndexOf('}');
    if (first === -1 || last === -1 || last <= first) return null;
    try {
      return JSON.parse(candidate.slice(first, last + 1)) as ParsedTaskPlanPayload;
    } catch {
      return null;
    }
  }
}

function findMappingByText(text: string) {
  const store = agentStore();
  const raw = String(text || '');
  if (!raw) return null;
  const sorted = [...store.routeMappings].sort((a, b) => b.alias.length - a.alias.length);
  return sorted.find((item) => raw.toLowerCase().includes(item.alias.toLowerCase())) || null;
}

/** 本地规则：零成本快速路径 */
export function parseLocalIntent(command: string, router: Router): IntentResult | null {
  const text = String(command || '').trim();
  if (!text) return null;

  if (/(什么是|解释|说明).*(质押|staking)/i.test(text)) {
    const plan = planFromPayload({
      summary: '解释质押概念',
      tasks: [
        {
          type: 'explain',
          title: '解释质押',
          description: '在左侧上下文展示质押说明',
          params: { term: '质押（Staking）', text: '质押指将代币锁定在合约中，以换取收益或参与网络治理；解锁前通常无法自由转出。' },
          riskLevel: 'low',
          estimatedResult: '左侧出现概念卡',
        },
      ],
    });
    if (plan) return { kind: 'task_plan', plan };
  }

  if (/(增加|新增|创建).*(dapp|DApp).*(卡片|项目|应用)/i.test(text)) {
    const routeName = router.hasRoute('submitDapp') ? 'submitDapp' : 'DappMarketPage';
    const plan = planFromPayload({
      summary: '打开 DApp 提交',
      tasks: [
        {
          type: 'navigate',
          title: '打开 DApp 提交页',
          description: '跳转到提交 DApp 入口',
          params: { routeName },
          riskLevel: 'low',
          estimatedResult: '预览窗口进入提交页',
        },
      ],
    });
    if (plan) return { kind: 'task_plan', plan };
  }

  if (/(打开|进入|切换到|前往)/.test(text)) {
    const match = findMappingByText(text);
    if (match && router.hasRoute(match.routeName)) {
      const plan = planFromPayload({
        summary: `打开 ${match.alias}`,
        tasks: [
          {
            type: 'navigate',
            title: `打开「${match.alias}」`,
            description: `路由 ${match.routeName}`,
            params: { routeName: match.routeName },
            riskLevel: 'low',
            estimatedResult: '预览窗口跳转到对应页面',
          },
        ],
      });
      if (plan) return { kind: 'task_plan', plan };
    }
  }

  return null;
}

function buildPlannerContext() {
  const store = agentStore();
  const ctx = store.contextSnapshot;
  const routes = store.routeMappings.slice(0, 40).map((item) => ({ alias: item.alias, routeName: item.routeName }));
  return {
    wallet: ctx.walletAddress || '未连接',
    chain: ctx.chainName || '未知',
    balance: ctx.balanceHint || '未知',
    page: ctx.currentRouteTitle || ctx.currentRouteName || '未知',
    routeMappings: routes,
  };
}

/** 调用 LLM 生成任务编排 JSON */
export async function parseIntentWithLLM(command: string): Promise<IntentResult> {
  const ctx = buildPlannerContext();
  const system = [
    '你是 PunkOS 区块链客户端的 PunkClaw 规划器。',
    '只输出 JSON，不要 Markdown，不要解释。',
    'JSON 结构：{"summary":"...","tasks":[{"type":"navigate|query|transact|explain|manage","title":"...","description":"...","params":{},"riskLevel":"low|medium|high","estimatedResult":"..."}]}',
    'navigate 时 params 必须包含 routeName，且从 routeMappings 中选合法路由名。',
    '若用户只是闲聊、问泛化问题，返回 tasks 为空数组，并在 summary 里用一句话说明需要闲聊。',
  ].join('\n');

  const user = [`用户指令: ${command}`, `上下文: ${JSON.stringify(ctx)}`].join('\n');

  const res = await chatCompletion(
    [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    { temperature: 0, maxTokens: 2048 }
  );

  if (!res.ok) {
    return { kind: 'reply', reply: `模型请求失败：HTTP ${res.status}` };
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content || '';
  const usage = data?.usage;
  if (usage?.total_tokens) {
    agentStore().bumpTokenUsage(Number(usage.total_tokens));
  }

  const payload = extractJsonFromText(content);
  const plan = planFromPayload(payload);

  if (plan && plan.tasks.length) {
    agentStore().setConnectionStatus('online');
    return { kind: 'task_plan', plan };
  }

  if (payload && String(payload.summary || '').length) {
    return { kind: 'stream_chat', useStream: true };
  }

  return { kind: 'stream_chat', useStream: true };
}

/** 三级漏斗入口 */
export async function parseUserIntent(command: string, router: Router): Promise<IntentResult> {
  const local = parseLocalIntent(command, router);
  if (local) {
    return local;
  }

  try {
    const llm = await parseIntentWithLLM(command);
    if (llm.kind === 'task_plan' && llm.plan?.tasks.length) {
      return llm;
    }
    if (llm.kind === 'reply') {
      return llm;
    }
  } catch (e: any) {
    return { kind: 'reply', reply: `规划失败：${String(e?.message || e)}` };
  }

  return { kind: 'stream_chat', useStream: true };
}
