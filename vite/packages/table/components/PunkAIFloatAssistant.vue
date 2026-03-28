<template>
  <div
    class="punkai-launcher"
    :class="{ 'punkai-docked': isDocked }"
    :style="launcherStyle"
    @mousedown="startDrag"
  >
    <button class="punkai-launcher-btn" type="button" @click.stop="handleButtonClick">
      <img src="/icons/punkai.png" class="punkai-icon" alt="PunkAI" draggable="false" />
    </button>
  </div>

  <transition name="punkai-fade">
    <div v-if="panelVisible" class="punkai-panel">
      <div class="punkai-header">
        <div>
          <div class="punkai-title">PunkAI Assistant</div>
          <div class="punkai-subtitle">你的磐古系统 AI 界面操控助手</div>
        </div>
        <div class="punkai-actions">
          <button
            class="punkai-tab-btn"
            type="button"
            :class="{ active: activeTab === 'chat' }"
            @click="activeTab = 'chat'"
          >
            对话
          </button>
          <button
            class="punkai-tab-btn"
            type="button"
            :class="{ active: activeTab === 'settings' }"
            @click="activeTab = 'settings'"
          >
            设置
          </button>
          <button class="punkai-close" type="button" @click="panelVisible = false">×</button>
        </div>
      </div>

      <div v-if="activeTab === 'chat'" class="punkai-chat">
        <div ref="msgListRef" class="punkai-message-list">
          <div v-for="item in messages" :key="item.id" class="punkai-message" :class="item.role">
            <div class="punkai-role">{{ item.role === 'assistant' ? 'PunkAI' : '你' }}</div>
            <div class="punkai-content">{{ item.content }}<span v-if="item.streaming" class="punkai-cursor">▋</span></div>
            <div v-if="item.kind === 'page-list'" class="punkai-page-list">
              <button
                v-for="routeItem in item.pages"
                :key="`${routeItem.alias}-${routeItem.routeName}`"
                type="button"
                class="punkai-page-chip"
                @click="jumpByMapping(routeItem)"
              >
                {{ routeItem.alias }}
              </button>
            </div>
          </div>
        </div>

        <div class="punkai-input-row">
          <textarea
            v-model="inputText"
            class="punkai-input"
            rows="2"
            placeholder="直接对话，或输入指令：打开设置页面、切换到DApp市场…"
            @keydown.enter.exact.prevent="submitCommand"
          ></textarea>
          <div class="punkai-btn-col">
            <button class="punkai-send" type="button" :disabled="isWorking && !currentStreamAbortController" @click="isWorking ? stopStreaming() : submitCommand()">
              {{ isWorking ? '停止' : '发送' }}
            </button>
            <button class="punkai-clear" title="清空对话" type="button" @click="clearConversation">清空</button>
          </div>
        </div>
      </div>

      <div v-else class="punkai-settings">
        <div class="punkai-section-title">模型配置</div>
        <label class="punkai-label">API 地址</label>
        <input v-model="ai.url" class="punkai-field" placeholder="例如：https://api.openai.com" />

        <label class="punkai-label">API 密钥</label>
        <input v-model="ai.key" class="punkai-field" type="password" placeholder="输入 API Key" />

        <label class="punkai-label">模型名称</label>
        <input v-model="ai.gpt" class="punkai-field" placeholder="例如：gpt-4o-mini" />

        <label class="punkai-label">上下文轮数（最多保留最近 N 轮对话）</label>
        <div class="punkai-slider-row">
          <input type="range" v-model.number="ai.count" min="1" max="20" class="punkai-slider" />
          <span class="punkai-slider-val">{{ ai.count }}</span>
        </div>

        <div class="punkai-section-title" style="margin-top:14px">系统提示词（System Prompt）</div>
        <div class="punkai-preset-list">
          <button
            v-for="p in PRESET_PROMPTS"
            :key="p.name"
            type="button"
            class="punkai-preset-chip"
            :class="{ active: systemPrompt === p.value }"
            @click="applyPreset(p)"
          >
            {{ p.name }}
          </button>
        </div>
        <textarea
          v-model="systemPrompt"
          class="punkai-field punkai-prompt-area"
          rows="4"
          placeholder="输入自定义系统提示词，为空则不使用系统提示词"
          @blur="persistSystemPrompt"
        ></textarea>
        <div class="punkai-setting-tip">以上配置自动保存到本地。指令解析前会注入功能列表和路由映射上下文。</div>

        <div class="punkai-section-title" style="margin-top:14px">页面路由映射</div>
        <div class="punkai-mapping-add">
          <input v-model="newAlias" class="punkai-field" placeholder="页面别名（如：设置页面）" />
          <select v-model="newRouteName" class="punkai-field punkai-select">
            <option value="">请选择路由</option>
            <option v-for="item in routeOptions" :key="item.routeName" :value="item.routeName">
              {{ item.label }} ({{ item.routeName }})
            </option>
          </select>
          <button class="punkai-save" type="button" @click="addRouteMapping">新增映射</button>
        </div>

        <div class="punkai-mapping-list">
          <div v-for="(item, index) in routeMappings" :key="`${item.alias}-${item.routeName}-${index}`" class="punkai-mapping-item">
            <input v-model="item.alias" class="punkai-field" />
            <select v-model="item.routeName" class="punkai-field punkai-select">
              <option v-for="opt in routeOptions" :key="opt.routeName" :value="opt.routeName">
                {{ opt.label }} ({{ opt.routeName }})
              </option>
            </select>
            <button class="punkai-remove" type="button" @click="removeRouteMapping(index)">删除</button>
          </div>
        </div>

        <button class="punkai-save" type="button" @click="persistMappings">保存映射</button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { aiStore } from '../store/ai';

