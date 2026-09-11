<template>
  <div class="proposals-container">
    <div class="stats-header governance-summary">
      <div class="go-back-section">
        <a-button class="go-back-btn" @click="router.push('/')">
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
          <div class="stat-value compact">{{ activeNetworkLabel }}</div>
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
            <a-select-option value="succeeded">Succeeded</a-select-option>
            <a-select-option value="executed">Executed</a-select-option>
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
          {{ createButtonLabel }} <PlusOutlined />
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
          <a-button type="primary" html-type="submit" block size="large" class="submit-btn" :loading="isCreating">
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
          message="Use a wallet with governance tokens on PunkChain."
        />

        <div class="network-flow">
          <div class="network-flow__header">
            <div>
              <div class="network-flow__title">PunkChain deployment flow</div>
              <div class="network-flow__desc">
                MetaMask can switch to PunkChain after the network is added. Add it manually if your wallet has not stored it yet.
              </div>
            </div>
            <a-tag :color="localNetworkReady ? 'green' : 'orange'" class="network-flow__tag">
              {{ walletNetworkLabel }}
            </a-tag>
          </div>

          <div class="network-flow__steps">
            <div :class="['network-flow__step', { 'is-ready': localNetworkReady }]">
              <span class="network-flow__index">1</span>
              <div>
                <div class="network-flow__step-title">Switch to PunkChain</div>
                <div class="network-flow__step-desc">If MetaMask has not added PunkChain, use the manual settings below.</div>
              </div>
            </div>
            <div class="network-flow__step">
              <span class="network-flow__index">2</span>
              <div>
                <div class="network-flow__step-title">Deploy implementation</div>
                <div class="network-flow__step-desc">MetaMask opens a deployment transaction on PunkChain.</div>
              </div>
            </div>
            <div class="network-flow__step">
              <span class="network-flow__index">3</span>
              <div>
                <div class="network-flow__step-title">Create proposal</div>
                <div class="network-flow__step-desc">Submit the upgrade proposal to PunkChain UpgradeGovernance.</div>
              </div>
            </div>
          </div>

          <a-button
            class="prepare-network-btn"
            :loading="isPreparingLocalNetwork"
            @click="prepareLocalNetwork"
          >
            {{ localNetworkReady ? 'PunkChain Ready' : 'Switch to PunkChain' }}
          </a-button>

          <div v-if="!localNetworkReady" class="manual-network">
            <div class="manual-network__title">Manual network settings</div>
            <div class="manual-network__grid">
              <span>Network Name</span><strong>PunkChain</strong>
              <span>RPC URL</span><strong>http://47.243.174.71:36054</strong>
              <span>Chain ID</span><strong>20260418</strong>
              <span>Currency Symbol</span><strong>PUNK</strong>
            </div>
          </div>
        </div>

        <div class="form-grid">
          <a-form-item label="Proxy" name="proxy" :rules="[{ required: true, message: 'Please select or enter proxy address' }]">
            <a-select
              v-model:value="upgradeForm.proxy"
              size="large"
              show-search
              :options="registeredProxyOptions"
              placeholder="Registered proxy address"
            />
          </a-form-item>

          <a-form-item label="New Implementation" name="newImplementation" :rules="[{ required: true, message: 'Please provide new implementation address' }]">
            <a-input v-model:value="upgradeForm.newImplementation" placeholder="0x..." size="large" />
          </a-form-item>
        </div>

        <div class="implementation-tools">
          <a-button class="tool-btn" :loading="isDeployingImplementation" @click="deployV2Implementation">
            Deploy New V2 Implementation
          </a-button>
          <a-button class="tool-btn" @click="fillDeployedImplementation">
            Use deployed.json Implementation
          </a-button>
        </div>

        <div class="form-grid">
          <a-form-item label="Call Data Mode">
            <a-select v-model:value="upgradeForm.callDataMode" size="large" @change="syncUpgradeCallData">
              <a-select-option value="none">No migration call</a-select-option>
              <a-select-option value="initializeV2">initializeV2(uint256)</a-select-option>
              <a-select-option value="custom">Custom calldata</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item v-if="upgradeForm.callDataMode === 'initializeV2'" label="Initial Multiplier">
            <a-input-number
              v-model:value="upgradeForm.multiplier"
              size="large"
              :min="0"
              style="width: 100%;"
              @change="syncUpgradeCallData"
            />
          </a-form-item>
        </div>

        <a-form-item label="Call Data">
          <a-textarea
            v-model:value="upgradeForm.callData"
            :disabled="upgradeForm.callDataMode !== 'custom'"
            placeholder="0x"
            :rows="3"
            size="large"
          />
        </a-form-item>

        <a-form-item label="Description" name="description" :rules="[{ required: true, message: 'Please provide description' }]">
          <a-textarea v-model:value="upgradeForm.description" placeholder="Describe the implementation change and migration intent." :rows="5" size="large" />
        </a-form-item>

        <a-form-item style="margin-bottom: 0;">
          <a-button type="primary" html-type="submit" block size="large" class="submit-btn" :loading="isCreating">
            Create Proposal
          </a-button>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-table
      :columns="activeColumns"
      :data-source="filteredData"
      :loading="isLoadingTable"
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
          <div :class="['state-tag', record.state.toLowerCase()]">
            <span class="dot"></span> {{ record.state }}
          </div>
        </template>

        <template v-else-if="column.key === 'proxy' || column.key === 'implementation'">
          <span class="mono-address">{{ record[column.key] }}</span>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { ethers } from 'ethers'
