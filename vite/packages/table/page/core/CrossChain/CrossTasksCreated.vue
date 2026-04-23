<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElLoading, ElDialog } from 'element-plus'
import { finishTask } from '../../../services/crosschain'

const tasks = ref([])
const loading = ref(false)
const errorMsg = ref('')

// --- 提交证明弹窗相关状态 ---
const submitDialogVisible = ref(false)
const currentTaskKey = ref('')
const destTxHash = ref('')
const destRpcUrl = ref('https://rpc.sepolia.org')
const submitting = ref(false)

// --- 🔥 新增：注册弹窗相关状态 ---
const registerDialogVisible = ref(false)
const relayerAddress = ref('')
const registering = ref(false)

// 获取任务列表
const fetchTasks = async () => {
  loading.value = true
  errorMsg.value = ''
  tasks.value = []
  
  try {
    const response = await fetch('http://localhost:3020/api/tasks')
    const data = await response.json()
    
    if (data.error) {
      errorMsg.value = data.error
    } else {
      // 确保 label 是数字
      tasks.value = data.map(task => ({
        ...task,
        label: Number(task.label)
      }))
    }
  } catch (e) {
    errorMsg.value = "无法连接到后端 API"
    console.error(e)
  } finally {
    loading.value = false
  }
}

// --- 🔥 新增：打开注册弹窗 ---
const openRegisterDialog = () => {
  relayerAddress.value = '' // 清空之前的输入
  registerDialogVisible.value = true
}

// --- 🔥 新增：确认注册逻辑 ---
const confirmRegister = async () => {
  // 1. 简单校验
  const addr = relayerAddress.value.trim()
  if (!addr) {
    ElMessage.warning('请输入中继者地址')
    return
  }
  // 简单的以太坊地址格式校验
  if (!addr.startsWith('0x') || addr.length !== 42) {
    ElMessage.warning('请输入有效的以太坊地址 (0x开头, 42位)')
    return
  }

  registering.value = true
  
  const loadingInstance = ElLoading.service({
    lock: true,
    text: '正在注册中继者身份，请稍候...',
    background: 'rgba(0, 0, 0, 0.7)',
  })

  try {
    // 🔥 TODO: 这里调用真实的合约服务
    // 例如: const tx = await registerRelayer(addr)
    
    // 模拟网络请求延迟
    await new Promise(resolve => setTimeout(resolve, 1500))

    ElMessage.success(`注册成功！地址: ${addr.substring(0, 6)}...${addr.substring(38)}`)
    registerDialogVisible.value = false // 关闭弹窗
    
  } catch (e) {
    console.error(e)
    ElMessage.error('注册失败: ' + e.message)
  } finally {
    registering.value = false
    loadingInstance.close()
  }
}

// 接单逻辑
const handleAccept = async (taskKey) => {
  const loadingInstance = ElLoading.service({
    lock: true,
    text: '正在链上提交接单交易，请稍候...',
    background: 'rgba(0, 0, 0, 0.7)',
  })

  try {
    const response = await fetch('http://localhost:3020/api/accept_task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_key: taskKey })
    })
    
    const result = await response.json()

    if (result.success) {
      ElMessage.success(`接单成功！交易哈希: ${result.tx_hash.substring(0, 10)}...`)
      setTimeout(() => fetchTasks(), 2000)
    } else {
      throw new Error(result.error || '未知错误')
    }

  } catch (e) {
    console.error(e)
    ElMessage.error(`接单失败: ${e.message}`)
  } finally {
    loadingInstance.close()
  }
}

// 打开提交证明弹窗
const openSubmitDialog = (taskKey) => {
  currentTaskKey.value = taskKey
  destTxHash.value = ''
  submitDialogVisible.value = true
}

// 提交完成证明逻辑
const handleSubmitProof = async () => {
  if (!destTxHash.value.trim()) {
    ElMessage.warning('请输入目标链交易 Hash')
    return
  }
  if (!destRpcUrl.value.trim()) {
    ElMessage.warning('请输入目标链 RPC 地址')
    return
  }

  let txHash = destTxHash.value.trim()
  if (!txHash.startsWith('0x')) {
    txHash = '0x' + txHash
  }

  submitting.value = true
  const loadingInstance = ElLoading.service({
    lock: true,
    text: '正在验证并提交完成证明...',
    background: 'rgba(0, 0, 0, 0.7)',
  })

  try {
    const resultTxHash = await finishTask(
      currentTaskKey.value,
      txHash,
      destRpcUrl.value
    )
    
    ElMessage.success(`🎉 任务完成！交易: ${resultTxHash.substring(0, 10)}...`)
    submitDialogVisible.value = false
    setTimeout(() => fetchTasks(), 2000)
    
  } catch (e) {
    console.error('提交失败:', e)
    ElMessage.error(`提交失败: ${e.message}`)
  } finally {
    submitting.value = false
    loadingInstance.close()
  }
}

// 辅助函数
const formatPayload = (hex) => {
  if (!hex) return ''
  if (hex.length < 30) return hex
  return `${hex.substring(0, 20)}...${hex.substring(hex.length - 6)}`
}

const copyToClipboard = (text) => {
  if (!text) return
  navigator.clipboard.writeText(text)
  ElMessage.info('已复制')
}

