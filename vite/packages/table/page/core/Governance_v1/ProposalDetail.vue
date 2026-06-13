<template>
  <div class="governance-page-shell">
    <div class="proposal-detail-container">
      <div class="top-actions">
        <a-button class="action-btn go-back" @click="goBack">
          <template #icon><ArrowLeftOutlined /></template>
          Go Back
        </a-button>
        <div class="right-links">
          <a-button class="action-btn link-btn">
            Snapshot <ExportOutlined class="link-icon" />
          </a-button>
          <a-button class="action-btn link-btn">
            Discussion Forum <ExportOutlined class="link-icon" />
          </a-button>
        </div>
      </div>

      <a-row :gutter="24" class="main-grid">
        <a-col :xs="24" :lg="14">
          <div class="detail-card left-card">
            <div class="card-header">
              <h2>Proposal Overview</h2>
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
                  <div class="value address-link">
                    {{ proposerShort }} <ExportOutlined class="addr-icon" />
                  </div>
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

              <div class="content-section pre-line">
                <div class="label text-faint">Full Description</div>
                <p class="description-text">{{ descriptionInfo }}</p>
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
                <span class="label text-faint">Voting Power</span>
                <span class="value text-bold">{{ remainingVotingPower }}</span>
              </div>

              <div class="vote-buttons">
                <a-button class="vote-btn btn-for" :disabled="proposalState !== 'Active'" @click="handleVote(true)">
                  <template #icon><LikeOutlined /></template>
                  Vote For
                </a-button>
                <a-button class="vote-btn btn-against" :disabled="proposalState !== 'Active'" @click="handleVote(false)">
                  <template #icon><DislikeOutlined /></template>
                  Vote Against
                </a-button>
              </div>

              <div v-if="proposalState !== 'Active'" class="hint-text">
                Voting is currently disabled. You can only vote when the proposal is in the Active state.
              </div>

              <div class="divider"></div>

              <div class="delegate-section">
                <div class="delegate-text">
                  <div class="delegate-title text-bold">Delegate your power</div>
                  <div class="delegate-desc text-faint">Give another person your voting power</div>
                </div>
                <a-button class="delegate-btn">Delegate</a-button>
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
                  <div class="stat-label text-faint">
                    Quorum
                    <a-tooltip
                      color="#ffffff"
                      :overlayInnerStyle="{ color: '#6b7280', fontSize: '12px', fontFamily: 'system-ui, -apple-system, sans-serif', lineHeight: '1.5', border: '1px solid #e5e7eb', padding: '8px 12px', borderRadius: '6px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }"
                      title="Minimum participation required for a proposal to be valid.">
                      <InfoCircleOutlined class="info-icon" />
                    </a-tooltip>
                  </div>
                  <div class="stat-value text-bold">1000 Voters</div>
                </div>
                <div class="stat-row">
                  <div class="stat-label text-faint">
                    Target Votes
                    <a-tooltip
                      color="#ffffff"
                      :overlayInnerStyle="{ color: '#6b7280', fontSize: '12px', fontFamily: 'system-ui, -apple-system, sans-serif', lineHeight: '1.5', border: '1px solid #e5e7eb', padding: '8px 12px', borderRadius: '6px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }"
                      title="Required approval threshold based on governance level.">
                      <InfoCircleOutlined class="info-icon" />
                    </a-tooltip>
                  </div>
                  <div class="stat-value text-bold">100k</div>
                </div>
                <div class="stat-row">
                  <div class="stat-label text-faint">Current Votes</div>
                  <div class="stat-value text-bold">{{ currentVotes.toLocaleString() }}</div>
                </div>
                <div class="stat-row">
                  <div class="stat-label text-faint">Total Voting Power</div>
                  <div class="stat-value text-bold">10,000,000</div>
                </div>
              </div>

              <div class="execute-action">
                <a-button
                  type="primary"
                  block
                  size="large"
                  class="execute-btn"
                  :disabled="proposalState !== 'Succeeded'"
                  @click="executeProposal"
                >
                  Execute Proposal
                </a-button>
                <div v-if="proposalState !== 'Succeeded'" class="hint-text center">
                  Execution is only available for proposals in the Succeeded state.
                </div>
              </div>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { useProposalStore } from './store/governance'
