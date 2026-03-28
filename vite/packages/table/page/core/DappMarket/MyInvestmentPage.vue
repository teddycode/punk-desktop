<template>
  <div class="my-investment-page">
    <div class="page-header">
      <h2 class="page-title">我的投资</h2>
      <div class="header-stats">
        <div class="stat-card-small">
          <span class="label">总投资</span>
          <span class="value">{{ formatNumber(totalInvestment) }} PUNK</span>
        </div>
        <div class="stat-card-small success">
          <span class="label">累计收益</span>
          <span class="value">+{{ formatNumber(totalRevenue) }} PUNK</span>
        </div>
        <div class="stat-card-small">
          <span class="label">参与项目</span>
          <span class="value">{{ investments.length }}</span>
        </div>
      </div>
    </div>

    <!-- 筛选和排序 -->
    <div class="filter-bar">
      <a-radio-group v-model:value="filterStatus" button-style="solid" @change="handleFilterChange">
        <a-radio-button value="all">全部</a-radio-button>
        <a-radio-button value="active">进行中</a-radio-button>
        <a-radio-button value="completed">已完成</a-radio-button>
      </a-radio-group>

      <a-select v-model:value="sortBy" style="width: 200px" @change="handleSortChange">
        <a-select-option value="time">按投资时间</a-select-option>
        <a-select-option value="amount">按投资金额</a-select-option>
        <a-select-option value="revenue">按收益大小</a-select-option>
      </a-select>
    </div>

    <!-- 投资列表 -->
    <div class="investments-list">
      <div
        v-for="investment in displayedInvestments"
        :key="investment.id"
        class="investment-card"
      >
        <div class="card-header">
          <div class="dapp-info">
            <img :src="investment.dapp.logo" :alt="investment.dapp.name" class="dapp-logo" />
            <div class="dapp-details">
              <h3 class="dapp-name">{{ investment.dapp.name }}</h3>
              <p class="dapp-category">{{ investment.dapp.category }}</p>
            </div>
          </div>
          <div class="status-badge" :class="investment.status">
            {{ getStatusLabel(investment.status) }}
          </div>
        </div>

        <div class="card-body">
          <a-row :gutter="16">
            <a-col :span="6">
              <div class="info-item">
                <span class="label">投资金额</span>
                <span class="value">{{ formatNumber(investment.amount) }} PUNK</span>
              </div>
            </a-col>
            <a-col :span="6">
              <div class="info-item">
                <span class="label">当前收益</span>
                <span class="value success">+{{ formatNumber(investment.currentRevenue) }} PUNK</span>
              </div>
            </a-col>
            <a-col :span="6">
              <div class="info-item">
                <span class="label">收益率</span>
                <span class="value success">+{{ investment.revenueRate }}%</span>
              </div>
            </a-col>
            <a-col :span="6">
              <div class="info-item">
                <span class="label">投资时长</span>
                <span class="value">{{ investment.duration }}</span>
              </div>
            </a-col>
          </a-row>

          <!-- 收益趋势图 -->
          <div class="revenue-chart">
            <div class="chart-header">
              <span class="chart-title">收益趋势</span>
              <span class="chart-value">{{ investment.trendPercent > 0 ? '+' : '' }}{{ investment.trendPercent }}%</span>
            </div>
            <div class="mini-chart">
              <div
                v-for="(point, index) in investment.revenueChart"
                :key="index"
                class="chart-bar"
                :style="{ height: point + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <div class="card-footer">
          <a-button size="small" @click="viewDappDetails(investment.dapp.id)">
            查看详情
          </a-button>
          <a-button size="small" @click="viewStakingDetails(investment.id)">
            收益详情
          </a-button>
          <a-button
            v-if="investment.status === 'active'"
            size="small"
            danger
            @click="handleWithdraw(investment.id)"
          >
            退出质押
          </a-button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <a-empty v-if="displayedInvestments.length === 0" description="暂无投资记录">
      <a-button type="primary" @click="goToMarket">去投资</a-button>
    </a-empty>

    <!-- 退出质押确认弹窗 -->
    <a-modal
      v-model:visible="withdrawModalVisible"
      title="退出质押"
      @ok="confirmWithdraw"
      @cancel="withdrawModalVisible = false"
    >
      <div class="withdraw-modal-content">
        <ExclamationCircleOutlined class="warning-icon" />
        <div class="modal-text">
          <h4>确认退出质押？</h4>
          <p>退出后将收回本金及所有收益，操作不可撤销。</p>
          <div class="withdraw-info">
            <div class="info-row">
              <span>本金:</span>
              <span>{{ selectedInvestment?.amount || 0 }} PUNK</span>
            </div>
            <div class="info-row">
              <span>收益:</span>
              <span class="success">+{{ selectedInvestment?.currentRevenue || 0 }} PUNK</span>
            </div>
            <div class="info-row total">
              <span>预计到账:</span>
              <span>{{ (selectedInvestment?.amount || 0) + (selectedInvestment?.currentRevenue || 0) }} PUNK</span>
            </div>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { appStore } from "@table/store";

