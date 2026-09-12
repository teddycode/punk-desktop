<template>
  <div class="cross-chain-tasks">
    <!-- 背景装饰层 -->
    <div class="bg-grid" aria-hidden="true"></div>
    <div class="bg-glow" aria-hidden="true"></div>

    <div class="container">
      <header class="header-section">
        <div class="title-wrap">
          <h1>跨链管理中心</h1>
          <p class="subtitle">管理委员会成员、源链配置与跨链任务类型</p>
        </div>

        <div class="header-actions">
          <button class="btn-ghost" @click="openSourceChainModal">
            注册源链
          </button>
          <button class="btn-primary" @click="openRegisterModal">
            新增任务类型
          </button>
          <button class="btn-ghost" @click="openInviteModal">
            邀请委员会成员
          </button>
        </div>
      </header>

      <!-- 个人状态栏：显示是否有待处理的邀请 -->
      <section v-if="pendingInvitation.pending" class="invitation-alert">
        <div class="alert-content">
          <span class="icon">✉️</span>
          <p>您收到来自 <span class="mono">{{ shortenAddress(pendingInvitation.inviter) }}</span> 的委员会加入邀请</p>
        </div>
        <div class="alert-actions">
          <button class="btn-primary btn-sm" :disabled="accepting || sendingInvitationTransaction" @click="handleAcceptInvitation">
            {{ accepting ? '加入中...' : '接受邀请' }}
          </button>
          <button class="btn-ghost btn-sm" :disabled="accepting || sendingInvitationTransaction" @click="handleSendInvitationTransaction">
            {{ sendingInvitationTransaction ? '发送中...' : '发送交易' }}
          </button>
        </div>
      </section>

      <section class="committee-section">
        <div class="committee-header">
          <div>
            <h2>委员会管理</h2>
            <p>管理委员会成员及其权限状态</p>
          </div>
          <button class="btn-ghost" :disabled="committeeLoading" @click="loadCommitteeData">
            {{ committeeLoading ? '刷新中...' : '刷新列表' }}
          </button>
        </div>

        <section v-if="committeeLoading" class="loading-state">
          <div class="spinner" aria-hidden="true"></div>
          <p>正在加载委员会数据...</p>
        </section>

        <div v-else>
          <div v-if="committeeMembers.length === 0" class="committee-empty">
            当前暂无委员会成员数据
          </div>

          <div v-else class="committee-grid">
            <article
              v-for="(member, idx) in committeeMembers"
              :key="member.address"
              class="committee-card"
            >
              <div class="committee-row">
                <span class="label">成员地址</span>
                <span class="value mono" :title="member.address">{{ shortenAddress(member.address) }}</span>
              </div>
              <div class="committee-row">
                <span class="label">角色状态</span>
                <span class="value">
                  <span
                    class="status-badge"
                    :class="isOperator(member.address) ? 'active' : 'neutral'"
                  >
                    {{ isOperator(member.address) ? '当前操作者' : '委员会成员' }}
                  </span>
                </span>
              </div>
              <div class="committee-row">
                <span class="label">移除进度</span>
                <span class="value">{{ member.removalCount }} / {{ member.removalRequired }}</span>
              </div>
              <div class="committee-foot">
                <button 
                  v-if="!isOperator(member.address)"
                  class="btn-danger-outline btn-block" 
                  :disabled="removingMember === member.address"
                  @click="handleRemoveMember(member.address)"
                >
                  {{ member.hasApproved ? '已投票移除' : '投票移除' }}
                </button>
                <span v-else class="self-label">本人</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      <!-- 任务类型列表 -->
      <section class="task-section">
        <div class="section-header">
          <div>
            <h2>跨链任务类型 (Routes)</h2>
            <p>已在传输合约中注册的跨链任务种类</p>
          </div>
        </div>

        <section v-if="loading" class="loading-state">
          <div class="spinner" aria-hidden="true"></div>
          <p>正在加载任务类型...</p>
        </section>

        <div v-else class="task-grid">
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
          </article>
        </div>
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
          <p class="desc">在传输合约中配置新的任务路由与验证逻辑</p>
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
            <label>验证器地址 (空则使用默认验证)</label>
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

    <!-- Manager：注册源链弹窗 -->
    <div
      v-if="showSourceChainDialog"
      class="modal-overlay manager"
      @click.self="closeSourceChainModal"
    >
      <div class="modal-content manager">
        <button class="close-btn" @click="closeSourceChainModal" aria-label="关闭">
          ✕
        </button>

        <div class="modal-title">
          <h2>注册源链</h2>
          <p class="desc">向管理合约添加新的源链信息，以便系统识别</p>
        </div>

        <div class="form">
          <div class="form-group">
            <label>链名称</label>
            <input v-model="sourceChainForm.name" placeholder="例如：Ethereum Mainnet" />
          </div>

          <div class="form-group">
            <label>链符号 (Symbol)</label>
            <input v-model="sourceChainForm.symbol" placeholder="例如：ETH" />
          </div>
        </div>

        <div class="button-group">
          <button class="btn-ghost" @click="closeSourceChainModal">取消</button>
          <button
            class="btn-primary"
            :disabled="registeringSourceChain"
            @click="handleSourceChainSubmit"
          >
            {{ registeringSourceChain ? '注册中...' : '确认注册' }}
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
          <p class="desc">被邀请方需自行链上确认加入</p>
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
import { ref, reactive, onMounted, watch } from 'vue'
import { browserWallet } from '../../../services/browserWallet'
import { ElMessage } from 'element-plus'
import { ethers } from 'ethers'
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@punkos/ethers5/vue'
import {
  formatAddress, 
  getFinalManagerAddress, 
  getFinalRpcUrl, 
  getSigner,
  getCurrentWalletAddress,
  getAllTaskTypes,
  setCrosschainWalletContext,
  TaskTypeInfo
} from '../../../services/crosschain'
const MANAGER_ABI = [
  'function getCommitteeMembers() external view returns (address[])',
  'function inviteCommitteeMember(address _member) external',
  'function acceptCommitteeInvitation() external',
  'function getCommitteeInvitation(address _member) external view returns (bool pending, address inviter)',
  'function approveCommitteeMemberRemoval(address _member) public',
  'function getCommitteeRemovalApproval(address _member) external view returns (uint256 count, uint256 required)',
  'function hasApprovedCommitteeRemoval(address _member, address _approver) external view returns (bool approved)',
  'function addNewSourceChain(string _symbol, string _name) external',
  'function operateSystemContract(address _address, bytes payload) external',
  'function contract_chain_index(uint256 _chainId, uint256 _levelId) external view returns (address)'
]

