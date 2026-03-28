<template>
  <div class="contract-market">
    <div class="header-box">
      <a-row class="navigation-row" align="middle" :gutter="24">
        <a-col :span="2">
          <div class="logo">
            <img src="/images/dapps/contract-store.png" alt="合约广场" />
          </div>
        </a-col>
        <a-col :span="15">
          <div class="filter-section">
            <span class="filter-label">分类:</span>
            <div class="filter-buttons">
              <a-button
                v-for="cat in categories"
                :key="cat.key"
                :class="['filter-button', { selected: selectedCategory === cat.key }]"
                @click="selectCategory(cat.key)"
              >
                <component :is="cat.icon" />
                {{ cat.label }}
              </a-button>
            </div>
          </div>
        </a-col>
        <a-col :span="4">
          <div class="sort-section">
            <FireOutlined class="sort-label" />
            <xt-select
              v-model="sortBy"
              :list="sortOptions"
              class="sort-select"
            />
          </div>
        </a-col>
        <a-col :span="3">
          <a-input-search
            v-model:value="searchValue"
            placeholder="搜索合约..."
            class="search-bar"
            @search="onSearch"
          />
        </a-col>
      </a-row>
    </div>

    <div class="content">
      <a-row :gutter="[24, 24]">
        <a-col
          v-for="contract in displayedContracts"
          :key="contract.id"
          :span="6"
          class="content-col"
        >
          <ContractCard
            :contract="contract"
            @view-details="handleViewDetails"
            @stake="handleStake"
          />
        </a-col>
      </a-row>
    </div>

    <div class="button-container">
      <a-pagination
        v-model:current="currentPage"
        :total="filteredContracts.length"
        :page-size="pageSize"
        @change="handlePageChange"
        showQuickJumper
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';
import {
  AppstoreOutlined,
  WalletOutlined,
  TeamOutlined,
  RocketOutlined,
  ToolOutlined,
  PictureOutlined,
  BankOutlined,
  FireOutlined
} from '@ant-design/icons-vue';
import ContractCard from './ContractCard.vue';
import { mockContracts, SmartContract } from '../../../data/mockContracts';

const emit = defineEmits(['viewContractDetails', 'stakeContract']);

const searchValue = ref<string>('');
const selectedCategory = ref<string>('');  
const sortBy = ref<string>('hot');
const currentPage = ref(1);
const pageSize = ref(16);

// 排序选项
const sortOptions = [
  { value: 'hot', name: '🔥 最热门' },
  { value: 'stakers', name: '👥 质押人数' },
  { value: 'staked', name: '💰 质押总额' },
  { value: 'revenue', name: '📈 收益最高' },
  { value: 'certification', name: '⭐ 认证等级' },
];

const categories = [
  { key: '', label: '全部', icon: AppstoreOutlined },
  { key: 'finance', label: '金融', icon: WalletOutlined },
  { key: 'nft', label: 'NFT', icon: PictureOutlined },
  { key: 'game', label: '游戏', icon: RocketOutlined },
  { key: 'social', label: '社交', icon: TeamOutlined },
  { key: 'tool', label: '工具', icon: ToolOutlined },
  { key: 'dao', label: 'DAO', icon: BankOutlined },
];

// 过滤和排序逻辑
const filteredContracts = computed(() => {
  let contracts = [...mockContracts];

  // 分类过滤
  if (selectedCategory.value) {
    contracts = contracts.filter(c => c.category === selectedCategory.value);
  }

  // 搜索过滤
  if (searchValue.value) {
    const search = searchValue.value.toLowerCase();
    contracts = contracts.filter(c =>
      c.name.toLowerCase().includes(search) ||
      c.address.toLowerCase().includes(search) ||
      c.description.toLowerCase().includes(search)
    );
  }

  // 排序
  switch (sortBy.value) {
    case 'hot':
      contracts.sort((a, b) => b.visitCount - a.visitCount);
      break;
    case 'stakers':
      contracts.sort((a, b) => b.stakersCount - a.stakersCount);
      break;
    case 'staked':
      contracts.sort((a, b) => b.totalStaked - a.totalStaked);
      break;
    case 'revenue':
      contracts.sort((a, b) => b.revenue - a.revenue);
      break;
    case 'certification':
      contracts.sort((a, b) => b.certificationLevel - a.certificationLevel);
      break;
  }

  return contracts;
});

const displayedContracts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredContracts.value.slice(start, end);
});

const onSearch = (value: string) => {
  currentPage.value = 1;
};

const selectCategory = (key: string) => {
  selectedCategory.value = key;
  currentPage.value = 1;
};

// 监听 sortBy 变化，自动触发数据刷新
watch(sortBy, () => {
  currentPage.value = 1;
});

const handleViewDetails = (address: string) => {
  emit('viewContractDetails', address);
};

const handleStake = (address: string) => {
  emit('stakeContract', address);
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
};
</script>

<style scoped>
.contract-market {
  height: 100%;
  overflow-y: auto;
  color: var(--primary-text);
  padding: 20px;
}

