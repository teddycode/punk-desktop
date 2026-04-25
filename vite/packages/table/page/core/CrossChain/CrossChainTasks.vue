<template>
  <div class="cross-chain-tasks">
    <div class="header-section">
      <h1>🌐 跨链任务市场</h1>
      <p class="subtitle">选择源链与任务类型，发起跨链请求</p>
    </div>

    <!-- 顶部过滤与统计 -->
    <div class="filter-section">
      <div class="filter-item">
        <label>目标链 (当前系统)</label>
        <div class="chain-tag">PunkOS (Hub)</div>
      </div>
      <div class="filter-item">
        <label>源链选择</label>
        <select v-model="selectedSourceChainId" @change="handleSourceChange" :disabled="loading">
          <option v-for="chain in sourceChains" :key="chain.id" :value="chain.id">
            {{ chain.name }} ({{ chain.symbol }})
          </option>
        </select>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>正在同步链上数据...</p>
    </div>

    <!-- 任务列表 -->
    <div v-else class="task-grid">
      <div 
        v-for="task in tasks" 
        :key="task.typeId"
        class="task-card"
        :class="{ disabled: !task.isActive }"
      >
        <div class="task-header">
          <h3>{{ task.name }}</h3>
          <span :class="['status-badge', task.isActive ? 'active' : 'inactive']">
            {{ task.isActive ? '可用' : '禁用' }}
          </span>
        </div>
        
        <div class="task-body">
          <div class="info-row">
            <span class="label">类型 ID:</span>
            <span class="value">#{{ task.typeId }}</span>
          </div>
          <div class="info-row">
            <span class="label">验证器:</span>
            <span class="value mono" :title="task.validator">{{ formatAddress(task.validator) }}</span>
          </div>
        </div>

        <button 
          @click="openModal(task)"
          :disabled="!task.isActive"
          class="action-button"
        >
          {{ task.isActive ? '立即发起任务' : '暂不可用' }}
        </button>
      </div>

      <div v-if="!loading && tasks.length === 0" class="empty-state">
        <p>当前源链下暂无已注册的任务类型</p>
      </div>
    </div>

    <!-- 弹窗遮罩 -->
    <div 
      v-if="showDialog" 
      class="modal-overlay"
      @click.self="closeModal"
    >
      <div class="modal-content">
        <button class="close-btn" @click="closeModal">✕</button>
        
        <h2>🚀 发起跨链任务</h2>
        <div class="task-meta-tag">{{ currentTask?.name }}</div>
        
        <div class="info-box">
          <div class="info-row">
            <span>源链:</span>
            <span class="highlight">{{ selectedChainInfo?.name }} ({{ selectedChainInfo?.symbol }})</span>
          </div>
          <div class="info-row">
            <span>目标链:</span>
            <span class="highlight">PunkOS (Hub)</span>
          </div>
          <div class="info-row">
            <span>验证器:</span>
            <span class="mono">{{ currentTask?.validator }}</span>
          </div>
        </div>

        <div class="form-group">
          <label>📝 任务 Payload (Hex 或 文本)</label>
          <textarea 
            v-model="formData.payload"
            placeholder="输入要跨链传输的数据内容..."
            rows="4"
          ></textarea>
          <p class="hint">💡 文本数据将自动转换为 Hex 发送</p>
        </div>

        <div class="form-group">
          <label>💰 跨链保证金/费用 (ETH)</label>
          <div class="input-with-unit">
            <input 
              v-model="formData.fee"
              type="number"
              step="0.001"
              placeholder="0.01"/>
            <span class="unit">ETH</span>
          </div>
          <p class="hint warning">⚠️ 费用将作为奖励支付给执行任务的搬运工</p>
        </div>

        <div class="fee-estimate">
          <div class="fee-row">
            <span>预估基础 Gas:</span>
            <span class="fee-value">~0.002 ETH</span>
          </div>
          <div class="fee-row">
            <span>设置奖励金额:</span>
            <span class="fee-value">{{ formData.fee || '0' }} ETH</span>
          </div>
          <hr>
          <div class="fee-row total">
            <span>预计总支出:</span>
            <span class="fee-value">~{{ calculateTotal() }} ETH</span>
          </div>
        </div>

        <div class="button-group">
          <button class="btn-cancel" @click="closeModal">取消</button>
          <button 
            class="btn-submit" 
            @click="handleSubmit"
            :disabled="submitting"
          >
            <span v-if="submitting" class="mini-spinner"></span>
            {{ submitting ? '正在提交交易...' : '确认并发起' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { ethers } from 'ethers'
import { 
  getFinalManagerAddress, 
  getFinalRpcUrl, 
  getSigner, 
  ensureNetwork,
  formatAddress,
  toHexPayload
} from '../../../services/crosschain'

interface TaskTypeInfo {
  typeId: number
  name: string
  isActive: boolean
  validator: string
}

interface SourceChain {
  id: number
  name: string
  symbol: string
}

const MANAGER_ABI = [
  'function getSourceChainNum() view returns (uint256)',
  'function getSourceChainInfo(uint256 sourceID) view returns (string symbol, string name, uint256 state, uint256 contractNum, address[] contractAddressList)',
  'function contract_chain_index(uint256 _chainId, uint256 _levelId) external view returns (address)'
]

const TRANSPORT_ABI = [
  'function getAllRoutes() external view returns (uint256[] memory typeIds, string[] memory names, bool[] memory isActive, address[] memory validators)',
  'function createTask(bytes _payload, string _routeName, uint256 _taskType) external payable',
  'function getRequireStake() public view returns (uint256)'
]

const loading = ref(false)
const submitting = ref(false)
const tasks = ref<TaskTypeInfo[]>([])
const sourceChains = ref<SourceChain[]>([])
const selectedSourceChainId = ref<number>(1)

const showDialog = ref(false)
const currentTask = ref<TaskTypeInfo | null>(null)
const formData = reactive({
  payload: '',
  fee: '0.01'
})

const selectedChainInfo = computed(() => 
  sourceChains.value.find(c => c.id === selectedSourceChainId.value)
)

const loadSourceChains = async () => {
  try {
    const managerAddr = await getFinalManagerAddress()
    const rpcUrl = await getFinalRpcUrl()
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const managerContract = new ethers.Contract(managerAddr, MANAGER_ABI, provider)

    const num = await managerContract.getSourceChainNum()
    const chains: SourceChain[] = []
    for (let i = 1; i <= Number(num); i++) {
      const info = await managerContract.getSourceChainInfo(i)
      chains.push({
        id: i,
        symbol: info.symbol,
        name: info.name
      })
    }
    sourceChains.value = chains
    if (chains.length > 0 && !selectedSourceChainId.value) {
      selectedSourceChainId.value = chains[0].id
    }
  } catch (error) {
    console.error('加载源链列表失败:', error)
  }
}

const loadTasks = async () => {
  loading.value = true
  tasks.value = []
  try {
    const managerAddr = await getFinalManagerAddress()
    const rpcUrl = await getFinalRpcUrl()
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const managerContract = new ethers.Contract(managerAddr, MANAGER_ABI, provider)
    
    // 获取该源链下绑定的第一个合约（通常是传输合约，levelId=0 在源链上代表 Relay，Hub 上 levelId=1 通常是 Transport）
    // 注意：这里逻辑需要根据实际合约部署约定。假设我们在 Hub 上发起，目标是 Hub 的 Transport。
    const transportAddr = await managerContract.contract_chain_index(0, 1)
    
    if (ethers.utils.isAddress(transportAddr) && transportAddr !== ethers.constants.AddressZero) {
      const transportContract = new ethers.Contract(transportAddr, TRANSPORT_ABI, provider)
      const [typeIds, names, isActiveArray, validators] = await transportContract.getAllRoutes()
      
      tasks.value = typeIds.map((id: any, index: number) => ({
        typeId: Number(id),
        name: names[index] || `Task-${id}`,
        isActive: !!isActiveArray[index],
        validator: validators[index]
      }))
    }
  } catch (error: any) {
    console.error('加载任务失败:', error)
    ElMessage.error('无法同步链上任务类型')
  } finally {
    loading.value = false
  }
}

const handleSourceChange = () => {
  // 目前任务类型是从 Hub 的 Transport 读取的，如果逻辑是不同源链有不同任务，可在此扩展
  loadTasks()
}

const openModal = (task: TaskTypeInfo) => {
  currentTask.value = task
  formData.payload = ''
  formData.fee = '0.01'
  showDialog.value = true
}

const closeModal = () => {
  showDialog.value = false
  currentTask.value = null
}

const calculateTotal = () => {
  const fee = parseFloat(formData.fee) || 0
  return (fee + 0.002).toFixed(4)
}

const handleSubmit = async () => {
  if (!formData.payload.trim()) {
    ElMessage.warning('请输入有效 Payload')
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
    if (!ethers.utils.isAddress(transportAddr)) throw new Error('未找到传输合约')

    const transportContract = new ethers.Contract(transportAddr, TRANSPORT_ABI, signer)
    
    const payloadHex = toHexPayload(formData.payload.trim())
    const value = ethers.utils.parseEther(formData.fee || '0')

    const tx = await transportContract.createTask(
      payloadHex,
      currentTask.value?.name,
      currentTask.value?.typeId,
      { value }
    )

    ElMessage.success('交易已发送，等待确认...')
    await tx.wait()
    ElMessage.success('🚀 跨链任务发起成功！')
    closeModal()
  } catch (error: any) {
    console.error('发送任务失败:', error)
    ElMessage.error(error?.reason || error?.message || '发送失败')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  await loadSourceChains()
  await loadTasks()
})
</script>

<style src="@assets/CrossChain/cross-chain-tasks.scss"></style>

<style lang="scss">
.cross-chain-tasks {
  .task-meta-tag {
    display: inline-block;
    background: #e6f7ff;
    color: #1890ff;
    padding: 4px 12px;
    border-radius: 6px;
    font-weight: 600;
    margin-bottom: 16px;
    font-size: 14px;
    border: 1px solid #91d5ff;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    font-size: 14px;

    .highlight {
      color: #1890ff;
      font-weight: 600;
    }

    .mono {
      font-family: monospace;
      color: #666;
    }
  }

  .input-with-unit {
    position: relative;
    display: flex;
    align-items: center;

    input {
      padding-right: 50px !important;
    }

    .unit {
      position: absolute;
      right: 12px;
      color: #999;
      font-size: 13px;
      font-weight: 600;
    }
  }

  .mini-spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-right: 8px;
    vertical-align: middle;
  }
}
</style>

<!-- 引入外部 SCSS 样式，取消 scoped -->
<style src="@assets/CrossChain/cross-chain-tasks.scss"></style>