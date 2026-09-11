<template>
  <div class="governance-page-shell">
    <div class="proposals-container">
      <div class="stats-header governance-summary">
        <div class="go-back-section">
          <a-button class="go-back-btn" @click="router.push({ name: 'GovernancePage' })">
            <template #icon><ArrowLeftOutlined style="font-size: 14px;" /></template>
            Go Back
          </a-button>
        </div>

        <div class="stat-items">
          <div class="stat-box">
            <div class="stat-label">Governance Type</div>
            <div class="stat-value compact">{{ activeGovernanceLabel }}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Parameter Proposals</div>
            <div class="stat-value">{{ parameterTotal }}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Upgrade Proposals</div>
            <div class="stat-value">{{ upgradeTotal }}</div>
          </div>
          <div class="stat-box last-stat">
            <div class="stat-label">Network</div>
            <div class="stat-value compact">{{ networkStatusLabel }}</div>
          </div>
        </div>
      </div>

      <div class="governance-switch">
        <a-segmented
          v-model:value="activeGovernance"
          :options="governanceOptions"
          size="large"
        />
      </div>

      <div class="filter-bar">
        <div class="search-wrap">
          <a-input v-model:value="searchText" :placeholder="searchPlaceholder" class="search-input">
            <template #prefix>
              <SearchOutlined style="color: rgba(0,0,0,.25)" />
            </template>
          </a-input>
        </div>

        <div class="actions-wrap">
          <div class="select-group">
            <span class="select-label">Filter</span>
            <a-select v-model:value="filterValue" class="custom-select" :bordered="false">
              <a-select-option value="all">All Proposals</a-select-option>
              <a-select-option value="active">Active</a-select-option>
              <a-select-option value="created">Created</a-select-option>
              <a-select-option value="succeeded">Succeeded</a-select-option>
              <a-select-option value="executed">Executed</a-select-option>
              <a-select-option value="cancelled">Cancelled</a-select-option>
            </a-select>
          </div>

          <div class="split-line"></div>

          <div class="select-group">
            <span class="select-label">Sort By</span>
            <a-select v-model:value="sortValue" class="custom-select" :bordered="false">
              <a-select-option value="desc">Newest</a-select-option>
              <a-select-option value="asc">Oldest</a-select-option>
            </a-select>
          </div>

          <a-button type="primary" class="new-proposal-btn" @click="showCreateModal">
            New Proposal <PlusOutlined />
          </a-button>
        </div>
      </div>

      <a-modal
        v-model:open="isParameterModalVisible"
        title="Create Parameter Upgrade Proposal"
        :footer="null"
        width="600px"
        :class="'custom-create-modal'"
        :afterClose="resetParameterForm"
      >
        <a-form layout="vertical" :model="parameterForm" @finish="handleCreateParameterProposal">
          <div class="form-grid">
            <a-form-item label="Parameter Name" name="name" :rules="[{ required: true, message: 'Please provide parameter name' }]">
              <a-input v-model:value="parameterForm.name" placeholder="e.g. minPowGas" size="large" />
            </a-form-item>

            <a-form-item label="Category" name="category" :rules="[{ required: true, message: 'Please provide category' }]">
              <a-input v-model:value="parameterForm.category" placeholder="e.g. execution" size="large" />
            </a-form-item>
          </div>

          <a-form-item label="New Value" name="newValue" :rules="[{ required: true, message: 'Please provide new value' }]">
            <a-input v-model:value="parameterForm.newValue" placeholder="provide new value (e.g. 2000000)" size="large" />
          </a-form-item>

          <a-form-item label="Description" name="description" :rules="[{ required: true, message: 'Please provide description' }]">
            <a-textarea v-model:value="parameterForm.description" placeholder="Describe why this parameter should change." :rows="6" size="large" />
          </a-form-item>

          <a-form-item style="margin-bottom: 0;">
            <a-button type="primary" html-type="submit" block size="large" class="submit-btn">
              Create Proposal
            </a-button>
          </a-form-item>
        </a-form>
      </a-modal>

      <a-modal
        v-model:open="isUpgradeModalVisible"
        title="Create Contract Upgrade Proposal"
        :footer="null"
        width="720px"
        :class="'custom-create-modal'"
        :afterClose="resetUpgradeForm"
      >
        <a-form layout="vertical" :model="upgradeForm" @finish="handleCreateUpgradeProposal">
          <a-alert
            class="upgrade-alert"
            type="info"
            show-icon
            message="This migrated view stores proposals in the current app mock governance store."
          />

          <div class="network-flow">
            <div class="network-flow__header">
              <div>
                <div class="network-flow__title">PunkChain deployment flow</div>
                <div class="network-flow__desc">
                  Add an implementation address here, then create an upgrade proposal for review.
                </div>
              </div>
              <a-tag color="green" class="network-flow__tag">PunkChain</a-tag>
            </div>

            <div class="network-flow__steps">
              <div class="network-flow__step is-ready">
                <span class="network-flow__index">1</span>
                <div>
                  <div class="network-flow__step-title">Prepare contract</div>
                  <div class="network-flow__step-desc">Record the proxy and implementation metadata.</div>
                </div>
              </div>
              <div class="network-flow__step">
                <span class="network-flow__index">2</span>
                <div>
                  <div class="network-flow__step-title">Review proposal</div>
                  <div class="network-flow__step-desc">Community members inspect the change before voting.</div>
                </div>
              </div>
              <div class="network-flow__step">
                <span class="network-flow__index">3</span>
                <div>
                  <div class="network-flow__step-title">Execute upgrade</div>
                  <div class="network-flow__step-desc">Execution becomes available after the proposal passes.</div>
                </div>
              </div>
            </div>
          </div>

          <div class="form-grid">
            <a-form-item label="Proxy" name="proxy" :rules="[{ required: true, message: 'Please provide proxy address' }]">
              <a-input v-model:value="upgradeForm.proxy" placeholder="0x..." size="large" />
            </a-form-item>

            <a-form-item label="New Implementation" name="newImplementation" :rules="[{ required: true, message: 'Please provide new implementation address' }]">
              <a-input v-model:value="upgradeForm.newImplementation" placeholder="0x..." size="large" />
            </a-form-item>
          </div>

          <div class="form-grid">
            <a-form-item label="Contract Name">
              <a-input v-model:value="upgradeForm.contractName" placeholder="e.g. Governance" size="large" />
            </a-form-item>

            <a-form-item label="Call Data">
              <a-input v-model:value="upgradeForm.callData" placeholder="0x" size="large" />
            </a-form-item>
          </div>

          <a-form-item label="Description" name="description" :rules="[{ required: true, message: 'Please provide description' }]">
            <a-textarea v-model:value="upgradeForm.description" placeholder="Describe the implementation change and migration intent." :rows="5" size="large" />
          </a-form-item>

          <a-form-item style="margin-bottom: 0;">
            <a-button type="primary" html-type="submit" block size="large" class="submit-btn">
              Create Proposal
            </a-button>
          </a-form-item>
        </a-form>
      </a-modal>

      <a-table
        :columns="activeColumns"
        :data-source="filteredData"
        :pagination="paginationConfig"
        class="custom-table"
        :rowClassName="() => 'custom-table-row'"
        :customRow="(record) => ({
          onClick: () => goToDetail(record.key)
        })"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'proposal'">
            <div class="proposal-title" @click.stop="goToDetail(record.key)">
              <span>{{ record.proposal }}</span>
              <ArrowRightOutlined class="link-icon" />
            </div>
          </template>

          <template v-else-if="column.key === 'state'">
            <div :class="['state-tag', stateClass(record.state)]">
              <span class="dot"></span> {{ record.state }}
            </div>
          </template>

          <template v-else-if="column.key === 'proxy' || column.key === 'implementation'">
            <span class="mono-address">{{ record[column.key] }}</span>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useProposalStore } from './store/governance'
