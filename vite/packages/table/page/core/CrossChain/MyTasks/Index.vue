<template>
  <div class="cc-page">
    <div class="cc-page-head">
      <div>
        <h1 class="cc-page-title">我的任务</h1>
        <p class="cc-page-desc">
          状态由链上事件推导：合约在任务完结时会删除任务记录，因此已成功 / 已失败 / 已撤回的状态来自
          UpdateTaskState 事件。
        </p>
      </div>
      <div class="cc-toolbar">
        <span class="cc-hint">{{ scanHint }}</span>
        <a-button :loading="crossChainState.scanning" @click="reload">刷新</a-button>
        <a-button type="primary" @click="goCreate">发起跨链</a-button>
      </div>
    </div>

    <a-alert v-if="!crossChainState.walletAddress" type="info" show-icon message="未获取到钱包账户">
      <template #description>
        <div>连接钱包后可查看“我发起 / 我接单”的任务。{{ crossChainState.walletError }}</div>
      </template>
    </a-alert>
    <a-alert v-if="crossChainState.scanError" type="error" show-icon :message="crossChainState.scanError" />

    <div v-if="crossChainState.scanning && crossChainState.scanProgress" class="cc-progress">
      <span>{{ crossChainState.scanProgress.message }}</span>
      <div class="cc-progress-bar"><div class="cc-progress-fill"></div></div>
    </div>

    <div class="cc-panel">
      <div class="cc-toolbar">
        <a-radio-group v-model:value="role" button-style="solid" size="small">
          <a-radio-button value="creator">我发起的</a-radio-button>
          <a-radio-button value="relayer">我接单的</a-radio-button>
        </a-radio-group>

        <a-select v-model:value="taskType" style="width: 180px" size="small" placeholder="全部业务类型">
          <a-select-option :value="''">全部业务类型</a-select-option>
          <a-select-option v-for="route in crossChainState.routes" :key="route.id" :value="route.id">
            {{ route.name || `#${route.id}` }}
          </a-select-option>
        </a-select>

        <a-input-search v-model:value="keyword" size="small" style="width: 240px" placeholder="任务 Key / 编号 / Payload" />

        <div class="cc-spacer"></div>
        <span class="cc-hint">共 {{ filtered.length }} 条</span>
      </div>

      <a-tabs v-model:activeKey="tab" style="margin-top: 8px">
        <a-tab-pane key="all" tab="全部" />
        <a-tab-pane key="created" tab="待接单" />
        <a-tab-pane key="accepted" tab="已接单" />
        <a-tab-pane key="success" tab="已成功" />
        <a-tab-pane key="failed" tab="已失败" />
      </a-tabs>

      <div v-if="!crossChainState.scannedOnce" class="cc-empty">尚未扫描任务。点击右上角“刷新”开始扫描。</div>
      <div v-else-if="!pagedItems.length" class="cc-empty">
        {{ emptyText }}
        <div style="margin-top: 10px">
          <a-button size="small" @click="goCreate">发起一次跨链</a-button>
        </div>
      </div>
      <a-table
        v-else
        :columns="columns"
        :data-source="pagedItems"
        :pagination="false"
        row-key="key"
        size="small"
        :scroll="{ x: 900 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'taskType'">
            {{ record.taskTypeName || `#${record.taskType}` }}
          </template>
          <template v-else-if="column.key === 'label'">
            <span class="cc-chip" :class="labelClass(record.label)">{{ labelText(record.label) }}</span>
            <span v-if="record.recordDeleted" class="cc-hint" style="margin-left: 6px">来自事件</span>
          </template>
          <template v-else-if="column.key === 'fee'">{{ formatWei(record.fee) }}</template>
          <template v-else-if="column.key === 'createdAt'">
            {{ formatTimestamp(record.createdAt) }}
            <div class="cc-hint">区块 #{{ record.createdAtBlock }}</div>
          </template>
          <template v-else-if="column.key === 'key'">
            <span class="cc-addr">{{ shortenHash(record.key) }}</span>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button type="link" size="small" @click="openTask(record.key)">详情</a-button>
            <a-button
              v-if="canWithdraw(record)"
              type="link"
              size="small"
              danger
              :loading="busyKey === record.key"
              @click="withdraw(record)"
            >
              撤回
            </a-button>
          </template>
        </template>
      </a-table>

      <div class="cc-toolbar" style="margin-top: 12px">
        <div class="cc-spacer"></div>
        <a-pagination
          v-model:current="page"
          v-model:page-size="pageSize"
          :total="filtered.length"
          :page-size-options="['10', '20', '50']"
          show-size-changer
          size="small"
          :show-total="(total: number) => `共 ${total} 条`"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import { crossChainState, loadTasks, loadWalletAddress, refreshAll } from '../services/store'
