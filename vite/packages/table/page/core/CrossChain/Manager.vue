<template>
  <a-layout style="background-color: #f5f5f5; min-height: 100vh">
    <!-- 管理员信息卡片 -->
    <a-card
      style="margin: 20px; border-radius: 8px"
      :class="{'error-card': !apiAvailable}"
    >
      <template #title>
        <div style="display: flex; align-items: center; gap: 8px">
          <span>跨链区管理员</span>
          <a-spin v-if="loading" size="small" />
          <a-tag v-else :color="apiAvailable ? 'green' : 'red'">
            {{ apiAvailable ? '在线' : '离线' }}
          </a-tag>
        </div>
      </template>
      <div style="font-family: monospace">
        {{ zone_info.manager || (apiAvailable ? '加载中...' : '服务不可用') }}
      </div>
    </a-card>

    <!-- 选项卡容器 -->
    <a-tabs
      v-model:activeKey="activeKey"
      type="card"
      style="margin: 0 20px"
      @change="handleTabChange"
    >
      <a-tab-pane key="overview" tab="交易概览" />
      <a-tab-pane key="events" tab="交易事件" />
      <a-tab-pane key="raw" tab="原始数据" />
    </a-tabs>

    <!-- 交易概览面板 -->
    <a-card
      v-if="activeKey === 'overview'"
      style="margin: 20px; border-radius: 8px"
      :loading="loading"
    >
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">交易哈希：</span>
          <span class="info-value">
            <a-tooltip v-if="safeTxDetails.hash">
              {{ safeTxDetails.hash }}
              <template #title>点击复制</template>
            </a-tooltip>
            <span v-else class="error-text">无法获取交易哈希</span>
          </span>
        </div>

        <div class="info-item">
          <span class="info-label">交易状态：</span>
          <span class="info-value">
            <a-tag :color="txStatusColor">
              {{ txStatusText }}
            </a-tag>
          </span>
        </div>

        <div class="info-item">
          <span class="info-label">区块高度：</span>
          <span class="info-value">
            {{ safeTxDetails.blockNumber || '--' }}
          </span>
        </div>

        <div class="info-item">
          <span class="info-label">时间戳：</span>
          <span class="info-value">
            {{ formatTimestamp(safeTxDetails.timestamp) }}
          </span>
        </div>

        <div class="info-item">
          <span class="info-label">发送方：</span>
          <span class="info-value">
            <a-button type="link" style="padding: 0">
              {{ safeTxDetails.from || '未知地址' }}
            </a-button>
          </span>
        </div>

        <div class="info-item">
          <span class="info-label">接收方：</span>
          <span class="info-value">
            <a-button
              v-if="safeTxDetails.to"
              type="link"
              style="padding: 0"
            >
              {{ safeTxDetails.to }}
            </a-button>
            <span v-else class="contract-creation">
              <api-outlined />
              合约创建交易
            </span>
          </span>
        </div>

        <div class="info-item">
          <span class="info-label">交易金额：</span>
          <span class="info-value">
            {{ formatEther(safeTxDetails.value) }} ETH
          </span>
        </div>

        <div class="info-item">
          <span class="info-label">Gas 价格：</span>
          <span class="info-value">
            {{ formatUnits(safeTxDetails.gasPrice, 'gwei') }} Gwei
          </span>
        </div>

        <div class="info-item">
          <span class="info-label">Gas 用量：</span>
          <span class="info-value">
            {{ safeTxDetails.gasLimit }}
          </span>
        </div>

        <div class="info-item full-width">
          <span class="info-label">输入数据：</span>
          <span class="info-value">
            <a-tooltip
              v-if="safeTxDetails.data"
              :title="safeTxDetails.data"
              placement="topLeft"
            >
              <div class="data-preview">
                {{ safeTxDetails.data }}
              </div>
            </a-tooltip>
            <span v-else class="empty-data">无输入数据</span>
          </span>
        </div>
      </div>
    </a-card>

    <!-- 交易事件面板 -->
    <a-card
      v-if="activeKey === 'events'"
      style="margin: 20px; border-radius: 8px"
      :loading="loading"
    >
      <a-table
        :columns="eventColumns"
        :data-source="safeEvents"
        :pagination="false"
      >
        <template #emptyText>
          <a-empty
            :description="apiAvailable ? '暂无事件记录' : '无法获取事件数据'"
          />
        </template>

        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'value'">
            {{ formatEther(record.args.value) }} ETH
          </template>

          <template v-if="column.dataIndex === 'address'">
            <a-button type="link" style="padding: 0">
              {{ shortenAddress(record.address) }}
            </a-button>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 原始数据面板 -->
    <a-card
      v-if="activeKey === 'raw'"
      style="margin: 20px; border-radius: 8px"
    >
      <a-collapse v-model:activeKey="collapseActiveKey">
        <a-collapse-panel key="tx" header="交易原始数据">
          <pre>{{ JSON.stringify(safeTxDetails, null, 2) }}</pre>
        </a-collapse-panel>

        <a-collapse-panel key="events" header="事件原始数据">
          <pre>{{ JSON.stringify(safeEvents, null, 2) }}</pre>
        </a-collapse-panel>
      </a-collapse>
    </a-card>
  </a-layout>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  ReloadOutlined,
  LinkOutlined,
  ApiOutlined,
  SwapOutlined
} from '@ant-design/icons-vue'
import { ethers } from 'ethers'
import type { providers } from 'ethers'  // 添加类型导入

import axios from 'axios'

// 类型定义
interface EventLog {
  address: string
  topics: string[]
  data: string
  args: {
    from: string
    to: string
    value: string
  }
}
// 新增类型定义
interface EthersProvider extends providers.JsonRpcProvider {}

