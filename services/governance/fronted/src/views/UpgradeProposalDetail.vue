<template>
  <div class="proposal-detail-container">
    <div class="top-actions">
      <a-button class="action-btn go-back" @click="goBack">
        <template #icon><ArrowLeftOutlined /></template>
        Go Back
      </a-button>
      <div class="right-links">
        <a-button class="action-btn link-btn" @click="refreshAll">
          Refresh <ReloadOutlined class="link-icon" />
        </a-button>
      </div>
    </div>

    <a-row :gutter="24" class="main-grid">
      <a-col :xs="24" :lg="14">
        <div class="detail-card left-card">
          <div class="card-header">
            <h2>Upgrade Proposal Overview</h2>
          </div>

          <div class="card-body">
            <div class="info-row state-row">
              <div class="state-group">
                <span class="label text-faint">State</span>
                <div :class="['state-tag', proposalState.toLowerCase()]">
                  <span class="dot"></span> {{ proposalState }}
                </div>
              </div>
              <div class="voting-end text-faint">
                Voting ends <span class="text-bold">{{ endTimeStr }}</span>
              </div>
            </div>

            <div class="info-row creator-row">
              <div class="info-block">
                <div class="label text-faint">Created</div>
                <div class="value text-bold">{{ createdDateObj }}</div>
              </div>
              <div class="info-block">
                <div class="label text-faint">Created By</div>
                <div class="value address-link">{{ proposerShort }}</div>
              </div>
            </div>

            <div class="divider"></div>

            <div class="content-section">
              <div class="label text-faint">Title</div>
              <h3 class="proposal-title text-bold">{{ proposalTitle }}</h3>
            </div>

            <div class="content-section">
              <div class="label text-faint">Summary</div>
              <p class="description-text">{{ summaryText }}</p>
            </div>

            <div class="content-section">
              <div class="label text-faint">Full Description</div>
              <p class="description-text pre-line">{{ descriptionInfo }}</p>
            </div>

            <div class="divider"></div>

            <div class="upgrade-grid">
              <div class="upgrade-field">
                <span class="label text-faint">Proxy</span>
                <span class="value mono">{{ proxyAddress }}</span>
              </div>
              <div class="upgrade-field">
                <span class="label text-faint">Contract</span>
                <span class="value text-bold">{{ proxyName }}</span>
              </div>
              <div class="upgrade-field">
                <span class="label text-faint">Level</span>
                <span class="value text-bold">{{ proxyLevel }}</span>
              </div>
              <div class="upgrade-field">
                <span class="label text-faint">Category</span>
                <span class="value text-bold">{{ proxyCategory }}</span>
              </div>
            </div>

            <div class="implementation-panel">
              <div class="implementation-row">
                <span class="label text-faint">Old Implementation</span>
                <span class="mono">{{ oldImplementation }}</span>
              </div>
              <div class="implementation-row">
                <span class="label text-faint">New Implementation</span>
                <span class="mono">{{ newImplementation }}</span>
              </div>
              <div class="implementation-row">
                <span class="label text-faint">Call Data</span>
                <span class="mono call-data">{{ readableCallData }}</span>
              </div>
            </div>
          </div>
        </div>
      </a-col>

      <a-col :xs="24" :lg="10">
        <div class="detail-card right-card voting-info">
          <div class="card-header">
            <h2>Voting Info</h2>
          </div>
          <div class="card-body">
            <div class="voting-power-row">
              <span class="label text-faint">Required Approval</span>
              <span class="value text-bold">{{ requiredThresholdLabel }}</span>
            </div>
            <div class="voting-power-row">
              <span class="label text-faint">Wallet</span>
              <span class="value text-bold">{{ walletLabel }}</span>
            </div>

            <div class="vote-buttons">
              <a-button class="vote-btn btn-for" :disabled="proposalState !== 'Active'" :loading="isVotingFor" @click="handleVote(true)">
                <template #icon><LikeOutlined /></template>
                Vote For
              </a-button>
              <a-button class="vote-btn btn-against" :disabled="proposalState !== 'Active'" :loading="isVotingAgainst" @click="handleVote(false)">
                <template #icon><DislikeOutlined /></template>
                Vote Against
              </a-button>
            </div>

            <div v-if="proposalState === 'Pending' || proposalState === 'Active'" class="hint-text">
              PunkChain uses real block time. Please wait until the voting window changes, then refresh.
            </div>

            <div v-if="proposalState !== 'Active'" class="hint-text">
              Voting is only available while the proposal is Active.
            </div>
          </div>
        </div>

        <div class="detail-card right-card voting-result">
          <div class="card-header">
            <h2>Voting Result</h2>
          </div>
          <div class="card-body">
            <div class="charts-row">
              <div class="chart-group">
                <div class="chart-box for-chart">
                  <div class="chart-label text-faint">Votes For</div>
                  <div class="chart-value text-bold">{{ votesFor.toLocaleString() }}</div>
                </div>
                <div class="chart-circle">
                  <a-progress type="circle" :percent="percentFor" :width="60" strokeColor="#10B981" class="custom-progress" />
                </div>
              </div>

              <div class="chart-group">
                <div class="chart-box against-chart">
                  <div class="chart-label text-faint">Votes Against</div>
                  <div class="chart-value against-value text-bold">{{ votesAgainst.toLocaleString() }}</div>
                </div>
                <div class="chart-circle">
                  <a-progress type="circle" :percent="percentAgainst" :width="60" strokeColor="#EF4444" class="custom-progress custom-progress-red" />
                </div>
              </div>
            </div>

            <div class="divider"></div>

            <div class="stats-list">
              <div class="stat-row">
                <div class="stat-label text-faint">Current Votes</div>
                <div class="stat-value text-bold">{{ currentVotes.toLocaleString() }}</div>
              </div>
              <div class="stat-row">
                <div class="stat-label text-faint">Approval Rate</div>
                <div class="stat-value text-bold">{{ approvalRateLabel }}</div>
              </div>
              <div class="stat-row">
                <div class="stat-label text-faint">Passing</div>
                <div class="stat-value text-bold">{{ isPassing ? 'Yes' : 'No' }}</div>
              </div>
            </div>

            <div class="execute-action">
              <a-button
                type="primary"
                block
                size="large"
                class="execute-btn"
                :disabled="proposalState !== 'Succeeded'"
                :loading="isExecuting"
                @click="executeProposal"
              >
                Execute Upgrade
              </a-button>
              <div v-if="proposalState !== 'Succeeded'" class="hint-text center">
                Execution is available after the proposal succeeds.
              </div>
            </div>
          </div>
        </div>

        <div class="detail-card right-card proxy-runtime">
          <div class="card-header">
            <h2>Proxy Runtime</h2>
          </div>
          <div class="card-body">
            <div class="stats-list">
              <div class="stat-row">
                <div class="stat-label text-faint">Version</div>
                <div class="stat-value text-bold">{{ proxyVersion }}</div>
              </div>
              <div class="stat-row">
                <div class="stat-label text-faint">Value</div>
                <div class="stat-value text-bold">{{ proxyValue }}</div>
              </div>
              <div class="stat-row">
                <div class="stat-label text-faint">Multiplier</div>
                <div class="stat-value text-bold">{{ proxyMultiplier }}</div>
              </div>
            </div>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { ethers } from 'ethers'
