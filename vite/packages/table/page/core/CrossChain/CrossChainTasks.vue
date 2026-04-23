<template>
  <!-- 添加唯一前缀类名 .cross-chain-tasks，对应 SCSS 前缀 -->
  <div class="cross-chain-tasks">
    <div class="header-section">
      <h1>🌐 跨链任务市场</h1>
      <p class="subtitle">选择任务类型，发起跨链请求</p>
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
          <label>🔗 源链 ID</label>
          <input 
            v-model="formData.srcChainId"
            type="number"
            placeholder="例如: 1"/>
        </div>

        <div class="form-group">
          <label>🔗 目标链 ID</label>
          <input 
            v-model="formData.destChainId"
            type="number"
            placeholder="例如: 2"/>
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
  type TaskTypeInfo
} from '../../../services/crosschain'

// 使用组合式函数
const { loading, submitting, tasks, loadTasks, submitTask } = useTaskContract()

// 弹窗状态
const showDialog = ref(false)
const currentTask = ref<TaskTypeInfo | null>(null)

// 表单数据
const formData = reactive({
  srcChainId: 1,
  destChainId: 2,
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
  formData.srcChainId = 1
  formData.destChainId = 2
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
      srcChainId: Number(formData.srcChainId) || 0,
      destChainId: Number(formData.destChainId) || 0,
      payload: formData.payload,
      taskType: currentTask.value.typeId,
      routeName: currentTask.value.name,  // ← 传入 routeName
      fee: formData.fee
    })
    
    // ✅ 修复：添加换行
    closeModal()
  } catch (error) {
    console.error('提交失败:', error)
  }
}

// 生命周期
onMounted(() => {
  console.log('🟢 组件已挂载')
  loadTasks()
})
</script>

<!-- 引入外部 SCSS 样式，取消 scoped -->
<style src="@assets/CrossChain/cross-tasks-created.scss"></style>