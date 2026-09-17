<template>
  <div class="cc-page">
    <div class="cc-page-head">
      <div>
        <h1 class="cc-page-title">任务详情</h1>
        <p class="cc-page-desc">
          <span class="cc-addr">{{ taskKey }}</span>
          <span class="cc-copy" @click="copy(taskKey)">复制</span>
        </p>
      </div>
      <div class="cc-toolbar">
        <a-button @click="back">返回列表</a-button>
        <a-button :loading="loading" @click="reload">刷新</a-button>
      </div>
    </div>

    <div v-if="loading && !record" class="cc-loading">正在从链上读取任务…</div>
    <div v-else-if="error" class="cc-error">{{ error }}</div>
    <div v-else-if="!record" class="cc-empty">
      链上未找到该任务。请确认任务 Key 是否正确，或该任务尚未创建。
    </div>

    <template v-else>
      <div class="cc-panel">
        <div class="cc-toolbar">
          <span class="cc-chip" :class="labelClass(record.label)">{{ labelText(record.label) }}</span>
          <strong style="font-size: 16px">{{ record.taskTypeName || `业务类型 #${record.taskType}` }}</strong>
          <span v-if="record.recordDeleted" class="cc-hint">链上记录已删除，状态来自事件</span>
          <div class="cc-spacer"></div>
          <a-button v-if="canAccept" type="primary" :loading="busy" @click="accept">接单</a-button>
          <a-button v-if="canExecute" type="primary" @click="goExecute">执行并提交证明</a-button>
          <a-button v-if="canReAccept" danger :loading="busy" @click="reAccept">超时重接</a-button>
          <a-button v-if="canWithdraw" danger :loading="busy" @click="withdraw">撤回任务</a-button>
        </div>
        <div class="cc-hint" style="margin-top: 8px">{{ statusExplain }}</div>
      </div>

      <div class="cc-grid cc-grid-2">
        <div class="cc-panel">
          <h2 class="cc-section-title">执行时间线</h2>
          <div class="cc-timeline">
            <div
              v-for="(node, index) in record.timeline"
              :key="`${node.blockNumber}-${node.kind}-${index}`"
              class="cc-tl-node"
              :class="labelClass(node.label)"
            >
              <div class="cc-tl-rail">
                <div class="cc-tl-dot"></div>
                <div v-if="index < record.timeline.length - 1" class="cc-tl-line"></div>
              </div>
              <div class="cc-tl-content">
                <div class="cc-tl-title">{{ node.text }}</div>
                <div class="cc-tl-meta">
                  {{ formatTimestamp(node.timestamp) }} · 区块 #{{ node.blockNumber }}
                  <template v-if="node.operator">
                    · <span class="cc-addr">{{ shortenAddress(node.operator) }}</span>
                  </template>
                </div>
                <div v-if="node.txHash" class="cc-tl-meta">
                  交易 <span class="cc-addr">{{ shortenHash(node.txHash) }}</span>
                  <span class="cc-copy" @click="copy(node.txHash)">复制</span>
                </div>
                <div v-if="node.evidence" class="cc-tl-meta">{{ node.evidence }}</div>
              </div>
            </div>
          </div>
          <div class="cc-hint" style="margin-top: 8px">
            时间线只展示有链上证据的节点：合约没有“证明提交中 / 验证中”这类中间状态，也不提供逐步时间戳。
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: var(--cc-gap)">
          <div class="cc-panel">
            <h2 class="cc-section-title">任务信息</h2>
            <div class="cc-kv">
              <div class="cc-kv-key">任务编号</div>
              <div class="cc-kv-value">{{ record.index >= 0 ? `#${record.index}` : '—' }}</div>

              <div class="cc-kv-key">业务类型</div>
              <div class="cc-kv-value">{{ record.taskTypeName || `#${record.taskType}` }}</div>

              <div class="cc-kv-key">发起人</div>
              <div class="cc-kv-value cc-addr">{{ record.user }}</div>

              <div class="cc-kv-key">执行者</div>
              <div class="cc-kv-value">
                <span v-if="record.relayer && record.relayer !== ZERO" class="cc-addr">{{ record.relayer }}</span>
                <span v-else class="cc-hint">尚未接单</span>
              </div>

              <div class="cc-kv-key">奖励</div>
              <div class="cc-kv-value">{{ formatWei(record.fee) }}</div>

              <div class="cc-kv-key">执行者质押</div>
              <div class="cc-kv-value">{{ record.stake && record.stake !== '0' ? formatWei(record.stake) : '—' }}</div>

              <div class="cc-kv-key">创建时间</div>
              <div class="cc-kv-value">
                {{ formatTimestamp(record.createdAt) }}
                <div class="cc-hint">区块 #{{ record.createdAtBlock }}</div>
              </div>
            </div>
          </div>

          <div class="cc-panel">
            <h2 class="cc-section-title">业务内容（Payload）</h2>
            <div v-if="payloadText" style="margin-bottom: 8px">
              <div class="cc-hint">按文本解释</div>
              <div>{{ payloadText }}</div>
            </div>
            <div class="cc-addr" style="word-break: break-all">{{ record.payload }}</div>
            <div class="cc-hint" style="margin-top: 6px">
              共 {{ payloadBytes(record.payload) }} 字节
              <span class="cc-copy" @click="copy(record.payload)">复制</span>
            </div>
            <div class="cc-hint" style="margin-top: 6px">
              内容格式由业务类型约定，前端不做强制校验。
            </div>
          </div>

          <div class="cc-panel">
            <h2 class="cc-section-title">下一步</h2>
            <div class="cc-hint">{{ nextStepText }}</div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import { ethers } from 'ethers'