import ParameterRegistryArtifact from '../../../artifacts/contracts/ParameterRegistry.sol/ParameterRegistry.json'
import UpgradeGovernanceArtifact from '../../../artifacts/contracts/UpgradeGovernance.sol/UpgradeGovernance.json'
import UpgradeableCounterV2Artifact from '../../../artifacts/contracts/mocks/UpgradeableCounterV2.sol/UpgradeableCounterV2.json'
import parameterDeployedData from '../../../scripts/upgrade_process/deployed.json'
import upgradeDeployedData from '../../../scripts/contract_upgrade_process/deployed.json'
import { useWallet } from '../composables/useWallet'
import {
  ArrowLeftOutlined,
  SearchOutlined,
  PlusOutlined,
  ArrowRightOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const { chainId, connect, getSigner } = useWallet()

const PARAMETER_RPC_URL = 'http://47.243.174.71:36054'
const UPGRADE_RPC_URL = 'http://47.243.174.71:36054'
const PUNKCHAIN_CHAIN_ID = '0x1352642'
const PK_DEPLOYER = 'eeefa7075d12e965851eef8e2622377d480f8b9c99c30cb615cf222b699b491f'

const PUNKCHAIN_NETWORK = {
  chainId: PUNKCHAIN_CHAIN_ID,
  chainName: 'PunkChain',
  nativeCurrency: {
    name: 'Punk',
    symbol: 'PUNK',
    decimals: 18
  },
  rpcUrls: [UPGRADE_RPC_URL],
  blockExplorerUrls: []
}

const STATE_MAPPING = ['Pending', 'Active', 'Succeeded', 'Defeated', 'Executed', 'Canceled']
const LEVEL_MAPPING = ['Application', 'System', 'Infrastructure']

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
const isCreating = ref(false)
const isDeployingImplementation = ref(false)
const isPreparingLocalNetwork = ref(false)
const isLoadingTable = ref(false)

const parameterData = ref([])
const upgradeData = ref([])
const registeredProxyOptions = ref([])
const parameterTotal = ref(0)
const upgradeTotal = ref(0)

const parameterForm = reactive({
  name: '',
  category: '',
  newValue: '',
  description: ''
})

const upgradeForm = reactive({
  proxy: upgradeDeployedData.proxy || '',
  newImplementation: upgradeDeployedData.newImplementation || '',
  callDataMode: 'none',
  multiplier: 3,
  callData: '0x',
  description: 'Upgrade the registered UUPS proxy to a new implementation.'
})

const activeGovernanceLabel = computed(() => (
  activeGovernance.value === 'parameter' ? 'Parameters' : 'Upgrades'
))

const activeNetworkLabel = computed(() => (
  'PunkChain'
))

const createButtonLabel = computed(() => (
  activeGovernance.value === 'parameter' ? 'New Proposal' : 'New Proposal'
))

const localNetworkReady = computed(() => chainId.value?.toLowerCase() === PUNKCHAIN_CHAIN_ID)

const walletNetworkLabel = computed(() => (
  localNetworkReady.value ? 'PunkChain' : 'PunkChain required'
))

const searchPlaceholder = computed(() => (
  activeGovernance.value === 'parameter'
    ? 'Search parameter proposals'
    : 'Search proxy, implementation, or description'
))

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

watch(activeGovernance, async () => {
  paginationConfig.value.current = 1
  searchText.value = ''
  filterValue.value = 'all'
  await fetchActiveProposals()
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
  upgradeForm.proxy = upgradeDeployedData.proxy || ''
  upgradeForm.newImplementation = upgradeDeployedData.newImplementation || ''
  upgradeForm.callDataMode = 'none'
  upgradeForm.multiplier = 3
  upgradeForm.callData = '0x'
  upgradeForm.description = 'Upgrade the registered UUPS proxy to a new implementation.'
}

const shortAddress = (address) => {
  if (!address || address === ethers.ZeroAddress) return '0x0000...0000'
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const formatVotes = (votesAmount) => {
  const etherVal = Number(ethers.formatEther(votesAmount))
  if (etherVal >= 1000) return `${(etherVal / 1000).toFixed(1)}K`
  return etherVal.toString()
}

const formatDate = (timestamp) => {
  if (Number(timestamp) === 0) return 'TBD'
  const date = new Date(Number(timestamp) * 1000)
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

const formatBps = (value) => `${(Number(value) / 100).toFixed(2)}%`

const getUpgradeGovernanceReadContract = () => {
  const provider = new ethers.JsonRpcProvider(UPGRADE_RPC_URL)
  return new ethers.Contract(upgradeDeployedData.upgradeGovernance, UpgradeGovernanceArtifact.abi, provider)
}

const ensurePunkChainNetwork = async () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    message.error('MetaMask not detected. Please open this page in a browser with MetaMask enabled.')
    return false
  }

  const currentChainId = await window.ethereum.request({ method: 'eth_chainId' })
  if (currentChainId?.toLowerCase() === PUNKCHAIN_CHAIN_ID) return true

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: PUNKCHAIN_CHAIN_ID }]
    })
    chainId.value = PUNKCHAIN_CHAIN_ID
    message.success('Switched to PunkChain')
    return true
  } catch (err) {
    if (err?.code === 4902) {
      message.warning('Please add PunkChain manually in MetaMask. Remote HTTP RPC URLs cannot be added automatically by MetaMask.')
      return false
    }

    if (err?.code !== 4001) {
      message.error(err?.shortMessage || err?.message || 'Failed to switch to PunkChain')
    }
    return false
  }
}

