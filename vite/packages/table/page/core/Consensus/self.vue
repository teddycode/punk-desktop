<template>
  <section class="consensus-page self-page">
    <header class="page-hero">
      <div>
        <div class="eyebrow">MY CONSENSUS</div>
        <h1>我的共识</h1>
        <p>本节点参与 PoT 出块、委员会确认和激励分配的运行记录。</p>
      </div>
      <div class="identity-block">
        <span>{{ selfInfo.role || 'PoT矿工节点' }}</span>
        <strong>{{ selfInfo.peerId || '-' }}</strong>
        <small class="mono">{{ selfInfo.address || '-' }}</small>
      </div>
    </header>

    <div class="metric-grid">
      <div v-for="item in metrics" :key="item.label" class="metric-tile">
        <span class="metric-label">{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <small>{{ item.hint }}</small>
      </div>
    </div>

    <section class="node-band">
      <div class="node-summary">
        <div class="section-title">
          <span>节点产出</span>
          <a-tag color="green">Active</a-tag>
        </div>
        <div class="reward-line">
          <b>{{ selfInfo.miningReward || '-' }}</b>
          <span>PUNK</span>
        </div>
        <div class="progress-track">
          <i :style="{ width: `${Math.min(Number(selfInfo.successRate || 0), 100)}%` }"></i>
        </div>
        <div class="runtime-meta">
          <span>成功率 {{ selfInfo.successRate || '-' }}%</span>
          <span>延迟 {{ selfInfo.latency || '-' }}ms</span>
          <span>锁定奖励 {{ selfInfo.lockedReward || '-' }}</span>
        </div>
      </div>
      <div class="node-facts">
        <div v-for="fact in facts" :key="fact.label" class="fact-row">
          <span>{{ fact.label }}</span>
          <strong>{{ fact.value }}</strong>
        </div>
      </div>
    </section>

    <section class="table-section">
      <div class="section-head">
        <div>
          <h2>PoT 区块产出</h2>
          <p>当前节点最近参与产生的 PoT 区块。</p>
        </div>
        <div class="table-actions">
          <a-input-search v-model:value="potSearchHeight" placeholder="区块高度" />
          <a-input-search v-model:value="potSearchHash" placeholder="区块 Hash" />
          <a-button @click="resetPotSearch">重置</a-button>
        </div>
      </div>
      <a-table
        :columns="potColumns"
        :data-source="filteredPotBlocks"
        :row-key="(record) => record.height"
        :pagination="{ pageSize: 6 }"
        class="control-table"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'hash'">
            <span class="mono">{{ record.hashShort }}</span>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button type="link" size="small" @click="showPotBlockDetail(record)">
              <template #icon><EyeOutlined /></template>
              详情
            </a-button>
          </template>
        </template>
      </a-table>
    </section>

    <section class="table-section">
      <div class="section-head">
        <div>
          <h2>业务区块产出</h2>
          <p>本节点所在委员会最近确认的业务区块。</p>
        </div>
        <div class="table-actions">
          <a-input-search v-model:value="businessSearchHeight" placeholder="区块高度" />
          <a-input-search v-model:value="businessSearchHash" placeholder="区块 Hash" />
          <a-button @click="resetBusinessSearch">重置</a-button>
        </div>
      </div>
      <a-table
        :columns="businessColumns"
        :data-source="filteredBusinessBlocks"
        :row-key="(record) => record.height"
        :pagination="{ pageSize: 6 }"
        class="control-table"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'hash'">
            <span class="mono">{{ record.hashShort }}</span>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button type="link" size="small" @click="showBusinessBlockDetail(record)">
              <template #icon><EyeOutlined /></template>
              详情
            </a-button>
          </template>
        </template>
      </a-table>
    </section>

    <a-modal v-model:visible="potModalVisible" title="PoT 区块详情" width="860px" @ok="potModalVisible = false">
      <a-descriptions :column="2" bordered size="small">
        <a-descriptions-item label="区块高度">{{ potBlockDetail.height }}</a-descriptions-item>
        <a-descriptions-item label="出块人">{{ potBlockDetail.owner }}</a-descriptions-item>
        <a-descriptions-item label="区块哈希" span="2">{{ potBlockDetail.hash }}</a-descriptions-item>
        <a-descriptions-item label="父区块哈希" span="2">{{ potBlockDetail.parentHash }}</a-descriptions-item>
        <a-descriptions-item label="微块数目">{{ potBlockDetail.microBlockCount }}</a-descriptions-item>
        <a-descriptions-item label="交易数目">{{ potBlockDetail.transactionCount }}</a-descriptions-item>
        <a-descriptions-item label="大小(Bytes)">{{ potBlockDetail.size }}</a-descriptions-item>
        <a-descriptions-item label="难度">{{ potBlockDetail.difficulty }}</a-descriptions-item>
        <a-descriptions-item label="mixDigest" span="2">{{ potBlockDetail.mixDigest }}</a-descriptions-item>
        <a-descriptions-item label="nonce">{{ potBlockDetail.nonce }}</a-descriptions-item>
        <a-descriptions-item label="时间">{{ potBlockDetail.time }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>

    <a-modal
      v-model:visible="businessModalVisible"
      title="业务区块详情"
      width="860px"
      @ok="businessModalVisible = false"
    >
      <a-descriptions :column="2" bordered size="small">
        <a-descriptions-item label="区块高度">{{ businessBlockDetail.height }}</a-descriptions-item>
        <a-descriptions-item label="Leader">{{ businessBlockDetail.leader }}</a-descriptions-item>
        <a-descriptions-item label="区块哈希" span="2">{{ businessBlockDetail.hash }}</a-descriptions-item>
        <a-descriptions-item label="父区块哈希" span="2">{{ businessBlockDetail.parentHash }}</a-descriptions-item>
        <a-descriptions-item label="交易数目">{{ businessBlockDetail.transactionCount }}</a-descriptions-item>
        <a-descriptions-item label="大小(Bytes)">{{ businessBlockDetail.size }}</a-descriptions-item>
        <a-descriptions-item label="共识">{{ businessBlockDetail.consensus }}</a-descriptions-item>
        <a-descriptions-item label="时间">{{ businessBlockDetail.time }}</a-descriptions-item>
        <a-descriptions-item label="委员会" span="2">
          <div v-for="member in businessBlockDetail.committee" :key="member" class="mono-line">
            {{ member }}
          </div>
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { EyeOutlined } from '@ant-design/icons-vue';
import { blockData } from './data/block.js';
import { myBlockData } from './data/myBlock.js';
import {
  normalizeBusinessBlock,
  normalizePotBlock,
  requestPotApi,
} from './services/potApi';

const selfInfo = ref<any>({
  address: '1NvTaPya8mMC47fLrtfTZ5F4zWGseaj8ek',
  peerId: 'peer-pot-0',
  role: 'PoT矿工节点',
  networkId: '2a9fc4123b',
  potBlockCount: 5,
  businessBlockCount: 33,
  miningReward: 60,
  lockedReward: 0,
  successRate: 92,
  latency: 36,
});
const potBlocks = ref(blockData.map(normalizePotBlock));
const businessBlocks = ref(myBlockData.map(normalizeBusinessBlock));
const potModalVisible = ref(false);
const businessModalVisible = ref(false);
const potBlockDetail = ref<any>({});
const businessBlockDetail = ref<any>({});
const potSearchHeight = ref('');
const potSearchHash = ref('');
const businessSearchHeight = ref('');
const businessSearchHash = ref('');
let refreshTimer: number | undefined;

const potColumns = [
  { title: '高度', dataIndex: 'height', key: 'height', width: 110 },
  { title: 'Hash', dataIndex: 'hash', key: 'hash', width: 190 },
  { title: '出块人', dataIndex: 'owner', key: 'owner', width: 150 },
  { title: '微块', dataIndex: 'microBlockCount', key: 'microBlockCount', width: 90 },
  { title: '交易', dataIndex: 'transactionCount', key: 'transactionCount', width: 90 },
  { title: '大小(Bytes)', dataIndex: 'size', key: 'size', width: 120 },
  { title: '时间', dataIndex: 'time', key: 'time', width: 180 },
  { title: '操作', key: 'action', width: 100 },
];

const businessColumns = [
  { title: '高度', dataIndex: 'height', key: 'height', width: 110 },
  { title: 'Hash', dataIndex: 'hash', key: 'hash', width: 190 },
  { title: 'Leader', dataIndex: 'leader', key: 'leader', width: 170 },
  { title: '交易', dataIndex: 'transactionCount', key: 'transactionCount', width: 90 },
  { title: '大小(Bytes)', dataIndex: 'size', key: 'size', width: 120 },
  { title: '共识', dataIndex: 'consensus', key: 'consensus', width: 120 },
  { title: '时间', dataIndex: 'time', key: 'time', width: 180 },
  { title: '操作', key: 'action', width: 100 },
];

const metrics = computed(() => [
  {
    label: 'PoT 区块',
    value: selfInfo.value.potBlockCount || '-',
    hint: '本节点产出',
  },
  {
    label: '业务区块',
    value: selfInfo.value.businessBlockCount || '-',
    hint: '委员会确认',
  },
  {
    label: '挖矿奖励',
    value: `${selfInfo.value.miningReward || '-'} PUNK`,
    hint: `锁定 ${selfInfo.value.lockedReward || '-'}`,
  },
  {
    label: '网络 ID',
    value: selfInfo.value.networkId || '-',
    hint: `最近活跃 ${selfInfo.value.lastSeen || '-'}`,
  },
]);

const facts = computed(() => [
  { label: '节点地址', value: selfInfo.value.address || '-' },
  { label: '节点身份', value: selfInfo.value.role || '-' },
  { label: 'Peer ID', value: selfInfo.value.peerId || '-' },
  { label: '平均延迟', value: `${selfInfo.value.latency || '-'}ms` },
]);

const filteredPotBlocks = computed(() => {
  return potBlocks.value.filter((item) => {
    const heightMatched = !potSearchHeight.value || String(item.height).includes(potSearchHeight.value);
    const hashMatched = !potSearchHash.value || String(item.hash).toLowerCase().includes(potSearchHash.value.toLowerCase());
    return heightMatched && hashMatched;
  });
});

const filteredBusinessBlocks = computed(() => {
  return businessBlocks.value.filter((item) => {
    const heightMatched = !businessSearchHeight.value || String(item.height).includes(businessSearchHeight.value);
    const hashMatched = !businessSearchHash.value || String(item.hash).toLowerCase().includes(businessSearchHash.value.toLowerCase());
    return heightMatched && hashMatched;
  });
});

function resetPotSearch() {
  potSearchHeight.value = '';
  potSearchHash.value = '';
}

function resetBusinessSearch() {
  businessSearchHeight.value = '';
  businessSearchHash.value = '';
}

async function showPotBlockDetail(record: any) {
  potBlockDetail.value = record;
  potModalVisible.value = true;

  try {
    const detail = await requestPotApi<any>(`/blocks/${record.height}`);
    potBlockDetail.value = normalizePotBlock(detail);
  } catch {
    potBlockDetail.value = record;
  }
}

async function showBusinessBlockDetail(record: any) {
  businessBlockDetail.value = record;
  businessModalVisible.value = true;

  try {
    const detail = await requestPotApi<any>(`/business/blocks/${record.height}`);
    businessBlockDetail.value = normalizeBusinessBlock(detail);
  } catch {
    businessBlockDetail.value = record;
  }
}

async function refreshData() {
  try {
    const [overview, blocks] = await Promise.all([
      requestPotApi<any>('/self/overview'),
      requestPotApi<any>('/self/blocks/recent?count=10'),
    ]);

    selfInfo.value = overview;
    potBlocks.value = (blocks.potBlocks || []).map(normalizePotBlock).reverse();
    businessBlocks.value = (blocks.businessBlocks || []).map(normalizeBusinessBlock).reverse();
  } catch (error) {
    console.warn('[Consensus] use fallback self data:', error);
  }
}

onMounted(() => {
  refreshData();
  refreshTimer = window.setInterval(refreshData, 6000);
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
.node-band,
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

.identity-block {
  min-width: 280px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.identity-block span {
  color: #168774;
  font-weight: 700;
}

.identity-block strong {
  font-size: 20px;
}

.identity-block small {
  max-width: 360px;
  color: #667085;
  word-break: break-all;
  text-align: right;
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
.runtime-meta,
.fact-row span {
  color: #667085;
}

.metric-label {
  font-size: 13px;
}

.metric-tile strong {
  font-size: 25px;
  line-height: 1;
  letter-spacing: 0;
  overflow-wrap: anywhere;
}

.node-band {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 0.8fr);
  gap: 18px;
  margin-top: 18px;
}

.node-summary,
.node-facts,
.table-section {
  background: #ffffff;
  border: 1px solid #dfe4dc;
}

.node-summary,
.node-facts {
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

.reward-line {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-top: 22px;
}

.reward-line b {
  font-size: 40px;
  line-height: 1;
}

.reward-line span {
  color: #168774;
  font-weight: 800;
}

.progress-track {
  height: 8px;
  margin-top: 18px;
  background: #edf1ec;
  overflow: hidden;
}

.progress-track i {
  display: block;
  height: 100%;
  background: #18a58f;
  transition: width 300ms ease;
}

.runtime-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 14px;
  font-size: 13px;
}

.node-facts {
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
  padding: 14px 16px;
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
  grid-template-columns: minmax(120px, 160px) minmax(180px, 240px) auto;
  gap: 10px;
}

.mono,
.mono-line {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.mono-line {
  word-break: break-all;
  line-height: 1.7;
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

@media (max-width: 1100px) {
  .metric-grid,
  .node-band {
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

  .identity-block {
    align-items: flex-start;
  }

  .identity-block small {
    text-align: left;
  }

  .metric-grid,
  .node-band,
  .table-actions {
    grid-template-columns: 1fr;
  }
}
</style>
