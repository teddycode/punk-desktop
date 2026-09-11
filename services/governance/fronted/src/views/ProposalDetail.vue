<template>
  <div class="proposal-detail-container">
    <!-- Top Actions -->
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

    <!-- Layout Grid -->
    <a-row :gutter="24" class="main-grid">
      <!-- Left Column: Overview -->
      <a-col :span="14">
        <div class="detail-card left-card">
          <div class="card-header">
            <h2>Proposal Overview</h2>
          </div>
          
          <div class="card-body">
            <!-- State Row -->
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

            <!-- Creator Row -->
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

            <!-- Content Sections -->
            <div class="content-section">
              <div class="label text-faint">Title</div>
              <h3 class="proposal-title text-bold">{{ proposalTitle }}</h3>
            </div>

            <div class="content-section">
              <div class="label text-faint">Summary</div>
              <p class="description-text">
                {{ summaryText }}
              </p>
            </div>

            <div class="content-section" style="white-space: pre-wrap;">
              <div class="label text-faint">Full Description</div>
              <p class="description-text">
                {{ descriptionInfo }}
              </p>
            </div>
          </div>
        </div>
      </a-col>

      <!-- Right Column: Info & Results -->
      <a-col :span="10">
        <!-- Voting Info Card -->
        <div class="detail-card right-card voting-info">
          <div class="card-header">
            <h2>Voting Info</h2>
          </div>
          <div class="card-body">
            <div class="voting-power-row">
              <span class="label text-faint">Voting Power</span>
              <span class="value text-bold">1150</span>
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
            
            <div v-if="proposalState !== 'Active'" style="margin-top: 12px; color: #DC2626; font-size: 13px;">
              * Voting is currently disabled. You can only vote when the proposal is in the Active state. 
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

        <!-- Voting Result Card -->
        <div class="detail-card right-card voting-result">
          <div class="card-header">
            <h2>Voting Result</h2>
          </div>
          <div class="card-body">
            <!-- Charts Row -->
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
              
              <!-- <div class="chart-divider"></div> -->

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

            <!-- Stats List -->
            <div class="stats-list">
              <div class="stat-row">
                  <div class="stat-label text-faint">
                    Quorum 
                    <a-tooltip 
                      color="#ffffff" 
                        :overlayInnerStyle="{ color: '#6b7280', fontSize: '12px', fontFamily: 'system-ui, -apple-system, sans-serif', lineHeight: '1.5', border: '1px solid #e5e7eb', padding: '8px 12px', borderRadius: '6px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }" 
                        title="Minimum participation required for a proposal to be valid. (Currently no strict minimum enforced)">
                        <InfoCircleOutlined class="info-icon" style="margin-left: 4px;" />
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
                        title="Required approval threshold based on parameter level (66.67%, 75%, or 80%).">
                        <InfoCircleOutlined class="info-icon" style="margin-left: 4px;" />
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

            <div class="execute-action" style="margin-top: 24px;">
              <a-button 
                type="primary" 
                block 
                size="large" 
                class="execute-btn" 
                :disabled="proposalState !== 'Succeeded'"
                :loading="isExecuting"
                @click="executeProposal"
              >
                Execute Proposal
              </a-button>
              <div v-if="proposalState !== 'Succeeded'" style="margin-top: 12px; color: #DC2626; font-size: 13px; text-align: center;">
                * Execution is only available for proposals in the Succeeded state.
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
import ParameterRegistryArtifact from '../../../artifacts/contracts/ParameterRegistry.sol/ParameterRegistry.json'
import deployedData from '../../../scripts/upgrade_process/deployed.json'
import parameterMapData from '../../../scripts/parameter-id-map.json'
import {
  ArrowLeftOutlined,
  ExportOutlined,
  LikeOutlined,
  DislikeOutlined,
  InfoCircleOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()

const goBack = () => {
  router.push('/proposals')
}

const currentProposalId = route.params.id

// Reactive real data
const proposalState = ref('Loading...')
const votesFor = ref(0)
const votesAgainst = ref(0)
const isExecuting = ref(false)

const creationTime = ref(0)
const endTime = ref(0)
const proposerInfo = ref('')
const descriptionInfo = ref('')
const proposalTitle = ref('Loading...')

const STATE_MAPPING = [
  'Pending', 'Active', 'Succeeded', 'Defeated', 'Executed', 'Canceled'
]

const createdDateObj = computed(() => {
  if (!creationTime.value) return 'Loading...';
  const d = new Date((Number(creationTime.value) - 60) * 1000); // subtract VOTING_DELAY
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
})

const endTimeStr = computed(() => {
  if (!endTime.value) return 'TBD';
  const d = new Date(Number(endTime.value) * 1000);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
})

const summaryText = computed(() => {
  if (!descriptionInfo.value) return 'Loading...';
  const firstDot = descriptionInfo.value.indexOf('.');
  return firstDot !== -1 ? descriptionInfo.value.substring(0, firstDot + 1) : descriptionInfo.value;
})

const proposerShort = computed(() => {
  if (!proposerInfo.value) return '0x000...00000';
  return proposerInfo.value.slice(0, 5) + '...' + proposerInfo.value.slice(-5);
})

const PK_DEPLOYER = "eeefa7075d12e965851eef8e2622377d480f8b9c99c30cb615cf222b699b491f";
const PK_VOTERS = [
  "9f888cbab2e7f4f12686549fba9c4f02b4c7a08ba4cc3c42e23c680c3c578673",
  "4bf042614763727e04b87367b405a247135ffe47179f665c46bb2849769c924e",
  "36d967b08835247d851bf0b07428d6a47cf2ea7b2053b65450c4259145099e10",
  "6f08641dc5dd53849fd3e2c07224f9f1e086dd926aa751687a1afa2a01a6e2a6",
  "fc53bf98cf0a07884886cee6e4b56550dc367d124b88276db53138da93ec0bbd"
];
const PK_EXECUTOR = "d2cd72b2d16b4a0f7ea0689c9021a590638cb0bee6c39c4de52b5f363a0477a2";
const RPC_URL = "http://47.243.174.71:36054";

const currentVoterIndex = ref(0);
const isVotingFor = ref(false);
const isVotingAgainst = ref(false);

const handleVote = async (support) => {
  if (currentVoterIndex.value >= PK_VOTERS.length) {
    message.warning('All test voters have finished voting!');
    return;
  }
  if (support) {
    isVotingFor.value = true;
  } else {
    isVotingAgainst.value = true;
  }
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const voterWallet = new ethers.Wallet(PK_VOTERS[currentVoterIndex.value], provider);
    const paramRegistry = new ethers.Contract(deployedData.paramRegistry, ParameterRegistryArtifact.abi, voterWallet);
    
    const tx = await paramRegistry.vote(currentProposalId, support);
    await tx.wait();
    
    // message.success(`测试节点 (Voter ${currentVoterIndex.value + 1}) 投了${support ? '赞成' : '反对'}票！`);
    message.success(`Vote cast successfully by Voter ${currentVoterIndex.value + 1} (${support ? 'For' : 'Against'})!`);
    currentVoterIndex.value++;
    
    // 重新获取数据以更新投票统计
    await fetchProposalData();
  } catch (error) {
    console.error("投票过程出错:", error);
    // message.error("投票失败: " + (error.reason || error.message));
    message.error("Vote failed: " + (error.reason || error.message));
  } finally {
    isVotingFor.value = false;
    isVotingAgainst.value = false;
  }
};

