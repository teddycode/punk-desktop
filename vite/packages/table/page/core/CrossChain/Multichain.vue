<template>
  <a-layout class="manager-layout">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-title-wrap">
        <div class="page-title">交易详情解析</div>
        <div class="page-desc">跨链区管理员状态及交易的执行明细、事件日志分析</div>
      </div>
      <div class="page-actions">
        <a-button type="primary" :loading="checkingAuth" @click="handleOpenRegisterDialog">
          新增任务类型
        </a-button>
      </div>
    </div>

    <!-- 管理员信息卡片 -->
    <a-card
      class="manager-card"
      :class="{'error-card': !apiAvailable}"
      :bordered="false"
    >
      <template #title>
        <div class="card-title">
          <span>跨链区管理员</span>
          <a-spin v-if="loading" size="small" style="margin-left: 12px;" />
          <a-tag v-else :color="apiAvailable ? 'blue' : 'red'" style="margin-left: 12px;">
            {{ apiAvailable ? '在线' : '离线' }}
          </a-tag>
        </div>
      </template>
      <div class="manager-address">
        {{ zone_info.manager || (apiAvailable ? '加载中...' : '服务不可用') }}
      </div>
    </a-card>

    <!-- 选项卡容器 -->
    <div class="tabs-container">
      <a-tabs
        v-model:activeKey="activeKey"
        class="custom-tabs"
        @change="handleTabChange"
      >
        <a-tab-pane key="overview" tab="交易概览" />
        <a-tab-pane key="events" tab="交易事件" />
        <a-tab-pane key="raw" tab="原始数据" />
      </a-tabs>
    </div>

    <!-- 交易概览面板 -->
    <a-card
      v-if="activeKey === 'overview'"
      class="detail-card"
      :loading="loading"
      :bordered="false"
    >
      <div class="info-grid">
        <div class="info-item full-width">
          <span class="info-label">交易哈希 (Transaction Hash)</span>
          <span class="info-value">
            <a-tooltip v-if="safeTxDetails.hash">
              <span style="color: #1890ff; cursor: pointer;">{{ safeTxDetails.hash }}</span>
              <template #title>点击复制</template>
            </a-tooltip>
            <span v-else class="error-text">无法获取交易哈希</span>
          </span>
        </div>

        <div class="info-item">
          <span class="info-label">交易状态 (Status)</span>
          <span class="info-value">
            <a-tag :color="txStatusColor" style="margin: 0; font-family: inherit;">
              {{ txStatusText }}
            </a-tag>
          </span>
        </div>

        <div class="info-item">
          <span class="info-label">区块高度 (Block)</span>
          <span class="info-value">
            {{ safeTxDetails.blockNumber || '--' }}
          </span>
        </div>

        <div class="info-item">
          <span class="info-label">时间戳 (Timestamp)</span>
          <span class="info-value">
            {{ formatTimestamp(safeTxDetails.timestamp) }}
          </span>
        </div>

        <div class="info-item">
          <span class="info-label">发送方 (From)</span>
          <span class="info-value">
            <a-button type="link" style="padding: 0; font-family: inherit; font-size: inherit; height: auto;">
              {{ safeTxDetails.from || '未知地址' }}
            </a-button>
          </span>
        </div>

        <div class="info-item">
          <span class="info-label">接收方 (To)</span>
          <span class="info-value">
            <a-button
              v-if="safeTxDetails.to"
              type="link"
              style="padding: 0; font-family: inherit; font-size: inherit; height: auto;"
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
          <span class="info-label">交易金额 (Value)</span>
          <span class="info-value">
            {{ formatEther(safeTxDetails.value) }} ETH
          </span>
        </div>

        <div class="info-item">
          <span class="info-label">Gas 价格 (Gas Price)</span>
          <span class="info-value">
            {{ formatUnits(safeTxDetails.gasPrice, 'gwei') }} Gwei
          </span>
        </div>

        <div class="info-item">
          <span class="info-label">Gas 用量 (Gas Limit)</span>
          <span class="info-value">
            {{ safeTxDetails.gasLimit }}
          </span>
        </div>

        <div class="info-item full-width">
          <span class="info-label">输入数据 (Input Data)</span>
          <span class="info-value">
            <div v-if="safeTxDetails.data" class="data-preview">
              {{ safeTxDetails.data }}
            </div>
            <span v-else class="empty-data">无输入数据</span>
          </span>
        </div>
      </div>
    </a-card>

    <!-- 交易事件面板 -->
    <a-card
      v-if="activeKey === 'events'"
      class="detail-card"
      :loading="loading"
      :bordered="false"
    >
      <a-table
        :columns="eventColumns"
        :data-source="safeEvents"
        :pagination="false"
        class="custom-table"
      >
        <template #emptyText>
          <a-empty
            :description="apiAvailable ? '暂无事件记录' : '无法获取事件数据'"
          />
        </template>

        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'value'">
            <span style="font-weight: 600; color: #1890ff;">{{ formatEther(record.args.value) }} ETH</span>
          </template>

          <template v-if="column.dataIndex === 'address'">
            <a-button type="link" style="padding: 0; font-family: monospace;">
              {{ shortenAddress(record.address) }}
            </a-button>
          </template>

          <template v-if="column.dataIndex === 'data'">
            <div style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: monospace; color: #666;">
              <a-tooltip :title="record.data" placement="topLeft">
                {{ record.data }}
              </a-tooltip>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 原始数据面板 -->
    <a-card
      v-if="activeKey === 'raw'"
      class="detail-card"
      :bordered="false"
    >
      <a-collapse v-model:activeKey="collapseActiveKey" ghost>
        <a-collapse-panel key="tx" header="交易原始数据 (Transaction Raw Data)">
          <pre class="raw-data-panel">{{ JSON.stringify(safeTxDetails, null, 2) }}</pre>
        </a-collapse-panel>

        <a-collapse-panel key="events" header="事件原始数据 (Events Raw Data)">
          <pre class="raw-data-panel">{{ JSON.stringify(safeEvents, null, 2) }}</pre>
        </a-collapse-panel>
      </a-collapse>
    </a-card>

    <!-- 注册任务类型弹窗 -->
    <div v-if="showRegisterDialog" class="modal-overlay" @click.self="showRegisterDialog = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>注册新任务类型</h3>
          <button class="close-btn" @click="showRegisterDialog = false">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>任务类型 ID (uint16)</label>
            <input 
              v-model.number="registerForm.taskType" 
              type="number" 
              min="1" 
              max="65535"
              placeholder="例如: 1"
            >
            <span class="help-text">有效范围: 1-65535</span>
          </div>

          <div class="form-group">
            <label>任务名称 (string)</label>
            <input
              v-model="registerForm.name"
              type="text"
              placeholder="例如: Route-1"
            >
          </div>

          <div class="form-group">
            <label>验证器地址 (address)</label>
            <input
              v-model="registerForm.verifier"
              type="text"
              placeholder="0x..."
            >
          </div>

          <div class="form-group">
            <label>是否启用 (bool)</label>
            <select v-model="registerForm.isActive">
              <option :value="true">启用</option>
              <option :value="false">禁用</option>
            </select>
          </div>

          <div class="form-group">
            <label>管理员地址</label>
            <input
              :value="resolvedTransportAddress"
              type="text"
              placeholder="禁止为空"
              readonly
            >
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="showRegisterDialog = false">取消</button>
          <button 
            class="btn-primary" 
            :disabled="submitting || checkingAuth || !registerForm.taskType || !registerForm.name || !registerForm.verifier"
            @click="handleRegisterSubmit"
          >
            <span v-if="submitting || checkingAuth">注册中...</span>
            <span v-else>确认注册</span>
          </button>
        </div>
      </div>
    </div>
  </a-layout>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import {
  ReloadOutlined,
  LinkOutlined,
  ApiOutlined,
  SwapOutlined
} from '@ant-design/icons-vue'
import { ethers } from 'ethers'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import {
  useTaskContract,
  useResolvedTransportAddressByManager
} from '../../../services/crosschain'

