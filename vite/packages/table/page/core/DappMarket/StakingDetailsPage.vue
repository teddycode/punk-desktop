<template>
  <div class="staking-details-page" v-if="staking">
    <!-- 顶部概览 -->
    <div class="details-header">
      <div class="header-left">
        <img :src="staking.dapp.logo" :alt="staking.dapp.name" class="dapp-logo-large" />
        <div class="header-info">
          <h1 class="title">{{ staking.dapp.name }}</h1>
          <p class="subtitle">质押收益详情</p>
          <div class="status-info">
            <span class="status-badge" :class="staking.status">
              {{ getStatusLabel(staking.status) }}
            </span>
            <span class="time-info">
              {{ staking.startTime }} 至 {{ staking.status === 'active' ? '今' : staking.endTime }}
            </span>
          </div>
        </div>
      </div>
      <a-button
        v-if="staking.status === 'active'"
        type="primary"
        danger
        size="large"
        @click="handleWithdraw"
      >
        退出质押
      </a-button>
    </div>

    <!-- 收益统计卡片 -->
    <a-row :gutter="16" class="stats-row">
      <a-col :span="6">
        <div class="stat-card">
          <div class="stat-icon">
            <WalletOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-label">投资本金</div>
            <div class="stat-value">{{ formatNumber(staking.amount) }} PUNK</div>
          </div>
        </div>
      </a-col>
      <a-col :span="6">
        <div class="stat-card success">
          <div class="stat-icon">
            <RiseOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-label">累计收益</div>
            <div class="stat-value">+{{ formatNumber(staking.totalRevenue) }} PUNK</div>
          </div>
        </div>
      </a-col>
      <a-col :span="6">
        <div class="stat-card">
          <div class="stat-icon">
            <PercentageOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-label">收益率</div>
            <div class="stat-value">{{ staking.revenueRate }}%</div>
          </div>
        </div>
      </a-col>
      <a-col :span="6">
        <div class="stat-card">
          <div class="stat-icon">
            <ClockCircleOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-label">质押天数</div>
            <div class="stat-value">{{ staking.days }} 天</div>
          </div>
        </div>
      </a-col>
    </a-row>

    <!-- 收益趋势图 -->
    <div class="chart-card">
      <div class="card-header">
        <h3 class="card-title">
          <LineChartOutlined />
          收益趋势
        </h3>
        <a-radio-group v-model:value="chartPeriod" button-style="solid" size="small">
          <a-radio-button value="7d">7天</a-radio-button>
          <a-radio-button value="30d">30天</a-radio-button>
          <a-radio-button value="90d">90天</a-radio-button>
          <a-radio-button value="all">全部</a-radio-button>
        </a-radio-group>
      </div>
      <div class="chart-container">
        <!-- 简化的趋势图 -->
        <div class="trend-chart">
          <div class="y-axis">
            <span v-for="i in 5" :key="i">{{ ((5-i) * 2000) }}</span>
          </div>
          <div class="chart-area">
            <div
              v-for="(point, index) in trendData"
              :key="index"
              class="data-point"
              :style="{
                left: (index / (trendData.length - 1)) * 100 + '%',
                bottom: (point / 10000) * 100 + '%'
              }"
              :title="`${point} PUNK`"
            >
              <div class="point-dot"></div>
            </div>
            <svg class="trend-line" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polyline
                :points="getTrendLinePoints()"
                fill="none"
                stroke="url(#lineGradient)"
                stroke-width="2"
              />
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#a7d9fe" />
                  <stop offset="100%" stop-color="#8ab4f8" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div class="x-axis">
            <span v-for="(label, index) in xAxisLabels" :key="index">{{ label }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 合约分配详情 -->
    <div class="allocation-card">
      <h3 class="card-title">
        <DeploymentUnitOutlined />
        合约分配详情
      </h3>
      <div class="allocation-list">
        <div
          v-for="allocation in staking.allocations"
          :key="allocation.contractAddress"
          class="allocation-item"
        >
          <div class="allocation-header">
            <div class="contract-info">
              <FileTextOutlined class="contract-icon" />
              <div>
                <div class="contract-name">{{ allocation.contractName }}</div>
                <div class="contract-address" @click="viewContract(allocation.contractAddress)">
                  {{ allocation.contractAddress }}
                  <LinkOutlined />
                </div>
              </div>
            </div>
            <div class="allocation-stats">
              <div class="stat-item">
                <span class="label">分配金额</span>
                <span class="value">{{ formatNumber(allocation.amount) }} PUNK</span>
              </div>
              <div class="stat-item">
                <span class="label">当前收益</span>
                <span class="value success">+{{ formatNumber(allocation.revenue) }} PUNK</span>
              </div>
              <div class="stat-item">
                <span class="label">收益率</span>
                <span class="value">{{ allocation.revenueRate }}%</span>
              </div>
            </div>
          </div>
          <div class="allocation-progress">
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: (allocation.amount / staking.amount) * 100 + '%' }"
              ></div>
            </div>
            <span class="progress-label">
              占比 {{ ((allocation.amount / staking.amount) * 100).toFixed(1) }}%
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 收益记录 -->
    <div class="history-card">
      <h3 class="card-title">
        <HistoryOutlined />
        收益记录
      </h3>
      <a-table
        :columns="columns"
        :data-source="revenueHistory"
        :pagination="{ pageSize: 10 }"
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'amount'">
            <span class="revenue-amount">+{{ record.amount }} PUNK</span>
          </template>
          <template v-else-if="column.key === 'type'">
            <a-tag :color="record.type === 'daily' ? 'blue' : 'green'">
              {{ record.type === 'daily' ? '每日收益' : '额外奖励' }}
            </a-tag>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, h } from 'vue';