const getStatusLabel = (labelCode) => {
  const map = { 0: 'Default', 1: 'Created', 2: 'Accepted', 3: 'Finished' }
  return map[labelCode] || 'Unknown'
}

onMounted(() => {
  fetchTasks()
})
</script>

<template>
  <!-- 添加唯一前缀类名 .cross-tasks-created -->
  <div class="cross-tasks-created">
    <header>
      <h1>⛓️ 链上任务监控</h1>
      
      <!-- 顶部按钮组 -->
      <div class="header-actions">
        <!-- 🔥 注册按钮 -->
        <button class="register-btn" @click="openRegisterDialog">
          📝 注册成为中继者
        </button>
        
        <!-- 刷新按钮 -->
        <button @click="fetchTasks" :disabled="loading" class="refresh-btn">
          {{ loading ? '扫描中...' : '🔄 刷新列表' }}
        </button>
      </div>
    </header>

    <div v-if="errorMsg" class="error-box">{{ errorMsg }}</div>

    <div v-if="tasks.length > 0" class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Index</th>
            <th>Task Key</th>
            <th>User</th>
            <th>Fee</th>
            <th>Payload</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="task in tasks" :key="task.task_key">
            <td>#{{ task.index }}</td>
            <td class="mono clickable" @click="copyToClipboard(task.task_key)" title="点击复制">
              {{ task.task_key.substring(0, 8) }}...
            </td>
            <td class="mono">
              {{ task.user ? (task.user.substring(0, 6) + '...') : 'Unknown' }}
            </td>
            <td class="highlight">{{ task.fee_eth }} ETH</td>
            <td class="mono payload-cell">{{ formatPayload(task.payload) }}</td>
            
            <td>
              <span :class="['status-badge', 'status-' + task.label]">
                {{ getStatusLabel(task.label) }}
              </span>
            </td>

            <td>
              <button 
                v-if="task.label === 1" 
                class="accept-btn" 
                @click="handleAccept(task.task_key)"
              >
                ⚡ 接单
              </button>
              
              <button 
                v-else-if="task.label === 2" 
                class="submit-btn" 
                @click="openSubmitDialog(task.task_key)"
              >
                📤 提交
              </button>
              
              <span v-else-if="task.label === 3" class="finished-text">✅ 已完成</span>
              
              <span v-else class="text-gray">--</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="!loading && !errorMsg" class="empty-state">
      <p>📭 暂无任务数据</p>
    </div>

    <!-- ========== 🔥 新增：注册中继者弹窗 ========== -->
    <el-dialog
      v-model="registerDialogVisible"
      title="📝 注册中继者"
      width="450px"
      :close-on-click-modal="false"
      class="cross-tasks-created-dialog"
    >
      <div class="dialog-content">
        <p class="intro-text">
          请输入您的钱包地址以注册成为网络中继者。注册成功后，您将有权限接取任务。
        </p>
        
        <div class="form-item">
          <label>中继者地址 (Address) <span class="required">*</span></label>
          <input 
            v-model="relayerAddress" 
            type="text" 
            placeholder="0x..."
            class="hash-input"
            :disabled="registering"
          />
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <button 
            class="cancel-btn" 
            @click="registerDialogVisible = false"
            :disabled="registering"
          >
            取消
          </button>
          <button 
            class="confirm-btn register-confirm" 
            @click="confirmRegister"
            :disabled="registering || !relayerAddress"
          >
            {{ registering ? '注册中...' : '✅ 确认注册' }}
          </button>
        </div>
      </template>
    </el-dialog>

    <!-- ========== 原有：提交证明弹窗 ========== -->
    <el-dialog
      v-model="submitDialogVisible"
      title="📤 提交完成证明"
      width="520px"
      :close-on-click-modal="false"
      class="cross-tasks-created-dialog"
    >
      <div class="dialog-content">
        <div class="form-item">
          <label>任务 Key:</label>
          <div class="task-key-display">{{ currentTaskKey }}</div>
        </div>
        
        <div class="form-item">
          <label>目标链 RPC 地址 <span class="required">*</span></label>
          <input 
            v-model="destRpcUrl" 
            type="text" 
            placeholder="例如: https://rpc.sepolia.org"
            class="hash-input"
            :disabled="submitting"
          />
          <p class="hint">用于获取目标链上的交易数据</p>
        </div>
        
        <div class="form-item">
          <label>目标链交易 Hash <span class="required">*</span></label>
          <input 
            v-model="destTxHash" 
            type="text" 
            placeholder="0x..."
            class="hash-input"
            :disabled="submitting"
          />
          <p class="hint">您在目标链上执行任务后产生的交易哈希</p>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <button 
            class="cancel-btn" 
            @click="submitDialogVisible = false"
            :disabled="submitting"
          >
            取消
          </button>
          <button 
            class="confirm-btn" 
            @click="handleSubmitProof"
            :disabled="submitting || !destTxHash.trim() || !destRpcUrl.trim()"
          >
            {{ submitting ? '提交中...' : '🚀 确认提交' }}
          </button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<!-- 引入外部 SCSS 样式，取消 scoped -->
<style src="@assets/CrossChain/cross-tasks-created.scss"></style>