const PANEL_WIDTH = 420;
const PANEL_HEIGHT = 700;
const EDGE_GAP = 16;
const LAUNCHER_SIZE = 52;

const MAPPING_STORAGE_KEY = 'punkai.route.mappings.v1';
const LAUNCHER_POS_KEY = 'punkai.launcher.position.v1';
const DOCK_STATE_KEY = 'punkai.dock.state.v1';
const SYSTEM_PROMPT_KEY = 'punkai.system.prompt.v1';

const PRESET_PROMPTS = [
  { name: '通用助手', value: '你是一个智能助手，请用中文回答用户的所有问题，保持简洁友好。' },
  {
    name: 'PunkOS 专家',
    value:
      '你是磐古系统 PunkOS 的专属 AI 助手，深度了解区块链、Web3 钱包、DApp 市场操作。请用中文帮助用户操作和理解 PunkOS 系统，回答时举例说明。',
  },
  {
    name: '代码助手',
    value:
      '你是资深编程专家，擅长 JavaScript、Solidity、Vue、TypeScript 等技术，请提供简洁准确的代码示例并附上说明，优先用中文回答。',
  },
  {
    name: 'Web3 顾问',
    value:
      '你是 Web3 领域专家，熟悉 DeFi、NFT、智能合约、跨链桥、Gas 优化等知识，请用通俗易懂的语言解答区块链相关问题。',
  },
  { name: '翻译助手', value: '你是专业翻译，擅长中英文互译。请准确翻译用户提供的内容，保持原文语义和语气，不要添加额外解释。' },
];

const router = useRouter();
const ai = aiStore();

const panelVisible = ref(false);
const activeTab = ref('chat');
const isWorking = ref(false);
const inputText = ref('');
const newAlias = ref('');
const newRouteName = ref('');

const messages = ref([]);
const routeOptions = ref([]);
const routeMappings = ref([]);
const msgListRef = ref(null);

// 对话历史（仅用于发给 API，不含欢迎消息等 UI 专属条目）
const conversationHistory = ref([]);
// 系统提示词（预设 + 自定义）
const systemPrompt = ref('');
// 当前流式请求的 AbortController
let currentStreamAbortController = null;

const isDocked = ref(false);
const savedBeforeDock = ref(null);
const windowWidth = ref(window.innerWidth);
const windowHeight = ref(window.innerHeight);

const launcherPos = ref({ x: 0, y: 0 });
let dragStartX = 0;
let dragStartY = 0;
let dragOriginX = 0;
let dragOriginY = 0;
let didDrag = false;
let suppressClickUntil = 0;
let singleClickTimer = null;
let pendingClickCount = 0;

const launcherStyle = computed(() => {
  if (isDocked.value) {
    return {
      left: `${windowWidth.value - LAUNCHER_SIZE / 2}px`,
      top: `${windowHeight.value - LAUNCHER_SIZE / 2}px`,
    };
  }
  return { left: `${launcherPos.value.x}px`, top: `${launcherPos.value.y}px` };
});