import { hasGovernanceArtifacts } from './services/governanceArtifacts'
import {
  encodeBytes32,
  getDeploymentStatus,
  getParameterRegistryWriteContract,
  getUpgradeGovernanceWriteContract
} from './services/chainContracts'
import { connectGovernanceWallet, getGovernanceSigner } from './services/walletConnect'
import {
  ArrowLeftOutlined,
  SearchOutlined,
  PlusOutlined,
  ArrowRightOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const store = useProposalStore()

const governanceOptions = [
  { label: 'Parameter Upgrade', value: 'parameter' },
  { label: 'Contract Upgrade', value: 'upgrade' }
]

const activeGovernance = ref('parameter')
const filterValue = ref('all')
const sortValue = ref('desc')
const searchText = ref('')
const isParameterModalVisible = ref(false)
const isUpgradeModalVisible = ref(false)

const parameterForm = reactive({
  name: '',
  category: '',
  newValue: '',
  description: ''
})

const upgradeForm = reactive({
  proxy: '0x0000000000000000000000000000000000000000',
  newImplementation: '0x0000000000000000000000000000000000000000',
  contractName: 'Governance',
  callData: '0x',
  description: 'Upgrade the registered proxy to a new implementation.'
})

const activeGovernanceLabel = computed(() => (
  activeGovernance.value === 'parameter' ? 'Parameters' : 'Upgrades'
))

const deploymentStatus = computed(() => getDeploymentStatus())

const networkStatusLabel = computed(() => {
  const status = deploymentStatus.value
  if (status.parameterReady || status.upgradeReady) return 'PunkChain'
  return hasGovernanceArtifacts ? 'PunkChain ABI' : 'PunkChain'
})

const searchPlaceholder = computed(() => (
  activeGovernance.value === 'parameter'
    ? 'Search parameter proposals'
    : 'Search proxy, implementation, or description'
))

const normalizeState = (status) => {
  const map = {
    Created: 'Created',
    'Open for voting': 'Active',
    Executed: 'Executed',
    Cancelled: 'Cancelled',
    Canceled: 'Cancelled',
    Succeeded: 'Succeeded'
  }
  return map[status] || status || 'Created'
}

const stateClass = (status) => normalizeState(status).toLowerCase()

const shortAddress = (address) => {
  if (!address) return '0x0000...0000'
  if (address.length <= 12) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const makeDueDate = (proposal) => {
  const raw = proposal?.endTime || proposal?.executeTime
  if (!raw) return 'TBD'
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return raw
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

const storeRows = computed(() => store.ProposalList.map((proposal) => {
  const detail = store.getProposalById(proposal.id) || {}
  const isUpgrade = Boolean(detail.upgradeTo || detail.version || /governance contract/i.test(proposal.title))
  return {
    key: String(proposal.id),
    proposal: proposal.title,
    state: normalizeState(proposal.status),
    dueDate: makeDueDate(detail),
    votesFor: proposal.yesVotes,
    votesAgainst: proposal.noVotes,
    totalVotes: proposal.yesVotes + proposal.noVotes,
    description: detail.description || proposal.title,
    type: isUpgrade ? 'upgrade' : 'parameter',
    proxy: shortAddress(detail.targetAddress || detail.managePermission || '0x0000000000000000000000000000000000000000'),
    implementation: shortAddress(detail.upgradeTo || detail.version || '0x0000000000000000000000000000000000000000')
  }
}))

const parameterData = computed(() => storeRows.value.filter((item) => item.type === 'parameter'))
const upgradeData = computed(() => storeRows.value.filter((item) => item.type === 'upgrade'))

const parameterTotal = computed(() => parameterData.value.length)
const upgradeTotal = computed(() => upgradeData.value.length)

const parameterColumns = [
  { title: 'PROPOSAL', dataIndex: 'proposal', key: 'proposal', width: '28%' },
  { title: 'STATE', dataIndex: 'state', key: 'state', width: '13%' },
  { title: 'DUE DATE', dataIndex: 'dueDate', key: 'dueDate', width: '19%' },
  { title: 'VOTES FOR', dataIndex: 'votesFor', key: 'votesFor', width: '14%' },
  { title: 'VOTES AGAINST', dataIndex: 'votesAgainst', key: 'votesAgainst', width: '14%' },
  { title: 'TOTAL VOTES', dataIndex: 'totalVotes', key: 'totalVotes', width: '12%' }
]

const upgradeColumns = [
  { title: 'PROPOSAL', dataIndex: 'proposal', key: 'proposal', width: '28%' },
  { title: 'STATE', dataIndex: 'state', key: 'state', width: '12%' },
  { title: 'PROXY', dataIndex: 'proxy', key: 'proxy', width: '16%' },
  { title: 'NEW IMPLEMENTATION', dataIndex: 'implementation', key: 'implementation', width: '18%' },
  { title: 'VOTES FOR', dataIndex: 'votesFor', key: 'votesFor', width: '13%' },
  { title: 'VOTES AGAINST', dataIndex: 'votesAgainst', key: 'votesAgainst', width: '13%' }
]

const activeColumns = computed(() => (
  activeGovernance.value === 'parameter' ? parameterColumns : upgradeColumns
))

const activeData = computed(() => (
  activeGovernance.value === 'parameter' ? parameterData.value : upgradeData.value
))

const filteredData = computed(() => {
  const normalizedSearch = searchText.value.trim().toLowerCase()
  const filtered = activeData.value.filter((item) => {
    const stateMatches = filterValue.value === 'all' || item.state.toLowerCase() === filterValue.value
    const textMatches = !normalizedSearch || [
      item.proposal,
      item.state,
      item.proxy,
      item.implementation,
      item.description
    ].filter(Boolean).some((value) => String(value).toLowerCase().includes(normalizedSearch))

    return stateMatches && textMatches
  })

  return [...filtered].sort((a, b) => (
    sortValue.value === 'asc' ? Number(a.key) - Number(b.key) : Number(b.key) - Number(a.key)
  ))
})

const paginationConfig = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ['5', '10', '20', '50'],
  showTotal: (total) => `Total ${total} items`,
  onChange: (page, pageSize) => {
    paginationConfig.value.current = page
    paginationConfig.value.pageSize = pageSize
  }
})

watch(filteredData, (rows) => {
  paginationConfig.value.total = rows.length
}, { immediate: true })

watch(activeGovernance, () => {
  paginationConfig.value.current = 1
  searchText.value = ''
  filterValue.value = 'all'
})

const showCreateModal = () => {
  if (activeGovernance.value === 'parameter') {
    isParameterModalVisible.value = true
  } else {
    isUpgradeModalVisible.value = true
  }
}

const resetParameterForm = () => {
  parameterForm.name = ''
  parameterForm.category = ''
  parameterForm.newValue = ''
  parameterForm.description = ''
}

const resetUpgradeForm = () => {
  upgradeForm.proxy = '0x0000000000000000000000000000000000000000'
  upgradeForm.newImplementation = '0x0000000000000000000000000000000000000000'
  upgradeForm.contractName = 'Governance'
  upgradeForm.callData = '0x'
  upgradeForm.description = 'Upgrade the registered proxy to a new implementation.'
}

const handleCreateParameterProposal = async () => {
  const now = new Date()
  const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  let txHash = ''
  const wallet = await connectGovernanceWallet()

  if (!wallet.address) {
    message.error('Please connect wallet first')
    return
  }

  if (deploymentStatus.value.parameterReady) {
    const signer = await getGovernanceSigner()
    if (!signer) {
      message.error('Please connect wallet first')
      return
    }

    try {
      const contract = getParameterRegistryWriteContract(signer)
      const tx = await contract.proposeParameterChange(
        encodeBytes32(parameterForm.name),
        encodeBytes32(parameterForm.newValue),
        parameterForm.description
      )
      txHash = tx.hash
      message.success(`Proposal transaction sent: ${tx.hash}`)
    } catch (err) {
      message.error(err?.shortMessage || err?.message || 'Failed to create proposal transaction')
      return
    }
  }

  store.addProposal({
    id: store.ProposalList.length + 1,
    target: parameterForm.category || 'Governance',
    upgradeType: `Upgrade ${parameterForm.name} to ${parameterForm.newValue}`,
    executor: 1,
    startTime: now.toISOString(),
    endTime: end.toISOString(),
    proposer: wallet.address || store.userInfo.address,
    upgradeParameter: txHash ? `${parameterForm.description}\nTx: ${txHash}` : parameterForm.description
  })
  if (!txHash) message.success('Proposal created successfully')
  isParameterModalVisible.value = false
}

const handleCreateUpgradeProposal = async () => {
  const now = new Date()
  const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  let txHash = ''
  const wallet = await connectGovernanceWallet()

  if (!wallet.address) {
    message.error('Please connect wallet first')
    return
  }

  if (deploymentStatus.value.upgradeReady) {
    const signer = await getGovernanceSigner()
    if (!signer) {
      message.error('Please connect wallet first')
      return
    }

    try {
      const contract = getUpgradeGovernanceWriteContract(signer)
      const tx = await contract.proposeUpgrade(
        upgradeForm.proxy,
        upgradeForm.newImplementation,
        upgradeForm.callData || '0x',
        upgradeForm.description
      )
      txHash = tx.hash
      message.success(`Upgrade proposal transaction sent: ${tx.hash}`)
    } catch (err) {
      message.error(err?.shortMessage || err?.message || 'Failed to create upgrade transaction')
      return
    }
  }

  store.addProposal({
    id: store.ProposalList.length + 1,
    target: upgradeForm.contractName || 'Governance',
    upgradeType: 'Upgrade the governance contract',
    executor: 1,
    startTime: now.toISOString(),
    endTime: end.toISOString(),
    proposer: wallet.address || store.userInfo.address,
    version: upgradeForm.newImplementation,
    targetAddress: upgradeForm.proxy,
    upgradeParameter: txHash ? `${upgradeForm.callData || '0x'}\nTx: ${txHash}` : upgradeForm.callData,
    upgradeTo: upgradeForm.newImplementation
  })
  if (!txHash) message.success('Upgrade proposal created successfully')
  isUpgradeModalVisible.value = false
}

const goToDetail = (id) => {
  router.push({
    name: activeGovernance.value === 'parameter' ? 'ParameterProposalDetail' : 'UpgradeProposalDetail',
    params: { id }
  })
}
</script>

<style>
.custom-create-modal .ant-modal-content {
  border-radius: 12px;
  padding: 0;
}
.custom-create-modal .ant-modal-header {
  border-bottom: 1px solid #f0f0f0;
  padding: 20px 24px;
  border-radius: 12px 12px 0 0;
}
.custom-create-modal .ant-modal-title {
  font-size: 20px;
  font-weight: 600;
}
.custom-create-modal .ant-modal-body {
  padding: 24px;
}
.custom-create-modal .submit-btn {
  background-color: #5544FF;
  border: none;
  height: 48px;
  font-size: 16px;
  border-radius: 6px;
}
.custom-create-modal .submit-btn:hover {
  background-color: #4034db;
}
</style>

<style scoped>
.governance-page-shell {
  width: 100%;
  min-height: calc(100vh - 64px);
  padding: 40px;
  display: flex;
  justify-content: center;
  background: #F8F9FB;
}

.proposals-container {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 1120px;
  overflow: hidden;
}

.stats-header {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
}
.governance-summary {
  background: #ffffff;
}
.go-back-section {
  padding: 24px;
  border-right: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 180px;
  min-width: 180px;
}
.go-back-btn {
  font-weight: 700;
  font-size: 16px;
  border-radius: 6px;
  color: #1f2937;
  border-color: #d1d5db;
  height: 42px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat-items {
  display: flex;
  flex: 1;
}
.stat-box {
  flex: 1;
  padding: 24px 16px;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-width: 0;
}
.last-stat {
  border-right: none;
}
.stat-label {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 12px;
  font-weight: 500;
}
.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stat-value.compact {
  font-size: 18px;
  text-align: center;
}

.governance-switch {
  padding: 18px 24px 0;
}
:deep(.ant-segmented) {
  background: #f3f4f6;
  padding: 4px;
  border-radius: 8px;
}
:deep(.ant-segmented-item) {
  border-radius: 6px;
  font-weight: 600;
}
:deep(.ant-segmented-item-selected) {
  color: #111827;
  box-shadow: 0 1px 4px rgba(17, 24, 39, 0.08);
}

.filter-bar {
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  gap: 20px;
}
.search-wrap {
  width: 360px;
}
.search-input {
  border-radius: 6px;
  padding: 8px 12px;
}

.actions-wrap {
  display: flex;
  align-items: center;
  gap: 16px;
}
.select-group {
  display: flex;
  align-items: center;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 0 8px;
}
.select-label {
  font-size: 14px;
  color: #6b7280;
}
.custom-select {
  width: 140px;
}
:deep(.ant-select-selector) {
  font-weight: 500;
  color: #374151 !important;
}
.split-line {
  height: 24px;
  width: 1px;
  background: #e5e7eb;
  margin: 0 4px;
}
.new-proposal-btn {
  background-color: #3b82f6;
  border-radius: 6px;
  font-weight: 600;
  height: 38px;
  padding: 0 20px;
  box-shadow: none;
}
.new-proposal-btn:hover {
  background-color: #2563eb;
}

.form-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 16px;
}
.upgrade-alert {
  margin-bottom: 18px;
  border-radius: 8px;
}
.network-flow {
  margin-bottom: 20px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fbfcfe;
}
.network-flow__header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 14px;
}
.network-flow__title {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
}
.network-flow__desc {
  margin-top: 4px;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.45;
}
.network-flow__tag {
  margin-inline-end: 0;
  font-weight: 700;
  border-radius: 6px;
}
.network-flow__steps {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}
.network-flow__step {
  display: flex;
  gap: 10px;
  padding: 12px;
  border: 1px solid #eef2f7;
  border-radius: 8px;
  background: #ffffff;
}
.network-flow__step.is-ready {
  border-color: #bbf7d0;
  background: #f0fdf4;
}
.network-flow__index {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  flex: 0 0 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #eef2ff;
  color: #4f46e5;
  font-size: 12px;
  font-weight: 800;
}
.network-flow__step.is-ready .network-flow__index {
  background: #dcfce7;
  color: #16a34a;
}
.network-flow__step-title {
  font-size: 13px;
  font-weight: 700;
  color: #111827;
}
.network-flow__step-desc {
  margin-top: 3px;
  font-size: 12px;
  line-height: 1.4;
  color: #6b7280;
}

