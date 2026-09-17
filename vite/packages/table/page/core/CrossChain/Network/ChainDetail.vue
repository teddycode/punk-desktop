<template>
  <div class="cc-page">
    <div class="cc-page-head">
      <div>
        <h1 class="cc-page-title">链详情</h1>
        <p class="cc-page-desc">
          链 #{{ chainId }}
          <span v-if="chain?.symbol"> · {{ chain.symbol }}</span>
          <span v-if="chain?.name"> · {{ chain.name }}</span>
        </p>
      </div>
      <div class="cc-toolbar">
        <a-button @click="back">返回列表</a-button>
        <a-button :loading="loading" @click="load">刷新</a-button>
      </div>
    </div>

    <a-alert v-if="error" type="error" show-icon :message="error" />

    <a-tabs v-model:activeKey="tab">
      <a-tab-pane key="overview" tab="概览">
        <div class="cc-grid cc-grid-2">
          <div class="cc-panel">
            <h2 class="cc-section-title">链上信息</h2>
            <div class="cc-kv">
              <div class="cc-kv-key">链 ID</div>
              <div class="cc-kv-value">{{ chainId }}</div>
              <div class="cc-kv-key">符号 / 名称</div>
              <div class="cc-kv-value">{{ chain?.symbol || '—' }} / {{ chain?.name || '—' }}</div>
              <div class="cc-kv-key">链上状态</div>
              <div class="cc-kv-value">{{ chain?.state ?? '—' }}</div>
              <div class="cc-kv-key">relay 合约</div>
              <div class="cc-kv-value cc-addr">{{ chain?.relayAddress || '未解析到' }}</div>
            </div>
          </div>
          <div class="cc-panel">
            <h2 class="cc-section-title">搬运进展（链上参照）</h2>
            <div class="cc-kv">
              <div class="cc-kv-key">影子账本顶端</div>
              <div class="cc-kv-value cc-addr">{{ relayParams?.topShadowKey || '—' }}</div>
              <div class="cc-kv-key">影子区块记录</div>
              <div class="cc-kv-value">{{ shadowBlocks.length }} 条</div>
              <div class="cc-kv-key">relay 状态</div>
              <div class="cc-kv-value">{{ relayParams?.contractState ?? '—' }}</div>
            </div>
            <div class="cc-hint" style="margin-top: 10px">
              全节点是否同步、搬运器是否运行无法探测，此处仅提供链上客观记录。
            </div>
          </div>
        </div>
      </a-tab-pane>

      <a-tab-pane key="tasks" tab="传输任务">
        <div class="cc-panel">
          <div class="cc-toolbar">
            <h2 class="cc-section-title" style="margin: 0">该链相关的传输任务</h2>
            <div class="cc-spacer"></div>
            <a-checkbox v-model:checked="onlyThisChain">仅显示该链相关</a-checkbox>
          </div>
          <div v-if="!chainTasks.length" class="cc-empty" style="margin-top: 10px">
            暂无任务。任务结构本身不记录源链/目标链，这里按业务类型匹配展示。
          </div>
          <a-table
            v-else
            :columns="taskColumns"
            :data-source="chainTasks"
            :pagination="{ pageSize: 10 }"
            row-key="key"
            size="small"
            style="margin-top: 10px"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'taskType'">{{ record.taskTypeName || `#${record.taskType}` }}</template>
              <template v-else-if="column.key === 'label'">
                <span class="cc-chip" :class="labelClass(record.label)">{{ labelText(record.label) }}</span>
              </template>
              <template v-else-if="column.key === 'fee'">{{ formatWei(record.fee) }}</template>
              <template v-else-if="column.key === 'action'">
                <a-button type="link" size="small" @click="openTask(record.key)">详情</a-button>
              </template>
            </template>
          </a-table>
        </div>
      </a-tab-pane>

      <a-tab-pane key="shadow" tab="影子区块">
        <div class="cc-panel">
          <div v-if="shadowSource === 'unsupported'" class="cc-empty">
            该链的 relay ABI 尚未确认，暂不支持链上读取影子区块。
          </div>
          <template v-else>
            <div class="cc-hint" style="margin-bottom: 10px">
              来源：{{ shadowSource === 'logs' ? 'UpdateShadowLedger 事件' : '影子账本顶端（链表头）' }}；总数无法精确统计，此处显示已加载条数。
            </div>
            <a-table
              :columns="shadowColumns"
              :data-source="shadowBlocks"
              :pagination="{ pageSize: 10 }"
              row-key="keyShadowBlock"
              size="small"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'keyShadowBlock'">
                  <span class="cc-addr">{{ shortenHash(record.keyShadowBlock) }}</span>
                </template>
                <template v-else-if="column.key === 'keyParentShadowBlock'">
                  <span class="cc-addr">{{ record.keyParentShadowBlock ? shortenHash(record.keyParentShadowBlock) : '—' }}</span>
                </template>
                <template v-else-if="column.key === 'blockNumber'">
                  {{ record.blockNumber || '—' }}
                </template>
              </template>
            </a-table>
          </template>
        </div>
      </a-tab-pane>

      <a-tab-pane key="relayers" tab="搬运参与者">
        <div class="cc-panel">
          <div v-if="!contributions.length" class="cc-empty">暂无搬运贡献记录（或该链 relay 不可读）。</div>
          <a-table
            v-else
            :columns="relayerColumns"
            :data-source="contributions"
            :pagination="{ pageSize: 10 }"
            row-key="txHash"
            size="small"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'relayer'">
                <span class="cc-addr">{{ record.relayer }}</span>
              </template>
              <template v-else-if="column.key === 'value'">{{ record.value }}</template>
            </template>
          </a-table>
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { crossChainState, loadTasks } from '../services/store'
import { formatWei, labelClass, labelText, shortenHash } from '../services/format'
import {
  getRelayParams,
  getRelayerContributions,
  getShadowBlocks,
  getSourceChains,
  type RelayParams,
  type SourceChainInfo,
} from '../services/chain'