// 导入和状态扩展
const { submitting, submitRegisterTaskType } = useTaskContract()

// 弹窗状态和表单数据
const showRegisterDialog = ref(false)
const checkingAuth = ref(false)
const currentWalletAddress = ref('')
const resolvedTransportAddress = ref<string>('')
const crosschainApi = (window as any).baseApi?.crosschain

type RegisterFormState = {
  taskType: string | number
  name: string
  verifier: string
  isActive: boolean
}

const registerForm = reactive<RegisterFormState>({
  taskType: '',
  name: '',
  verifier: '',
  isActive: true
})

const normalizeAddress = (address: string) => {
  try {
    return ethers.utils.getAddress(address)
  } catch {
    return ''
  }
}

const managerAddress = computed(() => normalizeAddress(zone_info.value.manager || ''))
const currentUserAddress = computed(() => normalizeAddress(currentWalletAddress.value || ''))
const isCurrentUserManager = computed(() => {
  if (!managerAddress.value || !currentUserAddress.value) return false
  return managerAddress.value === currentUserAddress.value
})

const getWalletAddress = async (requestConnect = false): Promise<string> => {
  const ethereum = (window as any)?.ethereum
  if (!ethereum?.request) {
    throw new Error('未检测到钱包插件')
  }

  const method = requestConnect ? 'eth_requestAccounts' : 'eth_accounts'
  const accounts = await ethereum.request({ method })
  const first = Array.isArray(accounts) ? accounts[0] : ''
  currentWalletAddress.value = first || ''
  return currentWalletAddress.value
}

