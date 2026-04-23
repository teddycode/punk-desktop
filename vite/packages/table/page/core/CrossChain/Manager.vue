<template>
  <div class="cross-chain-tasks">
    <!-- 背景装饰层 -->
    <div class="bg-grid" aria-hidden="true"></div>
    <div class="bg-glow" aria-hidden="true"></div>

    <div class="container">
      <header class="header-section">
        <div class="title-wrap">
          <h1>跨链任务市场</h1>
          <p class="subtitle">仅展示当前可用的跨链任务种类与验证器信息</p>
        </div>

        <div class="header-actions">
          <button class="btn-primary" @click="openRegisterModal">
            新增任务类型
          </button>
          <button class="btn-ghost" @click="openInviteModal">
            邀请委员会成员
          </button>
        </div>
      </header>

      <section class="committee-section">
        <div class="committee-header">
          <div>
            <h2>委员会管理</h2>
            <p>显示当前委员会成员，并支持邀请新成员</p>
          </div>
          <button class="btn-ghost" :disabled="committeeLoading" @click="loadCommitteeMembers">
            {{ committeeLoading ? '刷新中...' : '刷新列表' }}
          </button>
        </div>

        <section v-if="committeeLoading" class="loading-state">
          <div class="spinner" aria-hidden="true"></div>
          <p>正在加载委员会成员...</p>
        </section>

        <div v-else>
          <div v-if="committeeMembers.length === 0" class="committee-empty">
            当前暂无委员会成员数据
          </div>

          <div v-else class="committee-grid">
            <article
              v-for="(member, idx) in committeeMembers"
              :key="member"
              class="committee-card"
            >
              <div class="committee-row">
                <span class="label">序号</span>
                <span class="value mono">#{{ idx + 1 }}</span>
              </div>
              <div class="committee-row">
                <span class="label">成员地址</span>
                <span class="value mono" :title="member">{{ shortenAddress(member) }}</span>
              </div>
              <div class="committee-row">
                <span class="label">角色</span>
                <span class="value">
                  <span
                    class="status-badge"
                    :class="isOperator(member) ? 'active' : 'neutral'"
                  >
                    {{ isOperator(member) ? '当前操作者' : '委员会成员' }}
                  </span>
                </span>
              </div>
            </article>
          </div>
        </div>
      </section>

      <!-- 加载状态 -->
      <section v-if="loading" class="loading-state">
        <div class="spinner" aria-hidden="true"></div>
        <p>正在加载任务类型...</p>
      </section>

      <!-- 列表 -->
      <section v-else class="task-grid">
        <article
          v-for="task in tasks"
          :key="task.typeId"
          class="task-card"
          :class="{ disabled: !task.isActive }"
        >
          <div class="task-header">
            <h3 class="task-name">{{ task.name }}</h3>
            <span
              class="status-badge"
              :class="task.isActive ? 'active' : 'inactive'"
            >
              {{ task.isActive ? '可用' : '禁用' }}
            </span>
          </div>

          <div class="task-body">
            <div class="row">
              <span class="label">类型 ID</span>
              <span class="value mono">#{{ task.typeId }}</span>
            </div>

            <div class="row">
              <span class="label">验证器</span>
              <span class="value mono" :title="task.validator">
                {{ formatAddress(task.validator) }}
              </span>
            </div>
          </div>

          <!-- 不再需要“发起任务”按钮：这里仅展示状态提示 -->
          <div class="task-foot">
            <span class="foot-hint">
              {{ task.isActive ? '该类型可用于发起跨链请求（本页仅展示）' : '该类型已禁用' }}
            </span>
          </div>
        </article>
      </section>
    </div>

    <!-- Manager：注册新任务类型弹窗 -->
    <div
      v-if="showRegisterDialog"
      class="modal-overlay manager"
      @click.self="closeRegisterModal"
    >
      <div class="modal-content manager">
        <button class="close-btn" @click="closeRegisterModal" aria-label="关闭">
          ✕
        </button>

        <div class="modal-title">
          <h2>注册新任务类型</h2>
          <p class="desc">仅管理员可操作：写入任务类型、验证器与启用状态</p>
        </div>

        <div class="form">
          <div class="form-group">
            <label>任务名称</label>
            <input v-model="registerForm.name" placeholder="例如：跨链转账 / 数据证明" />
          </div>

          <div class="form-group">
            <label>类型 ID（正整数）</label>
            <input v-model="registerForm.typeId" inputmode="numeric" placeholder="例如：1" />
          </div>

          <div class="form-group">
            <label>验证器地址</label>
            <input v-model="registerForm.validator" placeholder="0x..." />
          </div>

          <div class="form-group">
            <label>是否启用</label>
            <select v-model="registerForm.isActive">
              <option :value="true">启用</option>
              <option :value="false">禁用</option>
            </select>
          </div>
        </div>

        <div class="button-group">
          <button class="btn-ghost" @click="closeRegisterModal">取消</button>
          <button
            class="btn-primary"
            :disabled="registering"
            @click="handleRegisterSubmit"
          >
            {{ registering ? '注册中...' : '确认注册' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Manager：邀请委员会成员弹窗 -->
    <div
      v-if="showInviteDialog"
      class="modal-overlay manager"
      @click.self="closeInviteModal"
    >
      <div class="modal-content manager">
        <button class="close-btn" @click="closeInviteModal" aria-label="关闭">
          ✕
        </button>

        <div class="modal-title">
          <h2>邀请委员会成员</h2>
          <p class="desc">至少一名当前委员会成员发起邀请，被邀请方需自行链上确认加入</p>
        </div>

        <div class="form">
          <div class="form-group">
            <label>被邀请地址</label>
            <input
              v-model="inviteForm.member"
              placeholder="0x..."
            />
          </div>
        </div>

        <div class="button-group">
          <button class="btn-ghost" @click="closeInviteModal">取消</button>
          <button
            class="btn-primary"
            :disabled="invitingCommitteeMember"
            @click="handleInviteSubmit"
          >
            {{ invitingCommitteeMember ? '邀请中...' : '确认邀请' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { ethers } from 'ethers'
import { useTaskContract, formatAddress, getFinalManagerAddress, getSigner, ensureNetwork } from '../../../services/crosschain'

const MANAGER_ABI = [
  'function getCommitteeMembers() external view returns (address[])',
  'function inviteCommitteeMember(address _member) external'
]

// 仅需要加载任务类型列表
const { 
  loading, 
  tasks, 
  loadTasks, 
  submitRegisterTaskType, 
  registering 
} = useTaskContract()
// Manager：注册任务类型
const showRegisterDialog = ref(false)
const registerForm = reactive({
  name: '',
  typeId: '',
  validator: '',
  isActive: true
})
const showInviteDialog = ref(false)
const invitingCommitteeMember = ref(false)
const committeeLoading = ref(false)
const committeeMembers = ref<string[]>([])
const operatorAddress = ref<string>('')
const inviteForm = reactive({
  member: ''
})

const shortenAddress = (address: string) => formatAddress(address)
const isOperator = (address: string) =>
  String(address || '').toLowerCase() === String(operatorAddress.value || '').toLowerCase()

const openRegisterModal = () => {
  registerForm.name = ''
  registerForm.typeId = ''
  registerForm.validator = ''
  registerForm.isActive = true
  showRegisterDialog.value = true
}

const closeRegisterModal = () => {
  showRegisterDialog.value = false
}

const openInviteModal = () => {
  inviteForm.member = ''
  showInviteDialog.value = true
}

const closeInviteModal = () => {
  showInviteDialog.value = false
}

const loadCommitteeMembers = async () => {
  committeeLoading.value = true
  try {
    const managerAddr = await getFinalManagerAddress()
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:30305')
    const managerContract = new ethers.Contract(managerAddr, MANAGER_ABI, provider)

    const members = await managerContract.getCommitteeMembers()

    committeeMembers.value = (Array.isArray(members) ? members : [])
      .map((addr: unknown) => String(addr || '').trim())
      .filter((addr: string) => ethers.isAddress(addr))
      .map((addr: string) => ethers.getAddress(addr))

    try {
      const signer = await getSigner()
      const address = await signer.getAddress()
      operatorAddress.value = ethers.isAddress(address) ? ethers.getAddress(address) : ''
    } catch (e) {
      console.warn('获取当前钱包地址失败:', e)
      operatorAddress.value = ''
    }
  } catch (error: any) {
    console.error('加载委员会成员失败:', error)
    ElMessage.error(error?.message || '加载委员会成员失败')
  } finally {
    committeeLoading.value = false
  }
}

const handleInviteSubmit = async () => {
  const memberInput = String(inviteForm.member || '').trim()
  if (!ethers.isAddress(memberInput)) {
    ElMessage.warning('请输入有效的钱包地址')
    return
  }

  invitingCommitteeMember.value = true
  try {
    await ensureNetwork()
    const signer = await getSigner()
    const managerAddr = await getFinalManagerAddress()
    const managerContract = new ethers.Contract(managerAddr, MANAGER_ABI, signer)
    
    const normalizedMember = ethers.getAddress(memberInput)
    
    // 发送交易
    const tx = await managerContract.inviteCommitteeMember(normalizedMember)
    
    ElMessage.success(`邀请已提交，交易: ${tx.hash.slice(0, 10)}...${tx.hash.slice(-8)}`)
    closeInviteModal()
    
    await tx.wait()
    await loadCommitteeMembers()
  } catch (error: any) {
    console.error('邀请委员会成员失败:', error)
    if (error?.code === 'ACTION_REJECTED' || error?.code === 4001) {
      ElMessage.warning('用户取消了交易')
    } else {
      ElMessage.error(error?.shortMessage || error?.message || '邀请委员会成员失败')
    }
  } finally {
    invitingCommitteeMember.value = false
  }
}

const handleRegisterSubmit = async () => {
  if (
    !registerForm.name.trim() ||
    !registerForm.typeId.trim() ||
    !registerForm.validator.trim()
  ) {
    ElMessage.warning('请填写完整的任务类型信息')
    return
  }

  const typeIdNum = Number(registerForm.typeId)
  if (!Number.isInteger(typeIdNum) || typeIdNum <= 0) {
    ElMessage.warning('类型 ID 需为正整数')
    return
  }

  try {
    await submitRegisterTaskType({
      typeId: typeIdNum,
      name: registerForm.name.trim(),
      isActive: registerForm.isActive,
      verifier: registerForm.validator.trim()
    })

    closeRegisterModal()
  } catch (error: any) {
    console.error(error)
    // 这里通常不需要再弹一次错误，因为 useTaskContract 里已经弹过了
  }
}

onMounted(() => {
  loadTasks()
  loadCommitteeMembers()
})
</script>
<!-- 引入外部 SCSS 样式，取消 scoped -->
<style src="@assets/CrossChain/manager.scss"></style>