interface Investment {
  id: number;
  dapp: {
    id: number;
    name: string;
    logo: string;
    category: string;
  };
  amount: number;
  currentRevenue: number;
  revenueRate: number;
  duration: string;
  status: 'active' | 'completed';
  startTime: string;
  revenueChart: number[];
  trendPercent: number;
}

const emit = defineEmits(['viewDapp', 'viewStakingDetails', 'goToMarket']);

const filterStatus = ref('all');
const sortBy = ref('time');
const investments = ref<Investment[]>([]);
const withdrawModalVisible = ref(false);
const selectedInvestment = ref<Investment | null>(null);

const totalInvestment = computed(() => {
  return investments.value.reduce((sum, inv) => sum + inv.amount, 0);
});

const totalRevenue = computed(() => {
  return investments.value.reduce((sum, inv) => sum + inv.currentRevenue, 0);
});

const displayedInvestments = computed(() => {
  let filtered = investments.value;

  // 状态筛选
  if (filterStatus.value !== 'all') {
    filtered = filtered.filter(inv => inv.status === filterStatus.value);
  }

  // 排序
  filtered = [...filtered].sort((a, b) => {
    switch (sortBy.value) {
      case 'amount':
        return b.amount - a.amount;
      case 'revenue':
        return b.currentRevenue - a.currentRevenue;
      case 'time':
      default:
        return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
    }
  });

  return filtered;
});

onMounted(() => {
  loadInvestments();
});

const loadInvestments = async () => {
  // Mock 数据
  investments.value = [
    {
      id: 1,
      dapp: {
        id: 1,
        name: 'Uniswap V3',
        logo: 'https://cryptologos.cc/logos/uniswap-uni-logo.png',
        category: 'DeFi'
      },
      amount: 50000,
      currentRevenue: 6250,
      revenueRate: 12.5,
      duration: '45 天',
      status: 'active',
      startTime: '2024-01-15',
      revenueChart: [20, 35, 45, 60, 75, 85, 100],
      trendPercent: 15.2
    },
    {
      id: 2,
      dapp: {
        id: 2,
        name: 'Aave Lending',
        logo: 'https://cryptologos.cc/logos/aave-aave-logo.png',
        category: 'DeFi'
      },
      amount: 30000,
      currentRevenue: 3300,
      revenueRate: 11.0,
      duration: '30 天',
      status: 'active',
      startTime: '2024-02-01',
      revenueChart: [15, 30, 50, 70, 85, 95, 100],
      trendPercent: 8.5
    },
    {
      id: 3,
      dapp: {
        id: 3,
        name: 'Compound cETH',
        logo: 'https://cryptologos.cc/logos/compound-comp-logo.png',
        category: 'DeFi'
      },
      amount: 20000,
      currentRevenue: 2100,
      revenueRate: 10.5,
      duration: '已完成',
      status: 'completed',
      startTime: '2023-12-01',
      revenueChart: [10, 25, 40, 55, 70, 85, 100],
      trendPercent: 10.5
    }
  ];
};

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

