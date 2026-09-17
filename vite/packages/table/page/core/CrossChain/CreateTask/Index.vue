<template>
  <div class="cc-page">
    <div class="cc-page-head">
      <div>
        <h1 class="cc-page-title">发起跨链</h1>
        <p class="cc-page-desc">选择业务类型 → 填写业务内容 → 核对并提交。创建任务需要钱包签名，创建成功不等于跨链执行成功。</p>
      </div>
      <div class="cc-toolbar">
        <a-steps :current="step - 1" size="small" style="min-width: 320px">
          <a-step title="选择业务" />
          <a-step title="填写内容" />
          <a-step title="核对提交" />
        </a-steps>
      </div>
    </div>

    <a-alert
      v-if="crossChainState.hubStatus && crossChainState.hubStatus.contractState !== 2"
      type="warning"
      show-icon
      :message="`业务通道当前不可用（合约状态：${crossChainState.hubStatus.contractStateText}）`"
      description="创建任务会被链上 onlyWorking 校验拒绝，请等待系统恢复 work 状态。"
    />

    <div class="cc-grid cc-grid-2">
      <div class="cc-panel">
        <!-- 步骤 1：选择业务类型 -->
        <template v-if="step === 1">
          <h2 class="cc-section-title">选择业务类型</h2>
          <div v-if="crossChainState.routesLoading" class="cc-loading">读取链上业务类型…</div>
          <div v-else-if="crossChainState.routesError" class="cc-error">
            {{ crossChainState.routesError }}
            <div style="margin-top: 8px"><a-button size="small" @click="loadRoutes(true)">重试</a-button></div>
          </div>
          <div v-else-if="!crossChainState.routes.length" class="cc-empty">链上尚未注册任何业务类型。</div>
          <div v-else style="display: flex; flex-direction: column; gap: 12px">
            <div
              v-for="route in crossChainState.routes"
              :key="route.id"
              class="cc-card"
              :class="{ 'is-selectable': route.isActive }"
              :style="{
                cursor: route.isActive ? 'pointer' : 'not-allowed',
                opacity: route.isActive ? 1 : 0.6,
                borderColor: selected?.id === route.id ? 'var(--cc-primary)' : undefined,
              }"
              @click="selectRoute(route)"
            >
              <div class="cc-toolbar">
                <strong>{{ route.name || `#${route.id}` }}</strong>
                <span class="cc-chip" :class="route.isActive ? 'is-success' : 'is-default'">
                  {{ route.isActive ? '可用' : '已停用' }}
                </span>
                <span v-if="capabilityOf(route.id)" class="cc-chip is-processing">
                  {{ describeCapability(capabilityOf(route.id)!).badge }}
                </span>
                <div class="cc-spacer"></div>
                <span class="cc-hint">typeId {{ route.id }}</span>
              </div>
              <div class="cc-hint" style="margin-top: 6px">
                验证器：<span class="cc-addr">{{ shortenAddress(route.verifier) }}</span>
              </div>
              <div v-if="capabilityOf(route.id)" class="cc-hint" style="margin-top: 4px">
                {{ describeCapability(capabilityOf(route.id)!).description }}
              </div>
            </div>
          </div>
        </template>

        <!-- 步骤 2：填写业务内容 -->
        <template v-else-if="step === 2">
          <h2 class="cc-section-title">填写业务内容</h2>
          <div class="cc-hint" style="margin-bottom: 10px">
            业务类型：<strong>{{ selected?.name }}</strong>
            <span v-if="capability" class="cc-chip is-processing" style="margin-left: 8px">{{ describeCapability(capability).badge }}</span>
          </div>

          <a-radio-group v-model:value="inputMode" button-style="solid" size="small" style="margin-bottom: 10px">
            <a-radio-button value="text">文本</a-radio-button>
            <a-radio-button value="hex">Hex</a-radio-button>
          </a-radio-group>

          <a-textarea
            v-if="inputMode === 'text'"
            v-model:value="textInput"
            :rows="5"
            placeholder="输入业务内容，提交时会自动转换为 Hex"
          />
          <a-textarea
            v-else
            v-model:value="hexInput"
            :rows="5"
            placeholder="0x 开头的十六进制内容"
          />

          <div class="cc-hint" style="margin-top: 8px">
            当前内容：{{ payloadBytes(payloadHex) }} 字节
          </div>
          <div v-if="payloadError" class="cc-error" style="margin-top: 10px">{{ payloadError }}</div>
          <div class="cc-hint" style="margin-top: 10px">
            内容格式由业务类型约定，前端只做通用校验（非空、合法 Hex）。若业务方提供了长度或编码要求，会在上方提示。
          </div>

          <div class="cc-toolbar" style="margin-top: 16px">
            <a-button @click="goStep(1)">上一步</a-button>
            <a-button type="primary" :disabled="Boolean(payloadError)" @click="goStep(3)">下一步</a-button>
          </div>
        </template>

        <!-- 步骤 3：核对并提交 -->
        <template v-else>
          <h2 class="cc-section-title">核对并提交</h2>
          <div class="cc-kv">
            <div class="cc-kv-key">业务类型</div>
            <div class="cc-kv-value">
              {{ selected?.name }}
              <span class="cc-hint">（提交时将原样使用链上名称，确保与合约记录一致）</span>
            </div>

            <div class="cc-kv-key">验证要求</div>
            <div class="cc-kv-value">
              {{ capability ? describeCapability(capability).description : '未知' }}
            </div>

            <div v-if="capability?.expectedChain" class="cc-kv-key">期望源链</div>
            <div v-if="capability?.expectedChain" class="cc-kv-value">{{ capability.expectedChain }}</div>

            <div class="cc-kv-key">签名网络</div>
            <div class="cc-kv-value">PunkOS（chainId {{ crossChainState.hubStatus?.chainId ?? '—' }}）</div>

            <div class="cc-kv-key">提交账户</div>
            <div class="cc-kv-value">
              <span v-if="crossChainState.walletAddress" class="cc-addr">{{ crossChainState.walletAddress }}</span>
              <span v-else class="cc-hint">{{ crossChainState.walletError || '未连接钱包' }}</span>
            </div>

            <div class="cc-kv-key">业务内容</div>
            <div class="cc-kv-value">
              <div class="cc-addr" style="word-break: break-all">{{ payloadHex }}</div>
              <div class="cc-hint">{{ payloadBytes(payloadHex) }} 字节</div>
            </div>
          </div>

          <div style="margin-top: 14px">
            <div class="cc-hint">任务奖励（PUNK）</div>
            <a-input v-model:value="fee" style="max-width: 220px" addon-after="PUNK" />
            <div class="cc-hint" style="margin-top: 4px">
              奖励由你自行设定，将由合约转给完成任务的执行者。可在“我的任务”中撤回。
            </div>
          </div>

          <div class="cc-card" style="margin-top: 14px">
            <div class="cc-hint">网络手续费</div>
            <div v-if="feeEstimate" style="margin-top: 4px">
              约 {{ feeEstimate }} PUNK
              <span class="cc-hint">（估算于 {{ estimateAt }}，实际以钱包确认为准）</span>
            </div>
            <div v-else style="margin-top: 4px">以钱包确认为准</div>
          </div>

          <div v-if="submitError" class="cc-error" style="margin-top: 12px">{{ submitError }}</div>

          <div class="cc-toolbar" style="margin-top: 16px">
            <a-button @click="goStep(2)">上一步</a-button>
            <a-button type="primary" :loading="submitting" :disabled="!canSubmit" @click="submit">
              钱包签名并创建
            </a-button>
          </div>
        </template>
      </div>

      <!-- 右侧摘要 -->
      <div style="display: flex; flex-direction: column; gap: var(--cc-gap)">
        <div class="cc-panel">
          <h2 class="cc-section-title">任务摘要</h2>
          <div class="cc-kv">
            <div class="cc-kv-key">业务类型</div>
            <div class="cc-kv-value">{{ selected?.name || '未选择' }}</div>
            <div class="cc-kv-key">内容字节</div>
            <div class="cc-kv-value">{{ payloadBytes(payloadHex) }}</div>
            <div class="cc-kv-key">奖励</div>
            <div class="cc-kv-value">{{ fee || '0' }} PUNK</div>
            <div class="cc-kv-key">需签名</div>
            <div class="cc-kv-value">是</div>
          </div>
        </div>
        <div class="cc-panel">
          <h2 class="cc-section-title">创建之后会发生什么</h2>
          <ol class="cc-hint" style="padding-left: 18px; line-height: 1.9; margin: 0">
            <li>任务状态变为「待接单」，等待中继者接单</li>
            <li>中继者在目标链完成业务动作，再回 Hub 提交证明</li>
            <li>证明通过验证后，奖励与质押按合约规则结算</li>
            <li>你可以在“我的任务”中跟踪，或撤回未被接单的任务</li>
          </ol>
        </div>
      </div>
    </div>

    <a-modal v-model:open="successVisible" title="任务已创建" :footer="null">
      <p>交易已确认，任务状态为「待接单」。</p>
      <p class="cc-addr" style="word-break: break-all">交易：{{ createdTx }}</p>
      <div class="cc-toolbar" style="margin-top: 12px">
        <a-button type="primary" @click="goDetail">查看任务详情</a-button>
        <a-button @click="resetForm">再创建一次</a-button>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { ethers } from 'ethers'