:deep(.ant-table-thead > tr > th) {
  background: #fff !important;
  color: #6b7280 !important;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #f3f4f6;
}
:deep(.ant-table-tbody > tr > td) {
  padding: 18px 24px;
  font-size: 15px;
  color: #374151;
  font-weight: 600;
  border-bottom: 1px solid #f3f4f6;
}
.proposal-title {
  display: flex;
  align-items: center;
  gap: 6px;
}
.proposal-title span {
  min-width: 0;
}
.link-icon {
  font-size: 12px;
  color: #9ca3af;
  cursor: pointer;
  border: 1px solid #e5e7eb;
  border-radius: 50%;
  padding: 2px;
  flex: 0 0 auto;
}
.mono-address {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 15px;
  font-weight: 700;
  color: #334155;
  letter-spacing: 0;
}

.state-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  background-color: #fff;
}
.state-tag .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 6px;
}
.active {
  border: 1px solid #c7d2fe;
  color: #4f46e5;
}
.active .dot { background-color: #4f46e5; }
.succeeded {
  border: 1px solid #bbf7d0;
  color: #16a34a;
}
.succeeded .dot { background-color: #16a34a; }
.executed {
  border: 1px solid #a5f3fc;
  color: #0891b2;
}
.executed .dot { background-color: #0891b2; }
.cancelled,
.canceled {
  border: 1px solid #d1d5db;
  color: #6b7280;
}
.cancelled .dot,
.canceled .dot { background-color: #6b7280; }
.defeated {
  border: 1px solid #fecaca;
  color: #dc2626;
}
.defeated .dot { background-color: #dc2626; }
.pending,
.created {
  border: 1px solid #fde68a;
  color: #d97706;
}
.pending .dot,
.created .dot { background-color: #d97706; }

:deep(.custom-table-row) {
  cursor: pointer;
  transition: all 0.3s;
}
:deep(.custom-table-row:hover) {
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
:deep(.ant-table-wrapper .ant-pagination) {
  margin: 16px 24px;
}
:deep(.ant-pagination-item-active) {
  border-color: #3b82f6;
}
:deep(.ant-pagination-item-active a) {
  color: #3b82f6;
}

@media (max-width: 980px) {
  .governance-page-shell {
    padding: 20px;
  }
  .stats-header,
  .filter-bar,
  .stat-items {
    flex-direction: column;
  }
  .go-back-section,
  .search-wrap {
    width: auto;
  }
  .go-back-section,
  .stat-box {
    border-right: none;
    border-bottom: 1px solid #f0f0f0;
  }
  .actions-wrap {
    flex-wrap: wrap;
    width: 100%;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
  .network-flow__header,
  .network-flow__steps {
    display: flex;
    flex-direction: column;
  }
}
</style>