const knownMappings = [
  { alias: '设置页面', routeName: 'setting' },
  { alias: '基础设置', routeName: 'basicSetting' },
  { alias: 'DApp市场', routeName: 'DappMarketPage' },
  { alias: 'Dapp市场', routeName: 'DappMarketPage' },
  { alias: '我的钱包', routeName: 'myWallets' },
  { alias: '浏览器', routeName: 'browserTabs' },
  { alias: '聊天', routeName: 'chat' },
  { alias: '工作台', routeName: 'workDesk' },
  { alias: '应用中心', routeName: 'apps' },
  { alias: '我的投资', routeName: 'myInfoPage' },
  { alias: '提交DApp', routeName: 'submitDapp' },
  { alias: 'AI助手', routeName: 'ai' },
];

function normalizeRouteName(name) {
  return String(name || '').trim();
}

function prettyRouteLabel(record) {
  if (record.meta && typeof record.meta.title === 'string' && record.meta.title) {
    return record.meta.title;
  }
  const routeName = String(record.name || '').trim();
  if (!routeName) {
    return '未命名页面';
  }
  return routeName.replace(/([a-z])([A-Z])/g, '$1 $2');
}

function refreshRouteOptions() {
  const allRoutes = router
    .getRoutes()
    .filter((item) => item.name && !String(item.path || '').includes(':') && !item.redirect)
    .map((item) => ({
      routeName: String(item.name),
      label: prettyRouteLabel(item),
      path: item.path,
    }));

  const unique = new Map();
  allRoutes.forEach((item) => {
    if (!unique.has(item.routeName)) {
      unique.set(item.routeName, item);
    }
  });

  routeOptions.value = Array.from(unique.values()).sort((a, b) => a.label.localeCompare(b.label));
}

function getDefaultMappings() {
  const result = [];
  const used = new Set();

  knownMappings.forEach((item) => {
    const routeName = normalizeRouteName(item.routeName);
    if (router.hasRoute(routeName) && !used.has(`${item.alias}-${routeName}`)) {
      result.push({ alias: item.alias, routeName });
      used.add(`${item.alias}-${routeName}`);
    }
  });

  routeOptions.value.slice(0, 20).forEach((item) => {
    const alias = item.label;
    if (!used.has(`${alias}-${item.routeName}`)) {
      result.push({ alias, routeName: item.routeName });
      used.add(`${alias}-${item.routeName}`);
    }
  });

  return result;
}

function loadMappings() {
  const raw = localStorage.getItem(MAPPING_STORAGE_KEY);
  if (!raw) {
    routeMappings.value = getDefaultMappings();
    persistMappings();
    return;
  }

  try {
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) {
      throw new Error('route mapping not array');
    }

    routeMappings.value = list
      .map((item) => ({
        alias: String(item.alias || '').trim(),
        routeName: normalizeRouteName(item.routeName),
      }))
      .filter((item) => item.alias && item.routeName && router.hasRoute(item.routeName));

    if (!routeMappings.value.length) {
      routeMappings.value = getDefaultMappings();
      persistMappings();
    }
  } catch (error) {
    routeMappings.value = getDefaultMappings();
    persistMappings();
  }
}

function persistMappings() {
  const normalized = routeMappings.value
    .map((item) => ({ alias: String(item.alias || '').trim(), routeName: normalizeRouteName(item.routeName) }))
    .filter((item) => item.alias && item.routeName && router.hasRoute(item.routeName));

  routeMappings.value = normalized;
  localStorage.setItem(MAPPING_STORAGE_KEY, JSON.stringify(routeMappings.value));
}

function addRouteMapping() {
  const alias = String(newAlias.value || '').trim();
  const routeName = normalizeRouteName(newRouteName.value);
  if (!alias || !routeName || !router.hasRoute(routeName)) {
    return;
  }

  routeMappings.value.push({ alias, routeName });
  persistMappings();
  newAlias.value = '';
  newRouteName.value = '';
}

function removeRouteMapping(index) {
  routeMappings.value.splice(index, 1);
  persistMappings();
}

function appendMessage(role, content, kind = 'text', pages = []) {
  messages.value.push({
    id: Date.now() + Math.random(),
    role,
    content,
    kind,
    pages,
    streaming: false,
  });
  nextTick(() => {
    if (msgListRef.value) {
      msgListRef.value.scrollTop = msgListRef.value.scrollHeight;
    }
  });
}

function ensureWelcomeMessage() {
  if (messages.value.length) {
    return;
  }

  appendMessage(
    'assistant',
    '你好，我是 PunkAI Assistant（PunkAI）。你可以直接输入自然语言让我帮你操控界面。'
  );

  appendMessage(
    'assistant',
    '你可以直接点击下面的页面快速跳转：',
    'page-list',
    routeMappings.value.slice(0, 12)
  );
}

