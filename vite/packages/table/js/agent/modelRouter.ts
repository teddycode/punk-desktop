import { agentStore } from '@store/agent';
import { aiStore } from '@store/ai';
import type { ModelProvider } from './types';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

function resolveModel(): ModelProvider | null {
  const ag = agentStore();
  ag.ensureDefaultProviders();
  const m = ag.activeModel;
  if (m && m.baseUrl && m.apiKey) {
    return m;
  }
  const ai = aiStore();
  if (ai.url && ai.key) {
    return {
      id: 'fallback-aistore',
      name: 'AI 设置',
      baseUrl: String(ai.url).replace(/\/$/, ''),
      apiKey: String(ai.key),
      modelName: String(ai.gpt || 'gpt-3.5-turbo'),
      maxTokens: 4096,
      temperature: Number(ai.temperature) || 0.7,
      status: 'untested',
    };
  }
  return null;
}

export async function chatCompletion(
  messages: ChatMessage[],
  options?: { temperature?: number; maxTokens?: number; model?: string; stream?: boolean }
): Promise<Response> {
  const model = resolveModel();
  if (!model) {
    throw new Error('未配置模型：请在 PunkClaw 模型设置或 AI 助手中填写 API 地址与密钥');
  }
  const baseUrl = model.baseUrl.replace(/\/$/, '');
  const body: Record<string, unknown> = {
    model: options?.model || model.modelName,
    messages,
    temperature: options?.temperature ?? model.temperature,
    max_tokens: options?.maxTokens ?? model.maxTokens,
    stream: options?.stream ?? false,
  };

  const started = Date.now();
  const res = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${model.apiKey}`,
    },
    body: JSON.stringify(body),
  });
  const ag = agentStore();
  ag.recordLatency(Date.now() - started);
  return res;
}

export async function testModelConnection(provider: ModelProvider): Promise<{ ok: boolean; message: string }> {
  const baseUrl = String(provider.baseUrl || '').replace(/\/$/, '');
  if (!baseUrl || !provider.apiKey) {
    return { ok: false, message: '请填写 API 地址与密钥' };
  }
  try {
    const res = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        model: provider.modelName,
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 5,
        temperature: 0,
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      return { ok: false, message: t.slice(0, 200) || `HTTP ${res.status}` };
    }
    return { ok: true, message: '连接成功' };
  } catch (e: any) {
    return { ok: false, message: String(e?.message || e) };
  }
}

export async function* streamChat(
  messages: ChatMessage[],
  signal?: AbortSignal
): AsyncGenerator<{ content?: string; error?: string }> {
  const model = resolveModel();
  if (!model) {
    yield { error: '未配置模型 API' };
    return;
  }
  const baseUrl = model.baseUrl.replace(/\/$/, '');
  const started = Date.now();
  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${model.apiKey}`,
    },
    body: JSON.stringify({
      model: model.modelName,
      stream: true,
      messages,
      temperature: model.temperature,
    }),
    signal,
  });
  const ag = agentStore();
  ag.recordLatency(Date.now() - started);

  if (!response.ok || !response.body) {
    yield { error: `HTTP ${response.status}` };
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value);
      while (buffer.includes('\n')) {
        const idx = buffer.indexOf('\n');
        const line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);
        if (line.startsWith('data: [DONE]')) return;
        if (line.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(line.slice(5));
            const token = parsed.choices?.[0]?.delta?.content || '';
            if (token) yield { content: token };
          } catch {
            /* ignore */
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
