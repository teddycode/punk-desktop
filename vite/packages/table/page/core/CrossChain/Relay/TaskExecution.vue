<template>
  <div class="cc-page">
    <div class="cc-page-head">
      <div>
        <h1 class="cc-page-title">执行任务</h1>
        <p class="cc-page-desc">
          接单、目标链业务动作、提交证明均由你的钱包签名完成。应用不持有私钥，也不会代你运行任何脚本。
        </p>
      </div>
      <div class="cc-toolbar">
        <a-button @click="back">返回</a-button>
        <a-button :loading="loading" @click="reload">刷新</a-button>
      </div>
    </div>

    <div v-if="loading && !record" class="cc-loading">正在从链上读取任务…</div>
    <div v-else-if="!record" class="cc-empty">链上未找到该任务。</div>

    <div v-else class="cc-grid cc-grid-2">
      <div class="cc-steps">
        <!-- 步骤 1 -->
        <div class="cc-step" :class="stepClass(1)">
          <div class="cc-step-index">1</div>
          <div class="cc-step-body">
            <div class="cc-step-title">
              接单（Hub 链）
              <span class="cc-chip" :class="record.label === TaskLabel.Created ? 'is-waiting' : 'is-success'">
                {{ record.label === TaskLabel.Created ? '待接单' : labelText(record.label) }}
              </span>
            </div>
            <div class="cc-step-desc">
              链：PunkOS（签名网络） · 需要钱包签名 · 需要已质押足额的执行者身份
            </div>
            <div class="cc-toolbar" style="margin-top: 10px">
              <a-button
                v-if="record.label === TaskLabel.Created"
                type="primary"
                :disabled="!canAccept"
                :loading="accepting"
                @click="accept"
              >
                钱包签名接单
              </a-button>
              <span v-else class="cc-hint">
                已由 <span class="cc-addr">{{ shortenAddress(record.relayer) }}</span> 接单
                <template v-if="isMe(record.relayer)">（当前账户）</template>
              </span>
            </div>
            <div v-if="!canAccept && record.label === TaskLabel.Created" class="cc-hint" style="margin-top: 6px">
              {{ acceptBlockReason }}
            </div>
          </div>
        </div>

        <!-- 步骤 2 -->
        <div class="cc-step" :class="stepClass(2)">
          <div class="cc-step-index">2</div>
          <div class="cc-step-body">
            <div class="cc-step-title">在目标链完成业务动作</div>
            <div class="cc-step-desc">
              链：{{ capability?.expectedChain || '目标链（按业务约定）' }} · 需要你在自己的钱包中执行 · 应用不代执行
            </div>
            <div class="cc-hint" style="margin-top: 8px">
              任务 Payload（{{ payloadBytes(record.payload) }} 字节）：
              <span class="cc-addr">{{ payloadPreview(record.payload, 40) }}</span>
            </div>
            <div style="margin-top: 10px; max-width: 520px">
              <div class="cc-hint">目标链 RPC（用于读取交易；仅保存在本地）</div>
              <a-input v-model:value="targetRpc" placeholder="http://..." style="margin-top: 4px" />
              <div class="cc-toolbar" style="margin-top: 8px">
                <a-button size="small" :loading="probing" @click="probe">测试连接</a-button>
                <a-button size="small" @click="saveTargetRpc">保存</a-button>
                <span v-if="probeResult" class="cc-hint">
                  {{ probeResult.ok ? `连接正常，chainId ${probeResult.chainId}` : `连接失败：${probeResult.error}` }}
                </span>
              </div>
              <div v-if="probeResult?.ok && !probeResult.supportsRawTransaction" class="cc-error" style="margin-top: 8px">
                该节点不支持 eth_getRawTransactionByHash，无法读取原始交易用于提交证明，请更换节点。
              </div>
            </div>
            <div style="margin-top: 12px; max-width: 520px">
              <div class="cc-hint">你在目标链上完成的交易哈希</div>
              <a-input v-model:value="targetTxHash" placeholder="0x..." style="margin-top: 4px" />
              <div class="cc-toolbar" style="margin-top: 8px">
                <a-button size="small" :loading="fetching" :disabled="!targetTxHash" @click="fetchRawTx">
                  读取交易数据
                </a-button>
                <span v-if="targetTx" class="cc-hint">
                  区块 #{{ targetTx.blockNumber }} ·
                  status {{ targetTx.status === 1 ? '成功' : '失败' }}
                </span>
              </div>
              <div v-if="targetTx?.status !== undefined && targetTx.status !== 1" class="cc-error" style="margin-top: 8px">
                该交易执行失败（status ≠ 1）。多数验证器只会接受成功的交易，请确认后重试。
              </div>
            </div>
          </div>
        </div>

        <!-- 步骤 3 -->
        <div class="cc-step" :class="stepClass(3)">
          <div class="cc-step-index">3</div>
          <div class="cc-step-body">
            <div class="cc-step-title">
              采集证明参数
              <span v-if="capability" class="cc-chip is-processing">{{ describeCapability(capability).badge }}</span>
            </div>
            <div class="cc-step-desc">{{ capability ? describeCapability(capability).description : '验证要求未知' }}</div>

            <div class="cc-kv" style="margin-top: 10px">
              <div class="cc-kv-key">rawTx</div>
              <div class="cc-kv-value">
                <span v-if="rawTx" class="cc-addr">已读取（{{ Math.floor((rawTx.length - 2) / 2) }} 字节）· 来源：目标链 RPC</span>
                <span v-else class="cc-hint">未读取 —— 请在上一步填入目标链交易哈希</span>
              </div>
            </div>

            <div v-if="showProofFields" style="margin-top: 10px; max-width: 620px">
              <div class="cc-hint">
                证明数据（由外部工具产出后粘贴；界面会在提交前做交叉校验）
              </div>
              <a-textarea v-model:value="proof" :rows="3" placeholder="0x..." style="margin-top: 4px" />
              <div class="cc-hint" style="margin-top: 8px">影子区块哈希 keyShadowBlock</div>
              <a-input v-model:value="keyShadowBlock" placeholder="0x..." style="margin-top: 4px" />
            </div>
            <div v-else style="margin-top: 10px">
              <a-button type="link" size="small" @click="showProofFields = true">
                该业务类型通常无需证明，如需填写请展开
              </a-button>
            </div>

            <div v-if="validation.issues.length" style="margin-top: 12px">
              <div
                v-for="(issue, index) in validation.issues"
                :key="index"
                :class="issue.level === 'error' ? 'cc-error' : 'cc-card'"
                :style="issue.level === 'error' ? 'margin-bottom:8px' : 'margin-bottom:8px;border-color:var(--cc-warning)'"
              >
                <strong>{{ issue.level === 'error' ? '错误' : '提示' }}（{{ issue.field }}）</strong>：{{ issue.message }}
              </div>
            </div>
          </div>
        </div>

        <!-- 步骤 4 -->
        <div class="cc-step" :class="stepClass(4)">
          <div class="cc-step-index">4</div>
          <div class="cc-step-body">
            <div class="cc-step-title">回 Hub 提交证明</div>
            <div class="cc-step-desc">链：PunkOS（签名网络） · 需要钱包签名 · 提交前会先做链上静态预检</div>
            <div class="cc-toolbar" style="margin-top: 10px">
              <a-button
                type="primary"
                :disabled="!canSubmit"
                :loading="submitting"
                @click="submit"
              >
                钱包签名提交证明
              </a-button>
              <span v-if="!canSubmit" class="cc-hint">{{ submitBlockReason }}</span>
            </div>
            <div v-if="submitError" class="cc-error" style="margin-top: 12px">{{ submitError }}</div>
            <div v-if="submitTx" class="cc-card" style="margin-top: 12px">
              提交成功：<span class="cc-addr">{{ submitTx }}</span>
              <div class="cc-toolbar" style="margin-top: 8px">
                <a-button size="small" type="primary" @click="goDetail">查看任务详情</a-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧上下文 -->
      <div style="display: flex; flex-direction: column; gap: var(--cc-gap)">
        <div class="cc-panel">
          <h2 class="cc-section-title">任务上下文</h2>
          <div class="cc-kv">
            <div class="cc-kv-key">业务类型</div>
            <div class="cc-kv-value">{{ record.taskTypeName || `#${record.taskType}` }}</div>
            <div class="cc-kv-key">当前状态</div>
            <div class="cc-kv-value">
              <span class="cc-chip" :class="labelClass(record.label)">{{ labelText(record.label) }}</span>
            </div>
            <div class="cc-kv-key">发起人</div>
            <div class="cc-kv-value cc-addr">{{ shortenAddress(record.user) }}</div>
            <div class="cc-kv-key">奖励</div>
            <div class="cc-kv-value">{{ formatWei(record.fee) }}</div>
            <div class="cc-kv-key">任务 Key</div>
            <div class="cc-kv-value cc-addr" style="word-break: break-all">{{ record.key }}</div>
          </div>
        </div>

        <div class="cc-panel">
          <h2 class="cc-section-title">签名网络提醒</h2>
          <div class="cc-hint" style="line-height: 1.9">
            步骤 1 与步骤 4 在 PunkOS 上签名；步骤 2 的目标链动作请先切换到对应网络再签名。<br />
            切换网络需在钱包中确认；若钱包中没有该链，会提示添加。
          </div>
        </div>

        <div class="cc-panel">
          <h2 class="cc-section-title">高级信息</h2>
          <div class="cc-hint">rawTx</div>
          <div class="cc-addr" style="word-break: break-all">{{ rawTx || '—' }}</div>
          <div class="cc-hint" style="margin-top: 8px">keyShadowBlock</div>
          <div class="cc-addr" style="word-break: break-all">{{ keyShadowBlock || '—' }}</div>
          <div v-if="validation.computedBlockHash" class="cc-hint" style="margin-top: 8px">
            本地按区块头重算：<span class="cc-addr">{{ validation.computedBlockHash }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { crossChainState, loadTasks, loadWalletAddress, routeNameMap, updateTargetChain } from '../services/store'
import { loadTaskRecord, TaskLabel, type TaskRecord } from '../services/taskState'
import {
  formatWei,
  labelClass,
  labelText,
  payloadBytes,
  payloadPreview,
  shortenAddress,
} from '../services/format'
import { describeCapability, probeVerifierCapability, type VerifierCapability } from '../services/verifier'
import { fetchTargetChainTx, validateProofInput } from '../services/proof'
import { probeTargetChain, type TargetChainProbeResult } from '../services/config'
import { ActionError, acceptTaskAction, finishTaskAction } from '../services/actions'

const route = useRoute()
const router = useRouter()

const taskKey = computed(() => String(route.params.taskKey || ''))
const record = ref<TaskRecord | null>(null)
const loading = ref(false)
const capability = ref<VerifierCapability | null>(null)

const accepting = ref(false)
const submitting = ref(false)
const submitError = ref('')
const submitTx = ref('')

const targetRpc = ref(crossChainState.targetChain?.rpcUrl || '')
const targetTxHash = ref('')
const targetTx = ref<{ rawTx: string; blockHash: string; blockNumber: number; status: number } | null>(null)
const rawTx = ref('')
const proof = ref('')
const keyShadowBlock = ref('')
const showProofFields = ref(false)
const probing = ref(false)
const probeResult = ref<TargetChainProbeResult | null>(null)
const fetching = ref(false)

const isMe = (address?: string) =>
  Boolean(address && crossChainState.walletAddress) &&
  address!.toLowerCase() === crossChainState.walletAddress.toLowerCase()

const canAccept = computed(
  () => record.value?.label === TaskLabel.Created && Boolean(crossChainState.walletAddress),
)
const acceptBlockReason = computed(() =>
  !crossChainState.walletAddress ? '请先连接钱包' : '请确认已质押足额，且系统处于 work 状态',
)

const validation = computed(() =>
  validateProofInput({
    proof: proof.value,
    rawTx: rawTx.value,
    keyShadowBlock: keyShadowBlock.value,
    expectedChain: capability.value?.expectedChain ?? undefined,
  }),
)

const canSubmit = computed(() => {
  if (!record.value || record.value.label !== TaskLabel.Accepted) return false
  if (!isMe(record.value.relayer)) return false
  if (!rawTx.value) return false
  if (capability.value?.kind === 'proof-required') {
    return validation.value.ok
  }
  // raw-tx-only / unknown：rawTx 齐备即可提交（unknown 由链上裁决）
  if (proof.value && proof.value !== '0x') {
    return validation.value.ok
  }
  return true
})

const submitBlockReason = computed(() => {
  if (!record.value) return ''
  if (record.value.label !== TaskLabel.Accepted) return '任务不是「已接单」状态'
  if (!isMe(record.value.relayer)) return '当前钱包不是该任务的执行者'
  if (!rawTx.value) return '尚未读取目标链交易数据'
  if (capability.value?.kind === 'proof-required' && !validation.value.ok) return '证明校验未通过'
  return ''
})

function stepClass(step: number): string {
  const current = record.value
  if (!current) return ''
  if (step === 1) return current.label === TaskLabel.Created ? 'is-current' : 'is-done'
  if (step === 2) return current.label === TaskLabel.Accepted ? 'is-current' : current.label > TaskLabel.Accepted ? 'is-done' : ''
  if (step === 3) return current.label === TaskLabel.Accepted ? '' : current.label > TaskLabel.Accepted ? 'is-done' : ''
  if (step === 4) return current.label === TaskLabel.Successed ? 'is-done' : ''
  return ''
}

async function reload() {
  loading.value = true
  try {
    const cached = crossChainState.records.find((item) => item.key.toLowerCase() === taskKey.value.toLowerCase())
    record.value = cached || (await loadTaskRecord(taskKey.value, routeNameMap.value))

    if (record.value) {
      const routeInfo = crossChainState.routes.find((item) => item.id === record.value!.taskType)
      capability.value = routeInfo
        ? await probeVerifierCapability(routeInfo.verifier)
        : { kind: 'unknown', expectedChain: null, reason: '未找到该业务的链上定义', source: 'default' }
      if (capability.value.kind === 'proof-required') showProofFields.value = true
      // 若已有目标链交易但 keyShadowBlock 为空，用回执区块哈希兜底
      if (targetTx.value && !keyShadowBlock.value) keyShadowBlock.value = targetTx.value.blockHash
    }
  } finally {
    loading.value = false
  }
}

async function accept() {
  accepting.value = true
  try {
    await acceptTaskAction(taskKey.value)
    message.success('接单成功')
    await loadTasks(false)
    await reload()
  } catch (error: any) {
    const hint = error instanceof ActionError && error.hint ? `（${error.hint}）` : ''
    message.error(`${error?.message || '接单失败'}${hint}`)
  } finally {
    accepting.value = false
  }
}

async function probe() {
  probing.value = true
  probeResult.value = null
  try {
    probeResult.value = await probeTargetChain(targetRpc.value, targetTxHash.value || undefined)
  } finally {
    probing.value = false
  }
}

function saveTargetRpc() {
  updateTargetChain({ rpcUrl: targetRpc.value, expectedChain: capability.value?.expectedChain ?? undefined })
  message.success('已保存目标链 RPC（仅存本机）')
}

async function fetchRawTx() {
  fetching.value = true
  submitError.value = ''
  try {
    const result = await fetchTargetChainTx(targetRpc.value || crossChainState.targetChain?.rpcUrl || '', targetTxHash.value)
    targetTx.value = result
    rawTx.value = result.rawTx
    if (!keyShadowBlock.value) keyShadowBlock.value = result.blockHash
    message.success('已读取目标链交易数据')
  } catch (error: any) {
    message.error(error?.message || '读取失败')
  } finally {
    fetching.value = false
  }
}

async function submit() {
  submitting.value = true
  submitError.value = ''
  try {
    const hash = await finishTaskAction({
      taskKey: taskKey.value,
      rawTx: rawTx.value,
      proof: proof.value || undefined,
      keyShadowBlock: keyShadowBlock.value || undefined,
    })
    submitTx.value = hash
    message.success('提交成功')
    await loadTasks(false)
    await reload()
  } catch (error: any) {
    const hint = error instanceof ActionError && error.hint ? `（${error.hint}）` : ''
    submitError.value = `${error?.message || '提交失败'}${hint}`
  } finally {
    submitting.value = false
  }
}

function back() {
  router.push({ name: 'CrossChainRelay' })
}

function goDetail() {
  router.push({ name: 'CrossChainTaskDetail', params: { taskKey: taskKey.value } })
}

watch(() => taskKey.value, reload, { immediate: true })
watch(targetTxHash, () => {
  targetTx.value = null
  rawTx.value = ''
})

onMounted(async () => {
  await Promise.all([loadWalletAddress(), loadTasks(false)])
  await reload()
})
</script>