import { crossChainState, loadRoutes, loadWalletAddress, refreshAfterWrite } from '../services/store'
import { describeCapability, probeVerifierCapability, type VerifierCapability } from '../services/verifier'
import { payloadBytes, shortenAddress, isHex } from '../services/format'
import { ActionError, createTaskAction } from '../services/actions'
import { getHubClient, resolveHubConfig } from '../services/config'
import { transportInterface } from '../services/config'
import type { RouteInfo } from '../services/abi'

const route = useRoute()
const router = useRouter()

const step = ref<number>(Number(route.query.step) || 1)
const selected = ref<RouteInfo | null>(null)
const inputMode = ref<'text' | 'hex'>('text')
const textInput = ref('')
const hexInput = ref('')
const fee = ref('0.01')
const submitting = ref(false)
const submitError = ref('')
const successVisible = ref(false)
const createdTx = ref('')
const createdKey = ref('')
const capabilityMap = ref<Record<number, VerifierCapability>>({})
const feeEstimate = ref('')
const estimateAt = ref('')

const capability = computed(() => (selected.value ? capabilityMap.value[selected.value.id] ?? null : null))

const payloadHex = computed(() => {
  if (inputMode.value === 'hex') return hexInput.value.trim()
  const text = textInput.value
  if (!text) return '0x'
  return ethers.utils.hexlify(ethers.utils.toUtf8Bytes(text))
})