const TRANSPORT_ABI = [
  'function getAllRoutes() external view returns (uint256[] memory typeIds, string[] memory names, bool[] memory isActive, address[] memory validators)',
  'function setCrossChainRoute(uint256 _routeId, string _name, bool _isActive, address _verifier) external'
]

interface CommitteeMemberInfo {
  address: string
  removalCount: number
  removalRequired: number
  hasApproved: boolean
}

// 任务类型数据
const loading = ref(false)
const tasks = ref<TaskTypeInfo[]>([])
const registering = ref(false)

// 委员会数据
const committeeLoading = ref(false)
const committeeMembers = ref<CommitteeMemberInfo[]>([])
const operatorAddress = ref<string>('')
const pendingInvitation = reactive({
  pending: false,
  inviter: ''
})
const accepting = ref(false)
const sendingInvitationTransaction = ref(false)
const removingMember = ref('')

const TX_CONFIRM_TIMEOUT_MS = 120000
const TX_POLL_INTERVAL_MS = 2000
const REQUEST_TIMEOUT_MS = 30000
const WALLET_ACTION_TIMEOUT_MS = 120000

// 弹窗与表单
const showRegisterDialog = ref(false)
const registerForm = reactive({
  name: '',
  typeId: '',
  validator: '',
  isActive: true
})

