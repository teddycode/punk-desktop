<template>
  <div class="cc-page">
    <div class="cc-page-head">
      <div>
        <h1 class="cc-page-title">交易详情</h1>
        <p class="cc-page-desc"><span class="cc-addr">{{ txHash }}</span></p>
      </div>
      <div class="cc-toolbar">
        <a-button @click="back">返回</a-button>
        <a-button :loading="loading" @click="load">刷新</a-button>
      </div>
    </div>

    <div v-if="loading && !receipt" class="cc-loading">读取链上交易…</div>
    <div v-else-if="error" class="cc-error">{{ error }}</div>
    <div v-else-if="!receipt" class="cc-empty">链上未找到该交易。</div>

    <template v-else>
      <div class="cc-grid cc-grid-2">
        <div class="cc-panel">
          <h2 class="cc-section-title">结果摘要</h2>
          <div class="cc-kv">
            <div class="cc-kv-key">执行结果</div>
            <div class="cc-kv-value">
              <span class="cc-chip" :class="Number(receipt.status) === 1 ? 'is-success' : 'is-failed'">
                {{ Number(receipt.status) === 1 ? '成功' : '失败' }}
              </span>
            </div>
            <div class="cc-kv-key">区块</div>
            <div class="cc-kv-value">
              #{{ Number(receipt.blockNumber) }}
              <div class="cc-addr">{{ receipt.blockHash }}</div>
            </div>
            <div class="cc-kv-key">发送方</div>
            <div class="cc-kv-value cc-addr">{{ receipt.from }}</div>
            <div class="cc-kv-key">接收方</div>
            <div class="cc-kv-value cc-addr">{{ receipt.to || '合约创建' }}</div>
            <div class="cc-kv-key">Gas 使用</div>
            <div class="cc-kv-value">{{ Number(receipt.gasUsed) }}</div>
          </div>
        </div>

        <div class="cc-panel">
          <h2 class="cc-section-title">关联记录</h2>
          <div v-if="relatedTask" class="cc-kv">
            <div class="cc-kv-key">关联任务</div>
            <div class="cc-kv-value">
              <a @click="openTask(relatedTask.key)">{{ relatedTask.taskTypeName || `业务类型 #${relatedTask.taskType}` }}</a>
              <div class="cc-hint">
                <span class="cc-chip" :class="labelClass(relatedTask.label)">{{ labelText(relatedTask.label) }}</span>
              </div>
            </div>
          </div>
          <div v-else class="cc-hint">
            未在本地区的任务集合中找到与该交易关联的任务。若这是较早的任务交易，请在“我的任务”中刷新后再查看。
          </div>

          <div style="margin-top: 14px">
            <h2 class="cc-section-title">事件日志（{{ receipt.logs.length }} 条）</h2>
            <div v-if="!receipt.logs.length" class="cc-hint">该交易没有产生日志。</div>
            <div v-else style="display: flex; flex-direction: column; gap: 8px">
              <div v-for="(log, index) in receipt.logs.slice(0, 8)" :key="index" class="cc-card" style="padding: 10px 12px">
                <div class="cc-hint">合约 <span class="cc-addr">{{ log.address }}</span></div>
                <div class="cc-addr" style="word-break: break-all">
                  topic0: {{ log.topics[0] }}
                </div>
              </div>
              <div v-if="receipt.logs.length > 8" class="cc-hint">仅显示前 8 条</div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { crossChainState } from '../services/store'
import { getHubClient } from '../services/config'
import { labelClass, labelText } from '../services/format'
import type { RpcReceipt } from '../services/rpc'

const route = useRoute()
const router = useRouter()

const txHash = computed(() => String(route.params.txHash || ''))
const receipt = ref<RpcReceipt | null>(null)
const loading = ref(false)
const error = ref('')

const relatedTask = computed(() =>
  crossChainState.records.find((record) =>
    record.timeline.some((node) => node.txHash.toLowerCase() === txHash.value.toLowerCase()),
  ),
)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const client = await getHubClient()
    receipt.value = await client.getTransactionReceipt(txHash.value)
  } catch (err: any) {
    error.value = err?.message || '读取交易失败'
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

onMounted(load)
</script>