import { filterTasks, TaskLabel, type TaskRecord } from '../services/taskState'
import { formatTimestamp, formatWei, labelClass, labelText, shortenHash } from '../services/format'
import { withdrawTaskAction, ActionError } from '../services/actions'

const router = useRouter()
const route = useRoute()

const tab = ref<string>((route.query.tab as string) || 'all')
const role = ref<'creator' | 'relayer'>((route.query.role as 'creator' | 'relayer') || 'creator')
const taskType = ref<number | ''>(route.query.type ? Number(route.query.type) : '')
const keyword = ref<string>((route.query.keyword as string) || '')
const page = ref<number>(Number(route.query.page) || 1)
const pageSize = ref<number>(Number(route.query.pageSize) || 10)
const busyKey = ref('')

const filtered = computed(() => {
  const address = crossChainState.walletAddress
  const base = filterTasks(crossChainState.records, {
    address,
    role: role.value,
    taskType: taskType.value === '' ? undefined : Number(taskType.value),
    keyword: keyword.value,
  })
  switch (tab.value) {
    case 'created':
      return base.filter((record) => record.label === TaskLabel.Created)
    case 'accepted':
      return base.filter((record) => record.label === TaskLabel.Accepted)
    case 'success':
      return base.filter((record) => record.label === TaskLabel.Successed)
    case 'failed':
      return base.filter((record) => record.label === TaskLabel.Failed || record.label === TaskLabel.Rejected)
    default:
      return base
  }
})

const pagedItems = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

const emptyText = computed(() => {
  if (!crossChainState.walletAddress) return '未连接钱包，无法筛选“我的任务”'
  if (role.value === 'relayer') return '没有找到由当前账户接单的任务'
  return '当前账户还没有发起过任务'
})

const scanHint = computed(() => {
  if (crossChainState.scanning && crossChainState.scanProgress) return crossChainState.scanProgress.message
  if (!crossChainState.scannedOnce) return '尚未扫描'
  return `已扫描 ${crossChainState.records.length} 个任务`
})

const columns = [
  { title: '业务类型', key: 'taskType', width: 140 },
  { title: '状态', key: 'label', width: 150 },
  { title: '奖励', key: 'fee', width: 120 },
  { title: '创建时间', key: 'createdAt', width: 200 },
  { title: '任务 Key', key: 'key', width: 200 },
  { title: '操作', key: 'action', width: 140, fixed: 'right' },
]

/** 仅 Created 状态可由发起人直接撤回 */
function canWithdraw(record: TaskRecord): boolean {
  return (
    record.label === TaskLabel.Created &&
    Boolean(crossChainState.walletAddress) &&
    record.user.toLowerCase() === crossChainState.walletAddress.toLowerCase()
  )
}

function withdraw(record: TaskRecord) {
  Modal.confirm({
    title: '确认撤回任务？',
    content: `撤回后奖励将退回你的账户，任务状态变为「已撤回」并删除链上记录。\n任务：${shortenHash(record.key)}`,
    okText: '钱包签名撤回',
    cancelText: '取消',
    async onOk() {
      busyKey.value = record.key
      try {
        await withdrawTaskAction(record.key)
        message.success('撤回成功')
        await loadTasks(false)
      } catch (error: any) {
        const hint = error instanceof ActionError && error.hint ? `（${error.hint}）` : ''
        message.error(`${error?.message || '撤回失败'}${hint}`)
        throw error
      } finally {
        busyKey.value = ''
      }
    },
  })
}

function openTask(key: string) {
  router.push({ name: 'CrossChainTaskDetail', params: { taskKey: key } })
}

function goCreate() {
  router.push({ name: 'CrossChainCreate' })
}

async function reload() {
  await Promise.all([loadWalletAddress(true), refreshAll()])
}

/** 查询参数同步，保证刷新/分享后视图一致 */
watch([tab, role, taskType, keyword], () => {
  page.value = 1
})
watch([tab, role, taskType, keyword, page, pageSize], () => {
  router.replace({
    name: 'CrossChainMyTasks',
    query: {
      tab: tab.value,
      role: role.value,
      type: taskType.value === '' ? undefined : String(taskType.value),
      keyword: keyword.value || undefined,
      page: String(page.value),
      pageSize: String(pageSize.value),
    },
  })
})

void loadWalletAddress()
</script>