const payloadError = computed(() => {
  const value = payloadHex.value
  if (!value || value === '0x') return '请填写业务内容'
  if (!isHex(value, true)) return '十六进制格式不正确（需 0x 开头且长度为偶数）'
  return ''
})

const canSubmit = computed(
  () =>
    Boolean(selected.value?.isActive) &&
    !payloadError.value &&
    Boolean(fee.value) &&
    Number(fee.value) >= 0 &&
    !submitting.value,
)

function capabilityOf(routeId: number): VerifierCapability | null {
  return capabilityMap.value[routeId] ?? null
}

async function selectRoute(item: RouteInfo) {
  if (!item.isActive) {
    message.warning('该业务类型已停用，无法创建任务')
    return
  }
  selected.value = item
  if (!capabilityMap.value[item.id]) {
    capabilityMap.value[item.id] = await probeVerifierCapability(item.verifier)
  }
  goStep(2)
}

function goStep(next: number) {
  step.value = Math.min(3, Math.max(1, next))
}

async function submit() {
  if (!selected.value) return
  submitting.value = true
  submitError.value = ''
  try {
    const txHash = await createTaskAction({
      payload: payloadHex.value,
      taskType: selected.value.id,
      // 原样回传链上名称：合约会校验 keccak256(route.name) == keccak256(_routeName)
      routeName: selected.value.name,
      fee: fee.value,
    })
    createdTx.value = txHash
    successVisible.value = true
    await refreshAfterWrite()

    // 从新建任务中定位 taskKey（合约不返回，需从事件读取）
    const { getCreatedEvents } = await import('../services/chain')
    const events = await getCreatedEvents()
    const mine = [...events].reverse().find((event) => event.txHash.toLowerCase() === txHash.toLowerCase())
    createdKey.value = mine?.key || ''
  } catch (error: any) {
    const hint = error instanceof ActionError && error.hint ? `（${error.hint}）` : ''
    submitError.value = `${error?.message || '创建任务失败'}${hint}`
  } finally {
    submitting.value = false
  }
}

function goDetail() {
  successVisible.value = false
  if (createdKey.value) {
    router.push({ name: 'CrossChainTaskDetail', params: { taskKey: createdKey.value } })
  } else {
    router.push({ name: 'CrossChainMyTasks' })
  }
}

function resetForm() {
  successVisible.value = false
  step.value = 1
  selected.value = null
  textInput.value = ''
  hexInput.value = ''
  submitError.value = ''
}

/** 手续费估算：estimateGas × gasPrice；失败则显示“以钱包确认为准” */
async function estimateFee() {
  if (!selected.value || payloadError.value) {
    feeEstimate.value = ''
    return
  }
  try {
    const { transportAddress } = await resolveHubConfig()
    const client = await getHubClient()
    const data = transportInterface.encodeFunctionData('createTask', [
      payloadHex.value,
      selected.value.name,
      selected.value.id,
    ])
    const [gasHex, feeData] = await Promise.all([
      client.estimateGas({
        from: crossChainState.walletAddress || undefined,
        to: transportAddress,
        value: ethers.utils.parseEther(fee.value || '0').toHexString(),
        data,
      }),
      client.getFeeData(),
    ])
    const gas = ethers.BigNumber.from(gasHex)
    const price = ethers.BigNumber.from(feeData.gasPrice || '0x0')
    const total = gas.mul(price)
    feeEstimate.value = Number(ethers.utils.formatEther(total)).toFixed(6)
    estimateAt.value = new Date().toLocaleTimeString()
  } catch {
    feeEstimate.value = ''
  }
}

watch([step, payloadHex, fee, selected], () => {
  router.replace({ name: 'CrossChainCreate', query: { step: String(step.value) } })
})

watch([payloadHex, fee], () => {
  estimateFee()
})

void Promise.all([loadRoutes(), loadWalletAddress()])
</script>