import { crossChainState, loadTasks, loadWalletAddress, routeNameMap } from '../services/store'
import { loadTaskRecord, TaskLabel, type TaskRecord } from '../services/taskState'
import {
  copyText,
  formatTimestamp,
  formatWei,
  labelClass,
  labelText,
  payloadBytes,
  shortenAddress,
  shortenHash,
  tryDecodePayloadText,
} from '../services/format'
import { ActionError, acceptTaskAction, reAcceptTaskAction, withdrawTaskAction } from '../services/actions'
import { MAX_TASK_TIME_BLOCKS } from '../services/abi'
import { getHubClient } from '../services/config'

const route = useRoute()
const router = useRouter()

const ZERO = ethers.constants.AddressZero
const taskKey = computed(() => String(route.params.taskKey || ''))
const record = ref<TaskRecord | null>(null)
const loading = ref(false)
const error = ref('')
const busy = ref(false)
const currentBlock = ref(0)

const wallet = computed(() => crossChainState.walletAddress)
const isCreator = computed(
  () => Boolean(wallet.value) && record.value?.user?.toLowerCase() === wallet.value.toLowerCase(),
)
const isRelayer = computed(
  () => Boolean(wallet.value) && record.value?.relayer?.toLowerCase() === wallet.value.toLowerCase(),
)
const isExpired = computed(
  () =>
    record.value?.label === TaskLabel.Accepted &&
    currentBlock.value > 0 &&
    currentBlock.value - lastActiveBlock.value > MAX_TASK_TIME_BLOCKS,
)

const lastActiveBlock = computed(() => {
  // acceptTask 会覆写 time，因此超时判断以“最近一次状态流转区块”为准
  const timeline = record.value?.timeline ?? []
  const accepted = [...timeline].reverse().find((node) => node.kind === 'accepted')
  return accepted?.blockNumber ?? record.value?.createdAtBlock ?? 0
})

const payloadText = computed(() => tryDecodePayloadText(record.value?.payload))

const canAccept = computed(
  () => record.value?.label === TaskLabel.Created && !record.value?.recordDeleted && Boolean(wallet.value),
)
const canExecute = computed(() => record.value?.label === TaskLabel.Accepted && isRelayer.value)
const canReAccept = computed(
  () => record.value?.label === TaskLabel.Accepted && isExpired.value && !isRelayer.value && Boolean(wallet.value),
)
const canWithdraw = computed(
  () => Boolean(wallet.value) && isCreator.value && (record.value?.label === TaskLabel.Created || isExpired.value),
)