const showInviteDialog = ref(false)
const invitingCommitteeMember = ref(false)
const inviteForm = reactive({
  member: ''
})

const showSourceChainDialog = ref(false)
const registeringSourceChain = ref(false)
const sourceChainForm = reactive({
  name: '',
  symbol: ''
})
const web3Account = useWeb3ModalAccount()
const web3Provider = useWeb3ModalProvider()
setCrosschainWalletContext({
  walletProviderRef: web3Provider,
  walletAccountRef: web3Account
})

const shortenAddress = (address: string) => formatAddress(address)
const isOperator = (address: string) =>
  String(address || '').toLowerCase() === String(operatorAddress.value || '').toLowerCase()

const extractErrorMessage = (error: any): string => {
  return (
    error?.reason ||
    error?.data?.message ||
    error?.error?.message ||
    error?.message ||
    '操作失败'
  )
}

const waitForTransactionReceipt = async (
  provider: ethers.providers.JsonRpcProvider,
  txHash: string,
  timeoutMs = TX_CONFIRM_TIMEOUT_MS,
  pollIntervalMs = TX_POLL_INTERVAL_MS
) => {
  const startedAt = Date.now()
  let pollCount = 0

  console.info('[CrossChain][Manager] 开始轮询交易确认:', {
    txHash,
    timeoutMs,
    pollIntervalMs,
    startedAt: new Date(startedAt).toISOString()
  })

  while (Date.now() - startedAt < timeoutMs) {
    pollCount += 1
    const receipt = await provider.getTransactionReceipt(txHash)
    if (receipt) {
      console.info('[CrossChain][Manager] 已获取到交易回执:', {
        txHash,
        pollCount,
        elapsedMs: Date.now() - startedAt,
        status: receipt.status,
        blockNumber: receipt.blockNumber
      })
      return receipt
    }

    if (pollCount === 1 || pollCount % 5 === 0) {
      console.info('[CrossChain][Manager] 等待交易确认中:', {
        txHash,
        pollCount,
        elapsedMs: Date.now() - startedAt
      })
    }

    await new Promise(resolve => setTimeout(resolve, pollIntervalMs))
  }

  const timeoutMessage = `交易已发送，但在 ${Math.round(timeoutMs / 1000)} 秒内未等到链上确认，请稍后刷新重试。`
  console.error('[CrossChain][Manager] 交易确认超时:', {
    txHash,
    pollCount,
    elapsedMs: Date.now() - startedAt,
    timeoutMs
  })
  throw new Error(timeoutMessage)
}

const withTimeout = async <T,>(
  promise: Promise<T>,
  timeoutMs: number,
  message: string
): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), timeoutMs)
      })
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

const parseWalletTxHash = (result: unknown): string => {
  if (typeof result === 'string' && result.startsWith('0x')) {
    return result
  }
  if (result && typeof result === 'object') {
    const hash = (result as { hash?: unknown }).hash
    if (typeof hash === 'string' && hash.startsWith('0x')) {
      return hash
    }
  }
  return ''
}

const getManagerWalletContext = async () => {
  const signer = await getSigner()
  const signerAddress = await signer.getAddress()
  return {
    signer,
    signerAddress
  }
}