.header-box {
  padding: 20px 28px;
  background: linear-gradient(135deg, rgba(167, 217, 254, 0.15) 0%, rgba(138, 180, 248, 0.1) 100%);
  border-radius: 16px;
  margin-bottom: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.navigation-row {
  margin-bottom: 0;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  font-weight: 800;
  background: linear-gradient(135deg, #a7d9fe 0%, #8ab4f8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
  white-space: nowrap;
}

.logo img {
  width: 150px;
  height: 66px;
  object-fit: contain;
  display: block;
}

.filter-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.filter-label {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--primary-text);
  white-space: nowrap;
  opacity: 0.95;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filter-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.filter-button {
  display: flex;
  align-items: center;
  color: var(--primary-text);
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(255, 255, 255, 0.08);
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 8px 16px;
  height: auto;
}

.filter-button:hover {
  background: rgba(167, 217, 254, 0.25);
  border-color: rgba(167, 217, 254, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(167, 217, 254, 0.35);
}

.filter-button > .anticon {
  margin-right: 6px;
  font-size: 1.1rem;
}

.filter-button.selected {
  background: linear-gradient(135deg, rgba(167, 217, 254, 0.5) 0%, rgba(138, 180, 248, 0.4) 100%);
  border-color: #a7d9fe;
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 6px 20px rgba(167, 217, 254, 0.5);
  transform: translateY(-1px);
}

.sort-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sort-label {
  font-size: 1.3rem;
  opacity: 0.9;
}

:deep(.sort-select) {
  flex: 1;
  width: 100%;
}

:deep(.sort-select .ant-select-selector) {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1.5px solid rgba(255, 255, 255, 0.25) !important;
  border-radius: 12px !important;
  color: var(--primary-text) !important;
  transition: all 0.3s ease;
  height: 44px;
  display: flex;
  align-items: center;
  font-weight: 500;
}

:deep(.sort-select .ant-select-selector:hover) {
  background: rgba(255, 255, 255, 0.15) !important;
  border-color: rgba(167, 217, 254, 0.6) !important;
  box-shadow: 0 4px 12px rgba(167, 217, 254, 0.25);
}

:deep(.sort-select .ant-select-selection-item) {
  color: var(--primary-text) !important;
  font-weight: 600;
  font-size: 0.95rem;
}

:deep(.sort-select .ant-select-arrow) {
  color: var(--primary-text) !important;
}

/* 下拉菜单样式 - 透明背景 */
:deep(.ant-select-dropdown) {
  z-index: 99999 !important;
  background: rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(10px);
  border: 1.5px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 12px !important;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2) !important;
  overflow: hidden;
  padding: 4px;
}

:deep(.ant-select-dropdown .rc-virtual-list),
:deep(.ant-select-dropdown .rc-virtual-list-holder),
:deep(.ant-select-dropdown .ant-select-item-empty) {
  background: transparent !important;
}

:deep(.ant-select-item) {
  color: var(--primary-text) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  background: transparent !important;
  border-radius: 8px !important;
  padding: 8px 12px !important;
  font-size: 0.95rem !important;
  font-weight: 500 !important;
}

:deep(.ant-select-item:hover) {
  background: rgba(167, 217, 254, 0.25) !important;
  transform: translateX(2px);
}

:deep(.ant-select-item-option-selected) {
  background: linear-gradient(135deg, rgba(167, 217, 254, 0.5) 0%, rgba(138, 180, 248, 0.4) 100%) !important;
  color: #ffffff !important;
  font-weight: 700 !important;
  box-shadow: 0 2px 8px rgba(167, 217, 254, 0.3);
}

:deep(.search-bar) {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  transition: all 0.3s ease;
  overflow: hidden;
}

:deep(.search-bar:hover) {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(167, 217, 254, 0.6);
  box-shadow: 0 4px 16px rgba(167, 217, 254, 0.25);
}

:deep(.search-bar input) {
  background: transparent !important;
  color: var(--primary-text) !important;
  font-size: 1rem;
  font-weight: 500;
}

:deep(.search-bar input::placeholder) {
  color: rgba(255, 255, 255, 0.5);
  font-weight: 400;
}

:deep(.search-bar .ant-input-search-button) {
  background: linear-gradient(135deg, #a7d9fe 0%, #8ab4f8 100%);
  border: none;
  height: 100%;
  transition: all 0.3s ease;
}

:deep(.search-bar .ant-input-search-button:hover) {
  background: linear-gradient(135deg, #8ab4f8 0%, #6a94d8 100%);
  box-shadow: 0 0 20px rgba(167, 217, 254, 0.5);
}

.content {
  min-height: 500px;
  padding: 0 4px;
}

.content-col {
  padding: 8px;
}

.button-container {
  margin: 20px 16px;
  display: flex;
  justify-content: center;
}

:deep(.ant-pagination-item) {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.25);
  transition: all 0.3s ease;
}

:deep(.ant-pagination-item:hover) {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(167, 217, 254, 0.5);
}

:deep(.ant-pagination-item a) {
  color: var(--primary-text);
  font-weight: 500;
}

:deep(.ant-pagination-item-active) {
  background: linear-gradient(135deg, rgba(167, 217, 254, 0.4) 0%, rgba(138, 180, 248, 0.3) 100%);
  border-color: #a7d9fe;
  box-shadow: 0 4px 12px rgba(167, 217, 254, 0.3);
}

:deep(.ant-pagination-item-active a) {
  color: #ffffff;
  font-weight: 700;
}

:deep(.ant-pagination-prev),
:deep(.ant-pagination-next) {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.25);
}

:deep(.ant-pagination-prev:hover),
:deep(.ant-pagination-next:hover) {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(167, 217, 254, 0.5);
}
</style>
