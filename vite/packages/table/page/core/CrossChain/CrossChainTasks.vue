<template>
  <!-- 添加唯一前缀类名 .cross-chain-tasks，对应 SCSS 前缀 -->
  <div class="cross-chain-tasks">
    <div class="header-section">
      <h1>🌐 跨链任务市场</h1>
      <p class="subtitle">选择任务类型，发起跨链请求</p>
      <!-- ← 新增：调试按钮 -->
      <button @click="handleDebug" style="margin-top: 10px; padding: 8px 16px; background: #ff9800; color: white; border: none; border-radius: 4px; cursor: pointer;">
        🔧 调试加载
      </button>
    </div>

    <!-- 加载状态（添加类名） -->
    <div v-if="loading" class="loading-state">
      <p>正在加载...</p>
    </div>

    <!-- 任务列表 -->
    <div v-else class="task-grid">
      <div 
        v-for="task in tasks" 
        :key="task.typeId"
        class="task-card"
      >
        <div class="task-header">
          <h3>{{ task.name }}</h3>
          <span :class="['status-badge', task.isActive ? 'active' : 'inactive']">
            {{ task.isActive ? '可用' : '禁用' }}
          </span>
        </div>
        
        <div class="task-body">
          <p><strong>类型 ID:</strong> {{ task.typeId }}</p>
          <p><strong>验证器:</strong> {{ formatAddress(task.validator) }}</p>
        </div>

        <button 
          @click="openModal(task)"
          :disabled="!task.isActive"
          class="action-button"
        >
          {{ task.isActive ? '立即发起任务' : '暂不可用' }}
        </button>
      </div>
    </div>

    <!-- 弹窗遮罩 -->
    <div 
      v-if="showDialog" 
      class="modal-overlay"
      @click.self="closeModal"
    >
      <div class="modal-content">
        <!-- 关闭按钮 -->
        <button class="close-btn" @click="closeModal">✕</button>
        
        <h2>🚀 发起任务: {{ currentTask?.name }}</h2>
        
        <!-- 任务信息 -->
        <div class="info-box">
          <p><strong>类型 ID:</strong> {{ currentTask?.typeId }}</p>
          <!-- <p><strong>验证器:</strong> {{ formatAddress(currentTask?.validator || '') }}</p> -->
          <p><strong>验证器:</strong> {{ currentTask?.validator || '' }}</p>
        </div>

        <!-- 表单 -->
        <div class="form-group">
          <label>⛓️ 源链 ID</label>
          <input 
            v-model="formData.srcChainId"
            type="text"
            placeholder="例如: 11155111"
          />
        </div>

        <div class="form-group">
          <label>🎯 目标链 ID</label>
          <input 
            v-model="formData.destChainId"
            type="text"
            placeholder="例如: 1"
          />
        </div>

        <div class="form-group">
          <label>📝 任务 Payload</label>
          <textarea 
            v-model="formData.payload"
            placeholder="输入要跨链传输的数据 (例如: 0x1234...)"
            rows="4"
          ></textarea>
          <p class="hint">💡 如果输入普通文本，系统会自动转换为 Hex 格式</p>
        </div>

        <div class="form-group">
          <label>💰 跨链费用 (ETH)</label>
          <input 
            v-model="formData.fee"
            type="text"
            placeholder="例如: 0.01"/>
          <p class="hint warning">⚠️ 建议费用高于 0.005 ETH</p>
        </div>

        <!-- 费用预估 -->
        <div class="fee-estimate">
          <div class="fee-row">
            <span>预估 Gas 费用:</span>
            <span class="fee-value">~0.002 ETH</span>
          </div>
          <div class="fee-row">
            <span>跨链服务费:</span>
            <span class="fee-value">{{ formData.fee }} ETH</span>
          </div><hr>
          <div class="fee-row total">
            <span>总计:</span>
            <span class="fee-value">~{{ calculateTotal() }} ETH</span>
          </div>
        </div>

        <!-- 按钮组 -->
        <div class="button-group">
          <button class="btn-cancel" @click="closeModal">取消</button>
          <button 
            class="btn-submit" 
            @click="handleSubmit"
            :disabled="submitting"
          >
            {{ submitting ? '提交中...' : '确认并发起' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

import {
  useTaskContract,
  formatAddress,
  debugLoadTaskTypes,
  type TaskTypeInfo
} from '../../../services/crosschain'  // 路径改为你的实际路径

// 使用组合式函数
const { loading, submitting, tasks, loadTasks, submitTask } = useTaskContract()

// 弹窗状态
const showDialog = ref(false)
const currentTask = ref<TaskTypeInfo | null>(null)

// 表单数据
const formData = reactive({
  srcChainId: '',
  destChainId: '',
  payload: '',
  fee: '0.01'
})

// 打开弹窗
const openModal = (task: TaskTypeInfo) => {
  console.log('🔵 打开弹窗，任务:', task)
  if (!task.isActive) {
    ElMessage.warning('该任务类型暂不可用')
    return
  }
  
  currentTask.value = task
  formData.srcChainId = ''
  formData.destChainId = ''
  formData.payload = ''
  formData.fee = '0.01'
  showDialog.value = true
  
  console.log('🟢 弹窗状态:', showDialog.value)
}

// 关闭弹窗
const closeModal = () => {
  showDialog.value = false
  currentTask.value = null
}

// 计算总费用
const calculateTotal = () => {
  const fee = parseFloat(formData.fee) || 0
  return (fee + 0.002).toFixed(4)
}

// 提交任务
const handleSubmit = async () => {
  if (!formData.srcChainId) {
    ElMessage.warning('请输入源链 ID')
    return
  }
  if (!formData.destChainId) {
    ElMessage.warning('请输入目标链 ID')
    return
  }
  if (!formData.payload) {
    ElMessage.warning('请输入 Payload 数据')
    return
  }

  if (!currentTask.value) {
    ElMessage.error('任务信息丢失')
    return
  }

  try {
    await submitTask({
      srcChainId: Number(formData.srcChainId),
      destChainId: Number(formData.destChainId),
      payload: formData.payload,
      taskType: currentTask.value.typeId,
      routeName: currentTask.value.name,
      fee: formData.fee
    })
    
    closeModal()
  } catch (error) {
    console.error('提交失败:', error)
  }
}
// ← 新增：调试函数
const handleDebug = async () => {
  console.log('🔍 开始调试...')
  try {
    const result = await debugLoadTaskTypes()
    console.log('✅ 调试结果:', result)
    ElMessage.success('调试完成，请查看控制台日志')
  } catch (error: any) {
    console.error('❌ 调试失败:', error)
    ElMessage.error('调试失败: ' + error.message)
  }
}

// 生命周期
onMounted(() => {
  console.log('🟢 组件已挂载')
  loadTasks()
})
</script>

<!-- 引入外部 SCSS 样式，取消 scoped -->
<style src="@assets/CrossChain/cross-chain-tasks.scss"></style>