const sendAndConfirmWithConnectedWallet = async (
  options: {
    contractAddress: string
    abi: string[]
    method: string
    params?: any[]
    provider: ethers.providers.JsonRpcProvider
    submittedMessage: string
  }
) => {
  const { signer, signerAddress } = await getManagerWalletContext()
  const contract = new ethers.Contract(options.contractAddress, options.abi, signer)
  const params = options.params || []

  console.info('[CrossChain][Manager] 准备通过跨链内置 signer 发送交易:', {
    contractAddress: options.contractAddress,
    method: options.method,
    params,
    signerAddress
  })

  const gasEstimate = await contract.estimateGas[options.method](...params)
  const tx = await withTimeout(
    contract[options.method](...params, {
      gasLimit: gasEstimate.mul(120).div(100)
    }),
    WALLET_ACTION_TIMEOUT_MS,
    '跨链内置账户在 120 秒内没有返回交易哈希，请检查 RPC 或账户余额。'
  )
  const txHash = parseWalletTxHash(tx)

  if (typeof txHash !== 'string' || !txHash.startsWith('0x')) {
    throw new Error('交易发送后未返回有效交易哈希')
  }

  console.info('[CrossChain][Manager] 交易已发送:', {
    method: options.method,
    txHash
  })
  ElMessage.success(options.submittedMessage)
  const receipt = await waitForTransactionReceipt(options.provider, txHash)
  console.info('[CrossChain][Manager] 交易确认结果:', receipt)
  if (receipt.status !== 1) {
    throw new Error('链上交易执行失败')
  }
  return txHash
}

const loadCommitteeData = async () => {
  committeeLoading.value = true
  try {
    const managerAddr = await getFinalManagerAddress()
    const rpcUrl = await getFinalRpcUrl()
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const managerContract = new ethers.Contract(managerAddr, MANAGER_ABI, provider)

    // 获取操作者地址
    try {
      operatorAddress.value = await getCurrentWalletAddress()
    } catch (e) {
      console.warn('获取当前跨链操作地址失败:', e)
      operatorAddress.value = ''
    }

    // 获取委员会列表
    const addresses = await managerContract.getCommitteeMembers()
    const memberInfos: CommitteeMemberInfo[] = []

    for (const addr of addresses) {
      const [count, required] = await managerContract.getCommitteeRemovalApproval(addr)
      let hasApproved = false
      if (operatorAddress.value) {
        hasApproved = await managerContract.hasApprovedCommitteeRemoval(addr, operatorAddress.value)
      }
      memberInfos.push({
        address: addr,
        removalCount: Number(count),
        removalRequired: Number(required),
        hasApproved
      })
    }
    committeeMembers.value = memberInfos

    // 检查是否有邀请
    if (operatorAddress.value) {
      const [pending, inviter] = await managerContract.getCommitteeInvitation(operatorAddress.value)
      pendingInvitation.pending = pending
      pendingInvitation.inviter = inviter
    }
  } catch (error: any) {
    console.error('加载委员会数据失败:', error)
    ElMessage.error(error?.message || '加载委员会数据失败')
  } finally {
    committeeLoading.value = false
  }
}

const loadTasksData = async () => {
  loading.value = true
  try {
    // 动态解析 Transport 合约地址
    const managerAddr = await getFinalManagerAddress()
    const rpcUrl = await getFinalRpcUrl()
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const managerContract = new ethers.Contract(managerAddr, MANAGER_ABI, provider)
    
    // HubChain ID 暂定为 0, Transport Level ID 为 1
    const transportAddr = await managerContract.contract_chain_index(0, 1)
    
    if (ethers.utils.isAddress(transportAddr) && transportAddr !== ethers.constants.AddressZero) {
      const transportContract = new ethers.Contract(transportAddr, TRANSPORT_ABI, provider)
      const [typeIds, names, isActiveArray, validators] = await transportContract.getAllRoutes()
      tasks.value = typeIds.map((id: any, index: number) => ({
        typeId: Number(id),
        name: names[index] || `任务类型 ${id}`,
        isActive: !!isActiveArray[index],
        validator: validators[index]
      }))
    } else {
      // 回退方案
      tasks.value = await getAllTaskTypes()
    }
  } catch (error: any) {
    console.error('加载任务类型失败:', error)
    ElMessage.error('无法从链上获取任务类型')
  } finally {
    loading.value = false
  }
}

