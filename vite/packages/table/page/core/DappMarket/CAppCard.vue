<template>
  <a-card hoverable class="capp-card" @click="handleClick">
    <div class="card-header">
      <div class="app-icon">
        <img :src="icon" :alt="name" />
      </div>
      <div class="app-info">
        <div class="app-name">{{ name }}</div>
        <div class="app-category">
          <component :is="categoryIcon" class="category-icon" />
          <span>{{ categoryLabel }}</span>
        </div>
      </div>
      <div class="app-badge" v-if="isNew">
        <span class="badge-new">NEW</span>
      </div>
    </div>
    
    <div class="card-stats">
      <div class="stat-item">
        <a-rate :value="rating" disabled allow-half style="font-size: 12px;" />
        <span class="rating-text">{{ rating.toFixed(1) }}</span>
      </div>
      
      <div class="stat-row">
        <div class="stat-item-inline">
          <DownloadOutlined class="stat-icon" />
          <span class="stat-label">日下载:</span>
          <span class="stat-value">{{ formatNumber(dailyDownloads) }}</span>
        </div>
        <div class="stat-item-inline">
          <DownloadOutlined class="stat-icon" />
          <span class="stat-label">周下载:</span>
          <span class="stat-value">{{ formatNumber(weeklyDownloads) }}</span>
        </div>
      </div>
      
      <div class="stat-row">
        <div class="stat-item-inline">
          <ClockCircleOutlined class="stat-icon" />
          <span class="stat-label">发布:</span>
          <span class="stat-value">{{ formatDate(publishDate) }}</span>
        </div>
        <div class="stat-item-inline">
          <CloudDownloadOutlined class="stat-icon" />
          <span class="stat-label">总下载:</span>
          <span class="stat-value highlight">{{ formatNumber(totalDownloads) }}</span>
        </div>
      </div>
    </div>
  </a-card>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { 
  DownloadOutlined, 
  ClockCircleOutlined,
  CloudDownloadOutlined,
  ToolOutlined,
  DollarOutlined,
  WalletOutlined,
  RobotOutlined,
  TeamOutlined
} from '@ant-design/icons-vue';

const props = defineProps<{
  id: number;
  name: string;
  icon: string;
  category: string; // 'dev-tools' | 'finance' | 'asset' | 'agent' | 'social'
  rating: number; // 0-5
  dailyDownloads: number;
  weeklyDownloads: number;
  totalDownloads: number;
  publishDate: string;
  isNew?: boolean;
}>();

const emits = defineEmits(['click']);

const categoryMap = {
  'dev-tools': { label: '开发工具', icon: ToolOutlined },
  'finance': { label: '金融分析', icon: DollarOutlined },
  'asset': { label: '资产管理', icon: WalletOutlined },
  'agent': { label: 'Agent服务', icon: RobotOutlined },
  'social': { label: '社交网络', icon: TeamOutlined },
};

const categoryLabel = computed(() => categoryMap[props.category]?.label || '其他');
const categoryIcon = computed(() => categoryMap[props.category]?.icon || ToolOutlined);

const handleClick = () => {
  emits('click', props.id);
};

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays}天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}月前`;
  return `${Math.floor(diffDays / 365)}年前`;
};
</script>

<style scoped>
.capp-card {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.capp-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 12px 32px rgba(167, 217, 254, 0.3);
  border-color: rgba(167, 217, 254, 0.5);
  background: linear-gradient(135deg, rgba(167, 217, 254, 0.15) 0%, rgba(138, 180, 248, 0.1) 100%);
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  position: relative;
}

.app-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(167, 217, 254, 0.2) 0%, rgba(138, 180, 248, 0.15) 100%);
  border: 2px solid rgba(167, 217, 254, 0.3);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.app-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.app-info {
  flex: 1;
  min-width: 0;
}

.app-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary-text);
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.app-category {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--secondary-text);
  padding: 4px 10px;
  background: rgba(167, 217, 254, 0.15);
  border-radius: 8px;
  width: fit-content;
  border: 1px solid rgba(167, 217, 254, 0.2);
}

.category-icon {
  font-size: 14px;
  color: #a7d9fe;
}

.app-badge {
  position: absolute;
  top: 12px;
  right: 12px;
}

.badge-new {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  color: white;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(255, 107, 107, 0.6);
  }
}

.card-stats {
  padding: 12px 16px 16px;
  background: rgba(0, 0, 0, 0.15);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.rating-text {
  font-size: 14px;
  font-weight: 600;
  color: #fadb14;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.stat-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.stat-row:last-child {
  margin-bottom: 0;
}

.stat-item-inline {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  flex: 1;
}

.stat-icon {
  color: #a7d9fe;
  font-size: 13px;
}

.stat-label {
  color: var(--secondary-text);
  white-space: nowrap;
}

.stat-value {
  color: var(--primary-text);
  font-weight: 600;
}

.stat-value.highlight {
  color: #a7d9fe;
  font-weight: 700;
}

:deep(.ant-card-body) {
  padding: 0;
}
</style>
