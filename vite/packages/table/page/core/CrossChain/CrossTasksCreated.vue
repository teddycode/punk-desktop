<template>
  <a-layout class="dashboard-layout">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-title-wrap">
        <div class="page-title">跨链任务监控</div>
        <div class="page-desc">实时扫描链上任务，进行接单与证明提交。当前连接：Hub Chain</div>
      </div>
      <div class="header-actions">
        <a-space>
          <a-button type="primary" ghost @click="openRegisterDialog">
            <template #icon><UserOutlined /></template>
            中继者管理
          </a-button>
          <a-button type="primary" :loading="loading" @click="refreshData">
            <template #icon><ReloadOutlined /></template>
            刷新列表
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- 状态概览 -->
    <a-row :gutter="[16, 16]" class="status-overview">
      <a-col :xs="24" :sm="12" :md="6">
        <a-card size="small" class="stat-card">
          <a-statistic title="待接单任务" :value="pendingTaskCount" :value-style="{ color: '#1890ff' }" />
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="6">
        <a-card size="small" class="stat-card">
          <a-statistic title="我的质押" :value="relayerStatus.my_stake_eth" suffix="ETH" />
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="6">
        <a-card size="small" class="stat-card">
          <a-statistic title="要求质押" :value="relayerStatus.require_stake_eth" suffix="ETH" />
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="6">
        <a-card size="small" class="stat-card">
          <a-statistic title="身份状态" :value="roleText" :value-style="{ color: isRelayer ? '#52c41a' : '#faad14' }" />
        </a-card>
      </a-col>
    </a-row>

    <!-- 任务表格 -->
    <a-card class="table-card" :bordered="false">
      <a-table
        :columns="columns"
        :data-source="tasks"
        :loading="loading"
        row-key="task_key"
        :pagination="{ pageSize: 10, showSizeChanger: true }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'task_type'">
            <a-tag color="blue">#{{ record.taskType }}</a-tag>
          </template>

          <template v-else-if="column.key === 'task_key'">
            <a-tooltip :title="record.task_key">
              <span class="mono clickable" @click="copyToClipboard(record.task_key)">
                {{ shortenValue(record.task_key) }}
              </span>
            </a-tooltip>
          </template>

          <template v-else-if="column.key === 'user'">
            <a-tooltip :title="record.user">
              <span class="mono">{{ shortenValue(record.user) }}</span>
            </a-tooltip>
          </template>

          <template v-else-if="column.key === 'fee'">
            <span class="fee-text">{{ record.fee_eth }} ETH</span>
          </template>

          <template v-else-if="column.key === 'payload'">
            <a-tooltip :title="record.payload">
              <span class="mono payload-preview">{{ formatPayload(record.payload) }}</span>
            </a-tooltip>
          </template>

          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.label)">
              {{ getStatusLabel(record.label) }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button 
                v-if="record.label === 1" 
                type="primary" 
                size="small"
                :disabled="!isRelayer"
                @click="handleAccept(record.task_key)"
              >
                ⚡ 接单
              </a-button>
              
              <a-button 
                v-else-if="record.label === 2" 
                type="primary" 
                size="small"
                danger
                :disabled="!isMyTask(record)"
                @click="openSubmitDialog(record)"
              >
                📤 提交证明
              </a-button>
              
              <span v-else-if="record.label === 4" class="finished-text">✅ 任务成功</span>
              <span v-else-if="record.label === 5" class="failed-text">❌ 任务失败</span>
              <span v-else>--</span>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 中继者注册/管理弹窗 -->
    <a-modal
      v-model:open="registerDialogVisible"
      title="中继者管理"
      @ok="confirmRegister"
      :confirm-loading="registering"
      ok-text="确认操作"
    >
      <div class="modal-form">
        <div class="form-item">
          <label>当前钱包地址</label>
          <div class="address-box mono">{{ operatorAddress || '请先连接钱包' }}</div>
        </div>
        <div class="form-item">
          <label>已质押金额</label>
          <div class="value-text">{{ relayerStatus.my_stake_eth }} ETH</div>
        </div>
        <div class="form-item">
          <label>系统要求金额</label>
          <div class="value-text">{{ relayerStatus.require_stake_eth }} ETH</div>
        </div>
        <div class="form-item">
          <label>质押状态</label>
          <a-tag :color="isRelayer ? 'success' : 'warning'">
            {{ isRelayer ? '资格有效' : '质押不足' }}
          </a-tag>
        </div>
        <div class="form-item">
          <label>操作类型</label>
          <a-radio-group v-model:value="registerType">
            <a-radio value="deposit">追加质押</a-radio>
            <a-radio value="withdraw">提取质押</a-radio>
          </a-radio-group>
        </div>
        <div class="form-item">
          <label>{{ registerType === 'deposit' ? '质押金额' : '提取金额' }} (ETH)</label>
          <a-input-number v-model:value="stakeAmount" :min="0" :step="0.1" style="width: 100%" />
        </div>
        <p v-if="registerType === 'deposit'" class="hint">
          注意：成为中继者至少需要质押 {{ relayerStatus.require_stake_eth }} ETH。
        </p>
      </div>
    </a-modal>

    <!-- 提交证明弹窗 -->
    <a-modal
      v-model:open="submitDialogVisible"
      title="提交任务执行证明"
      width="640px"
      @ok="handleSubmitProof"
      :confirm-loading="submitting"
      ok-text="提交到链上"
    >
      <div class="modal-form">
        <a-alert message="请确保任务已在目标链执行成功，并获取对应交易凭证" type="info" show-icon style="margin-bottom: 20px" />
        
        <a-descriptions bordered :column="1" size="small">
          <a-descriptions-item label="任务 Key">
            <span class="mono">{{ currentTaskKey }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="任务数据 (Payload)">
            <div class="payload-box mono">{{ currentTask?.payload }}</div>
          </a-descriptions-item>
          <a-descriptions-item label="数据预览">
            <span class="decode-text">{{ decodePayloadPreview(currentTask?.payload) }}</span>
          </a-descriptions-item>
        </a-descriptions>

        <div class="form-group-title">目标链执行信息</div>
        <a-form layout="vertical">
          <a-form-item label="源链交易哈希 (Source Tx Hash)" required>
            <a-input v-model:value="destTxHash" placeholder="请输入目标链上执行该任务的交易哈希 0x..." />
          </a-form-item>
          
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="交易高度 (Tx Height)" required>
                <a-input v-model:value="destTxHeight" placeholder="高度数字" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="确认高度 (Confirm Height)">
                <a-input v-model:value="destConfirmHeight" placeholder="留空则同交易高度" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-form-item label="目标链 RPC 地址">
            <a-input v-model:value="destRpcUrl" placeholder="http://..." />
            <p class="hint">系统将通过此 RPC 获取交易详情与区块哈希进行验证</p>
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { UserOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import { ethers } from 'ethers'
import { 
  getFinalManagerAddress, 
  getFinalRpcUrl, 
  getSigner, 
  ensureNetwork,
  formatAddress,
  toHexPayload
} from '../../../services/crosschain'

// 合约 ABI 定义
const TRANSPORT_ABI = [
  'function taskNum() view returns (uint256)',
  'function taskIndex(uint256) view returns (bytes32)',
  'function getTaskInfoByKey(bytes32 _taskKey) view returns (address user, uint256 fee, uint256 taskType, address relayer, uint256 stake, bytes payload, uint8 label, uint256 time)',
  'function getMyStake() view returns (uint256)',
  'function getRequireStake() view returns (uint256)',
  'function becomeRelayer() payable',
  'function withdrawStake(uint256 _amount)',
  'function acceptTask(bytes32 _taskKey)',
  'function finishTask(bytes32 _taskKey, bytes rawTx, bytes leafNode, bytes proof, bytes32 keyShadowBlock) returns (bool)'
]

const MANAGER_ABI = [
  'function contract_chain_index(uint256 _chainId, uint256 _levelId) view returns (address)'
]

// 状态定义
const tasks = ref<any[]>([])
const loading = ref(false)
const totalTaskNum = ref(0)
const operatorAddress = ref('')
const relayerStatus = ref({
  my_stake_eth: '0',
  require_stake_eth: '0'
})

const isRelayer = computed(() => {
  const my = parseFloat(relayerStatus.value.my_stake_eth)
  const req = parseFloat(relayerStatus.value.require_stake_eth)
  return my >= req && req > 0
})

const roleText = computed(() => isRelayer.value ? '正式中继者' : '观察员 (质押不足)')
const pendingTaskCount = computed(() => tasks.value.filter(t => t.label === 1).length)

// 注册弹窗状态
const registerDialogVisible = ref(false)
const registering = ref(false)
const registerType = ref('deposit')
const stakeAmount = ref(0)

// 提交证明弹窗状态
const submitDialogVisible = ref(false)
const submitting = ref(false)
const currentTaskKey = ref('')
const currentTask = ref<any>(null)
const destTxHash = ref('')
const destTxHeight = ref('')
const destConfirmHeight = ref('')
const destRpcUrl = ref('http://47.243.174.71:36054')

const columns = [
  { title: '类型', key: 'task_type', dataIndex: 'taskType', width: 80 },
  { title: 'Task Key', key: 'task_key', dataIndex: 'task_key' },
  { title: '发起者', key: 'user', dataIndex: 'user' },
  { title: '悬赏费用', key: 'fee', dataIndex: 'fee_eth', width: 120 },
  { title: 'Payload', key: 'payload', dataIndex: 'payload' },
  { title: '当前状态', key: 'status', dataIndex: 'label', width: 100 },
  { title: '操作', key: 'action', width: 120 }
]

const shortenValue = (value: string) => {
  if (!value || value === '-') return value
  if (value.length <= 14) return value
  return `${value.slice(0, 8)}...${value.slice(-6)}`
}

const refreshData = async () => {
  loading.value = true
  try {
    const managerAddr = await getFinalManagerAddress()
    const rpcUrl = await getFinalRpcUrl()
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const managerContract = new ethers.Contract(managerAddr, MANAGER_ABI, provider)
    
    // Hub Chain ID = 0, Transport Level ID = 1
    const transportAddr = await managerContract.contract_chain_index(0, 1)
    if (!ethers.utils.isAddress(transportAddr)) throw new Error('解析传输合约失败')

    const transportContract = new ethers.Contract(transportAddr, TRANSPORT_ABI, provider)
    const total = await transportContract.taskNum()
    totalTaskNum.value = Number(total)

    const fetchedTasks = []
    const limit = 20
    const start = Math.max(0, totalTaskNum.value - limit)

    for (let i = totalTaskNum.value - 1; i >= start; i--) {
      try {
        const key = await transportContract.taskIndex(i)
        const info = await transportContract.getTaskInfoByKey(key)
        fetchedTasks.push({
          task_key: key,
          user: info.user,
          fee_eth: ethers.utils.formatEther(info.fee),
          taskType: Number(info.taskType),
          relayer: info.relayer,
          payload: info.payload,
          label: Number(info.label),
          time: Number(info.time)
        })
      } catch (e) {
        console.warn(`读取任务 ${i} 失败:`, e)
      }
    }
    tasks.value = fetchedTasks
    await fetchRelayerStatus()
  } catch (err: any) {
    message.error('同步链上任务失败: ' + (err.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

const fetchRelayerStatus = async () => {
  try {
    const managerAddr = await getFinalManagerAddress()
    const rpcUrl = await getFinalRpcUrl()
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const managerContract = new ethers.Contract(managerAddr, MANAGER_ABI, provider)
    const transportAddr = await managerContract.contract_chain_index(0, 1)

    const signer = await getSigner()
    const addr = await signer.getAddress()
    operatorAddress.value = addr

    const transportContract = new ethers.Contract(transportAddr, TRANSPORT_ABI, provider)
    const [myStake, reqStake] = await Promise.all([
      transportContract.getMyStake({ from: addr }).catch(() => BigInt(0)),
      transportContract.getRequireStake()
    ])

    relayerStatus.value = {
      my_stake_eth: ethers.utils.formatEther(myStake),
      require_stake_eth: ethers.utils.formatEther(reqStake)
    }
  } catch (e) {
    console.warn('获取质押状态失败:', e)
  }
}

const openRegisterDialog = () => {
  stakeAmount.value = 0
  registerDialogVisible.value = true
}

const confirmRegister = async () => {
  if (stakeAmount.value <= 0) {
    message.warning('请输入有效金额')
    return
  }

  registering.value = true
  try {
    await ensureNetwork()
    const signer = await getSigner()
    const managerAddr = await getFinalManagerAddress()
    const rpcUrl = await getFinalRpcUrl()
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const managerContract = new ethers.Contract(managerAddr, MANAGER_ABI, provider)
    const transportAddr = await managerContract.contract_chain_index(0, 1)
    
    const transportContract = new ethers.Contract(transportAddr, TRANSPORT_ABI, signer)
    const valWei = ethers.utils.parseEther(String(stakeAmount.value))
    
    let tx
    if (registerType.value === 'deposit') {
      tx = await transportContract.becomeRelayer({ value: valWei })
    } else {
      tx = await transportContract.withdrawStake(valWei)
    }
    
    message.success('交易已发送，等待确认...')
    await tx.wait()
    message.success('操作成功')
    registerDialogVisible.value = false
    await refreshData()
  } catch (e: any) {
    message.error(e.message || '操作失败')
  } finally {
    registering.value = false
  }
}

const handleAccept = async (taskKey: string) => {
  try {
    await ensureNetwork()
    const signer = await getSigner()
    const managerAddr = await getFinalManagerAddress()
    const rpcUrl = await getFinalRpcUrl()
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const managerContract = new ethers.Contract(managerAddr, MANAGER_ABI, provider)
    const transportAddr = await managerContract.contract_chain_index(0, 1)
    
    const transportContract = new ethers.Contract(transportAddr, TRANSPORT_ABI, signer)
    const tx = await transportContract.acceptTask(taskKey)
    message.success('接单交易已发送...')
    await tx.wait()
    message.success('接单成功！请开始在目标链执行任务。')
    await refreshData()
  } catch (e: any) {
    message.error(e.message || '接单失败')
  }
}

const openSubmitDialog = (record: any) => {
  currentTaskKey.value = record.task_key
  currentTask.value = record
  destTxHash.value = ''
  destTxHeight.value = ''
  destConfirmHeight.value = ''
  submitDialogVisible.value = true
}

const handleSubmitProof = async () => {
  if (!destTxHash.value.trim() || !destTxHeight.value.trim()) {
    message.warning('请提供目标链交易哈希与高度')
    return
  }

  submitting.value = true
  try {
    await ensureNetwork()
    const signer = await getSigner()
    const managerAddr = await getFinalManagerAddress()
    const rpcUrl = await getFinalRpcUrl()
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const managerContract = new ethers.Contract(managerAddr, MANAGER_ABI, provider)
    const transportAddr = await managerContract.contract_chain_index(0, 1)
    
    // 1. 获取目标链数据 (通过用户提供的 RPC)
    const dRpc = destRpcUrl.value.trim() || rpcUrl
    const dProvider = new ethers.providers.JsonRpcProvider(dRpc)
    const dHash = destTxHash.value.trim()
    
    const dTx = await dProvider.send('eth_getRawTransactionByHash', [dHash])
    if (!dTx) throw new Error('无法从目标链获取原始交易，请检查 RPC 或哈希')
    
    const dReceipt = await dProvider.getTransactionReceipt(dHash)
    if (!dReceipt?.blockHash) throw new Error('交易未确认')

    // 2. 调用合约提交 (简化验证模式)
    const transportContract = new ethers.Contract(transportAddr, TRANSPORT_ABI, signer)
    
    // 调用参数顺序: taskKey, rawTx, leafNode, proof, keyShadowBlock
    // 在 LCL 简化模式下，通常使用 rawTx 填充 leafNode, proof 可为 0x
    const tx = await transportContract.finishTask(
      currentTaskKey.value,
      dTx,
      dTx,
      '0x',
      dReceipt.blockHash,
      { gasLimit: 2000000 }
    )

    message.success('任务证明已提交，等待链上验证...')
    await tx.wait()
    message.success('🎉 任务完成！奖励已发放至质押余额。')
    submitDialogVisible.value = false
    await refreshData()
  } catch (e: any) {
    console.error(e)
    message.error(e.message || '证明提交失败')
  } finally {
    submitting.value = false
  }
}

const formatPayload = (payload: string) => {
  if (!payload || payload === '0x') return '--'
  return payload.length > 24 ? `${payload.slice(0, 14)}...${payload.slice(-8)}` : payload
}

const getStatusLabel = (label: number) => {
  const map: any = { 0: 'Unknown', 1: '待接单', 2: '进行中', 3: 'Rejected', 4: '已成功', 5: '已失败' }
  return map[label] || 'Unknown'
}

const getStatusColor = (label: number) => {
  const map: any = { 1: 'blue', 2: 'orange', 4: 'green', 5: 'red' }
  return map[label] || 'default'
}

const isMyTask = (record: any) => 
  String(record.relayer).toLowerCase() === String(operatorAddress.value).toLowerCase()

const decodePayloadPreview = (payload: string) => {
  try {
    if (!payload || payload === '0x') return '--'
    const bytes = ethers.utils.arrayify(payload)
    return new TextDecoder().decode(bytes).replace(/\u0000/g, '')
  } catch (e) {
    return '(二进制数据)'
  }
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
  message.info('已复制')
}

onMounted(() => {
  refreshData()
})
</script>

<style lang="scss" scoped>
.dashboard-layout {
  padding: 24px;
  background: transparent;
  min-height: 100vh;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  .page-title {
    font-size: 24px;
    font-weight: bold;
    color: #1a1a1a;
  }
  .page-desc {
    color: #666;
    margin-top: 4px;
  }
}
.status-overview {
  margin-bottom: 24px;
}
.stat-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.table-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.mono {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 13px;
}
.clickable {
  cursor: pointer;
  color: #1890ff;
  &:hover { text-decoration: underline; }
}
.fee-text {
  color: #f5222d;
  font-weight: bold;
}
.payload-preview {
  color: #666;
}
.finished-text { color: #52c41a; font-weight: bold; }
.failed-text { color: #ff4d4f; font-weight: bold; }

.modal-form {
  .form-item {
    margin-bottom: 20px;
    label {
      display: block;
      font-weight: 600;
      margin-bottom: 8px;
      color: #333;
    }
    .address-box {
      background: #f8f9fa;
      padding: 10px;
      border-radius: 6px;
      border: 1px solid #e9ecef;
      word-break: break-all;
    }
    .value-text {
      font-size: 16px;
      color: #1890ff;
      font-weight: bold;
    }
  }
  .form-group-title {
    font-size: 16px;
    font-weight: bold;
    margin: 24px 0 16px;
    padding-left: 12px;
    border-left: 4px solid #1890ff;
  }
}
.payload-box {
  max-height: 80px;
  overflow-y: auto;
  background: #f1f3f5;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
}
.decode-text {
  color: #096dd9;
  font-style: italic;
}
.hint {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 6px;
}
</style>

<!-- 引入外部 SCSS 样式，取消 scoped
<style src="@/styles/cross-tasks-created.scss"></style> -->