const handleOpenRegisterDialog = async () => {
  showRegisterDialog.value = true
}

// 处理注册提交
const handleRegisterSubmit = async () => {
  if (!registerForm.taskType || !registerForm.name || !registerForm.verifier) {
    ElMessage.warning('请填写完整信息')
    return
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(registerForm.verifier)) {
    ElMessage.error('无效的验证器地址格式')
    return
  }

  try {
    checkingAuth.value = true

    if (!zone_info.value.manager) {
      await fetchZoneInfo()
    }

    if (!zone_info.value.manager) {
      ElMessage.error('未获取到管理员地址，无法校验权限。请检查跨链区配置服务是否可用')
      return
    }

    let address = await getWalletAddress(false)
    if (!address) {
      address = await getWalletAddress(true)
    }

    if (!address) {
      ElMessage.warning('请先连接钱包')
      return
    }

    if (!isCurrentUserManager.value) {
      ElMessage.error(`当前钱包 ${shortenAddress(currentUserAddress.value)} 不是管理员，无权限新增任务类型`)
      return
    }

    if (!resolvedTransportAddress.value) {
      const rpcUrl = zone_info.value.rpc || undefined
      resolvedTransportAddress.value = await useResolvedTransportAddressByManager({
        managerAddress: zone_info.value.manager,
        rpcUrl
      })
    }

    const success = await submitRegisterTaskType({
      typeId: Number(registerForm.taskType),
      name: String(registerForm.name).trim(),
      verifier: registerForm.verifier,
      isActive: !!registerForm.isActive
    })
    
    if (success) {
      ElMessage.success('任务类型注册请求已提交')
      showRegisterDialog.value = false
      // 清空表单
      registerForm.taskType = ''
      registerForm.name = ''
      registerForm.verifier = ''
      registerForm.isActive = true
      resolvedTransportAddress.value = ''
    }
  } catch (error: any) {
    ElMessage.error(error.message || '注册失败')
  } finally {
    checkingAuth.value = false
  }
}

// 响应式状态
const loading = ref(true)
const apiAvailable = ref(true)
const activeKey = ref('overview')
const collapseActiveKey = ref(['tx'])
const zone_info = ref<Record<string, any>>({})
const safeTxDetails = ref<Record<string, any>>({})
const safeEvents = ref<any[]>([])

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
      const fetchByBridge = async () => {
        const response = await crosschainApi.getCrosschainzone()
        if (response?.success) {
          return response.data?.[0] || {}
        }
        throw new Error(response?.error || 'IPC 获取跨链区信息失败')
      }

      const fetchByHttp = async () => {
        const response = await axios.get('http://localhost:3020/api/crosschainzone')
        return response.data?.[0] || {}
      }

      if (crosschainApi?.getCrosschainzone) {
        try {
          return await fetchByBridge()
        } catch (bridgeError) {
          console.warn('IPC 获取跨链区信息失败，回退 HTTP:', bridgeError)
        }
      }

      return await fetchByHttp()
    },
    {},
    '获取跨链区信息失败'
  )
}

// 修改后的数据获取函数
const fetchTransactionDetails = async (txHash: string) => {
  const fallbackTx: Record<string, any> = {
    hash: txHash,
    error: true,
    confirmations: 0
  }

  // 修改后的 Provider 实例化
  const provider = await safeApiCall<ethers.providers.JsonRpcProvider | null>(
    async () => {
      if (!zone_info.value.rpc) throw new Error('RPC 地址未配置')
      return new ethers.providers.JsonRpcProvider(zone_info.value.rpc)
    },
    null,
    'RPC 连接失败'
  )

  // 修改后的交易详情获取
  safeTxDetails.value = await safeApiCall<Record<string, any>>(
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
    try {
      await getWalletAddress(false)
    } catch {
      currentWalletAddress.value = ''
    }

    await fetchZoneInfo()
    if (!zone_info.value.manager) {
      ElMessage.warning('跨链区配置未就绪：管理员地址为空，新增任务类型将不可用')
    }
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

<style src="@assets/CrossChain/manager.scss"></style>