const route = useRoute()
const router = useRouter()

const chainId = computed(() => Number(route.params.chainId))
const tab = ref<string>((route.query.tab as string) || 'overview')
const loading = ref(false)
const error = ref('')
const chain = ref<SourceChainInfo | null>(null)
const relayParams = ref<RelayParams | null>(null)
const shadowBlocks = ref<Array<{ keyShadowBlock: string; keyParentShadowBlock: string; blockNumber: number; txHash: string }>>([])
const shadowSource = ref<'logs' | 'head' | 'unsupported'>('unsupported')
const contributions = ref<Array<{ relayer: string; label: number; value: string; keyShadowBlock: string; blockNumber: number; txHash: string }>>([])
const onlyThisChain = ref(true)

const taskColumns = [
  { title: '业务类型', key: 'taskType', width: 140 },
  { title: '状态', key: 'label', width: 110 },
  { title: '奖励', key: 'fee', width: 120 },
  { title: '任务 Key', key: 'key', width: 220 },
  { title: '操作', key: 'action', width: 100 },
]

const shadowColumns = [
  { title: 'keyShadowBlock', key: 'keyShadowBlock', width: 220 },
  { title: 'keyParentShadowBlock', key: 'keyParentShadowBlock', width: 220 },
  { title: '区块', key: 'blockNumber', width: 120 },
]

const relayerColumns = [
  { title: '搬运者', key: 'relayer', width: 240 },
  { title: 'label', key: 'label', width: 100 },
  { title: 'value', key: 'value', width: 160 },
  { title: '区块', key: 'blockNumber', width: 120 },
]

/**
 * 任务结构不含源链字段，因此“该链相关”只能按业务类型匹配：
 * 当前链的 relay 与业务类型并非强绑定，这里保守地展示全部任务并给出说明。
 */
const chainTasks = computed(() => {
  if (!onlyThisChain.value) return crossChainState.records
  return crossChainState.records
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    const chains = await getSourceChains()
    chain.value = chains.find((item) => item.chainId === chainId.value) ?? null
    if (!chain.value) {
      error.value = `未找到链 #${chainId.value} 的链上记录`
    }
    const [params, shadow, contributionsResult] = await Promise.all([
      getRelayParams(chainId.value).catch(() => null),
      getShadowBlocks(chainId.value, 100).catch(() => ({ items: [], source: 'unsupported' as const })),
      getRelayerContributions(chainId.value, 100).catch(() => []),
    ])
    relayParams.value = params
    shadowBlocks.value = shadow.items
    shadowSource.value = shadow.source
    contributions.value = contributionsResult
    await loadTasks(false)
  } finally {
    loading.value = false
  }
}

function back() {
  router.push({ name: 'CrossChainNetwork' })
}

function openTask(key: string) {
  router.push({ name: 'CrossChainTaskDetail', params: { taskKey: key } })
}

watch(tab, (value) => router.replace({ name: 'CrossChainNetworkChain', params: { chainId: String(chainId.value) }, query: { tab: value } }))
watch(chainId, load)

onMounted(load)
</script>