const statusExplain = computed(() => {
  const current = record.value
  if (!current) return ''
  switch (current.label) {
    case TaskLabel.Created:
      return '任务已创建，正在等待中继者接单。你可以在满足条件时撤回任务，奖励将退回。'
    case TaskLabel.Accepted:
      return isRelayer.value
        ? `你已接单。请在目标链完成业务动作，再返回此处提交证明。${isExpired.value ? '（已超时，其他人可以重接）' : `（超过 ${MAX_TASK_TIME_BLOCKS} 个区块未完成将被重接）`}`
        : '任务已被中继者接单。若长时间未完成，超时后可由其他中继者重接或由发起人取回。'
    case TaskLabel.Successed:
      return '证明已通过验证，奖励与质押已按合约规则结算。'
    case TaskLabel.Rejected:
      return '任务已被发起人撤回，奖励已退回。'
    case TaskLabel.Failed:
      return '任务失败，合约已按规则处理质押。'
    default:
      return '链上记录已删除，无法读取更多字段。'
  }
})

const nextStepText = computed(() => {
  const current = record.value
  if (!current) return ''
  if (current.label === TaskLabel.Created) {
    return '等待中继者接单。若你是中继者且已质押足额，可直接在上方接单。'
  }
  if (current.label === TaskLabel.Accepted) {
    return isRelayer.value
      ? '切换到目标链完成业务动作（用钱包签名），然后回到本页点击“执行并提交证明”。'
      : '等待执行者提交证明。超时后你可以重接该任务。'
  }
  return '任务已结束，无需进一步操作。'
})

async function reload() {
  if (!taskKey.value) return
  loading.value = true
  error.value = ''
  try {
    // 优先使用共享扫描结果，避免重复读链
    const cached = crossChainState.records.find((item) => item.key.toLowerCase() === taskKey.value.toLowerCase())
    if (cached) {
      record.value = cached
    } else {
      record.value = await loadTaskRecord(taskKey.value, routeNameMap.value)
    }
    const hub = await getHubClient()
    currentBlock.value = await hub.getBlockNumber().catch(() => 0)
  } catch (err: any) {
    error.value = err?.message || '读取任务失败'
  } finally {
    loading.value = false
  }
}

function back() {
  router.push({ name: 'CrossChainMyTasks' })
}

function goExecute() {
  router.push({ name: 'CrossChainRelayExecution', params: { taskKey: taskKey.value } })
}

async function copy(text: string) {
  const ok = await copyText(text)
  message[ok ? 'success' : 'error'](ok ? '已复制' : '复制失败')
}

async function accept() {
  busy.value = true
  try {
    await acceptTaskAction(taskKey.value)
    message.success('接单成功')
    await loadTasks(false)
    await reload()
  } catch (err: any) {
    const hint = err instanceof ActionError && err.hint ? `（${err.hint}）` : ''
    message.error(`${err?.message || '接单失败'}${hint}`)
  } finally {
    busy.value = false
  }
}

function withdraw() {
  Modal.confirm({
    title: '确认撤回任务？',
    content: isExpired.value && record.value?.label === TaskLabel.Accepted
      ? '任务已超时：撤回将退回你的奖励，并使原中继者的质押被惩罚。'
      : '撤回后奖励将退回你的账户，任务状态变为「已撤回」。',
    okText: '钱包签名撤回',
    cancelText: '取消',
    async onOk() {
      busy.value = true
      try {
        await withdrawTaskAction(taskKey.value)
        message.success('撤回成功')
        await loadTasks(false)
        await reload()
      } catch (err: any) {
        const hint = err instanceof ActionError && err.hint ? `（${err.hint}）` : ''
        message.error(`${err?.message || '撤回失败'}${hint}`)
        throw err
      } finally {
        busy.value = false
      }
    },
  })
}

function reAccept() {
  Modal.confirm({
    title: '确认重接该任务？',
    content: '重接会使原中继者的质押被惩罚，并由你接管该任务。',
    okText: '钱包签名重接',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      busy.value = true
      try {
        await reAcceptTaskAction(taskKey.value)
        message.success('重接成功')
        await loadTasks(false)
        await reload()
      } catch (err: any) {
        const hint = err instanceof ActionError && err.hint ? `（${err.hint}）` : ''
        message.error(`${err?.message || '重接失败'}${hint}`)
        throw err
      } finally {
        busy.value = false
      }
    },
  })
}

watch(() => taskKey.value, reload, { immediate: true })
watch(() => crossChainState.records.length, () => {
  const cached = crossChainState.records.find((item) => item.key.toLowerCase() === taskKey.value.toLowerCase())
  if (cached) record.value = cached
})

void loadWalletAddress()
</script>
