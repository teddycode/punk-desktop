<template>
  <div class="cc-page">
    <div class="cc-page-head">
      <div>
        <h1 class="cc-page-title">跨链网络</h1>
        <p class="cc-page-desc">已接入的源链、relay 合约与链上记录。数据实时读取自 PunkOS Hub 链。</p>
      </div>
      <div class="cc-toolbar">
        <a-input-search v-model:value="keyword" placeholder="搜索链名 / 符号" style="width: 220px" />
        <a-select v-model:value="stateFilter" style="width: 140px">
          <a-select-option value="all">全部状态</a-select-option>
          <a-select-option value="ready">可用</a-select-option>
          <a-select-option value="pending">待配置</a-select-option>
        </a-select>
        <a-button :loading="loading" @click="load">刷新</a-button>
      </div>
    </div>

    <a-alert v-if="error" type="error" show-icon :message="error">
      <template #description>
        <a-button size="small" @click="load">重试</a-button>
      </template>
    </a-alert>

    <div v-if="loading && !chains.length" class="cc-loading">读取链上源链信息…</div>
    <div v-else-if="!filtered.length" class="cc-empty">
      {{ chains.length ? '没有符合筛选条件的链。' : '链上尚未注册任何源链。' }}
    </div>
    <div v-else class="cc-grid cc-grid-3">
      <div v-for="chain in filtered" :key="chain.chainId" class="cc-panel">
        <div class="cc-toolbar">
          <strong style="font-size: 16px">{{ chain.name || chain.symbol || `链 #${chain.chainId}` }}</strong>
          <span class="cc-chip" :class="chain.relayAddress ? 'is-success' : 'is-waiting'">
            {{ chain.relayAddress ? '已配置' : '待补充' }}
          </span>
          <div class="cc-spacer"></div>
          <span class="cc-hint">#{{ chain.chainId }}</span>
        </div>

        <div class="cc-kv" style="margin-top: 10px">
          <div class="cc-kv-key">符号</div>
          <div class="cc-kv-value">{{ chain.symbol || '—' }}</div>
          <div class="cc-kv-key">链上状态</div>
          <div class="cc-kv-value">{{ chain.state }}</div>
          <div class="cc-kv-key">影子区块</div>
          <div class="cc-kv-value">{{ shadowCounts[chain.chainId] ?? '—' }}</div>
        </div>

        <div class="cc-hint" style="margin-top: 10px">relay 合约</div>
        <div class="cc-addr">
          {{ chain.relayAddress || '未解析到 relay 地址' }}
          <span v-if="chain.relayAddress" class="cc-copy" @click="copy(chain.relayAddress)">复制</span>
        </div>

        <div class="cc-toolbar" style="margin-top: 14px">
          <a-button size="small" type="primary" @click="goDetail(chain.chainId)">查看链详情</a-button>
          <a-button size="small" @click="goCreate">用此链发起任务</a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { getShadowBlocks, getSourceChains, type SourceChainInfo } from '../services/chain'
import { copyText } from '../services/format'

const router = useRouter()

const chains = ref<SourceChainInfo[]>([])
const shadowCounts = ref<Record<number, number>>({})
const loading = ref(false)
const error = ref('')
const keyword = ref('')
const stateFilter = ref<'all' | 'ready' | 'pending'>('all')

const filtered = computed(() =>
  chains.value.filter((chain) => {
    if (stateFilter.value === 'ready' && !chain.relayAddress) return false
    if (stateFilter.value === 'pending' && chain.relayAddress) return false
    const needle = keyword.value.trim().toLowerCase()
    if (!needle) return true
    return `${chain.name} ${chain.symbol} ${chain.chainId}`.toLowerCase().includes(needle)
  }),
)

async function load() {
  loading.value = true
  error.value = ''
  try {
    chains.value = await getSourceChains()
    // 影子区块数量作为“搬运是否在推进”的链上参照
    const counts: Record<number, number> = {}
    await Promise.all(
      chains.value.map(async (chain) => {
        const shadow = await getShadowBlocks(chain.chainId, 100).catch(() => ({ items: [], source: 'unsupported' as const }))
        counts[chain.chainId] = shadow.items.length
      }),
    )
    shadowCounts.value = counts
  } catch (err: any) {
    error.value = err?.message || '读取源链失败'
  } finally {
    loading.value = false
  }
}

async function copy(text: string) {
  const ok = await copyText(text)
  message[ok ? 'success' : 'error'](ok ? '已复制' : '复制失败')
}

function goDetail(chainId: number) {
  router.push({ name: 'CrossChainNetworkChain', params: { chainId: String(chainId) } })
}

function goCreate() {
  router.push({ name: 'CrossChainCreate' })
}

onMounted(load)
</script>