const handleAcceptInvitation = async () => {
  accepting.value = true
  console.info('[CrossChain][Manager] 点击了接受邀请按钮', {
    clickedAt: new Date().toISOString()
  })
  console.group('[CrossChain][Manager] 接受委员会邀请')
  try {
    console.info('[CrossChain][Manager] 开始检查跨链内置账户状态')
    const { signerAddress } = await getManagerWalletContext()
    const managerAddr = await getFinalManagerAddress()
    const rpcUrl = await getFinalRpcUrl()
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const managerReadContract = new ethers.Contract(managerAddr, MANAGER_ABI, provider)

    console.info('[CrossChain][Manager] 基础信息:', {
      signerAddress,
      managerAddr,
      rpcUrl
    })

    const [pendingBefore, inviterBefore] = await withTimeout(
      managerReadContract.getCommitteeInvitation(signerAddress),
      REQUEST_TIMEOUT_MS,
      '读取邀请状态超时，请检查 RPC 连接。'
    ) as [boolean, string]
    console.info('[CrossChain][Manager] 接受前邀请状态:', {
      pending: pendingBefore,
      inviter: inviterBefore
    })

    await withTimeout(
      managerReadContract.callStatic.acceptCommitteeInvitation({ from: signerAddress }),
      REQUEST_TIMEOUT_MS,
      '链上预检查超时，请稍后重试。'
    )
    console.info('[CrossChain][Manager] callStatic 校验通过，准备发送交易')

    console.info('[CrossChain][Manager] 开始使用跨链内置账户发送交易')
    await sendAndConfirmWithConnectedWallet({
      contractAddress: managerAddr,
      abi: MANAGER_ABI,
      method: 'acceptCommitteeInvitation',
      provider,
      submittedMessage: '加入请求已发送，正在等待链上确认'
    })

    const [pendingAfter, inviterAfter] = await withTimeout(
      managerReadContract.getCommitteeInvitation(signerAddress),
      REQUEST_TIMEOUT_MS,
      '读取加入后的邀请状态超时，请稍后刷新列表确认。'
    ) as [boolean, string]
    console.info('[CrossChain][Manager] 接受后邀请状态:', {
      pending: pendingAfter,
      inviter: inviterAfter
    })

    ElMessage.success('成功加入委员会')
    console.info('[CrossChain][Manager] 接受邀请流程完成，准备刷新委员会数据')
    try {
      await loadCommitteeData()
    } catch (refreshError) {
      console.warn('加入成功后刷新委员会数据失败:', refreshError)
    }
  } catch (error: any) {
    console.error('[CrossChain][Manager] 接受委员会邀请失败:', {
      error,
      message: error?.message,
      reason: error?.reason,
      code: error?.code,
      data: error?.data,
      stack: error?.stack
    })
    ElMessage.error(extractErrorMessage(error) || '加入失败')
  } finally {
    accepting.value = false
    console.info('[CrossChain][Manager] 接受邀请流程结束', {
      finishedAt: new Date().toISOString()
    })
    console.groupEnd()
  }
}

