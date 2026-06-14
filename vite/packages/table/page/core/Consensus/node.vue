<template>
  <section class="consensus-page node-page">
    <header class="page-hero">
      <div>
        <div class="eyebrow">CONSENSUS NODES</div>
        <h1>我的节点</h1>
        <p>PoT 矿工节点、委员会节点和 P2P 拓扑状态。</p>
      </div>
      <div class="hero-actions">
        <a-button @click="openAddModal = true">
          <template #icon><PlusOutlined /></template>
          添加节点
        </a-button>
        <a-button @click="openPotTransactionModal = true">
          <template #icon><TransactionOutlined /></template>
          POT交易
        </a-button>
        <a-button type="primary" @click="openConsensusSwitchModal = true">
          <template #icon><SwapOutlined /></template>
          提交共识切换
        </a-button>
      </div>
    </header>

    <div class="metric-grid">
      <div v-for="item in metrics" :key="item.label" class="metric-tile">
        <span class="metric-label">{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <small>{{ item.hint }}</small>
      </div>
    </div>

    <section class="topology-band">
      <div class="topology-map">
        <div class="section-title">
          <span>拓扑概览</span>
          <a-tag color="green">{{ topology.p2pAdaptorType || 'libp2p' }}</a-tag>
        </div>
        <div class="node-orbit">
          <button
            v-for="node in orbitNodes"
            :key="node.peerId"
            :class="['orbit-node', node.type, { leader: node.isLeader }]"
            :style="{ left: `${node.x}%`, top: `${node.y}%` }"
            @click="showDetailModal(node)"
          >
            <span></span>
            <b>{{ node.peerId }}</b>
          </button>
        </div>
      </div>
      <div class="network-facts">
        <div v-for="fact in networkFacts" :key="fact.label" class="fact-row">
          <span>{{ fact.label }}</span>
          <strong>{{ fact.value }}</strong>
        </div>
      </div>
    </section>

    <section class="table-section">
      <div class="section-head">
        <div>
          <h2>节点列表</h2>
          <p>节点状态来自 pot-mock 的网络拓扑和委员会运行信息。</p>
        </div>
        <div class="table-actions">
          <a-input-search v-model:value="nodeName" placeholder="节点名称" />
          <a-select v-model:value="nodeStatus" allow-clear placeholder="状态">
            <a-select-option value="在线">在线</a-select-option>
            <a-select-option value="离线">离线</a-select-option>
          </a-select>
          <a-button @click="resetSearch">重置</a-button>
        </div>
      </div>
      <a-table
        bordered
        :columns="columns"
        :data-source="filteredNodes"
        :row-key="(record) => record.peerId"
        :pagination="{ pageSize: 8 }"
        class="control-table"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <a-button type="link" size="small" @click="showDetailModal(record)">
              {{ record.name }}
            </a-button>
          </template>
          <template v-else-if="column.key === 'address'">
            <span class="mono">{{ shortAddress(record.address) }}</span>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.status === '在线' ? 'green' : 'red'">{{ record.status }}</a-tag>
          </template>
          <template v-else-if="column.key === 'latency'">
            <span :class="{ warn: record.latency > 70 }">{{ record.latency }} ms</span>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="showDetailModal(record)">
                <template #icon><EyeOutlined /></template>
                详情
              </a-button>
              <a-button type="link" size="small" @click="toggleNodeStatus(record)">
                <template #icon><EditOutlined /></template>
                {{ record.status === '在线' ? '下线' : '上线' }}
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </section>

    <a-modal v-model:visible="openDetailModal" title="节点详情" width="820px" @ok="openDetailModal = false">
      <a-descriptions bordered :column="2" size="small">
        <a-descriptions-item label="节点名称">{{ nodeDetail?.name }}</a-descriptions-item>
        <a-descriptions-item label="Peer ID">{{ nodeDetail?.peerId }}</a-descriptions-item>
        <a-descriptions-item label="节点地址" span="2">{{ nodeDetail?.address }}</a-descriptions-item>
        <a-descriptions-item label="服务地址" span="2">{{ nodeDetail?.url }}</a-descriptions-item>
        <a-descriptions-item label="所在位置">{{ nodeDetail?.location }}</a-descriptions-item>
        <a-descriptions-item label="身份">{{ nodeDetail?.role }}</a-descriptions-item>
        <a-descriptions-item label="出块数量">{{ nodeDetail?.blockNum }}</a-descriptions-item>
        <a-descriptions-item label="状态">{{ nodeDetail?.status }}</a-descriptions-item>
        <a-descriptions-item label="连接数">{{ nodeDetail?.connections }}</a-descriptions-item>
        <a-descriptions-item label="延迟">{{ nodeDetail?.latency }} ms</a-descriptions-item>
        <a-descriptions-item label="最近活跃">{{ nodeDetail?.lastSeen }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>

    <a-modal v-model:visible="openAddModal" title="添加节点" width="600px" @ok="handleNodeAdd">
      <a-form layout="vertical" :model="nodeAddInfo">
        <a-form-item label="节点名称">
          <a-input v-model:value="nodeAddInfo.name" addon-before="0x" />
        </a-form-item>
        <a-form-item label="节点地址">
          <a-input v-model:value="nodeAddInfo.url" addon-before="Http://" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:visible="openPotTransactionModal"
      title="POT交易"
      width="1200px"
      :footer="null"
      :body-style="{ maxHeight: 'calc(100vh - 180px)', overflowY: 'auto', padding: '0 16px 16px' }"
    >
      <PotTransaction />
    </a-modal>

    <a-modal
      v-model:visible="openConsensusSwitchModal"
      title="提交共识切换提案"
      width="760px"
      ok-text="创建治理提案"
      cancel-text="取消"
      @ok="goCreateConsensusProposal"
    >
      <a-alert
        style="margin-bottom: 16px"
        type="info"
        show-icon
        message="确认当前共识信息和目标共识信息后，将跳转到治理区创建共识切换提案。"
      />
      <a-descriptions title="当前共识信息" bordered :column="2" size="small">
        <a-descriptions-item label="当前共识">{{ currentConsensusInfo.algorithm }}</a-descriptions-item>
        <a-descriptions-item label="委员会共识">{{ currentConsensusInfo.committee }}</a-descriptions-item>
        <a-descriptions-item label="节点总数">{{ currentConsensusInfo.nodeCount }}</a-descriptions-item>
        <a-descriptions-item label="在线节点">{{ currentConsensusInfo.onlineNodeCount }}</a-descriptions-item>
        <a-descriptions-item label="共识节点">{{ currentConsensusInfo.consensusNodeCount }}</a-descriptions-item>
        <a-descriptions-item label="累计出块">{{ currentConsensusInfo.totalBlockNum }}</a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <a-form layout="vertical" :model="consensusSwitchForm">
        <a-form-item label="目标共识" required>
          <a-select v-model:value="consensusSwitchForm.targetConsensus" placeholder="请选择目标共识">
            <a-select-option
              v-for="option in consensusSwitchOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-descriptions title="目标共识信息" bordered :column="2" size="small">
          <a-descriptions-item label="治理目标">PoT</a-descriptions-item>
          <a-descriptions-item label="提案类型">Consensus switch</a-descriptions-item>
          <a-descriptions-item label="目标共识">{{ targetConsensusInfo.label }}</a-descriptions-item>
          <a-descriptions-item label="预期效果">{{ targetConsensusInfo.description }}</a-descriptions-item>
        </a-descriptions>
        <a-form-item label="切换说明" style="margin-top: 16px">
          <a-textarea v-model:value="consensusSwitchForm.reason" :rows="4" placeholder="请输入本次共识切换的原因或预期收益" />
        </a-form-item>
      </a-form>
    </a-modal>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SwapOutlined,
  TransactionOutlined,
} from '@ant-design/icons-vue';
import PotTransaction from './potTransaction.vue';
import {
  normalizeNode,
  requestPotApi,
  shortHash,
} from './services/potApi';

const router = useRouter();
const data = ref<any[]>([]);
const topology = ref<any>({});
const potStatus = ref<any>({});
const committeeStatus = ref<any>({});
const openDetailModal = ref(false);
const openAddModal = ref(false);
const openPotTransactionModal = ref(false);
const openConsensusSwitchModal = ref(false);
const nodeDetail = ref<any>({});
const nodeAddInfo = ref<any>({});
const nodeName = ref('');
const nodeStatus = ref<string | undefined>();
let refreshTimer: number | undefined;

const fallbackNodes = [
  {
    name: 'peer-pot-0',
    peerId: 'peer-pot-0',
    url: 'http://127.0.0.1:7890/node0',
    address: '0x96cae35ce8a9b02441',
    location: '北京市海淀区',
    role: 'PoT矿工节点',
    type: 'pot',
    status: '在线',
    blockNum: 20,
    latency: 42,
    connections: 3,
  },
  {
    name: 'peer-pot-1',
    peerId: 'peer-pot-1',
    url: 'http://127.0.0.1:7891/node1',
    address: '0xa495c744797a0ab6aef',
    location: '北京市海淀区',
    role: 'PoT矿工节点',
    type: 'pot',
    status: '在线',
    blockNum: 25,
    latency: 48,
    connections: 3,
  },
  {
    name: 'peer-committee-0',
    peerId: 'peer-committee-0',
    url: 'http://127.0.0.1:7892/node2',
    address: '0x9cfbf1e37d8a884f',
    location: '浙江省杭州市',
    role: '委员会Leader',
    type: 'committee',
    status: '在线',
    blockNum: 31,
    latency: 18,
    connections: 7,
    isLeader: true,
  },
].map(normalizeNode);

const columns = [
  { title: '名称', dataIndex: 'name', key: 'name', width: 160 },
  { title: '地址', dataIndex: 'address', key: 'address', width: 180 },
  { title: '位置', dataIndex: 'location', key: 'location', width: 140 },
  { title: '身份', dataIndex: 'role', key: 'role', width: 150 },
  { title: '出块数量', dataIndex: 'blockNum', key: 'blockNum', width: 110 },
  { title: '延迟', dataIndex: 'latency', key: 'latency', width: 90 },
  { title: '状态', key: 'status', dataIndex: 'status', width: 90 },
  { title: '操作', key: 'action', width: 170 },
];

const consensusSwitchOptions = [
  {
    label: 'PoS',
    value: 'PoS',
    description: '引入权益权重参与共识，适合提升治理参与和节点长期稳定性。',
  },
  {
    label: 'PoW',
    value: 'PoW',
    description: '切换为工作量证明共识，适合强调算力竞争和出块安全性。',
  },
  {
    label: 'PBFT',
    value: 'PBFT',
    description: '切换为拜占庭容错共识，适合低延迟、确定性确认的联盟节点场景。',
  },
  {
    label: 'HotStuff',
    value: 'HotStuff',
    description: '切换为流水线 BFT 共识，适合提高委员会共识吞吐和确认效率。',
  },
];

const consensusSwitchForm = ref({
  targetConsensus: 'PoS',
  reason: '将当前 PoT 共识切换为 PoS，用于提升节点权益参与度和治理可控性。',
});

const metrics = computed(() => {
  const nodes = data.value;
  const online = nodes.filter((node) => node.status === '在线').length;
  const committee = nodes.filter((node) => node.type === 'committee').length;
  const totalBlocks = nodes.reduce((total, node) => total + Number(node.blockNum || 0), 0);

  return [
    { label: '节点数', value: nodes.length, hint: `在线 ${online}` },
    { label: '委员会节点', value: committee, hint: `${committeeStatus.value.consensusType || 'SimpleWhirly'}` },
    { label: '累计出块', value: totalBlocks, hint: `高度 ${potStatus.value.currentHeight || '-'}` },
    { label: '消息队列', value: topology.value.messageQueueLength || '-', hint: `${formatBandwidth(topology.value.networkBandwidth)}` },
  ];
});

const networkFacts = computed(() => [
  { label: '订阅主题', value: (topology.value.subscribedTopics || ['blocks', 'transactions', 'consensus']).join(', ') },
  { label: 'P2P 适配器', value: topology.value.p2pAdaptorType || 'libp2p' },
  { label: '委员会阶段', value: committeeStatus.value.workStage || '-' },
  { label: '确认延迟', value: `${committeeStatus.value.confirmDelay || '-'} 块` },
]);

const orbitNodes = computed(() => {
  const nodes = data.value.length ? data.value : fallbackNodes;
  const total = nodes.length || 1;
  return nodes.map((node, index) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const radiusX = node.type === 'committee' ? 28 : 39;
    const radiusY = node.type === 'committee' ? 26 : 36;
    return {
      ...node,
      x: 50 + Math.cos(angle) * radiusX,
      y: 50 + Math.sin(angle) * radiusY,
    };
  });
});