import { message, Modal } from 'ant-design-vue';
import {
  WalletOutlined,
  RiseOutlined,
  PercentageOutlined,
  ClockCircleOutlined,
  LineChartOutlined,
  DeploymentUnitOutlined,
  FileTextOutlined,
  LinkOutlined,
  HistoryOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons-vue';

const props = defineProps<{
  stakingId: number;
}>();

const emit = defineEmits(['back', 'withdraw', 'viewContract']);

const staking = ref<any>(null);
const chartPeriod = ref('30d');
const trendData = ref<number[]>([]);
const xAxisLabels = ref<string[]>([]);

const columns = [
  { title: '日期', dataIndex: 'date', key: 'date', width: 150 },
  { title: '类型', dataIndex: 'type', key: 'type', width: 120 },
  { title: '收益金额', dataIndex: 'amount', key: 'amount', width: 150 },
  { title: '累计收益', dataIndex: 'total', key: 'total', width: 150 },
  { title: '备注', dataIndex: 'note', key: 'note' }
];

const revenueHistory = ref<any[]>([]);

onMounted(() => {
  loadStakingDetails();
});

const loadStakingDetails = async () => {
  // Mock 数据
  staking.value = {
    id: props.stakingId,
    dapp: {
      name: 'Uniswap V3',
      logo: 'https://cryptologos.cc/logos/uniswap-uni-logo.png'
    },
    amount: 50000,
    totalRevenue: 6250,
    revenueRate: 12.5,
    days: 45,
    status: 'active',
    startTime: '2024-01-15',
    endTime: '',
    allocations: [
      {
        contractAddress: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
        contractName: 'Uniswap V3 Router',
        amount: 30000,
        revenue: 3750,
        revenueRate: 12.5
      },
      {
        contractAddress: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
        contractName: 'Uniswap V3 Factory',
        amount: 15000,
        revenue: 1875,
        revenueRate: 12.5
      },
      {
        contractAddress: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
        contractName: 'Position Manager',
        amount: 5000,
        revenue: 625,
        revenueRate: 12.5
      }
    ]
  };

  // Mock 趋势数据
  trendData.value = [1000, 1500, 2200, 2800, 3500, 4200, 5000, 5600, 6250];
  xAxisLabels.value = ['1/15', '1/22', '1/29', '2/5', '2/12', '2/19', '2/26', '3/4', '今'];

  // Mock 收益记录
  revenueHistory.value = [
    { date: '2024-03-04', type: 'daily', amount: 138.89, total: 6250, note: '每日质押收益' },
    { date: '2024-03-03', type: 'daily', amount: 138.89, total: 6111.11, note: '每日质押收益' },
    { date: '2024-03-02', type: 'daily', amount: 138.89, total: 5972.22, note: '每日质押收益' },
    { date: '2024-03-01', type: 'bonus', amount: 500, total: 5833.33, note: '持有30天奖励' },
    { date: '2024-02-29', type: 'daily', amount: 138.89, total: 5333.33, note: '每日质押收益' }
  ];
};

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
};