const getStatusLabel = (status: string) => {
  return status === 'active' ? '进行中' : '已完成';
};

const handleFilterChange = () => {
  // 筛选逻辑已在computed中处理
};

const handleSortChange = () => {
  // 排序逻辑已在computed中处理
};

const viewDappDetails = (dappId: number) => {
  emit('viewDapp', dappId);
};

const viewStakingDetails = (investmentId: number) => {
  emit('viewStakingDetails', investmentId);
};

const handleWithdraw = (investmentId: number) => {
  selectedInvestment.value = investments.value.find(inv => inv.id === investmentId) || null;
  withdrawModalVisible.value = true;
};

const confirmWithdraw = async () => {
  try {
    // TODO: 调用退出质押接口
    message.success('退出成功，资金将在24小时内到账');
    withdrawModalVisible.value = false;

    // 更新状态
    if (selectedInvestment.value) {
      selectedInvestment.value.status = 'completed';
    }
  } catch (error) {
    message.error('退出失败: ' + error.message);
  }
};

const goToMarket = () => {
  emit('goToMarket');
};
</script>

<style scoped>
.my-investment-page {
  height: 100%;
  overflow-y: auto;
  padding: 20px;
  color: var(--primary-text);
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 16px 0;
}

.header-stats {
  display: flex;
  gap: 16px;
}

.stat-card-small {
  flex: 1;
  background: var(--secondary-bg);
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-card-small.success {
  background: linear-gradient(135deg, rgba(82, 196, 26, 0.1) 0%, rgba(82, 196, 26, 0.05) 100%);
  border-color: rgba(82, 196, 26, 0.3);
}

.stat-card-small .label {
  font-size: 13px;
  color: var(--secondary-text);
}

.stat-card-small .value {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-text);
}

.stat-card-small.success .value {
  color: #52c41a;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px;
  background: var(--secondary-bg);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.investments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.investment-card {
  background: var(--secondary-bg);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
}

.investment-card:hover {
  border-color: rgba(167, 217, 254, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.dapp-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.dapp-logo {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  object-fit: contain;
  background: rgba(255, 255, 255, 0.05);
  padding: 4px;
}

.dapp-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dapp-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.dapp-category {
  font-size: 13px;
  color: var(--secondary-text);
  margin: 0;
}

.status-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
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

.card-body {
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-item .label {
  font-size: 13px;
  color: var(--secondary-text);
}

.info-item .value {
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-text);
}

.info-item .value.success {
  color: #52c41a;
}

.revenue-chart {
  margin-top: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.chart-title {
  font-size: 14px;
  color: var(--secondary-text);
}

.chart-value {
  font-size: 16px;
  font-weight: 600;
  color: #52c41a;
}

.mini-chart {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 60px;
}

.chart-bar {
  flex: 1;
  background: linear-gradient(180deg, #a7d9fe 0%, #8ab4f8 100%);
  border-radius: 2px 2px 0 0;
  min-height: 4px;
  transition: all 0.3s;
}

.chart-bar:hover {
  opacity: 0.7;
}

.card-footer {
  display: flex;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.card-footer :deep(.ant-btn) {
  border-radius: 8px;
}

.withdraw-modal-content {
  display: flex;
  gap: 16px;
}

.warning-icon {
  font-size: 32px;
  color: #faad14;
  flex-shrink: 0;
}

.modal-text h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
}

.modal-text p {
  margin: 0 0 16px 0;
  color: var(--secondary-text);
}

.withdraw-info {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.info-row:last-child {
  border-bottom: none;
}

.info-row.total {
  font-weight: 600;
  font-size: 16px;
  padding-top: 12px;
}

.info-row .success {
  color: #52c41a;
}
</style>