const fetchProposalData = async () => {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL)
    const paramRegistry = new ethers.Contract(deployedData.paramRegistry, ParameterRegistryArtifact.abi, provider)
    
    if(!currentProposalId) return;

    const basic = await paramRegistry.getProposalBasic(currentProposalId)
    const details = await paramRegistry.getProposalDetails(currentProposalId)
    
    proposalState.value = STATE_MAPPING[Number(basic.state)]
    descriptionInfo.value = basic.description
    proposerInfo.value = basic.proposer
    
    creationTime.value = details.startTime
    endTime.value = details.endTime
    votesFor.value = Number(ethers.formatEther(details.forVotes))
    votesAgainst.value = Number(ethers.formatEther(details.againstVotes))

    let pTitle = basic.description;
    try {
      if (basic.parameterId) {
        const paramInfo = await paramRegistry.getParameter(basic.parameterId)
        if (paramInfo.isRegistered) {
          const categoryObjStr = ethers.decodeBytes32String(paramInfo.category)
          const decodedNewValueStr = ethers.AbiCoder.defaultAbiCoder().decode(["uint256"], details.newValue)[0].toString()
          pTitle = `Upgrade ${paramInfo.name} to ${decodedNewValueStr} for ${categoryObjStr} zone`
        }
      }
    } catch (e) {
      console.warn("Could not decode templated title", e)
    }
    proposalTitle.value = pTitle || `Proposal #${basic.id}`

  } catch (error) {
    console.error("Failed fetching proposal details:", error)
  }
}

onMounted(() => {
  fetchProposalData()
})