const getStatusLabel = (status: string) => {
  return status === 'active' ? '进行中' : '已完成';
};

const getTrendLinePoints = () => {
  return trendData.value
    .map((point, index) => {
      const x = (index / (trendData.value.length - 1)) * 100;
      const y = 100 - (point / 10000) * 100;
      return `${x},${y}`;
    })
    .join(' ');
};

const viewContract = (address: string) => {
  emit('viewContract', address);
};

const handleWithdraw = () => {
  Modal.confirm({
    title: '确认退出质押？',
    icon: h(ExclamationCircleOutlined),
    content: `退出后将收回本金 ${formatNumber(staking.value.amount)} PUNK 及收益 ${formatNumber(staking.value.totalRevenue)} PUNK，操作不可撤销。`,
    okText: '确认退出',
    okType: 'danger',
    cancelText: '取消',
    onOk: async () => {
      try {
        // TODO: 调用退出接口
        message.success('退出成功，资金将在24小时内到账');
        emit('withdraw', props.stakingId);
      } catch (error) {
        message.error('退出失败');
      }
    }
  });
};
</script>

<style scoped>
.staking-details-page {
  height: 100%;
  overflow-y: auto;
  padding: 20px;
  color: var(--primary-text);
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: var(--secondary-bg);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.header-left {
  display: flex;
  gap: 20px;
  align-items: center;
}

.dapp-logo-large {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  object-fit: contain;
  background: rgba(255, 255, 255, 0.05);
  padding: 8px;
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
}

.subtitle {
  font-size: 14px;
  color: var(--secondary-text);
  margin: 0;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.active {
  background: rgba(82, 196, 26, 0.2);
  color: #52c41a;
}

.status-badge.completed {
  background: rgba(255, 255, 255, 0.1);
  color: var(--secondary-text);
}

.time-info {
  font-size: 13px;
  color: var(--secondary-text);
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--secondary-bg);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.stat-card.success {
  background: linear-gradient(135deg, rgba(82, 196, 26, 0.1) 0%, rgba(82, 196, 26, 0.05) 100%);
  border-color: rgba(82, 196, 26, 0.3);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(167, 217, 254, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #a7d9fe;
}

.stat-card.success .stat-icon {
  background: rgba(82, 196, 26, 0.2);
  color: #52c41a;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 13px;
  color: var(--secondary-text);
  margin-bottom: 6px;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--primary-text);
}

.chart-card,
.allocation-card,
.history-card {
  background: var(--secondary-bg);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px 0;
}

.card-title .anticon {
  color: #a7d9fe;
}

.trend-chart {
  position: relative;
  height: 300px;
  padding: 20px 0 40px 60px;
}

.y-axis {
  position: absolute;
  left: 0;
  top: 20px;
  bottom: 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: 12px;
  color: var(--secondary-text);
}

.chart-area {
  position: relative;
  width: 100%;
  height: 100%;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.trend-line {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.data-point {
  position: absolute;
  transform: translate(-50%, 50%);
}

.point-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #a7d9fe;
  cursor: pointer;
  transition: all 0.3s;
}

.point-dot:hover {
  width: 12px;
  height: 12px;
  box-shadow: 0 0 12px rgba(167, 217, 254, 0.6);
}

.x-axis {
  position: absolute;
  left: 60px;
  right: 0;
  bottom: 0;
  height: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--secondary-text);
}

.allocation-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.allocation-item {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.allocation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.contract-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.contract-icon {
  font-size: 24px;
  color: #a7d9fe;
}

.contract-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.contract-address {
  font-family: monospace;
  font-size: 12px;
  color: var(--secondary-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.3s;
}

.contract-address:hover {
  color: #a7d9fe;
}

.allocation-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.stat-item .label {
  font-size: 12px;
  color: var(--secondary-text);
}

.stat-item .value {
  font-size: 16px;
  font-weight: 600;
}

.stat-item .value.success {
  color: #52c41a;
}

.allocation-progress {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #a7d9fe 0%, #8ab4f8 100%);
  transition: width 0.3s;
}

.progress-label {
  font-size: 12px;
  color: var(--secondary-text);
  min-width: 80px;
  text-align: right;
}

.revenue-amount {
  color: #52c41a;
  font-weight: 600;
}
</style>