const handleSendInvitationTransaction = async () => {
  sendingInvitationTransaction.value = true
  console.info('[CrossChain][Manager] 点击了发送交易按钮', {
    clickedAt: new Date().toISOString()
  })
  console.group('[CrossChain][Manager] 通过跨链内置账户发送接受邀请交易')
  try {
    const { signerAddress } = await getManagerWalletContext()
    const managerAddr = await getFinalManagerAddress()
    const rpcUrl = await getFinalRpcUrl()
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const managerReadContract = new ethers.Contract(managerAddr, MANAGER_ABI, provider)

    const [pendingBefore, inviterBefore] = await withTimeout(
      managerReadContract.getCommitteeInvitation(signerAddress),
      REQUEST_TIMEOUT_MS,
      '读取邀请状态超时，请检查 RPC 连接。'
    ) as [boolean, string]
    console.info('[CrossChain][Manager] 发送前邀请状态:', {
      pending: pendingBefore,
      inviter: inviterBefore
    })

    if (!pendingBefore) {
      throw new Error('当前操作地址没有待处理的委员会邀请')
    }

    await withTimeout(
      managerReadContract.callStatic.acceptCommitteeInvitation({ from: signerAddress }),
      REQUEST_TIMEOUT_MS,
      '链上预检查超时，请稍后重试。'
    )

    await sendAndConfirmWithConnectedWallet({
      contractAddress: managerAddr,
      abi: MANAGER_ABI,
      method: 'acceptCommitteeInvitation',
      provider,
      submittedMessage: '交易已发送，正在等待链上确认'
    })

    ElMessage.success('交易确认完成')
    await loadCommitteeData()
  } catch (error: any) {
    console.error('[CrossChain][Manager] 发送接受邀请交易失败:', {
      error,
      message: error?.message,
      reason: error?.reason,
      code: error?.code,
      data: error?.data,
      stack: error?.stack
    })
    ElMessage.error(extractErrorMessage(error) || '发送交易失败')
  } finally {
    sendingInvitationTransaction.value = false
    console.info('[CrossChain][Manager] 发送交易流程结束', {
      finishedAt: new Date().toISOString()
    })
    console.groupEnd()
  }
}

const handleRemoveMember = async (memberAddr: string) => {
  removingMember.value = memberAddr
  try {
    const managerAddr = await getFinalManagerAddress()
    const rpcUrl = await getFinalRpcUrl()
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)

    await sendAndConfirmWithConnectedWallet({
      contractAddress: managerAddr,
      abi: MANAGER_ABI,
      method: 'approveCommitteeMemberRemoval',
      params: [memberAddr],
      provider,
      submittedMessage: '投票移除请求已发送'
    })
    await loadCommitteeData()
  } catch (error: any) {
    ElMessage.error(error?.message || '操作失败')
  } finally {
    removingMember.value = ''
  }
}

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

const openSourceChainModal = () => {
  sourceChainForm.name = ''
  sourceChainForm.symbol = ''
  showSourceChainDialog.value = true
}

const closeSourceChainModal = () => {
  showSourceChainDialog.value = false
}

const handleInviteSubmit = async () => {
  const memberInput = String(inviteForm.member || '').trim()
  if (!ethers.utils.isAddress(memberInput)) {
    ElMessage.warning('请输入有效的钱包地址')
    return
  }

  invitingCommitteeMember.value = true
  try {
    const managerAddr = await getFinalManagerAddress()
    const rpcUrl = await getFinalRpcUrl()
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)

    await sendAndConfirmWithConnectedWallet({
      contractAddress: managerAddr,
      abi: MANAGER_ABI,
      method: 'inviteCommitteeMember',
      params: [memberInput],
      provider,
      submittedMessage: '邀请已提交，正在等待链上确认'
    })
    closeInviteModal()
    await loadCommitteeData()
  } catch (error: any) {
    ElMessage.error(error?.message || '邀请失败')
  } finally {
    invitingCommitteeMember.value = false
  }
}