const executeProposal = async () => {
  if (proposalState.value === 'Succeeded') {
    isExecuting.value = true;
    try {
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const executor = new ethers.Wallet(PK_EXECUTOR, provider);
      
      const paramRegistry = new ethers.Contract(deployedData.paramRegistry, ParameterRegistryArtifact.abi, executor);

      console.log(`执行提案: ${currentProposalId}...`);
      const executeTx = await paramRegistry.execute(currentProposalId);
      const receipt = await executeTx.wait();
      console.log("✅ 提案已在链上执行成功!");

      // 检索执行结果并组装离线执行区负载 (Payload)
      const filter = paramRegistry.filters.ProposalExecuted(currentProposalId);
      const events = await paramRegistry.queryFilter(filter, receipt.blockNumber, receipt.blockNumber);
      
      if (events.length > 0) {
        const evt = events[0];
        const eventArgs = evt.args;
        
        let normalizedMap = {};
        for (const [k, v] of Object.entries(parameterMapData)) {
          normalizedMap[k.toLowerCase()] = v;
        }
        
        const pIdHex = eventArgs.parameterId.toLowerCase();
        const meta = normalizedMap[pIdHex] || { name: 'unknown', valueType: 'uint256', zone: 'unknown' };
        
        const abiCoder = ethers.AbiCoder.defaultAbiCoder();
        const decodedOld = abiCoder.decode(["uint256"], eventArgs.oldValue)[0].toString();
        const decodedNew = abiCoder.decode(["uint256"], eventArgs.newValue)[0].toString();

        const block = await provider.getBlock(receipt.blockNumber);
        const network = await provider.getNetwork();

        const payload = {
          proposalId: eventArgs.proposalId.toString(),
          parameterId: pIdHex,
          parameterName: meta.name,
          zone: meta.zone,
          valueType: meta.valueType,
          oldValue: { rawHex: eventArgs.oldValue, decoded: decodedOld },
          newValue: { rawHex: eventArgs.newValue, decoded: decodedNew },
          chainId: Number(network.chainId),
          blockNumber: receipt.blockNumber,
          blockHash: receipt.blockHash,
          txHash: receipt.hash,
          logIndex: evt.index,
          executedAt: new Date(Number(block.timestamp) * 1000).toISOString(),
          effectiveHeight: receipt.blockNumber + 100000
        };
        
        console.log("-----------------------------------------");
        console.log("🌐 发往执行区 (RPC) 的 Payload:");
        console.log(JSON.stringify(payload, null, 2));

        try {
          const resp = await fetch(RPC_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: Date.now(),
              method: "governance_applyParameterUpdate",
              params: [payload]
            })
          });
          const text = await resp.text();
          console.log("⬇️ 执行区 (RPC) 响应内容:");
          console.log(text);
          console.log("✅ 下发至 Python Executor 的接口调用完成");
        } catch (e) {
          console.error("❌ RPC 请求失败:", e);
        }
        console.log("-----------------------------------------");
      } else {
        console.log("⚠️ 未检索到 ProposalExecuted 事件记录");
      }
      
      proposalState.value = 'Executed';
      message.success('Proposal executed successfully and notified to the execution zone!');
      await fetchProposalData();
    } catch (e) {
      console.error(e);
      message.error('Execution failed: ' + (e.reason || e.message));
    } finally {
      isExecuting.value = false;
    }
  }
}

// Dynamically compute derived stats and percentages based on the vote count
const currentVotes = computed(() => votesFor.value + votesAgainst.value)

const percentFor = computed(() => {
  if (currentVotes.value === 0) return 0
  return Number(((votesFor.value / currentVotes.value) * 100).toFixed(2))
})

const percentAgainst = computed(() => {
  if (currentVotes.value === 0) return 0
  return Number(((votesAgainst.value / currentVotes.value) * 100).toFixed(2))
})
</script>

<style scoped>
.proposal-detail-container {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
}

/* Typography Helpers */
.text-faint {
  color: #6B7280;
  font-size: 14px;
}
.text-bold {
  color: #111827;
  font-weight: 600;
}

/* Divider */
.divider {
  height: 1px;
  background-color: #F3F4F6;
  margin: 20px 0;
}

/* Top Actions */
.top-actions {
  display: flex;
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

/* Cards */
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

/* Left Card Details */
.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}
.state-row {
  gap: 20px;
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
.state-tag.active {
  background: #EEF2FF;
  color: #4F46E5;
  border: 1px solid #E0E7FF;
}
.state-tag .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 6px;
}
.state-tag.active .dot {
  background-color: #4F46E5;
}
.state-tag.succeeded {
  background: #ECFDF5;
  color: #10B981;
  border: 1px solid #D1FAE5;
}
.state-tag.succeeded .dot {
  background-color: #10B981;
}
.state-tag.executed {
  background: #FFFFFF;
  color: #009ACD;
  border: 1px solid #8EE5EE;
}
.state-tag.executed .dot {
  background-color: #009ACD;
}
.state-tag.pending {
  background: #FFFBEB;
  color: #D97706;
  border: 1px solid #FEF3C7;
}
.state-tag.pending .dot {
  background-color: #D97706;
}
.state-tag.canceled, .state-tag.defeated {
  background: #FEF2F2;
  color: #EF4444;
  border: 1px solid #FEE2E2;
}
.state-tag.canceled .dot, .state-tag.defeated .dot {
  background-color: #EF4444;
}

.creator-row {
  gap: 60px;
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

/* Right Card: Voting Info */
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

/* Right Card: Voting Result */
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
.chart-divider {
  width: 1px;
  height: 60px;
  background-color: #F3F4F6;
  margin: 0 12px;
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
}
.info-icon {
  margin-left: 4px;
  font-size: 12px;
  color: #9CA3AF;
}
.stat-value {
  font-size: 14px;
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
</style>