const filteredNodes = computed(() => {
  return data.value.filter((item) => {
    const nameMatched = !nodeName.value || item.name.toLowerCase().includes(nodeName.value.toLowerCase());
    const statusMatched = !nodeStatus.value || item.status === nodeStatus.value;
    return nameMatched && statusMatched;
  });
});

const currentConsensusInfo = computed(() => {
  const nodes = data.value;
  return {
    algorithm: potStatus.value.consensusType || 'PoT',
    committee: committeeStatus.value.consensusType || 'Hotstuff',
    nodeCount: nodes.length,
    onlineNodeCount: nodes.filter((item) => item.status === '在线').length,
    consensusNodeCount: nodes.filter((item) => item.type === 'pot' || item.role.includes('共识')).length,
    totalBlockNum: nodes.reduce((total, item) => total + Number(item.blockNum || 0), 0),
  };
});

const targetConsensusInfo = computed(() => {
  return (
    consensusSwitchOptions.find((item) => item.value === consensusSwitchForm.value.targetConsensus) ||
    consensusSwitchOptions[0]
  );
});

function shortAddress(address?: string) {
  return shortHash(address);
}

function formatBandwidth(value?: number) {
  if (!value) return '带宽 -';
  if (value > 1024 * 1024) return `${(value / 1024 / 1024).toFixed(1)} MB/s`;
  return `${(value / 1024).toFixed(0)} KB/s`;
}