// 响应式状态
const loading = ref(true)
const apiAvailable = ref(true)
const activeKey = ref('overview')
const collapseActiveKey = ref(['tx'])
const zone_info = ref<Record<string, any>>({})
const safeTxDetails = ref<Record<string, any>>({})
const safeEvents = ref<EventLog[]>([])

// 表格列配置
const eventColumns = [
  { title: '事件合约', dataIndex: 'address', width: 200 },
  { title: '发送方', dataIndex: ['args', 'from'], width: 180 },
  { title: '接收方', dataIndex: ['args', 'to'], width: 180 },
  { title: '金额', dataIndex: 'value', width: 120 },
  { title: '原始数据', dataIndex: 'data' }
]

// 计算属性
const txStatusColor = computed(() => {
  if (!safeTxDetails.value) return 'gray'
  return safeTxDetails.value.confirmations > 0 ? 'green' : 'orange'
})

const txStatusText = computed(() => {
  if (!safeTxDetails.value) return '未知状态'
  return safeTxDetails.value.confirmations > 0
    ? `已确认 (${safeTxDetails.value.confirmations} 确认)`
    : '待确认'
})

// 工具函数
const formatEther = (value: string | number) => {
  try {
    return ethers.utils.formatEther(value.toString())
  } catch {
    return '0.0'
  }
}

const formatUnits = (value: string | number, unit: 'gwei' | 'ether' = 'gwei') => {
  try {
    return ethers.utils.formatUnits(value.toString(), unit)
  } catch {
    return '0.0'
  }
}

const shortenAddress = (address: string) => {
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '--'
}

const formatTimestamp = (timestamp: number) => {
  if (!timestamp) return '--'
  const date = new Date(timestamp * 1000)
  return date.toLocaleString()
}

// API 安全调用封装
const safeApiCall = async <T>(fn: () => Promise<T>, fallback: T, errorMsg?: string) => {
  try {
    return await fn()
  } catch (error) {
    console.error(errorMsg || 'API 调用失败:', error)
    apiAvailable.value = false
    return fallback
  }
}

// 数据获取函数
const fetchZoneInfo = async () => {
  zone_info.value = await safeApiCall<Record<string, any>>(
    async () => {
      const response = await axios.get('http://localhost:3020/api/crosschainzone')
      return response.data?.[0] || {}
    },
    {},
    '获取跨链区信息失败'
  )
}

// 修改后的数据获取函数
const fetchTransactionDetails = async (txHash: string) => {
  const fallbackTx = {
    hash: txHash,
    error: true,
    confirmations: 0
  }

  // 修改后的 Provider 实例化
  const provider = await safeApiCall<EthersProvider | null>(
    () => {
      if (!zone_info.value.rpc) throw new Error('RPC 地址未配置')
      return new ethers.providers.JsonRpcProvider(zone_info.value.rpc)
    },
    null,
    'RPC 连接失败'
  )

  // 修改后的交易详情获取
  safeTxDetails.value = await safeApiCall(
    async () => {
      if (!provider) throw new Error('RPC 不可用')
      const tx = await provider.getTransaction(txHash)
      if (!tx) throw new Error('交易不存在')

      // 获取额外信息
      const [receipt, block] = await Promise.all([
        provider.getTransactionReceipt(txHash),
        tx.blockNumber ? provider.getBlock(tx.blockNumber) : null
      ])

      return {
        ...tx,
        confirmations: tx.confirmations,
        timestamp: block?.timestamp,
        gasUsed: receipt?.gasUsed.toString()
      }
    },
    fallbackTx,
    '获取交易详情失败'
  )

  // 修改后的事件日志处理
  safeEvents.value = await safeApiCall(
    async () => {
      if (!provider) return []
      const receipt = await provider.getTransactionReceipt(txHash)
      return receipt?.logs.map(log => ({
        address: log.address,
        topics: log.topics,
        data: log.data,
        args: {
          from: log.topics[1] ?
            ethers.utils.hexStripZeros(log.topics[1]) : '',
          to: log.topics[2] ?
            ethers.utils.hexStripZeros(log.topics[2]) : '',
          value: log.data
        }
      })) || []
    },
    [],
    '获取事件日志失败'
  )
}

// 未实现功能（保留结构）
/* 待实现 - 自动刷新功能
const startPolling = () => {
  // 实现定时刷新逻辑
  // setInterval(fetchTransactionDetails, 15000)
}
*/

/* 待实现 - 区块信息获取
const fetchBlockInfo = async (blockNumber: number) => {
  // 实现区块详细信息获取
}
*/

/* 待实现 - 交易列表获取
const fetchTxList = async () => {
  // 实现交易列表获取
}
*/

// 生命周期
onMounted(async () => {
  const route = useRoute()
  const txHash = route.params.txHash as string

  try {
    await fetchZoneInfo()
    await fetchTransactionDetails(txHash)
  } catch (error) {
    console.error('初始化失败:', error)
  } finally {
    loading.value = false
  }
})

// 事件处理
const handleTabChange = (key: string) => {
  console.log('Tab changed to:', key)
}
</script>

<style scoped>
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  padding: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 8px 12px;
  background: #fafafa;
  border-radius: 4px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-label {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
}

.info-value {
  font-family: monospace;
  color: rgba(0, 0, 0, 0.65);
  word-break: break-all;
  text-align: right;
}

.data-preview {
  max-width: 600px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  direction: rtl;
  text-align: left;
}

.empty-data {
  color: rgba(0, 0, 0, 0.25);
}

.error-card {
  border-color: #ff4d4f;
}

.error-card ::v-deep(.ant-card-head) {
  border-color: #ff4d4f;
}

.error-text {
  color: #ff4d4f;
}

.contract-creation {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #1890ff;
}

pre {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  max-height: 400px;
  overflow: auto;
}
</style>
