<template>
  <section class="consensus-page">
    <header class="page-hero">
      <div>
        <div class="eyebrow">POT CONSENSUS</div>
        <h1>共识概览</h1>
        <p>PoT 出块、委员会确认、交易池和激励状态的实时视图。</p>
      </div>
      <div class="hero-status">
        <span :class="['live-dot', overview.networkStatus === 'warning' ? 'warning' : '']"></span>
        <div>
          <strong>{{ statusText }}</strong>
          <span>更新于 {{ currentDate }}</span>
        </div>
      </div>
    </header>

    <div class="metric-grid">
      <div v-for="item in metrics" :key="item.label" class="metric-tile">
        <span class="metric-label">{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <small>{{ item.hint }}</small>
      </div>
    </div>

    <section class="runtime-band">
      <div class="runtime-main">
        <div class="section-title">
          <span>PoT 工作状态</span>
          <a-tag :color="potStatus.workFlag ? 'green' : 'orange'">
            {{ potStatus.workFlag ? 'Working' : 'Idle' }}
          </a-tag>
        </div>
        <div class="runtime-line">
          <span>Epoch {{ potStatus.epoch || '-' }}</span>
          <b>{{ potStatus.consensusType || 'POT' }}</b>
          <span>{{ potStatus.difficulty || '-' }}</span>
        </div>
        <div class="progress-track">
          <i :style="{ width: `${Math.min(Number(potStatus.miningSuccessRate || 0), 100)}%` }"></i>
        </div>
        <div class="runtime-meta">
          <span>平均挖矿 {{ potStatus.avgMiningTime || '-' }}s</span>
          <span>成功率 {{ potStatus.miningSuccessRate || '-' }}%</span>
          <span>Nonce {{ potStatus.nonce || '-' }}</span>
        </div>
      </div>
      <div class="committee-flow">
        <div class="section-title">
          <span>委员会确认</span>
          <a-tag color="blue">{{ committeeStatus.consensusType || 'SimpleWhirly' }}</a-tag>
        </div>
        <div class="flow-steps">
          <span
            v-for="stage in stages"
            :key="stage"
            :class="{ active: committeeStatus.workStage === stage }"
          >
            {{ stage }}
          </span>
        </div>
        <div class="runtime-meta">
          <span>工作高度 {{ committeeStatus.workHeight || '-' }}</span>
          <span>批大小 {{ committeeStatus.batchSize || '-' }}</span>
          <span>队列 {{ committeeStatus.messageQueueLength || '-' }}</span>
        </div>
      </div>
    </section>

    <section class="table-section">
      <div class="section-head">
        <div>
          <h2>PoT 区块</h2>
          <p>来自 PoT 主链的最近出块数据。</p>
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
        :pagination="{ pageSize: 8 }"
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
          <h2>业务区块</h2>
          <p>委员会共识确认后的业务区块流水。</p>
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
        :pagination="{ pageSize: 8 }"
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
        <a-descriptions-item label="叔区块哈希" span="2">
          <div v-for="uncleHash in potBlockDetail.uncleHashes" :key="uncleHash" class="mono-line">
            {{ uncleHash }}
          </div>
        </a-descriptions-item>
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
import dayjs from 'dayjs';
import { EyeOutlined } from '@ant-design/icons-vue';
import { blockData } from './data/block.js';
import { micBlockData } from './data/micBlock.js';
import {
  formatTime,
  normalizeBusinessBlock,
  normalizePotBlock,
  requestPotApi,
} from './services/potApi';

const stages = ['init', 'shuffle', 'draw', 'share', 'consensus'];
const currentDate = ref(dayjs().format('YYYY-MM-DD HH:mm:ss'));
const overview = ref<any>({});
const potStatus = ref<any>({});
const committeeStatus = ref<any>({});
const mempoolStatus = ref<any>({});
const potBlocks = ref(blockData.map(normalizePotBlock));
const businessBlocks = ref(micBlockData.map(normalizeBusinessBlock));
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

const statusText = computed(() => {
  if (overview.value.networkStatus === 'warning') return '网络繁忙';
  if (overview.value.networkStatus === 'error') return '网络异常';
  return '运行中';
});

const metrics = computed(() => [
  {
    label: '当前高度',
    value: overview.value.currentHeight || potStatus.value.currentHeight || '-',
    hint: `平均出块 ${overview.value.avgBlockTime || '-'}s`,
  },
  {
    label: '实时 TPS',
    value: overview.value.currentTPS || '-',
    hint: `交易池 ${mempoolStatus.value.totalSize || '-'} 笔`,
  },
  {
    label: '在线节点',
    value: `${overview.value.onlineNodes || '-'} / ${overview.value.totalNodes || '-'}`,
    hint: `利用率 ${overview.value.networkUtilization || '-'}%`,
  },
  {
    label: '委员会',
    value: committeeStatus.value.committeeSize || '-',
    hint: `确认延迟 ${committeeStatus.value.confirmDelay || '-'} 块`,
  },
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
  currentDate.value = dayjs().format('YYYY-MM-DD HH:mm:ss');

  try {
    const [system, pot, committee, mempool, blocks, bizBlocks] = await Promise.all([
      requestPotApi<any>('/system/overview'),
      requestPotApi<any>('/pot/status'),
      requestPotApi<any>('/committee/status'),
      requestPotApi<any>('/mempool/status'),
      requestPotApi<any[]>('/blocks/recent?count=12'),
      requestPotApi<any[]>('/business/blocks/recent?count=12'),
    ]);

    overview.value = {
      ...system,
      lastBlockTime: formatTime(system.lastBlockTime),
    };
    potStatus.value = pot;
    committeeStatus.value = committee;
    mempoolStatus.value = mempool;
    potBlocks.value = blocks.map(normalizePotBlock).reverse();
    businessBlocks.value = bizBlocks.map(normalizeBusinessBlock).reverse();
  } catch (error) {
    console.warn('[Consensus] use fallback overview data:', error);
  }
}

onMounted(() => {
  refreshData();
  refreshTimer = window.setInterval(refreshData, 5000);
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
.runtime-band,
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

.hero-status {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 220px;
  justify-content: flex-end;
}

.hero-status div {
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: right;
}

.hero-status span {
  color: #667085;
  font-size: 12px;
}

.live-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #18a58f;
  box-shadow: 0 0 0 6px rgba(24, 165, 143, 0.12);
  animation: pulse 1.8s ease-in-out infinite;
}

.live-dot.warning {
  background: #d98924;
  box-shadow: 0 0 0 6px rgba(217, 137, 36, 0.14);
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
.runtime-meta {
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

.runtime-band {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
  gap: 18px;
  margin-top: 18px;
}

.runtime-main,
.committee-flow,
.table-section {
  background: #ffffff;
  border: 1px solid #dfe4dc;
}

.runtime-main,
.committee-flow {
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

.runtime-line {
  display: flex;
  align-items: baseline;
  gap: 18px;
  margin-top: 22px;
}

.runtime-line b {
  font-size: 32px;
  line-height: 1;
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

.flow-steps {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
  margin-top: 22px;
}

.flow-steps span {
  min-width: 0;
  padding: 9px 8px;
  text-align: center;
  border: 1px solid #dfe4dc;
  color: #667085;
  font-size: 12px;
  transition: all 180ms ease;
}

.flow-steps span.active {
  color: #0f5f52;
  background: #e6f6f2;
  border-color: #90d8c8;
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

:deep(.control-table .ant-table-tbody > tr) {
  transition: background 160ms ease, transform 160ms ease;
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

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.18);
  }
}

@media (max-width: 1100px) {
  .metric-grid,
  .runtime-band {
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

  .hero-status {
    justify-content: flex-start;
  }

  .hero-status div {
    text-align: left;
  }

  .metric-grid,
  .runtime-band,
  .table-actions {
    grid-template-columns: 1fr;
  }
}
</style>
