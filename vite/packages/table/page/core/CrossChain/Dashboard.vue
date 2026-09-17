<template>
  <div class="cc-page">
    <div class="cc-page-head">
      <div>
        <h1 class="cc-page-title">跨链工作台</h1>
        <p class="cc-page-desc">发起跨链请求，跟踪执行过程与链上结果。所有数据实时读取自链上。</p>
      </div>
      <div class="cc-toolbar">
        <span class="cc-hint">{{ scanHint }}</span>
        <a-button :loading="crossChainState.scanning" @click="onRefresh">刷新</a-button>
        <a-button type="primary" @click="goCreate">发起跨链</a-button>
      </div>
    </div>

    <a-alert v-if="crossChainState.scanError" type="error" show-icon :message="crossChainState.scanError" />
    <a-alert
      v-if="crossChainState.hubStatus && !crossChainState.hubStatus.ok"
      type="warning"
      show-icon
      :message="`链连接异常：${crossChainState.hubStatus.error || 'RPC 不可达'}`"
      :description="`RPC：${crossChainState.hubStatus.rpcUrl || '未配置'}`"
    />
    <a-alert
      v-else-if="crossChainState.hubStatus?.contractState !== undefined && crossChainState.hubStatus.contractState !== 2"
      type="warning"
      show-icon
      :message="`业务通道当前不可用：合约状态为 ${crossChainState.hubStatus.contractStateText}`"
      description="合约处于非 work 状态时，创建任务与接单会被链上拒绝。"
    />

    <div v-if="crossChainState.scanning && crossChainState.scanProgress" class="cc-progress">
      <span>{{ crossChainState.scanProgress.message }}</span>
      <div class="cc-progress-bar"><div class="cc-progress-fill"></div></div>
    </div>

    <div class="cc-stat-row">
      <div class="cc-stat is-primary">
        <div class="cc-stat-label">我发起的进行中任务</div>
        <div class="cc-stat-value">{{ walletReady ? summary.active : '—' }}</div>
      </div>
      <div class="cc-stat">
        <div class="cc-stat-label">待我处理</div>
        <div class="cc-stat-value">{{ walletReady ? summary.actionable : '—' }}</div>
      </div>
      <div class="cc-stat">
        <div class="cc-stat-label">可用业务类型</div>
        <div class="cc-stat-value">{{ activeRoutes.length }}</div>
      </div>
      <div class="cc-stat">
        <div class="cc-stat-label">链连接</div>
        <div class="cc-stat-value" style="font-size: 16px">
          {{ hubStateText }}
        </div>
      </div>
    </div>

    <div class="cc-grid cc-grid-2">
      <div style="display: flex; flex-direction: column; gap: var(--cc-gap)">
        <div class="cc-panel">
          <h2 class="cc-section-title">开始一次跨链</h2>
          <p class="cc-page-desc">
            选择业务类型 → 填写业务内容 → 核对奖励与手续费 → 钱包签名创建任务 → 在“我的任务”中跟踪执行。
          </p>
          <div class="cc-toolbar" style="margin-top: 12px">
            <a-button type="primary" @click="goCreate">发起跨链</a-button>
            <a-button @click="goTasks">查看我的任务</a-button>
          </div>
        </div>

        <div class="cc-panel">
          <div class="cc-toolbar">
            <h2 class="cc-section-title" style="margin: 0">最近任务</h2>
            <div class="cc-spacer"></div>
            <a-button type="link" size="small" @click="goTasks">全部</a-button>
          </div>
          <div v-if="!crossChainState.scannedOnce" class="cc-empty">尚未扫描任务，点击右上角“刷新”开始。</div>
          <div v-else-if="!walletReady" class="cc-empty">
            未连接钱包，无法筛选“我发起的任务”。
            <div style="margin-top: 10px">
              <a-button size="small" @click="goTasks">查看全部任务</a-button>
            </div>
          </div>
          <div v-else-if="!recentTasks.length" class="cc-empty">暂无任务。</div>
          <a-table
            v-else
            :columns="recentColumns"
            :data-source="recentTasks"
            :pagination="false"
            row-key="key"
            size="small"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'taskType'">
                {{ record.taskTypeName || `#${record.taskType}` }}
              </template>
              <template v-else-if="column.key === 'label'">
                <span class="cc-chip" :class="labelClass(record.label)">{{ labelText(record.label) }}</span>
              </template>
              <template v-else-if="column.key === 'fee'">{{ formatWei(record.fee) }}</template>
              <template v-else-if="column.key === 'createdAt'">
                {{ formatTimestamp(record.createdAt) }}
              </template>
              <template v-else-if="column.key === 'action'">
                <a-button type="link" size="small" @click="openTask(record.key)">查看进度</a-button>
              </template>
            </template>
          </a-table>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: var(--cc-gap)">
        <div class="cc-panel">
          <h2 class="cc-section-title">当前环境</h2>
          <div class="cc-kv">
            <div class="cc-kv-key">钱包账户</div>
            <div class="cc-kv-value">
              <span v-if="crossChainState.walletAddress" class="cc-addr">{{ crossChainState.walletAddress }}</span>
              <span v-else class="cc-hint">{{ crossChainState.walletError || '未连接钱包' }}</span>
            </div>
            <div class="cc-kv-key">签名网络</div>
            <div class="cc-kv-value">
              PunkOS（chainId {{ crossChainState.hubStatus?.chainId ?? '—' }}）
            </div>
            <div class="cc-kv-key">链连接</div>
            <div class="cc-kv-value">
              <span :class="crossChainState.hubStatus?.ok ? '' : 'cc-hint'">
                {{ hubStateText }}
              </span>
              <div class="cc-hint" v-if="crossChainState.hubStatus?.blockNumber">
                最新区块 #{{ crossChainState.hubStatus.blockNumber }}
              </div>
            </div>
            <div class="cc-kv-key">业务通道</div>
            <div class="cc-kv-value">
              {{ crossChainState.hubStatus?.contractStateText || '—' }}
            </div>
          </div>
        </div>

        <div class="cc-panel">
          <div class="cc-toolbar">
            <h2 class="cc-section-title" style="margin: 0">业务类型</h2>
            <div class="cc-spacer"></div>
            <a-button type="link" size="small" @click="goManage">管理</a-button>
          </div>
          <div v-if="crossChainState.routesLoading" class="cc-loading">读取链上业务类型…</div>
          <div v-else-if="crossChainState.routesError" class="cc-error">{{ crossChainState.routesError }}</div>
          <div v-else-if="!crossChainState.routes.length" class="cc-empty">链上尚未注册业务类型。</div>
          <div v-else style="display: flex; flex-direction: column; gap: 10px">
            <div v-for="route in crossChainState.routes" :key="route.id" class="cc-card" style="padding: 12px 14px">
              <div class="cc-toolbar">
                <strong>{{ route.name || `#${route.id}` }}</strong>
                <span class="cc-chip" :class="route.isActive ? 'is-success' : 'is-default'">
                  {{ route.isActive ? '可用' : '已停用' }}
                </span>
                <div class="cc-spacer"></div>
                <span class="cc-hint">typeId {{ route.id }}</span>
              </div>
              <div class="cc-hint" style="margin-top: 6px">
                验证器：<span class="cc-addr">{{ shortenAddress(route.verifier) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  crossChainState,
  activeRoutes,
  refreshAll,
  loadWalletAddress,
} from './services/store'
import { filterTasks, summarizeTasks } from './services/taskState'
import { formatTimestamp, formatWei, labelClass, labelText, shortenAddress } from './services/format'
import { SYSTEM_STATE_TEXT } from './services/abi'

const router = useRouter()

const summary = computed(() =>
  summarizeTasks(crossChainState.records, crossChainState.walletAddress || undefined, true),
)

/** 未连接钱包时，与“我的任务”相关的统计不展示数字，避免把所有任务当成我的 */
const walletReady = computed(() => Boolean(crossChainState.walletAddress))

const myTasks = computed(() =>
  crossChainState.walletAddress
    ? filterTasks(crossChainState.records, { address: crossChainState.walletAddress, role: 'creator' })
    : [],
)

const recentTasks = computed(() => myTasks.value.slice(0, 5))

const hubStateText = computed(() => {
  const status = crossChainState.hubStatus
  if (!status) return '未检测'
  if (!status.ok) return '连接失败'
  const state = status.contractState
  return state === 2 ? '已连接' : SYSTEM_STATE_TEXT[state ?? 0] || '未知'
})

const scanHint = computed(() => {
  if (crossChainState.scanning && crossChainState.scanProgress) return crossChainState.scanProgress.message
  if (!crossChainState.scannedOnce) return '尚未扫描'
  return `已扫描 ${crossChainState.records.length} 个任务`
})

const recentColumns = [
  { title: '业务类型', key: 'taskType', width: 140 },
  { title: '状态', key: 'label', width: 110 },
  { title: '奖励', key: 'fee', width: 120 },
  { title: '创建时间', key: 'createdAt', width: 180 },
  { title: '操作', key: 'action', width: 100 },
]

async function onRefresh() {
  await refreshAll()
}

function goCreate() {
  router.push({ name: 'CrossChainCreate' })
}

function goTasks() {
  router.push({ name: 'CrossChainMyTasks' })
}

function goManage() {
  router.push({ name: 'CrossChainManage' })
}

function openTask(key: string) {
  router.push({ name: 'CrossChainTaskDetail', params: { taskKey: key } })
}

// 钱包状态可能在进入后才连接，这里主动补一次
void loadWalletAddress()
</script>