function findMappingByText(text) {
  const raw = String(text || '');
  if (!raw) {
    return null;
  }

  const sortedMappings = [...routeMappings.value].sort((a, b) => b.alias.length - a.alias.length);
  return sortedMappings.find((item) => raw.toLowerCase().includes(item.alias.toLowerCase())) || null;
}

function parseLocalCommand(command) {
  const text = String(command || '').trim();
  if (!text) {
    return { type: 'reply', reply: '请先输入命令。' };
  }

  const switchModelMatch = text.match(/(?:切换大模型|切换模型)\s*(?:到|为)?\s*([a-zA-Z0-9._:-]+)/i);
  if (switchModelMatch && switchModelMatch[1]) {
    return {
      type: 'switch_model',
      model: switchModelMatch[1],
      reply: `模型已切换到 ${switchModelMatch[1]}`,
    };
  }

  if (/(增加|新增|创建).*(dapp|DApp).*(卡片|项目|应用)/.test(text)) {
    return {
      type: 'navigate',
      routeName: router.hasRoute('submitDapp') ? 'submitDapp' : 'DappMarketPage',
      reply: '已为你打开 DApp 提交入口，可以继续添加新的 DApp 卡片。',
    };
  }

  if (/(打开|进入|切换到|前往)/.test(text)) {
    const match = findMappingByText(text);
    if (match) {
      return {
        type: 'navigate',
        routeName: match.routeName,
        reply: `已为你打开 ${match.alias}。`,
      };
    }
  }

  return {
    type: 'reply',
    reply: '我理解了你的意图，但当前还无法精确执行。你可以更明确地说"打开设置页面"或"切换到DApp市场"。',
  };
}

function extractJsonFromText(content) {
  const text = String(content || '').trim();
  if (!text) {
    return null;
  }

  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;

  try {
    return JSON.parse(candidate);
  } catch (error) {
    const first = candidate.indexOf('{');
    const last = candidate.lastIndexOf('}');
    if (first === -1 || last === -1 || last <= first) {
      return null;
    }
    try {
      return JSON.parse(candidate.slice(first, last + 1));
    } catch (parseError) {
      return null;
    }
  }
}

function buildModelContext() {
  const featureList = routeMappings.value.slice(0, 30).map((item) => item.alias);
  const routes = routeMappings.value.slice(0, 50).map((item) => ({ alias: item.alias, routeName: item.routeName }));

  return {
    appName: '磐古系统 PunkOS',
    assistantName: 'PunkAI Assistant',
    features: featureList,
    routeMappings: routes,
  };
}

// 构建发送给 API 的 messages 数组（系统提示词 + 历史 + 当前问题）
function buildApiMessages(userInput) {
  const msgs = [];
  if (systemPrompt.value && systemPrompt.value.trim()) {
    msgs.push({ role: 'system', content: systemPrompt.value.trim() });
  }
  // 取最近 count*2 条历史（user+assistant 各算一条）
  const maxHistory = Math.max(2, (ai.count || 4) * 2);
  const recent = conversationHistory.value.slice(-maxHistory);
  msgs.push(...recent);
  msgs.push({ role: 'user', content: userInput });
  return msgs;
}