const handleRegisterSubmit = async () => {
  const name = registerForm.name.trim()
  const typeIdRaw = String(registerForm.typeId || '').trim()
  const validatorInput = String(registerForm.validator || '').trim()
  const validatorAddress = ethers.utils.isAddress(validatorInput)
    ? validatorInput
    : ethers.constants.AddressZero

  console.group('[CrossChain][Manager] 开始注册任务类型')
  console.info('[CrossChain][Manager] 表单数据:', {
    name,
    typeIdRaw,
    isActive: registerForm.isActive,
    validatorInput,
    validatorAddress
  })

  if (!name || !typeIdRaw) {
    console.warn('[CrossChain][Manager] 表单校验失败：缺少名称或类型 ID')
    console.groupEnd()
    ElMessage.warning('请填写完整的任务类型信息')
    return
  }

  const typeIdNum = Number(typeIdRaw)
  if (Number.isNaN(typeIdNum)) {
    console.warn('[CrossChain][Manager] 类型 ID 不是有效数字:', typeIdRaw)
    console.groupEnd()
    ElMessage.warning('类型 ID 必须是数字')
    return
  }

  registering.value = true
  try {
    console.info('[CrossChain][Manager] 开始解析链上配置')

    // 优先使用动态解析的 Transport 合约
    const managerAddr = await getFinalManagerAddress()
    const rpcUrl = await getFinalRpcUrl()
    console.info('[CrossChain][Manager] 解析结果:', {
      managerAddr,
      rpcUrl
    })

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const managerContract = new ethers.Contract(managerAddr, MANAGER_ABI, provider)
    const transportAddr = await managerContract.contract_chain_index(0, 1)

    console.info('[CrossChain][Manager] 解析到 Transport 地址:', transportAddr)

    if (ethers.utils.isAddress(transportAddr) && transportAddr !== ethers.constants.AddressZero) {
      console.info('[CrossChain][Manager] 使用动态解析到的 Transport 合约注册路由')
      console.info('[CrossChain][Manager] 准备发送 setCrossChainRoute 交易:', {
        typeIdNum,
        name,
        isActive: registerForm.isActive,
        validatorAddress
      })

      const transportInterface = new ethers.utils.Interface(TRANSPORT_ABI)
      const payload = transportInterface.encodeFunctionData('setCrossChainRoute', [
        typeIdNum,
        name,
        registerForm.isActive,
        validatorAddress
      ])

      console.info('[CrossChain][Manager] 已编码 Manager 代理调用 payload:', {
        transportAddr,
        payload
      })

      await sendAndConfirmWithConnectedWallet({
        contractAddress: managerAddr,
        abi: MANAGER_ABI,
        method: 'operateSystemContract',
        params: [transportAddr, payload],
        provider,
        submittedMessage: '任务类型注册中...'
      })
      ElMessage.success('注册成功')
      closeRegisterModal()
      await loadTasksData()
    } else {
      throw new Error('未解析到有效 Transport 合约地址，无法注册任务类型')
    }
  } catch (error: any) {
    console.error('[CrossChain][Manager] 注册任务类型失败:', {
      error,
      message: error?.message,
      reason: error?.reason,
      code: error?.code,
      data: error?.data,
      stack: error?.stack
    })
    ElMessage.error(error?.message || '注册失败')
  } finally {
    registering.value = false
    console.groupEnd()
  }
}

const handleSourceChainSubmit = async () => {
  if (!sourceChainForm.name.trim() || !sourceChainForm.symbol.trim()) {
    ElMessage.warning('请填写完整的源链信息')
    return
  }

  registeringSourceChain.value = true
  try {
    const managerAddr = await getFinalManagerAddress()
    const rpcUrl = await getFinalRpcUrl()
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)

    await sendAndConfirmWithConnectedWallet({
      contractAddress: managerAddr,
      abi: MANAGER_ABI,
      method: 'addNewSourceChain',
      params: [sourceChainForm.symbol.trim(), sourceChainForm.name.trim()],
      provider,
      submittedMessage: '注册交易已发送，正在等待链上确认'
    })
    closeSourceChainModal()
    ElMessage.success('源链注册成功')
    await loadTasksData()
  } catch (error: any) {
    ElMessage.error(error?.message || '注册失败')
  } finally {
    registeringSourceChain.value = false
  }
}

onMounted(() => {
  loadTasksData()
  loadCommitteeData()
})
watch(() => [browserWallet.address, browserWallet.connected], () => {
  if (browserWallet.selected) {
    operatorAddress.value = browserWallet.connected ? browserWallet.address : ''
    loadCommitteeData()
  }
})
</script>
<!-- 引入外部 SCSS 样式，取消 scoped -->
<style src="@assets/CrossChain/manager.scss"></style>
