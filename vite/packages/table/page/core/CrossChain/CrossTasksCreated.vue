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
          <a-statistic title="我的质押" :value="relayerStatus.my_stake_eth" :suffix="nativeSymbol" />
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="6">
        <a-card size="small" class="stat-card">
          <a-statistic title="要求质押" :value="relayerStatus.require_stake_eth" :suffix="nativeSymbol" />
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
      width="760px"
      centered
      wrap-class-name="relayer-manage-modal"
      @ok="confirmRegister"
      :confirm-loading="registering"
      cancel-text="取消"
      ok-text="确认操作"
    >
      <div class="register-modal-content">
        <div class="register-hero">
          <div>
            <div class="register-hero-title">中继者质押面板</div>
            <div class="register-hero-desc">查看当前身份状态，并在同一处完成追加质押或提取质押操作。</div>
          </div>
          <a-tag class="status-chip" :color="isRelayer ? 'success' : 'warning'">
            {{ isRelayer ? '正式中继者' : '观察员 / 质押不足' }}
          </a-tag>
        </div>

        <div class="wallet-panel">
          <div class="panel-label">当前钱包地址</div>
          <div class="address-box mono">{{ operatorAddress || '请先连接钱包' }}</div>
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <div class="summary-label">已质押金额</div>
            <div class="summary-value">{{ relayerStatus.my_stake_eth }} {{ nativeSymbol }}</div>
            <div class="summary-subtext">当前钱包在 Transport 合约中的质押余额</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">系统要求金额</div>
            <div class="summary-value">{{ relayerStatus.require_stake_eth }} {{ nativeSymbol }}</div>
            <div class="summary-subtext">成为正式中继者所需的最低门槛</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">当前身份</div>
            <div class="summary-value">{{ roleText }}</div>
            <div class="summary-subtext">身份会随质押余额变化实时更新</div>
          </div>
          <div class="summary-card" :class="{ highlight: missingStakeAmount > 0 }">
            <div class="summary-label">还需补足</div>
            <div class="summary-value">{{ missingStakeAmount.toFixed(4) }} {{ nativeSymbol }}</div>
            <div class="summary-subtext">
              {{ missingStakeAmount > 0 ? '补足后即可具备接单资格' : '当前已满足最低质押要求' }}
            </div>
          </div>
        </div>

        <div class="action-panel">
          <div class="panel-header">
            <div class="panel-title">质押操作</div>
            <div class="panel-desc">建议先确认钱包网络与账户余额，再提交链上交易。</div>
          </div>

          <div class="action-switch">
            <a-radio-group v-model:value="registerType" button-style="solid">
              <a-radio-button value="deposit">追加质押</a-radio-button>
              <a-radio-button value="withdraw">提取质押</a-radio-button>
            </a-radio-group>
          </div>

          <div class="amount-row">
            <div class="amount-field">
              <label>{{ registerType === 'deposit' ? '质押金额' : '提取金额' }} ({{ nativeSymbol }})</label>
              <a-input-number v-model:value="stakeAmount" :min="0" :step="0.1" style="width: 100%" />
            </div>
            <div class="amount-tip-card">
              <div class="tip-title">{{ registerType === 'deposit' ? '操作提示' : '提取说明' }}</div>
              <div class="tip-text">
                {{ registerType === 'deposit'
                  ? `至少补足 ${missingStakeAmount.toFixed(4)} ${nativeSymbol} 可恢复接单资格。`
                  : `当前最多可尝试提取 ${withdrawableStakeAmount.toFixed(4)} ${nativeSymbol}。` }}
              </div>
            </div>
          </div>

          <p class="hint">
            {{ registerType === 'deposit'
              ? `注意：成为中继者至少需要质押 ${relayerStatus.require_stake_eth} ${nativeSymbol}。`
              : '注意：提取后若低于要求金额，身份会变为观察员，无法继续接单。' }}
          </p>
        </div>
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
const currentStakeAmount = computed(() => parseFloat(relayerStatus.value.my_stake_eth) || 0)
const requiredStakeAmount = computed(() => parseFloat(relayerStatus.value.require_stake_eth) || 0)
const missingStakeAmount = computed(() => Math.max(requiredStakeAmount.value - currentStakeAmount.value, 0))
const withdrawableStakeAmount = computed(() => Math.max(currentStakeAmount.value, 0))
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
const nativeSymbol = 'PUNK'
const TX_CONFIRM_TIMEOUT_MS = 120000
const TX_POLL_INTERVAL_MS = 2000

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

const extractErrorMessage = (error: any): string => {
  const nestedMessage =
    error?.reason ||
    error?.data?.message ||
    error?.error?.message ||
    error?.message ||
    ''

  if (/user rejected|user denied|rejected request|4001/i.test(nestedMessage)) {
    return '用户取消了钱包签名'
  }

  return nestedMessage || '未知错误'
}

const waitForTransactionReceipt = async (
  provider: ethers.providers.JsonRpcProvider,
  txHash: string,
  timeoutMs = TX_CONFIRM_TIMEOUT_MS,
  pollIntervalMs = TX_POLL_INTERVAL_MS
) => {
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    const receipt = await provider.getTransactionReceipt(txHash)
    if (receipt) {
      return receipt
    }
    await new Promise(resolve => setTimeout(resolve, pollIntervalMs))
  }

  throw new Error(`交易已发送，但在 ${Math.round(timeoutMs / 1000)} 秒内未等到链上确认。请稍后刷新重试。`)
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
  registerType.value = 'deposit'
  const myStake = parseFloat(relayerStatus.value.my_stake_eth) || 0
  const reqStake = parseFloat(relayerStatus.value.require_stake_eth) || 0
  const missingStake = Math.max(reqStake - myStake, 0)
  stakeAmount.value = missingStake > 0 ? Number(missingStake.toFixed(4)) : 0
  registerDialogVisible.value = true
}