const prepareLocalNetwork = async () => {
  isPreparingLocalNetwork.value = true
  try {
    await ensurePunkChainNetwork()
  } finally {
    isPreparingLocalNetwork.value = false
  }
}

const getUpgradeGovernanceWriteContract = async () => {
  const onLocalNetwork = await ensurePunkChainNetwork()
  if (!onLocalNetwork) return null

  let signer = await getSigner()
  if (!signer) {
    const connected = await connect()
    if (!connected) return null
    signer = await getSigner()
  }
  return new ethers.Contract(upgradeDeployedData.upgradeGovernance, UpgradeGovernanceArtifact.abi, signer)
}

const handleCreateParameterProposal = async () => {
  isCreating.value = true
  try {
    const provider = new ethers.JsonRpcProvider(PARAMETER_RPC_URL)
    const deployer = new ethers.Wallet(PK_DEPLOYER, provider)
    const paramRegistry = new ethers.Contract(parameterDeployedData.paramRegistry, ParameterRegistryArtifact.abi, deployer)

    const categoryBytes32 = ethers.encodeBytes32String(parameterForm.category)
    const parameterId = ethers.keccak256(
      ethers.solidityPacked(['string', 'bytes32'], [parameterForm.name, categoryBytes32])
    )

    const newValueInt = parseInt(parameterForm.newValue, 10)
    if (Number.isNaN(newValueInt)) throw new Error('New Value must be a number')

    const encodedNewValue = ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [newValueInt])
    const tx = await paramRegistry.proposeParameterChange(parameterId, encodedNewValue, parameterForm.description)
    await tx.wait()

    await fetchParameterProposals()
    message.success('Proposal created successfully')
    isParameterModalVisible.value = false
  } catch (err) {
    console.error(err)
    message.error(`Failed to create proposal: ${err.shortMessage || err.reason || err.message}`)
  } finally {
    isCreating.value = false
  }
}

const syncUpgradeCallData = () => {
  if (upgradeForm.callDataMode === 'none') {
    upgradeForm.callData = '0x'
    return
  }

  if (upgradeForm.callDataMode === 'initializeV2') {
    const iface = new ethers.Interface(UpgradeableCounterV2Artifact.abi)
    upgradeForm.callData = iface.encodeFunctionData('initializeV2', [upgradeForm.multiplier || 0])
  }
}

const fillDeployedImplementation = () => {
  upgradeForm.newImplementation = upgradeDeployedData.newImplementation || ''
  message.success('Implementation filled from deployed.json')
}

