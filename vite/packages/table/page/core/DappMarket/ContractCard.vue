<template>
  <div class="contract-card" @click="handleClick">
    <div class="card-header">
      <img :src="contract.logo" :alt="contract.name" class="contract-logo" />
      <div class="header-info">
        <h3 class="contract-name">{{ contract.name }}</h3>
        <div class="category-tag">{{ getCategoryLabel(contract.category) }}</div>
      </div>
    </div>

    <div class="contract-address">
      <span class="label">合约地址:</span>
      <span class="address" :title="contract.address">{{ truncateAddress(contract.address) }}</span>
    </div>

    <p class="contract-description">{{ contract.description }}</p>

    <div class="stats-grid">
      <div class="stat-item">
        <span class="stat-label">认证等级</span>
        <div class="stat-value">
          <a-rate :value="contract.certificationLevel" disabled allow-half style="font-size: 14px;" />
        </div>
      </div>
      <div class="stat-item">
        <span class="stat-label">访问量</span>
        <span class="stat-value">{{ formatNumber(contract.visitCount) }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">质押人数</span>
        <span class="stat-value">{{ formatNumber(contract.stakersCount) }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">质押总额</span>
        <span class="stat-value highlight">{{ formatNumber(contract.totalStaked) }} PUNK</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">收益</span>
        <span class="stat-value success">+{{ formatNumber(contract.revenue) }} PUNK</span>
      </div>
    </div>

    <div class="card-footer">
      <a-button type="primary" size="small" @click.stop="$emit('view-details', contract.address)">
        查看详情
      </a-button>
      <a-button size="small" @click.stop="$emit('stake', contract.address)">
        质押投资
      </a-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { SmartContract } from '../../../data/mockContracts';

const props = defineProps<{
  contract: SmartContract;
}>();

const emit = defineEmits(['view-details', 'stake', 'click']);

const categoryLabels = {
  finance: '金融',
  social: '社交',
  game: '游戏',
  tool: '工具',
  nft: 'NFT',
  dao: 'DAO'
};

const getCategoryLabel = (category: string) => {
  return categoryLabels[category] || category;
};

const truncateAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const handleClick = () => {
  emit('click', props.contract);
};
</script>

<style scoped>
.contract-card {
  background: var(--secondary-bg);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.contract-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  border-color: rgba(167, 217, 254, 0.5);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 12px;
}

.contract-logo {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  object-fit: contain;
  background: rgba(255, 255, 255, 0.05);
  padding: 4px;
}

.header-info {
  flex: 1;
  min-width: 0;
}

.contract-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--primary-text);
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-tag {
  display: inline-block;
  padding: 2px 8px;
  background: rgba(167, 217, 254, 0.2);
  border-radius: 6px;
  font-size: 12px;
  color: #a7d9fe;
}

.contract-address {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 13px;
}

.contract-address .label {
  color: var(--secondary-text);
}

.contract-address .address {
  color: var(--primary-text);
  font-family: monospace;
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 8px;
  border-radius: 4px;
}

.contract-description {
  font-size: 14px;
  color: var(--secondary-text);
  margin: 0 0 16px 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex-grow: 1;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--secondary-text);
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-text);
}

.stat-value.highlight {
  color: #a7d9fe;
}

.stat-value.success {
  color: #52c41a;
}

.card-footer {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.card-footer :deep(.ant-btn) {
  flex: 1;
  border-radius: 8px;
}

.card-footer :deep(.ant-btn-primary) {
  background: linear-gradient(135deg, #a7d9fe 0%, #8ab4f8 100%);
  border: none;
}

.card-footer :deep(.ant-btn-primary:hover) {
  background: linear-gradient(135deg, #8ab4f8 0%, #6a94d8 100%);
}
</style>