// 流式 SSE 对话生成器，逻辑与 chat/main/api.ts getStreamData 保持一致
async function* streamChat(apiMessages) {
  const baseUrl = String(ai.url || '').replace(/\/+$/, '');
  if (!baseUrl || !ai.key) return;

  currentStreamAbortController = new AbortController();

  try {
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ai.key}`,
      },
      body: JSON.stringify({
        model: ai.gpt || 'gpt-3.5-turbo',
        stream: true,
        messages: apiMessages,
        temperature: parseFloat(String(ai.temperature)) || 0.7,
      }),
      signal: currentStreamAbortController.signal,
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    if (!response.ok) {
      const { value } = await reader.read();
      try {
        const errBody = JSON.parse(decoder.decode(value));
        yield { error: errBody?.error?.message || `HTTP ${response.status}` };
      } catch (_) {
        yield { error: `HTTP ${response.status}` };
      }
      reader.releaseLock();
      return;
    }

    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        reader.releaseLock();
        break;
      }
      buffer += decoder.decode(value);
      while (buffer.includes('\n')) {
        const idx = buffer.indexOf('\n');
        const line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);
        if (line.startsWith('data: [DONE]')) break;
        if (line.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(line.slice(5));
            const token = parsed.choices?.[0]?.delta?.content || '';
            if (token) {
              yield { content: token, id: parsed.created };
            }
          } catch (_) {
            // 忽略格式错误的 SSE 行
          }
        }
      }
    }
  } catch (err) {
    if (err && err.name !== 'AbortError') {
      console.error('PunkAI stream error:', err);
      yield { error: String(err.message || err) };
    }
  } finally {
    currentStreamAbortController = null;
  }
}

function stopStreaming() {
  if (currentStreamAbortController) {
    currentStreamAbortController.abort();
    currentStreamAbortController = null;
  }
  // 清除最后一条消息的打字光标
  const last = messages.value[messages.value.length - 1];
  if (last && last.streaming) {
    last.streaming = false;
  }
  isWorking.value = false;
}

function clearConversation() {
  stopStreaming();
  conversationHistory.value = [];
  messages.value = [];
  ensureWelcomeMessage();
}

async function parseByModel(command) {
  const baseUrl = String(ai.url || '').replace(/\/+$/, '');
  if (!baseUrl || !ai.key) {
    return null;
  }

  const context = buildModelContext();

  const systemPrompt = [
    '你是 PunkAI Assistant 的指令解析器。',
    '根据用户命令，返回 JSON。不要返回解释文字。',
    '可用 action.type: navigate | switch_model | reply。',
    'JSON 字段：type, routeName, model, reply。',
    '如果是打开页面，优先从 routeMappings 中选择 routeName。',
    '如果是切换模型，返回 switch_model 和 model。',
    '如果无法执行，返回 reply。',
  ].join('\n');

  const userPrompt = [
    `用户命令: ${command}`,
    `功能与路由上下文: ${JSON.stringify(context)}`,
  ].join('\n');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ai.key}`,
      },
      body: JSON.stringify({
        model: ai.gpt || 'gpt-4o-mini',
        temperature: 0,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || '';
    return extractJsonFromText(content);
  } catch (error) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function executeAction(action) {
  if (!action || !action.type) {
    appendMessage('assistant', '未能解析出可执行动作，请换一种说法。');
    return;
  }

  if (action.type === 'switch_model' && action.model) {
    ai.gpt = String(action.model);
    appendMessage('assistant', action.reply || `模型已切换为 ${ai.gpt}`);
    return;
  }

  if (action.type === 'navigate' && action.routeName) {
    const routeName = normalizeRouteName(action.routeName);
    if (router.hasRoute(routeName)) {
      await router.push({ name: routeName });
      appendMessage('assistant', action.reply || `已为你打开 ${routeName}。`);
      return;
    }
    appendMessage('assistant', `没有找到路由 ${routeName}，请在设置中检查映射。`);
    return;
  }

  appendMessage('assistant', action.reply || '命令已接收，但暂未执行具体动作。');
}

async function submitCommand() {
  const command = String(inputText.value || '').trim();
  if (!command || isWorking.value) return;

  appendMessage('user', command);
  inputText.value = '';
  isWorking.value = true;

  try {
    // 第一层：本地正则快速识别界面指令
    const localAction = parseLocalCommand(command);
    if (localAction.type === 'navigate' || localAction.type === 'switch_model') {
      await executeAction(localAction);
      return;
    }

    // 未配置 API 时直接提示
    if (!ai.url || !ai.key) {
      appendMessage('assistant', '请先在「设置」中配置 API 地址和密钥，以启用 AI 对话功能。');
      return;
    }

    // 第二层：调用模型判断是否为界面操控指令（非流式，等待 JSON 结果）
    const modelCmd = await parseByModel(command);
    if (modelCmd && (modelCmd.type === 'navigate' || modelCmd.type === 'switch_model')) {
      await executeAction(modelCmd);
      return;
    }

    // 第三层：普通对话，使用流式接口
    // 将用户消息加入会话历史
    conversationHistory.value.push({ role: 'user', content: command });

    // 创建空的助手消息占位（用于流式追加）
    // streaming:true 用于显示打字光标
    messages.value.push({ id: Date.now() + Math.random(), role: 'assistant', content: '', kind: 'text', pages: [], streaming: true });
    const msgIndex = messages.value.length - 1;

    const apiMessages = buildApiMessages(command);
    // buildApiMessages 已经在末尾追加了 user 消息，
    // 但 conversationHistory 里刚刚也 push 了，
    // 为避免重复，重新构建时使用不含最新 user 的历史
    const messagesForApi = [];
    if (systemPrompt.value && systemPrompt.value.trim()) {
      messagesForApi.push({ role: 'system', content: systemPrompt.value.trim() });
    }
    const maxHistory = Math.max(2, (ai.count || 4) * 2);
    // 历史里最后一条已是刚 push 的 user，取前面的 + 末尾 user
    const prevHistory = conversationHistory.value.slice(0, -1).slice(-maxHistory);
    messagesForApi.push(...prevHistory);
    messagesForApi.push({ role: 'user', content: command });

    let fullReply = '';
    for await (const chunk of streamChat(messagesForApi)) {
      if (chunk.error) {
        // 通过响应式路径更新，确保 Vue 检测到变化
        messages.value[msgIndex].content = `请求失败：${chunk.error}`;
        messages.value[msgIndex].streaming = false;
        conversationHistory.value.pop();
        return;
      }
      if (chunk.content) {
        fullReply += chunk.content;
        // 必须通过 messages.value[index] 写入，走 Vue Proxy setter 触发响应式更新
        messages.value[msgIndex].content = fullReply;
        // 自动滚到底部
        nextTick(() => {
          if (msgListRef.value) {
            msgListRef.value.scrollTop = msgListRef.value.scrollHeight;
          }
        });
      }
    }

    // 流结束，移除打字光标
    messages.value[msgIndex].streaming = false;

    // 将完整回复加入会话历史
    if (fullReply) {
      conversationHistory.value.push({ role: 'assistant', content: fullReply });
    } else {
      // 流被中断或无内容
      if (!messages.value[msgIndex].content) {
        messages.value[msgIndex].content = '（已停止）';
      }
      conversationHistory.value.pop(); // 回滚 user
    }
  } finally {
    isWorking.value = false;
  }
}

async function jumpByMapping(item) {
  const routeName = normalizeRouteName(item.routeName);
  if (!router.hasRoute(routeName)) {
    appendMessage('assistant', `当前映射路由不存在：${routeName}`);
    return;
  }
  await router.push({ name: routeName });
  appendMessage('assistant', `已打开 ${item.alias}。`);
}

function clampLauncherPos(x, y) {
  const maxX = Math.max(EDGE_GAP, window.innerWidth - LAUNCHER_SIZE - EDGE_GAP);
  const maxY = Math.max(EDGE_GAP, window.innerHeight - LAUNCHER_SIZE - EDGE_GAP);

  return {
    x: Math.min(Math.max(EDGE_GAP, x), maxX),
    y: Math.min(Math.max(EDGE_GAP, y), maxY),
  };
}

function initLauncherPos() {
  const defaultPos = {
    x: Math.max(EDGE_GAP, window.innerWidth - LAUNCHER_SIZE - EDGE_GAP),
    y: Math.max(EDGE_GAP, window.innerHeight - LAUNCHER_SIZE - PANEL_HEIGHT * 0.2),
  };

  const raw = localStorage.getItem(LAUNCHER_POS_KEY);
  if (!raw) {
    launcherPos.value = clampLauncherPos(defaultPos.x, defaultPos.y);
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    launcherPos.value = clampLauncherPos(Number(parsed.x || defaultPos.x), Number(parsed.y || defaultPos.y));
  } catch (error) {
    launcherPos.value = clampLauncherPos(defaultPos.x, defaultPos.y);
  }
}

function persistLauncherPos() {
  localStorage.setItem(LAUNCHER_POS_KEY, JSON.stringify(launcherPos.value));
}

function startDrag(event) {
  if (event.button !== 0 || isDocked.value) {
    return;
  }

  didDrag = false;
  dragStartX = event.clientX;
  dragStartY = event.clientY;
  dragOriginX = launcherPos.value.x;
  dragOriginY = launcherPos.value.y;

  window.addEventListener('mousemove', onDragging);
  window.addEventListener('mouseup', stopDrag);
}

function onDragging(event) {
  const deltaX = event.clientX - dragStartX;
  const deltaY = event.clientY - dragStartY;
  if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
    didDrag = true;
  }

  launcherPos.value = clampLauncherPos(dragOriginX + deltaX, dragOriginY + deltaY);
}