const deployV2Implementation = async () => {
  isDeployingImplementation.value = true
  try {
    const onLocalNetwork = await ensurePunkChainNetwork()
    if (!onLocalNetwork) return

    let signer = await getSigner()
    if (!signer) {
      const connected = await connect()
      if (!connected) return
      signer = await getSigner()
    }

    const signerAddress = await signer.getAddress()
    const signerProvider = signer.provider
    const balance = await signerProvider.getBalance(signerAddress)
    const gasEstimate = await signerProvider.estimateGas({
      from: signerAddress,
      data: UpgradeableCounterV2Artifact.bytecode
    })
    const feeData = await signerProvider.getFeeData()
    const gasPrice = feeData.gasPrice || feeData.maxFeePerGas || 0n
    if (gasPrice > 0n) {
      const estimatedCost = gasEstimate * gasPrice
      if (balance < estimatedCost) {
        throw new Error(`Insufficient PUNK for deployment gas. Need about ${ethers.formatEther(estimatedCost)} PUNK, current balance ${ethers.formatEther(balance)} PUNK.`)
      }
    }

    const factory = new ethers.ContractFactory(
      UpgradeableCounterV2Artifact.abi,
      UpgradeableCounterV2Artifact.bytecode,
      signer
    )
    const implementation = await factory.deploy({
      gasLimit: (gasEstimate * 120n) / 100n,
      ...(gasPrice > 0n ? { gasPrice } : {})
    })
    await implementation.waitForDeployment()

    upgradeForm.newImplementation = await implementation.getAddress()
    message.success(`New V2 implementation deployed: ${shortAddress(upgradeForm.newImplementation)}`)
  } catch (err) {
    console.error(err)
    message.error(`Deploy failed: ${err.shortMessage || err.reason || err.message}`)
  } finally {
    isDeployingImplementation.value = false
  }
}

const handleCreateUpgradeProposal = async () => {
  isCreating.value = true
  try {
    syncUpgradeCallData()
    if (!ethers.isAddress(upgradeForm.proxy)) throw new Error('Invalid proxy address')
    if (!ethers.isAddress(upgradeForm.newImplementation)) throw new Error('Invalid implementation address')
    if (!upgradeForm.callData || !upgradeForm.callData.startsWith('0x')) throw new Error('Call data must be hex')

    const upgradeGovernance = await getUpgradeGovernanceWriteContract()
    if (!upgradeGovernance) return

    const tx = await upgradeGovernance.proposeUpgrade(
      upgradeForm.proxy,
      upgradeForm.newImplementation,
      upgradeForm.callData,
      upgradeForm.description
    )
    await tx.wait()

    await fetchUpgradeProposals()
    message.success('Upgrade proposal created successfully')
    isUpgradeModalVisible.value = false
  } catch (err) {
    console.error(err)
    message.error(`Failed to create upgrade proposal: ${err.shortMessage || err.reason || err.message}`)
  } finally {
    isCreating.value = false
  }
}

const fetchParameterProposals = async () => {
  isLoadingTable.value = true
  try {
    const provider = new ethers.JsonRpcProvider(PARAMETER_RPC_URL)
    const paramRegistry = new ethers.Contract(parameterDeployedData.paramRegistry, ParameterRegistryArtifact.abi, provider)

    const count = await paramRegistry.proposalCount()
    const totalProposals = Number(count)
    const proposalIds = Array.from({ length: totalProposals }, (_, i) => totalProposals - i)

    const rows = await Promise.all(proposalIds.map(async (id) => {
      const [p, details] = await Promise.all([
        paramRegistry.getProposalBasic(id),
        paramRegistry.getProposalDetails(id)
      ])

      const paramInfo = await paramRegistry.getParameter(p.parameterId)
      const categoryString = ethers.decodeBytes32String(paramInfo.category)

      let decodedValue = 'Unknown'
      try {
        decodedValue = ethers.AbiCoder.defaultAbiCoder().decode(['uint256'], details.newValue)[0].toString()
      } catch (e) {
        console.error('Failed to decode newValue', e)
      }

      const total = details.forVotes + details.againstVotes

      return {
        key: p.id.toString(),
        proposal: `Upgrade ${paramInfo.name} to ${decodedValue} for ${categoryString} zone`,
        state: STATE_MAPPING[Number(p.state)],
        dueDate: formatDate(details.endTime),
        votesFor: formatVotes(details.forVotes),
        votesAgainst: formatVotes(details.againstVotes),
        totalVotes: formatVotes(total),
        description: p.description
      }
    }))

    parameterData.value = rows
    parameterTotal.value = totalProposals
  } catch (error) {
    console.error('Failed to load parameter proposals:', error)
    message.error('Failed to load parameter governance data')
  } finally {
    isLoadingTable.value = false
  }
}