import {
  getDeploymentStatus,
  getParameterRegistryWriteContract
} from './services/chainContracts'
import { connectGovernanceWallet, getGovernanceSigner } from './services/walletConnect'
import {
  ArrowLeftOutlined,
  ExportOutlined,
  LikeOutlined,
  DislikeOutlined,
  InfoCircleOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()
const store = useProposalStore()
const currentProposalId = computed(() => Number(route.params.id))
const deploymentStatus = computed(() => getDeploymentStatus())

const goBack = () => {
  router.push({ name: 'GovernanceProposals' })
}

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

const proposalOverview = computed(() => store.getProposalListById(currentProposalId.value) || {})
const proposal = computed(() => store.getProposalById(currentProposalId.value) || {})
const proposalState = computed(() => normalizeState(proposalOverview.value.status))
const votesFor = computed(() => Number(proposalOverview.value.yesVotes || 0))
const votesAgainst = computed(() => Number(proposalOverview.value.noVotes || 0))
const currentVotes = computed(() => votesFor.value + votesAgainst.value)
const percentFor = computed(() => currentVotes.value === 0 ? 0 : Number(((votesFor.value / currentVotes.value) * 100).toFixed(2)))
const percentAgainst = computed(() => currentVotes.value === 0 ? 0 : Number(((votesAgainst.value / currentVotes.value) * 100).toFixed(2)))

const proposalTitle = computed(() => proposalOverview.value.title || `Proposal #${currentProposalId.value}`)
const descriptionInfo = computed(() => proposal.value.upgradeParameter || proposalOverview.value.title || 'No description provided.')
const summaryText = computed(() => {
  const text = descriptionInfo.value
  const firstDot = text.indexOf('.')
  return firstDot !== -1 ? text.substring(0, firstDot + 1) : text
})

const formatDateTime = (raw) => {
  if (!raw) return 'TBD'
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return raw
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const createdDateObj = computed(() => formatDateTime(proposal.value.createdTime || proposal.value.startTime))
const endTimeStr = computed(() => formatDateTime(proposal.value.endTime))
const proposerShort = computed(() => {
  const proposer = proposal.value.proposer || store.userInfo.address || ''
  if (!proposer) return '0x000...00000'
  return proposer.length > 14 ? `${proposer.slice(0, 6)}...${proposer.slice(-5)}` : proposer
})

const remainingVotingPower = computed(() => {
  const userProposal = store.userInfo.proposals.find((item) => item.id === currentProposalId.value)
  if (!userProposal) return store.userInfo.cgi
  return Math.max(0, store.userInfo.cgi - userProposal.yes - userProposal.no)
})

const ensureVotingPower = () => {
  let userProposal = store.userInfo.proposals.find((item) => item.id === currentProposalId.value)
  if (!userProposal) {
    store.addVotingPower(currentProposalId.value)
    userProposal = store.userInfo.proposals.find((item) => item.id === currentProposalId.value)
  }
  return userProposal
}

const handleVote = async (support) => {
  const wallet = await connectGovernanceWallet()
  if (!wallet.address) {
    message.error('Please connect wallet first')
    return
  }

  const userProposal = ensureVotingPower()
  if (!userProposal || remainingVotingPower.value <= 0) {
    message.warning('No voting power available.')
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
      const tx = await contract.vote(currentProposalId.value, support)
      message.success(`Vote transaction sent: ${tx.hash}`)
    } catch (err) {
      message.error(err?.shortMessage || err?.message || 'Failed to submit vote transaction')
      return
    }
  }

  store.confirmVote({
    proposalId: currentProposalId.value,
    voteOption: support ? 'yes' : 'no',
    voteCount: 1
  })
  message.success(`Vote ${support ? 'for' : 'against'} submitted`)
}

const executeProposal = async () => {
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
      const tx = await contract.execute(currentProposalId.value)
      message.success(`Execution transaction sent: ${tx.hash}`)
    } catch (err) {
      message.error(err?.shortMessage || err?.message || 'Failed to execute proposal transaction')
      return
    }
  }

  const overview = store.ProposalList.find((item) => item.id === currentProposalId.value)
  if (overview) {
    overview.status = 'Executed'
  }
  if (!deploymentStatus.value.parameterReady) message.success('Proposal executed successfully')
}
</script>

<style scoped>
.governance-page-shell {
  width: 100%;
  min-height: calc(100vh - 64px);
  padding: 40px;
  background: #F8F9FB;
}

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

.divider {
  height: 1px;
  background-color: #F3F4F6;
  margin: 20px 0;
}

.top-actions {
  display: flex;
  margin-bottom: 24px;
  gap: 16px;
  justify-content: space-between;
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
.state-tag.pending,
.state-tag.created {
  background: #FFFBEB;
  color: #D97706;
  border: 1px solid #FEF3C7;
}
.state-tag.pending .dot,
.state-tag.created .dot { background-color: #D97706; }
.state-tag.cancelled,
.state-tag.canceled,
.state-tag.defeated {
  background: #FEF2F2;
  color: #EF4444;
  border: 1px solid #FEE2E2;
}
.state-tag.cancelled .dot,
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
  cursor: pointer;
}
.addr-icon {
  margin-left: 6px;
  font-size: 14px;
}

.content-section {
  margin-bottom: 24px;
}
.content-section .label {
  margin-bottom: 8px;
}
.content-section:last-child {
  margin-bottom: 0;
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

.voting-power-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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
.hint-text {
  margin-top: 12px;
  color: #DC2626;
  font-size: 13px;
}
.hint-text.center {
  text-align: center;
}

.delegate-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.delegate-title {
  margin-bottom: 2px;
  font-size: 14px;
}
.delegate-desc {
  font-size: 13px;
}
.delegate-btn {
  border-radius: 6px;
  color: #374151;
  font-weight: 500;
  height: 36px;
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
.info-icon {
  margin-left: 4px;
  font-size: 12px;
  color: #9CA3AF;
}
.stat-value {
  font-size: 14px;
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
  .governance-page-shell {
    padding: 20px;
  }
  .top-actions,
  .vote-buttons {
    flex-direction: column;
  }
}
</style>