function stopDrag() {
  window.removeEventListener('mousemove', onDragging);
  window.removeEventListener('mouseup', stopDrag);

  if (didDrag) {
    suppressClickUntil = Date.now() + 120;
    persistLauncherPos();
  }
}

function togglePanel() {
  if (Date.now() < suppressClickUntil) {
    return;
  }

  panelVisible.value = !panelVisible.value;
  if (panelVisible.value) {
    ensureWelcomeMessage();
  }
}

function saveDockState() {
  localStorage.setItem(
    DOCK_STATE_KEY,
    JSON.stringify({ isDocked: isDocked.value, savedPos: savedBeforeDock.value })
  );
}

function toggleDocked() {
  if (isDocked.value) {
    isDocked.value = false;
    if (savedBeforeDock.value) {
      launcherPos.value = { ...savedBeforeDock.value };
      savedBeforeDock.value = null;
    }
  } else {
    savedBeforeDock.value = { ...launcherPos.value };
    isDocked.value = true;
    panelVisible.value = false;
  }
  saveDockState();
}

function handleButtonClick() {
  if (Date.now() < suppressClickUntil) {
    return;
  }
  pendingClickCount++;
  if (pendingClickCount === 1) {
    singleClickTimer = setTimeout(() => {
      pendingClickCount = 0;
      if (!isDocked.value) {
        togglePanel();
      }
    }, 280);
  } else {
    clearTimeout(singleClickTimer);
    pendingClickCount = 0;
    toggleDocked();
  }
}