const fetchRegisteredProxies = async () => {
  const upgradeGovernance = getUpgradeGovernanceReadContract()
  const proxies = await upgradeGovernance.getAllRegisteredProxies()

  registeredProxyOptions.value = await Promise.all(proxies.map(async (proxy) => {
    const info = await upgradeGovernance.getUpgradeableContract(proxy)
    const name = info.name || info[1]
    const level = Number(info.level ?? info[2])
    return {
      value: proxy,
      label: `${name} - ${LEVEL_MAPPING[level]} - ${shortAddress(proxy)}`
    }
  }))
}

const fetchUpgradeProposals = async () => {
  isLoadingTable.value = true
  try {
    const upgradeGovernance = getUpgradeGovernanceReadContract()
    await fetchRegisteredProxies()

    const count = await upgradeGovernance.proposalCount()
    const totalProposals = Number(count)
    const proposalIds = Array.from({ length: totalProposals }, (_, i) => totalProposals - i)

    const rows = await Promise.all(proposalIds.map(async (id) => {
      const [basic, details, upgrade] = await Promise.all([
        upgradeGovernance.getProposalBasic(id),
        upgradeGovernance.getProposalDetails(id),
        upgradeGovernance.getProposalUpgrade(id)
      ])

      let proxyName = 'Registered Proxy'
      let level = 0
      let category = 'unknown'
      try {
        const info = await upgradeGovernance.getUpgradeableContract(basic.proxy)
        proxyName = info.name || info[1]
        level = Number(info.level ?? info[2])
        category = ethers.decodeBytes32String(info.category ?? info[3])
      } catch (e) {
        console.warn('Failed to load proxy metadata', e)
      }

      return {
        key: basic.id.toString(),
        proposal: `${proxyName} upgrade to ${shortAddress(upgrade.newImplementation)}`,
        state: STATE_MAPPING[Number(basic.state)],
        proxy: shortAddress(basic.proxy),
        proxyAddress: basic.proxy,
        implementation: shortAddress(upgrade.newImplementation),
        implementationAddress: upgrade.newImplementation,
        dueDate: formatDate(details.endTime),
        votesFor: formatVotes(details.forVotes),
        votesAgainst: formatVotes(details.againstVotes),
        totalVotes: formatVotes(details.forVotes + details.againstVotes),
        description: basic.description,
        level: LEVEL_MAPPING[level],
        category,
        threshold: formatBps(basic.requiredThreshold)
      }
    }))

    upgradeData.value = rows
    upgradeTotal.value = totalProposals
  } catch (error) {
    console.error('Failed to load upgrade proposals:', error)
    message.error('Failed to load contract upgrade governance data')
  } finally {
    isLoadingTable.value = false
  }
}

const fetchActiveProposals = async () => {
  if (activeGovernance.value === 'parameter') {
    await fetchParameterProposals()
  } else {
    await fetchUpgradeProposals()
  }
}

const goToDetail = (id) => {
  router.push(`/proposal/${activeGovernance.value}/${id}`)
}

onMounted(async () => {
  await fetchParameterProposals()
  await fetchUpgradeProposals()
})
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
.prepare-network-btn {
  margin-top: 12px;
  border-radius: 6px;
  font-weight: 700;
}
.manual-network {
  margin-top: 12px;
  padding: 12px;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
  background: #ffffff;
}
.manual-network__title {
  font-size: 13px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
}
.manual-network__grid {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 6px 12px;
  font-size: 12px;
  color: #6b7280;
}
.manual-network__grid strong {
  color: #111827;
  font-weight: 700;
  overflow-wrap: anywhere;
}
.implementation-tools {
  display: flex;
  gap: 12px;
  margin: -2px 0 20px;
}
.tool-btn {
  border-radius: 6px;
  font-weight: 600;
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
.canceled,
.cancelled {
  border: 1px solid #d1d5db;
  color: #6b7280;
}
.canceled .dot,
.cancelled .dot { background-color: #6b7280; }
.defeated {
  border: 1px solid #fecaca;
  color: #dc2626;
}
.defeated .dot { background-color: #dc2626; }
.pending {
  border: 1px solid #fde68a;
  color: #d97706;
}
.pending .dot { background-color: #d97706; }

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




