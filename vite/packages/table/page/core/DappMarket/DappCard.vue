<template>
  <a-card hoverable class="dapp-card" @click="handleClick">
    <template #cover>
      <div class="image-container">
        <img :src="image" alt="Dapp Image" class="dapp-image" />
        <div class="overlay">
          <a-card-meta class="dapp-meta" :title="title">
            <template #description>
              <div class="description">{{ description }}</div>
            </template>
          </a-card-meta>
        </div>
      </div>
    </template>
    <div class="card-stats" v-if="qualityLevel || visitCount || stakersCount">
      <div class="stat-row" v-if="qualityLevel">
        <span class="stat-label">质量等级:</span>
        <a-rate :value="qualityLevel" disabled allow-half style="font-size: 14px;" />
      </div>
      <div class="stat-row" v-if="visitCount">
        <span class="stat-label">访问量:</span>
        <span class="stat-value">{{ formatNumber(visitCount) }}</span>
      </div>
      <div class="stat-row" v-if="stakersCount">
        <span class="stat-label">质押人数:</span>
        <span class="stat-value">{{ formatNumber(stakersCount) }}</span>
      </div>
      <div class="stat-row" v-if="totalStaked">
        <span class="stat-label">投资总额:</span>
        <span class="stat-value highlight">{{ formatNumber(totalStaked) }} PUNK</span>
      </div>
      <div class="stat-row" v-if="revenue">
        <span class="stat-label">收益:</span>
        <span class="stat-value success">+{{ formatNumber(revenue) }} PUNK</span>
      </div>
    </div>
  </a-card>
</template>

<script lang="ts" setup>
const props = defineProps<{
  image: string;
  title: string;
  description: string;
  id: number;
  qualityLevel?: number; // 质量等级 1-5
  visitCount?: number; // 访问量
  stakersCount?: number; // 质押人数
  totalStaked?: number; // 投资总额（PUNK）
  stakingCap?: number; // 投资上限（PUNK）
  revenue?: number; // 收益（PUNK）
}>();

const emits = defineEmits(['click']);

const handleClick = () => {
  emits('click', props.id);
};

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};
</script>

<style scoped>
.dapp-card {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: var(--secondary-bg);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.dapp-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.dapp-image {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.dapp-card:hover .dapp-image {
  transform: scale(1.05);
}

.overlay {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  padding: 10px;
  color: var(--primary-text);
}

:deep(.dapp-meta .ant-card-meta-title) {
  color: var(--primary-text);
}

:deep(.dapp-meta .ant-card-meta-description) {
  color: rgba(255, 255, 255, 0.8);
}

.description {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-stats {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-size: 13px;
}

.stat-label {
  color: var(--secondary-text);
}

.stat-value {
  color: var(--primary-text);
  font-weight: 600;
}

.stat-value.highlight {
  color: #a7d9fe;
}

.stat-value.success {
  color: #52c41a;
}
</style>