import UpgradeGovernanceArtifact from '../../../artifacts/contracts/UpgradeGovernance.sol/UpgradeGovernance.json'
import UpgradeableCounterV2Artifact from '../../../artifacts/contracts/mocks/UpgradeableCounterV2.sol/UpgradeableCounterV2.json'
import deployedData from '../../../scripts/contract_upgrade_process/deployed.json'
import { useWallet } from '../composables/useWallet'
import {
  ArrowLeftOutlined,
  ReloadOutlined,
  LikeOutlined,
  DislikeOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()
const { account, chainId, shortAddress: connectedShortAddress, connect, getSigner } = useWallet()

const RPC_URL = 'http://47.243.174.71:36054'
const PUNKCHAIN_CHAIN_ID = '0x1352642'
const PUNKCHAIN_NETWORK = {
  chainId: PUNKCHAIN_CHAIN_ID,
  chainName: 'PunkChain',
  nativeCurrency: { name: 'Punk', symbol: 'PUNK', decimals: 18 },
  rpcUrls: [RPC_URL],
  blockExplorerUrls: []
}
const STATE_MAPPING = ['Pending', 'Active', 'Succeeded', 'Defeated', 'Executed', 'Canceled']
const LEVEL_MAPPING = ['Application', 'System', 'Infrastructure']
const VOTING_DELAY = 60

const currentProposalId = route.params.id

const proposalState = ref('Loading')
const votesFor = ref(0)
const votesAgainst = ref(0)
const requiredThreshold = ref(0)
const forPercentageBps = ref(0)
const isPassing = ref(false)

const startTime = ref(0)
const endTime = ref(0)
const proposerInfo = ref('')
const descriptionInfo = ref('')
const proposalTitle = ref('Loading...')
const proxyAddress = ref('')
const proxyName = ref('Loading...')
const proxyLevel = ref('Loading...')
const proxyCategory = ref('Loading...')
const oldImplementation = ref('')
const newImplementation = ref('')
const callData = ref('0x')

const proxyVersion = ref('Loading...')
const proxyValue = ref('Loading...')
const proxyMultiplier = ref('Loading...')

const isVotingFor = ref(false)
const isVotingAgainst = ref(false)
const isExecuting = ref(false)

const provider = new ethers.JsonRpcProvider(RPC_URL)

const goBack = () => {
  router.push('/proposals')
}

const short = (address) => {
  if (!address || address === ethers.ZeroAddress) return '0x0000...0000'
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const createdDateObj = computed(() => {
  if (!startTime.value) return 'Loading...'
  const d = new Date((Number(startTime.value) - VOTING_DELAY) * 1000)
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

const endTimeStr = computed(() => {
  if (!endTime.value) return 'TBD'
  const d = new Date(Number(endTime.value) * 1000)
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

const summaryText = computed(() => {
  if (!descriptionInfo.value) return 'Loading...'
  const firstDot = descriptionInfo.value.indexOf('.')
  return firstDot !== -1 ? descriptionInfo.value.substring(0, firstDot + 1) : descriptionInfo.value
})

const proposerShort = computed(() => short(proposerInfo.value))
const walletLabel = computed(() => account.value ? connectedShortAddress.value : 'Not connected')
const requiredThresholdLabel = computed(() => `${(Number(requiredThreshold.value) / 100).toFixed(2)}%`)
const currentVotes = computed(() => votesFor.value + votesAgainst.value)
const percentFor = computed(() => currentVotes.value === 0 ? 0 : Number(((votesFor.value / currentVotes.value) * 100).toFixed(2)))
const percentAgainst = computed(() => currentVotes.value === 0 ? 0 : Number(((votesAgainst.value / currentVotes.value) * 100).toFixed(2)))
const approvalRateLabel = computed(() => `${(Number(forPercentageBps.value) / 100).toFixed(2)}%`)

const readableCallData = computed(() => {
  if (!callData.value || callData.value === '0x') return '0x'

  try {
    const iface = new ethers.Interface(UpgradeableCounterV2Artifact.abi)
    const parsed = iface.parseTransaction({ data: callData.value })
    if (parsed.name === 'initializeV2') {
      return `initializeV2(${parsed.args[0].toString()})`
    }
  } catch {
    // Keep raw calldata when it is not known to the V2 ABI.
  }

  return callData.value
})

const getReadContract = () => (
  new ethers.Contract(deployedData.upgradeGovernance, UpgradeGovernanceArtifact.abi, provider)
)

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

const getWriteContract = async () => {
  const onPunkChain = await ensurePunkChainNetwork()
  if (!onPunkChain) return null

  let signer = await getSigner()
  if (!signer) {
    const connected = await connect()
    if (!connected) return null
    signer = await getSigner()
  }

  return new ethers.Contract(deployedData.upgradeGovernance, UpgradeGovernanceArtifact.abi, signer)
}

const fetchProposalData = async () => {
  try {
    const upgradeGovernance = getReadContract()

    const [basic, details, upgrade, voting] = await Promise.all([
      upgradeGovernance.getProposalBasic(currentProposalId),
      upgradeGovernance.getProposalDetails(currentProposalId),
      upgradeGovernance.getProposalUpgrade(currentProposalId),
      upgradeGovernance.getVotingResults(currentProposalId)
    ])

    proposalState.value = STATE_MAPPING[Number(basic.state)]
    proposerInfo.value = basic.proposer
    descriptionInfo.value = basic.description
    proxyAddress.value = basic.proxy
    requiredThreshold.value = Number(basic.requiredThreshold)

    callData.value = details.callData
    startTime.value = Number(details.startTime)
    endTime.value = Number(details.endTime)
    votesFor.value = Number(ethers.formatEther(details.forVotes))
    votesAgainst.value = Number(ethers.formatEther(details.againstVotes))

    oldImplementation.value = upgrade.oldImplementation
    newImplementation.value = upgrade.newImplementation
    forPercentageBps.value = Number(voting.forPercentage)
    isPassing.value = voting.isPassing

    const proxyInfo = await upgradeGovernance.getUpgradeableContract(basic.proxy)
    proxyName.value = proxyInfo.name
    proxyLevel.value = LEVEL_MAPPING[Number(proxyInfo.level)]
    proxyCategory.value = ethers.decodeBytes32String(proxyInfo.category)
    proposalTitle.value = `${proxyInfo.name} upgrade to ${short(upgrade.newImplementation)}`
  } catch (error) {
    console.error('Failed fetching upgrade proposal:', error)
    message.error(`Failed to load upgrade proposal: ${error.shortMessage || error.reason || error.message}`)
  }
}

const fetchProxyRuntime = async () => {
  if (!proxyAddress.value) return

  try {
    const proxy = new ethers.Contract(proxyAddress.value, UpgradeableCounterV2Artifact.abi, provider)

    const [version, value] = await Promise.all([
      proxy.version(),
      proxy.value()
    ])

    proxyVersion.value = version
    proxyValue.value = value.toString()

    try {
      const multiplier = await proxy.multiplier()
      proxyMultiplier.value = multiplier.toString()
    } catch {
      proxyMultiplier.value = 'Unavailable'
    }
  } catch (error) {
    console.warn('Failed to load proxy runtime:', error)
    proxyVersion.value = 'Unavailable'
    proxyValue.value = 'Unavailable'
    proxyMultiplier.value = 'Unavailable'
  }
}

const refreshAll = async () => {
  await fetchProposalData()
  await fetchProxyRuntime()
}

const handleVote = async (support) => {
  if (support) {
    isVotingFor.value = true
  } else {
    isVotingAgainst.value = true
  }

  try {
    const upgradeGovernance = await getWriteContract()
    if (!upgradeGovernance) return

    const tx = await upgradeGovernance.vote(currentProposalId, support)
    await tx.wait()

    message.success(`Vote ${support ? 'for' : 'against'} submitted`)
    await refreshAll()
  } catch (error) {
    console.error('Vote failed:', error)
    message.error(`Vote failed: ${error.shortMessage || error.reason || error.message}`)
  } finally {
    isVotingFor.value = false
    isVotingAgainst.value = false
  }
}

const executeProposal = async () => {
  isExecuting.value = true

  try {
    const upgradeGovernance = await getWriteContract()
    if (!upgradeGovernance) return

    const tx = await upgradeGovernance.executeUpgrade(currentProposalId)
    await tx.wait()

    message.success('Upgrade executed successfully')
    await refreshAll()
  } catch (error) {
    console.error('Execution failed:', error)
    message.error(`Execution failed: ${error.shortMessage || error.reason || error.message}`)
  } finally {
    isExecuting.value = false
  }
}


onMounted(refreshAll)
</script>

<style scoped>
.proposal-detail-container {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
}

.text-faint {
  color: #6B7280;
  font-size: 14px;
}
.text-bold {
  color: #111827;
  font-weight: 600;
}
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  color: #374151;
  overflow-wrap: anywhere;
}
.divider {
  height: 1px;
  background-color: #F3F4F6;
  margin: 20px 0;
}

.top-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 16px;
}
.right-links {
  display: flex;
  gap: 16px;
}
.action-btn {
  height: 40px;
  border-radius: 6px;
  border: 1px solid #E5E7EB;
  color: #374151;
  font-weight: 500;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
}
.link-btn .link-icon {
  margin-left: 8px;
  color: #6B7280;
  font-size: 14px;
}

.detail-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #F3F4F6;
  margin-bottom: 24px;
  overflow: hidden;
}
.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid #F3F4F6;
}
.card-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}
.card-body {
  padding: 24px;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}
.state-row {
  gap: 20px;
  flex-wrap: wrap;
}
.state-group {
  display: flex;
  align-items: center;
  gap: 12px;
}
.state-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
}
.state-tag .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 6px;
}
.state-tag.active {
  background: #EEF2FF;
  color: #4F46E5;
  border: 1px solid #E0E7FF;
}
.state-tag.active .dot { background-color: #4F46E5; }
.state-tag.succeeded {
  background: #ECFDF5;
  color: #10B981;
  border: 1px solid #D1FAE5;
}
.state-tag.succeeded .dot { background-color: #10B981; }
.state-tag.executed {
  background: #FFFFFF;
  color: #009ACD;
  border: 1px solid #8EE5EE;
}
.state-tag.executed .dot { background-color: #009ACD; }
.state-tag.pending {
  background: #FFFBEB;
  color: #D97706;
  border: 1px solid #FEF3C7;
}
.state-tag.pending .dot { background-color: #D97706; }
.state-tag.canceled,
.state-tag.defeated {
  background: #FEF2F2;
  color: #EF4444;
  border: 1px solid #FEE2E2;
}
.state-tag.canceled .dot,
.state-tag.defeated .dot { background-color: #EF4444; }

.creator-row {
  gap: 60px;
  flex-wrap: wrap;
}
.info-block .label {
  margin-bottom: 4px;
}
.info-block .value {
  font-size: 15px;
}
.address-link {
  color: #4F46E5 !important;
  display: flex;
  align-items: center;
}

.content-section {
  margin-bottom: 24px;
}
.content-section .label {
  margin-bottom: 8px;
}
.proposal-title {
  font-size: 16px;
  margin: 0;
}
.description-text {
  font-size: 15px;
  line-height: 1.6;
  color: #374151;
  margin: 0;
}
.pre-line {
  white-space: pre-wrap;
}

.upgrade-grid {
  display: grid;
  grid-template-columns: 1.25fr 0.85fr;
  gap: 16px;
}
.upgrade-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px;
  background: #F9FAFB;
  border: 1px solid #F3F4F6;
  border-radius: 8px;
}
.implementation-panel {
  margin-top: 18px;
  border: 1px solid #F3F4F6;
  border-radius: 8px;
  overflow: hidden;
}
.implementation-row {
  display: grid;
  grid-template-columns: 160px minmax(0, 1fr);
  gap: 14px;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #F3F4F6;
}
.implementation-row:last-child {
  border-bottom: none;
}
.call-data {
  max-height: 84px;
  overflow: auto;
}

.voting-power-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
}
.vote-buttons {
  display: flex;
  gap: 12px;
}
.vote-btn {
  flex: 1;
  height: 40px;
  border-radius: 6px;
  font-weight: 600;
  display: flex;
  justify-content: center;
  align-items: center;
}
.btn-for {
  color: #10B981;
  border: 1px solid #10B981;
  background: #F0FDF4;
}
.btn-against {
  color: #EF4444;
  border: 1px solid #EF4444;
  background: #FEF2F2;
}
.local-tools {
  margin-top: 14px;
}
.tool-btn {
  border-radius: 6px;
  font-weight: 600;
}
.hint-text {
  margin-top: 12px;
  color: #DC2626;
  font-size: 13px;
}
.hint-text.center {
  text-align: center;
}

.charts-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}
.chart-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.chart-box {
  display: flex;
  flex-direction: column;
  gap: 2px;
  white-space: nowrap;
}
.chart-label {
  font-size: 13px;
}
.chart-value {
  font-size: 16px;
}
.against-value {
  color: #EF4444;
}
.chart-circle {
  display: flex;
  align-items: center;
}
:deep(.custom-progress .ant-progress-text) {
  color: #10B981;
  font-weight: 600;
  font-size: 13px !important;
}
:deep(.custom-progress-red .ant-progress-text) {
  color: #EF4444;
  font-size: 13px !important;
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}
.stat-value {
  font-size: 14px;
  text-align: right;
}
.execute-action {
  margin-top: 24px;
}
.execute-btn {
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
}
.execute-btn.ant-btn-primary:not([disabled]) {
  background: #7370DC;
  border: none;
  box-shadow: none;
}
.execute-btn.ant-btn-primary:not([disabled]):hover {
  transform: translateY(-1px);
  background: #8481E6;
  box-shadow: 0 4px 10px rgba(115, 112, 220, 0.2);
  color: #fff;
}
.execute-btn.ant-btn-primary:not([disabled]):active {
  transform: translateY(1px);
  box-shadow: none;
}

@media (max-width: 980px) {
  .top-actions,
  .vote-buttons,
  .implementation-row {
    flex-direction: column;
  }
  .implementation-row {
    display: flex;
    align-items: flex-start;
  }
  .upgrade-grid {
    grid-template-columns: 1fr;
  }
}
</style>