function onWindowResize() {
  windowWidth.value = window.innerWidth;
  windowHeight.value = window.innerHeight;
  if (!isDocked.value) {
    launcherPos.value = clampLauncherPos(launcherPos.value.x, launcherPos.value.y);
    if (panelVisible.value) {
      const tooRight = launcherPos.value.x + PANEL_WIDTH + EDGE_GAP > window.innerWidth;
      if (tooRight) {
        launcherPos.value = clampLauncherPos(window.innerWidth - LAUNCHER_SIZE - EDGE_GAP, launcherPos.value.y);
      }
    }
  }
}

function loadDockState() {
  const raw = localStorage.getItem(DOCK_STATE_KEY);
  if (!raw) return;
  try {
    const state = JSON.parse(raw);
    if (state.isDocked) {
      isDocked.value = true;
      savedBeforeDock.value = state.savedPos || null;
    }
  } catch (e) {
    // ignore
  }
}

function loadSystemPrompt() {
  const saved = localStorage.getItem(SYSTEM_PROMPT_KEY);
  // 默认使用 PunkOS 专家预设
  systemPrompt.value = saved !== null ? saved : PRESET_PROMPTS[1].value;
}

function persistSystemPrompt() {
  localStorage.setItem(SYSTEM_PROMPT_KEY, systemPrompt.value);
}

function applyPreset(preset) {
  systemPrompt.value = preset.value;
  persistSystemPrompt();
}