function showDetailModal(record: any) {
  nodeDetail.value = { ...record };
  openDetailModal.value = true;
}

function resetSearch() {
  nodeName.value = '';
  nodeStatus.value = undefined;
}

function toggleNodeStatus(record: any) {
  record.status = record.status === '在线' ? '离线' : '在线';
}

function handleNodeAdd() {
  if (!nodeAddInfo.value.name) {
    openAddModal.value = false;
    return;
  }

  data.value.unshift(
    normalizeNode({
      id: Date.now(),
      name: `0x${nodeAddInfo.value.name}`,
      peerId: `custom-${Date.now()}`,
      url: `http://${nodeAddInfo.value.url || '127.0.0.1:7899/node'}`,
      address: `0x${nodeAddInfo.value.name}`,
      location: '本地',
      role: 'PoT矿工节点',
      type: 'pot',
      status: '在线',
      blockNum: 0,
      latency: 0,
      connections: 0,
    }),
  );
  nodeAddInfo.value = {};
  openAddModal.value = false;
}

function buildConsensusProposalDescription() {
  const current = currentConsensusInfo.value;
  const target = targetConsensusInfo.value;
  return [
    `当前共识：${current.algorithm}`,
    `委员会共识：${current.committee}`,
    `节点总数：${current.nodeCount}`,
    `在线节点：${current.onlineNodeCount}`,
    `共识节点：${current.consensusNodeCount}`,
    `累计出块：${current.totalBlockNum}`,
    `目标共识：${target.label}`,
    `切换说明：${consensusSwitchForm.value.reason || target.description}`,
  ].join('；');
}