const confirmRegister = async () => {
  const normalizedAmount = Number(stakeAmount.value)
  if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
    message.warning(`请输入有效的 ${nativeSymbol} 金额`)
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
    const valWei = ethers.utils.parseEther(String(normalizedAmount))
    
    let tx
    if (registerType.value === 'deposit') {
      await transportContract.callStatic.becomeRelayer({ value: valWei })
      tx = await transportContract.becomeRelayer({ value: valWei })
    } else {
      await transportContract.callStatic.withdrawStake(valWei)
      tx = await transportContract.withdrawStake(valWei)
    }

    if (!tx?.hash) {
      throw new Error('钱包未返回交易哈希，请确认是否已签名')
    }

    message.success(`交易已发送：${shortenValue(tx.hash)}`)
    const receipt = await waitForTransactionReceipt(provider, tx.hash)
    if (receipt.status !== 1) {
      throw new Error('链上交易执行失败，请检查质押金额或合约状态')
    }

    message.success('操作成功，质押状态已同步')
    registerDialogVisible.value = false
    await refreshData()
  } catch (e: any) {
    message.error(extractErrorMessage(e))
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
    if (!tx?.hash) {
      throw new Error('钱包未返回接单交易哈希')
    }
    message.success(`接单交易已发送：${shortenValue(tx.hash)}`)
    const receipt = await waitForTransactionReceipt(provider, tx.hash)
    if (receipt.status !== 1) {
      throw new Error('链上接单交易执行失败')
    }
    message.success('接单成功！请开始在目标链执行任务。')
    await refreshData()
  } catch (e: any) {
    message.error(extractErrorMessage(e))
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
    if (!tx?.hash) {
      throw new Error('钱包未返回任务证明交易哈希')
    }
    const receipt = await waitForTransactionReceipt(provider, tx.hash)
    if (receipt.status !== 1) {
      throw new Error('链上任务证明交易执行失败')
    }
    message.success('🎉 任务完成！奖励已发放至质押余额。')
    submitDialogVisible.value = false
    await refreshData()
  } catch (e: any) {
    console.error(e)
    message.error(extractErrorMessage(e))
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

.register-modal-content {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.register-hero {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 18px 20px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(22, 119, 255, 0.1), rgba(13, 35, 89, 0.05));
  border: 1px solid rgba(24, 144, 255, 0.14);
}

.register-hero-title {
  font-size: 18px;
  font-weight: 700;
  color: #102a43;
  margin-bottom: 6px;
}

.register-hero-desc {
  font-size: 13px;
  line-height: 1.6;
  color: #486581;
}

.status-chip {
  margin-top: 2px;
  border-radius: 999px;
  padding: 4px 10px;
}

.wallet-panel,
.action-panel {
  padding: 18px 20px;
  border-radius: 16px;
  background: #f8fbff;
  border: 1px solid #d8e8ff;
}

.panel-label {
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #486581;
}

.address-box {
  background: #ffffff;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #d9e2ec;
  word-break: break-all;
  color: #243b53;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.summary-card {
  padding: 18px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid #e8eef6;
  box-shadow: 0 10px 24px rgba(16, 42, 67, 0.06);
}

.summary-card.highlight {
  border-color: rgba(250, 173, 20, 0.35);
  background: linear-gradient(180deg, #fffaf0 0%, #ffffff 100%);
}

.summary-label {
  margin-bottom: 10px;
  font-size: 13px;
  color: #7b8794;
}

.summary-value {
  font-size: 24px;
  line-height: 1.2;
  font-weight: 700;
  color: #102a43;
}

.summary-subtext {
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.6;
  color: #7b8794;
}

.panel-header {
  margin-bottom: 16px;
}

.panel-title {
  font-size: 16px;
  font-weight: 700;
  color: #102a43;
}

.panel-desc {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.6;
  color: #7b8794;
}

.action-switch {
  margin-bottom: 16px;
}

.amount-row {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(220px, 1fr);
  gap: 14px;
  align-items: end;
}

.amount-field {
  label {
    display: block;
    font-weight: 600;
    margin-bottom: 8px;
    color: #333;
  }
}

.amount-tip-card {
  min-height: 74px;
  padding: 14px 16px;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid #e8eef6;
}

.tip-title {
  font-size: 13px;
  font-weight: 700;
  color: #102a43;
  margin-bottom: 6px;
}

.tip-text {
  font-size: 12px;
  line-height: 1.6;
  color: #52606d;
}

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

@media (max-width: 768px) {
  .amount-row {
    grid-template-columns: 1fr;
  }

  .register-hero {
    flex-direction: column;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }
}

:deep(.relayer-manage-modal .ant-modal-content) {
  border-radius: 20px;
  overflow: hidden;
}

:deep(.relayer-manage-modal .ant-modal-header) {
  padding: 18px 24px 12px;
  border-bottom: 1px solid #eef2f7;
}

:deep(.relayer-manage-modal .ant-modal-title) {
  font-size: 22px;
  font-weight: 700;
  color: #102a43;
}

:deep(.relayer-manage-modal .ant-modal-body) {
  padding: 20px 24px 16px;
}

:deep(.relayer-manage-modal .ant-modal-footer) {
  padding: 12px 24px 20px;
  border-top: 1px solid #eef2f7;
}
</style>

<!-- 引入外部 SCSS 样式，取消 scoped
<style src="@/styles/cross-tasks-created.scss"></style> -->