onMounted(() => {
  refreshRouteOptions();
  loadMappings();
  initLauncherPos();
  loadDockState();
  loadSystemPrompt();
  window.addEventListener('resize', onWindowResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', onWindowResize);
  window.removeEventListener('mousemove', onDragging);
  window.removeEventListener('mouseup', stopDrag);
  stopStreaming();
  if (singleClickTimer) {
    clearTimeout(singleClickTimer);
  }
});
</script>

<style scoped>
.punkai-launcher {
  position: fixed;
  z-index: 2400;
}

.punkai-launcher-btn {
  width: 52px;
  height: 52px;
  border: 0;
  border-radius: 50%;
  cursor: pointer;
  padding: 0;
  overflow: hidden;
  background: linear-gradient(135deg, #ff6a00, #ee0979);
  box-shadow: 0 10px 30px rgba(238, 9, 121, 0.35);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.punkai-launcher-btn:hover {
  transform: scale(1.08);
  box-shadow: 0 14px 36px rgba(238, 9, 121, 0.45);
}

.punkai-icon {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
  pointer-events: none;
  user-select: none;
}

/* 吸附到右下角时仅露出左上四分之一圆 */
.punkai-docked .punkai-launcher-btn {
  box-shadow: -4px -4px 20px rgba(238, 9, 121, 0.5);
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.punkai-docked .punkai-launcher-btn:hover {
  transform: translate(-4px, -4px);
  box-shadow: -8px -8px 28px rgba(238, 9, 121, 0.6);
}

.punkai-panel {
  position: fixed;
  right: 16px;
  bottom: 94px;
  width: 420px;
  max-width: calc(100vw - 24px);
  height: min(700px, calc(100vh - 112px));
  border-radius: 16px;
  overflow: hidden;
  z-index: 2390;
  background: rgba(15, 19, 32, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  color: #eff4ff;
}

.punkai-header {
  padding: 12px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.punkai-title {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.3;
}

.punkai-subtitle {
  font-size: 12px;
  color: rgba(239, 244, 255, 0.75);
  margin-top: 2px;
}

.punkai-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.punkai-tab-btn,
.punkai-close,
.punkai-send,
.punkai-save,
.punkai-remove {
  border: 0;
  cursor: pointer;
  border-radius: 10px;
}

.punkai-tab-btn {
  font-size: 12px;
  padding: 6px 10px;
  color: #d4deff;
  background: rgba(255, 255, 255, 0.08);
}

.punkai-tab-btn.active {
  color: #ffffff;
  background: rgba(255, 124, 67, 0.85);
}

.punkai-close {
  width: 28px;
  height: 28px;
  font-size: 18px;
  line-height: 1;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.12);
}

.punkai-chat,
.punkai-settings {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.punkai-message-list {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.punkai-message {
  max-width: 92%;
  border-radius: 12px;
  padding: 10px 12px;
}

.punkai-message.assistant {
  align-self: flex-start;
  background: rgba(255, 255, 255, 0.09);
}

.punkai-message.user {
  align-self: flex-end;
  background: rgba(255, 129, 68, 0.26);
}

.punkai-role {
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 5px;
}

.punkai-content {
  font-size: 14px;
  line-height: 1.45;
  white-space: pre-wrap;
}

.punkai-cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  background: #ff9555;
  margin-left: 2px;
  vertical-align: text-bottom;
  border-radius: 1px;
  animation: punkai-blink 0.8s step-start infinite;
}

@keyframes punkai-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.punkai-page-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 9px;
}

.punkai-page-chip {
  border: 0;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 999px;
  color: #0f1424;
  background: #ffd06b;
  font-size: 12px;
}

.punkai-input-row {
  display: flex;
  gap: 8px;
  padding: 10px 12px 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.punkai-input {
  flex: 1;
  resize: none;
  border: 0;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  padding: 10px;
  font-size: 14px;
  outline: none;
}

.punkai-send {
  width: 70px;
  color: #ffffff;
  background: linear-gradient(135deg, #ff6a00, #ef3e36);
  border: 0;
  border-radius: 10px;
  cursor: pointer;
  padding: 8px 0;
  font-size: 13px;
  transition: background 0.15s;
}

.punkai-send:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.punkai-btn-col {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
}

.punkai-clear {
  width: 70px;
  border: 0;
  border-radius: 10px;
  cursor: pointer;
  padding: 6px 0;
  font-size: 12px;
  color: rgba(239, 244, 255, 0.7);
  background: rgba(255, 255, 255, 0.09);
}

.punkai-clear:hover {
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
}

/* 系统提示词相关 */
.punkai-preset-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.punkai-preset-chip {
  border: 1px solid rgba(255, 255, 255, 0.18);
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 999px;
  color: rgba(239, 244, 255, 0.8);
  background: transparent;
  font-size: 12px;
  transition: background 0.15s, border-color 0.15s;
}

.punkai-preset-chip:hover {
  background: rgba(255, 255, 255, 0.1);
}

.punkai-preset-chip.active {
  background: rgba(255, 129, 68, 0.25);
  border-color: rgba(255, 129, 68, 0.7);
  color: #ffc27f;
}

.punkai-prompt-area {
  resize: vertical;
  min-height: 72px;
  line-height: 1.5;
  font-family: inherit;
}

/* 滑块 */
.punkai-slider-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
}

.punkai-slider {
  flex: 1;
  accent-color: #ff6a00;
}

.punkai-slider-val {
  font-size: 13px;
  min-width: 24px;
  text-align: center;
  color: #ffc27f;
}

.punkai-settings {
  padding: 12px;
  overflow: auto;
}

.punkai-section-title {
  font-size: 13px;
  margin-bottom: 8px;
  color: #ffc27f;
}

.punkai-label {
  display: block;
  font-size: 12px;
  color: rgba(239, 244, 255, 0.78);
  margin-bottom: 4px;
  margin-top: 8px;
}

.punkai-field {
  width: 100%;
  border: 0;
  border-radius: 10px;
  padding: 8px 10px;
  font-size: 13px;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.11);
}

.punkai-select {
  appearance: none;
}

.punkai-setting-tip {
  margin-top: 8px;
  font-size: 12px;
  color: rgba(239, 244, 255, 0.72);
}

.punkai-mapping-add {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.punkai-mapping-list {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.punkai-mapping-item {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 8px;
}

.punkai-save {
  margin-top: 8px;
  padding: 8px 12px;
  color: #ffffff;
  background: rgba(255, 124, 67, 0.88);
}

.punkai-remove {
  width: 56px;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.2);
}

.punkai-fade-enter-active,
.punkai-fade-leave-active {
  transition: opacity 0.2s ease;
}

.punkai-fade-enter-from,
.punkai-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .punkai-panel {
    right: 12px;
    left: 12px;
    width: auto;
    bottom: 88px;
    height: calc(100vh - 132px);
  }

  .punkai-mapping-item {
    grid-template-columns: 1fr;
  }
}
</style>
