<template>
  <div class="cc-page">
    <div class="cc-page-head">
      <div>
        <h1 class="cc-page-title">中继工作台</h1>
        <p class="cc-page-desc">
          接单与提交证明全部由你的钱包签名完成。目标链的业务动作也请在你自己的钱包中执行。
        </p>
      </div>
      <div class="cc-toolbar">
        <span class="cc-hint">{{ crossChainState.walletError || crossChainState.walletAddress || '未连接钱包' }}</span>
        <a-button :loading="crossChainState.scanning" @click="reload">刷新</a-button>
      </div>
    </div>

    <a-alert v-if="!crossChainState.walletAddress" type="info" show-icon message="未连接钱包，接单与提交证明不可用" />

    <a-tabs v-model:activeKey="tab">
      <!-- 任务执行 -->
      <a-tab-pane key="exec" tab="任务执行">
        <div class="cc-panel" style="margin-bottom: var(--cc-gap)">
          <div class="cc-toolbar">
            <h2 class="cc-section-title" style="margin: 0">待接单任务</h2>
            <div class="cc-spacer"></div>
            <span class="cc-hint">
              资格：已质押 {{ formatWei(requireStake) }} / 我的质押 {{ formatWei(myStake) }}
            </span>
          </div>
          <div v-if="!qualification.ready" class="cc-error" style="margin-top: 10px">
            尚不满足接单条件：{{ qualification.reason }}
            <div style="margin-top: 8px"><a-button size="small" @click="tab = 'stake'">去质押</a-button></div>
          </div>
          <div v-if="!openTasks.length" class="cc-empty" style="margin-top: 10px">暂无待接单任务。</div>
          <a-table
            v-else
            :columns="taskColumns"
            :data-source="openTasks"
            :pagination="{ pageSize: 10 }"
            row-key="key"
            size="small"
            style="margin-top: 10px"
            :scroll="{ x: 860 }"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'taskType'">{{ record.taskTypeName || `#${record.taskType}` }}</template>
              <template v-else-if="column.key === 'fee'">{{ formatWei(record.fee) }}</template>
              <template v-else-if="column.key === 'createdAt'">{{ formatTimestamp(record.createdAt) }}</template>
              <template v-else-if="column.key === 'action'">
                <a-button type="link" size="small" :disabled="!qualification.ready" @click="openTask(record.key)">
                  接单 / 详情
                </a-button>
              </template>
            </template>
          </a-table>
        </div>

        <div class="cc-panel">
          <h2 class="cc-section-title">我执行的任务</h2>
          <div v-if="!myExecuting.length" class="cc-empty">当前账户没有进行中的任务。</div>
          <a-table
            v-else
            :columns="taskColumns"
            :data-source="myExecuting"
            :pagination="{ pageSize: 10 }"
            row-key="key"
            size="small"
            :scroll="{ x: 860 }"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'taskType'">{{ record.taskTypeName || `#${record.taskType}` }}</template>
              <template v-else-if="column.key === 'fee'">{{ formatWei(record.fee) }}</template>
              <template v-else-if="column.key === 'createdAt'">{{ formatTimestamp(record.createdAt) }}</template>
              <template v-else-if="column.key === 'action'">
                <a-button type="link" size="small" @click="goExecution(record.key)">执行并提交证明</a-button>
              </template>
            </template>
          </a-table>
        </div>
      </a-tab-pane>

      <!-- 区块搬运 -->
      <a-tab-pane key="move" tab="区块搬运">
        <a-alert
          type="info"
          show-icon
          message="运行搬运工具不会使你获得任务接单资格"
          description="接单需要单独的质押与签名。搬运工具需你在本机或服务器自行运行，应用只提供说明与链上状态参照。"
        />
        <div class="cc-panel" style="margin-top: var(--cc-gap)">
          <h2 class="cc-section-title">源链与搬运参数</h2>
          <div v-if="relayLoading" class="cc-loading">读取 relay 参数…</div>
          <div v-else-if="!relayParams.length" class="cc-empty">未读取到源链信息。</div>
          <div v-else style="display: flex; flex-direction: column; gap: 12px">
            <div v-for="item in relayParams" :key="item.chainId" class="cc-card">
              <div class="cc-toolbar">
                <strong>{{ item.symbol || `链 #${item.chainId}` }}</strong>
                <span class="cc-hint">{{ item.name }}</span>
                <div class="cc-spacer"></div>
                <span v-if="item.params" class="cc-chip is-success">relay 已就绪</span>
                <span v-else class="cc-chip is-default">relay 不可读</span>
              </div>
              <div v-if="item.params" class="cc-kv" style="margin-top: 8px">
                <div class="cc-kv-key">relay 地址</div>
                <div class="cc-kv-value cc-addr">{{ item.params.address }}</div>
                <div class="cc-kv-key">影子账本顶端</div>
                <div class="cc-kv-value cc-addr">{{ item.params.topShadowKey || '—' }}</div>
                <div class="cc-kv-key">已同步高度参照</div>
                <div class="cc-kv-value">
                  {{ item.shadowCount }}
                  <span class="cc-hint">条影子区块记录</span>
                </div>
              </div>
              <div v-else class="cc-hint" style="margin-top: 6px">
                该链的 relay ABI 尚未确认，暂不支持链上读取影子区块。
              </div>
              <div class="cc-hint" style="margin-top: 6px">
                全节点是否同步、搬运器是否运行：<strong>不可探测</strong>，需你自行确认；上方“影子账本”仅作为链上参照。
              </div>

              <div v-if="downloadsOf(item.symbol).length" style="margin-top: 12px">
                <div class="cc-hint">运行包与脚本（供你自行运行，应用不代运行）</div>
                <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 8px">
                  <div v-for="dl in downloadsOf(item.symbol)" :key="dl.fileName" class="cc-card" style="padding: 12px 14px">
                    <div class="cc-toolbar">
                      <strong>{{ dl.label }}</strong>
                      <span class="cc-chip is-default">{{ dl.kind === 'bundle' ? '运行包' : dl.kind === 'node' ? '全节点包' : '脚本' }}</span>
                      <div class="cc-spacer"></div>
                      <span class="cc-hint">{{ dl.fileName }}</span>
                    </div>
                    <div class="cc-hint" style="margin-top: 6px">{{ dl.requirements }}</div>
                    <div v-if="dl.startCommand" class="cc-addr" style="margin-top: 6px">{{ dl.startCommand }}</div>
                    <div class="cc-toolbar" style="margin-top: 8px">
                      <a :href="dl.url" :download="dl.fileName">下载</a>
                      <a-button type="link" size="small" :loading="inspecting === dl.fileName" @click="inspect(dl)">
                        查看大小与校验值
                      </a-button>
                      <span v-if="metaOf(dl.fileName)" class="cc-hint">
                        {{ formatSize(metaOf(dl.fileName)!.sizeBytes) }} ·
                        {{ metaOf(dl.fileName)!.sha256 ? `SHA-256 ${metaOf(dl.fileName)!.sha256!.slice(0, 16)}…` : '未提供校验值' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </a-tab-pane>

      <!-- 身份与质押 -->
      <a-tab-pane key="stake" tab="身份与质押">
        <div class="cc-grid cc-grid-2">
          <div class="cc-panel">
            <h2 class="cc-section-title">我的中继身份</h2>
            <div class="cc-kv">
              <div class="cc-kv-key">要求质押</div>
              <div class="cc-kv-value">{{ formatWei(requireStake) }}</div>
              <div class="cc-kv-key">已质押</div>
              <div class="cc-kv-value">{{ formatWei(myStake) }}</div>
              <div class="cc-kv-key">还需补足</div>
              <div class="cc-kv-value">{{ formatWei(shortfall) }}</div>
              <div class="cc-kv-key">当前身份</div>
              <div class="cc-kv-value">
                <span class="cc-chip" :class="qualification.ready ? 'is-success' : 'is-waiting'">
                  {{ qualification.ready ? '可接单' : '资格不足' }}
                </span>
              </div>
            </div>
            <div class="cc-hint" style="margin-top: 10px">{{ qualification.reason }}</div>
          </div>

          <div class="cc-panel">
            <h2 class="cc-section-title">质押操作</h2>
            <a-radio-group v-model:value="stakeMode" button-style="solid" size="small">
              <a-radio-button value="deposit">追加质押</a-radio-button>
              <a-radio-button value="withdraw">提取质押</a-radio-button>
            </a-radio-group>
            <div style="margin-top: 12px">
              <div class="cc-hint">{{ stakeMode === 'deposit' ? '质押金额' : '提取金额' }}（PUNK）</div>
              <a-input v-model:value="stakeAmount" style="max-width: 220px; margin-top: 4px" />
            </div>
            <div class="cc-toolbar" style="margin-top: 14px">
              <a-button type="primary" :loading="stakeBusy" @click="submitStake">
                钱包签名{{ stakeMode === 'deposit' ? '质押' : '提取' }}
              </a-button>
            </div>
            <div v-if="stakeError" class="cc-error" style="margin-top: 12px">{{ stakeError }}</div>
            <div class="cc-hint" style="margin-top: 12px">
              质押通过 Transport 合约的 becomeRelayer / withdrawStake 完成，全部由钱包签名。
            </div>
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { ethers } from 'ethers'
import { crossChainState, loadTasks, loadWalletAddress } from '../services/store'
import { filterTasks, TaskLabel } from '../services/taskState'
import { formatTimestamp, formatWei } from '../services/format'
import { getRelayParams, getSourceChains, getShadowBlocks } from '../services/chain'
import { formatSize, getDownloads, inspectDownload, type DownloadItem, type DownloadMeta } from '../services/downloads'
import { ActionError, becomeRelayerAction, withdrawStakeAction } from '../services/actions'

const router = useRouter()
const route = useRoute()

const tab = ref<string>((route.query.tab as string) || 'exec')
const myStake = ref('0')
const requireStake = ref('0')
const stakeMode = ref<'deposit' | 'withdraw'>('deposit')
const stakeAmount = ref('')
const stakeBusy = ref(false)
const stakeError = ref('')
const relayLoading = ref(false)
const relayParams = ref<
  Array<{ chainId: number; symbol: string; name: string; params: any; shadowCount: number }>
>([])
const downloadMeta = ref<Record<string, DownloadMeta>>({})
const inspecting = ref('')

function downloadsOf(symbol?: string | null): DownloadItem[] {
  return getDownloads(symbol)
}

function metaOf(fileName: string): DownloadMeta | null {
  return downloadMeta.value[fileName] ?? null
}

async function inspect(item: DownloadItem) {
  inspecting.value = item.fileName
  try {
    downloadMeta.value = { ...downloadMeta.value, [item.fileName]: await inspectDownload(item.url, true) }
  } finally {
    inspecting.value = ''
  }
}

const taskColumns = [
  { title: '业务类型', key: 'taskType', width: 140 },
  { title: '奖励', key: 'fee', width: 120 },
  { title: '创建时间', key: 'createdAt', width: 180 },
  { title: '任务 Key', key: 'key', width: 200 },
  { title: '操作', key: 'action', width: 160, fixed: 'right' },
]

const openTasks = computed(() => filterTasks(crossChainState.records, { label: TaskLabel.Created, role: 'all' }))

const myExecuting = computed(() =>
  crossChainState.walletAddress
    ? filterTasks(crossChainState.records, {
        address: crossChainState.walletAddress,
        role: 'relayer',
        label: TaskLabel.Accepted,
      })
    : [],
)

const shortfall = computed(() => {
  try {
    const required = ethers.BigNumber.from(requireStake.value || '0')
    const mine = ethers.BigNumber.from(myStake.value || '0')
    return required.gt(mine) ? required.sub(mine).toString() : '0'
  } catch {
    return '0'
  }
})

const qualification = computed(() => {
  if (!crossChainState.walletAddress) return { ready: false, reason: '未连接钱包' }
  try {
    const required = ethers.BigNumber.from(requireStake.value || '0')
    const mine = ethers.BigNumber.from(myStake.value || '0')
    if (required.isZero()) return { ready: false, reason: '无法读取质押门槛，请刷新后重试' }
    if (mine.lt(required)) {
      return { ready: false, reason: `还需补足 ${formatWei(required.sub(mine).toString())}` }
    }
    return { ready: true, reason: '已满足接单所需的质押要求' }
  } catch (error: any) {
    return { ready: false, reason: error?.message || '资格判定失败' }
  }
})

/** 质押门槛与我的质押来自第一条可读 relay；没有源链时回退到合约读取 */
async function loadQualification() {
  relayLoading.value = true
  try {
    const chains = await getSourceChains()
    const items: typeof relayParams.value = []
    for (const chain of chains) {
      const params = await getRelayParams(chain.chainId, crossChainState.walletAddress).catch(() => null)
      let shadowCount = 0
      if (params) {
        const shadow = await getShadowBlocks(chain.chainId, 50).catch(() => ({ items: [], source: 'unsupported' as const }))
        shadowCount = shadow.items.length
      }
      items.push({ chainId: chain.chainId, symbol: chain.symbol, name: chain.name, params, shadowCount })
    }
    relayParams.value = items

    const usable = items.find((item) => item.params?.requireStake !== null && item.params?.requireStake !== undefined)
    if (usable?.params) {
      requireStake.value = usable.params.requireStake || '0'
      myStake.value = usable.params.myStake || '0'
    } else {
      // 没有可用 relay 时尝试从 Transport 读取门槛（Transport 自身也有质押管理）
      const contract = await import('../services/config').then((mod) => mod.getReadonlyTransport())
      const [required, mine] = await Promise.all([
        contract.getRequireStake().catch(() => null),
        crossChainState.walletAddress
          ? contract.getMyStake({ from: crossChainState.walletAddress }).catch(() => null)
          : Promise.resolve(null),
      ])
      requireStake.value = required ? required.toString() : '0'
      myStake.value = mine ? mine.toString() : '0'
    }
  } finally {
    relayLoading.value = false
  }
}

async function submitStake() {
  stakeBusy.value = true
  stakeError.value = ''
  try {
    const hash =
      stakeMode.value === 'deposit'
        ? await becomeRelayerAction(stakeAmount.value)
        : await withdrawStakeAction(stakeAmount.value)
    message.success(`交易已确认：${hash.slice(0, 12)}…`)
    stakeAmount.value = ''
    await loadQualification()
  } catch (error: any) {
    const hint = error instanceof ActionError && error.hint ? `（${error.hint}）` : ''
    stakeError.value = `${error?.message || '操作失败'}${hint}`
  } finally {
    stakeBusy.value = false
  }
}

function openTask(key: string) {
  router.push({ name: 'CrossChainTaskDetail', params: { taskKey: key } })
}

function goExecution(key: string) {
  router.push({ name: 'CrossChainRelayExecution', params: { taskKey: key } })
}

async function reload() {
  await Promise.all([loadWalletAddress(true), loadTasks(false), loadQualification()])
}

watch(tab, (value) => {
  router.replace({ name: 'CrossChainRelay', query: { tab: value } })
  if (value === 'move' || value === 'stake') void loadQualification()
})

onMounted(async () => {
  await Promise.all([loadWalletAddress(), loadTasks(false)])
  await loadQualification()
})
</script>