function goCreateConsensusProposal() {
  const current = currentConsensusInfo.value;
  const target = targetConsensusInfo.value;
  router.push({
    name: 'CreateProposal',
    query: {
      proposalPreset: 'consensus-switch',
      source: 'consensus-node',
      currentConsensus: current.algorithm,
      currentCommitteeConsensus: current.committee,
      currentNodeCount: String(current.nodeCount),
      onlineNodeCount: String(current.onlineNodeCount),
      consensusNodeCount: String(current.consensusNodeCount),
      totalBlockNum: String(current.totalBlockNum),
      targetConsensus: target.value,
      targetConsensusDescription: target.description,
      upgradeParameter: buildConsensusProposalDescription(),
      executor: '1',
    },
  });
}

async function refreshData() {
  try {
    const [nodes, network, pot, committee] = await Promise.all([
      requestPotApi<any[]>('/nodes'),
      requestPotApi<any>('/network/topology'),
      requestPotApi<any>('/pot/status'),
      requestPotApi<any>('/committee/status'),
    ]);

    data.value = nodes.map(normalizeNode);
    topology.value = network;
    potStatus.value = pot;
    committeeStatus.value = committee;
  } catch (error) {
    console.warn('[Consensus] use fallback node data:', error);
    if (!data.value.length) {
      data.value = fallbackNodes;
    }
  }
}

onMounted(() => {
  data.value = fallbackNodes;
  refreshData();
  refreshTimer = window.setInterval(refreshData, 7000);
});

