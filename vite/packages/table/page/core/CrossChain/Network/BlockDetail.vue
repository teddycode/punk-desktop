<template>
  <div class="cc-page">
    <div class="cc-page-head">
      <div>
        <h1 class="cc-page-title">区块详情</h1>
        <p class="cc-page-desc"><span class="cc-addr">{{ blockHashOrNumber }}</span></p>
      </div>
      <div class="cc-toolbar">
        <a-button @click="back">返回</a-button>
        <a-button :loading="loading" @click="load">刷新</a-button>
      </div>
    </div>

    <div v-if="loading && !block" class="cc-loading">读取链上区块…</div>
    <div v-else-if="error" class="cc-error">{{ error }}</div>
    <div v-else-if="!block" class="cc-empty">链上未找到该区块。</div>

    <template v-else>
      <div class="cc-grid cc-grid-2">
        <div class="cc-panel">
          <h2 class="cc-section-title">关键字段</h2>
          <div class="cc-kv">
            <div class="cc-kv-key">高度</div>
            <div class="cc-kv-value">#{{ Number(block.number) }}</div>
            <div class="cc-kv-key">区块哈希</div>
            <div class="cc-kv-value cc-addr">{{ block.hash }}</div>
            <div class="cc-kv-key">父区块</div>
            <div class="cc-kv-value cc-addr">{{ block.parentHash }}</div>
            <div class="cc-kv-key">时间</div>
            <div class="cc-kv-value">{{ formatTimestamp(Number(block.timestamp)) }}</div>
            <div class="cc-kv-key">Gas 使用 / 上限</div>
            <div class="cc-kv-value">{{ Number(block.gasUsed) }} / {{ Number(block.gasLimit) }}</div>
          </div>
        </div>

        <div class="cc-panel">
          <h2 class="cc-section-title">交易（{{ txHashes.length }} 笔）</h2>
          <div v-if="!txHashes.length" class="cc-hint">该区块没有交易。</div>
          <div v-else style="display: flex; flex-direction: column; gap: 8px">
            <div
              v-for="hash in txHashes"
              :key="hash"
              class="cc-card"
              style="padding: 10px 12px; cursor: pointer"
              @click="openTx(hash)"
            >
              <span class="cc-addr">{{ hash }}</span>
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
import { getHubClient } from '../services/config'
import { formatTimestamp } from '../services/format'
import type { RpcBlock } from '../services/rpc'

const route = useRoute()
const router = useRouter()

const blockHashOrNumber = computed(() => String(route.params.blockHash || ''))
const block = ref<RpcBlock | null>(null)
const loading = ref(false)
const error = ref('')

const txHashes = computed(() => {
  const list = block.value?.transactions ?? []
  return list.map((item) => (typeof item === 'string' ? item : item.hash))
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    const client = await getHubClient()
    const target = blockHashOrNumber.value
    // 支持区块哈希与高度两种入参
    block.value = /^\d+$/.test(target)
      ? await client.getBlock(Number(target), false)
      : await client.request<RpcBlock | null>('eth_getBlockByHash', [target, false])
  } catch (err: any) {
    error.value = err?.message || '读取区块失败'
  } finally {
    loading.value = false
  }
}

function back() {
  router.push({ name: 'CrossChainNetwork' })
}

function openTx(hash: string) {
  router.push({ name: 'CrossChainNetworkTx', params: { txHash: hash } })
}

onMounted(load)
</script>