onBeforeUnmount(() => {
  if (refreshTimer) {
    window.clearInterval(refreshTimer);
  }
});
</script>

<style scoped>
.consensus-page {
  min-height: calc(100vh - 96px);
  padding: 28px;
  background: #f6f7f4;
  color: #18212f;
}

.page-hero,
.metric-grid,
.topology-band,
.table-section {
  animation: rise-in 360ms ease both;
}

.page-hero {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
  padding-bottom: 22px;
  border-bottom: 1px solid #dfe4dc;
}

.eyebrow {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #168774;
}

h1,
h2,
p {
  margin: 0;
}

.page-hero h1 {
  margin-top: 6px;
  font-size: 34px;
  line-height: 1.1;
  letter-spacing: 0;
}

.page-hero p,
.section-head p {
  margin-top: 8px;
  color: #667085;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  margin-top: 22px;
  border: 1px solid #dfe4dc;
  background: #dfe4dc;
}

.metric-tile {
  min-width: 0;
  padding: 20px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metric-label,
.metric-tile small,
.fact-row span {
  color: #667085;
}

.metric-label {
  font-size: 13px;
}

.metric-tile strong {
  font-size: 27px;
  line-height: 1;
  letter-spacing: 0;
}

.topology-band {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(360px, 0.8fr);
  gap: 18px;
  margin-top: 18px;
}

.topology-map,
.network-facts,
.table-section {
  background: #ffffff;
  border: 1px solid #dfe4dc;
}

.topology-map {
  padding: 20px;
}

.section-title,
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.section-title span,
.section-head h2 {
  font-size: 18px;
  font-weight: 800;
}

.node-orbit {
  position: relative;
  height: 320px;
  margin-top: 18px;
  background:
    radial-gradient(circle at center, rgba(24, 165, 143, 0.12) 0 1px, transparent 2px),
    radial-gradient(circle at center, transparent 0 35%, #edf3ef 36%, transparent 37%),
    radial-gradient(circle at center, transparent 0 48%, #edf3ef 49%, transparent 50%);
  overflow: hidden;
}

.node-orbit::before {
  content: '';
  position: absolute;
  inset: 34px;
  border: 1px dashed #cbd8d2;
  border-radius: 50%;
  animation: orbit-spin 18s linear infinite;
}

.orbit-node {
  position: absolute;
  width: 120px;
  min-height: 42px;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 10px;
  border: 1px solid #dfe4dc;
  background: #ffffff;
  color: #263241;
  cursor: pointer;
  transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
}

.orbit-node:hover {
  transform: translate(-50%, -50%) translateY(-2px);
  border-color: #18a58f;
  background: #f2faf7;
}

.orbit-node span {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #18a58f;
  flex: 0 0 auto;
}

.orbit-node.committee span {
  background: #3b82f6;
}

.orbit-node.leader {
  border-color: #3b82f6;
}

.orbit-node b {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
}

.network-facts {
  display: grid;
  gap: 1px;
  background: #dfe4dc;
  padding: 1px;
}

.fact-row {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr);
  gap: 14px;
  align-items: center;
  padding: 16px;
  background: #ffffff;
}

.fact-row strong {
  min-width: 0;
  overflow-wrap: anywhere;
}

.table-section {
  margin-top: 18px;
  padding: 20px;
}

.table-actions {
  display: grid;
  grid-template-columns: minmax(150px, 180px) minmax(120px, 150px) auto;
  gap: 10px;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.warn {
  color: #b45309;
  font-weight: 700;
}

:deep(.control-table) {
  margin-top: 16px;
}

:deep(.control-table .ant-table-thead > tr > th) {
  background: #f8faf7;
  color: #5f6b7a;
  font-size: 12px;
  font-weight: 800;
}

:deep(.control-table .ant-table-tbody > tr > td) {
  color: #2f3a4a;
}

:deep(.control-table .ant-table-tbody > tr:hover > td) {
  background: #f2faf7;
}

@keyframes rise-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes orbit-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1100px) {
  .metric-grid,
  .topology-band {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .consensus-page {
    padding: 18px;
  }

  .page-hero,
  .section-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .hero-actions {
    justify-content: flex-start;
  }

  .metric-grid,
  .topology-band,
  .table-actions {
    grid-template-columns: 1fr;
  }
}
</style>
