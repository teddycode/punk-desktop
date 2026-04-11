<template>
  <div class="capp-store">
    <div class="header-box">
      <a-row class="navigation-row" align="middle" :gutter="24">
        <a-col :span="2">
          <div class="logo">
            <img src="/images/dapps/capp-store.png" alt="CApp Store" />
          </div>
        </a-col>
        <a-col :span="15">
          <div class="filter-section">
            <div class="filter-buttons">
              <a-button
                v-for="category in cappCategories"
                :key="category.key"
                type="text"
                size="small"
                :class="{'filter-button': true, 'selected': selectedCategory === category.key}"
                @click="selectCategory(category.key)"
              >
                <template #icon>
                  <component :is="category.icon" />
                </template>
                {{ category.label }}
              </a-button>
            </div>
          </div>
        </a-col>
        <a-col :span="3">
          <div class="sort-section">
            <xt-select
              v-model="sortBy"
              :list="sortOptions"
              class="sort-select"
            />
          </div>
        </a-col>
        <a-col :span="4">
          <a-input-search
            v-model:value="searchValue"
            placeholder="搜索 CApp..."
            @search="onSearch"
            class="search-bar"
            size="large"
          />
        </a-col>
      </a-row>
    </div>
    
    <div class="content">
      <a-row :gutter="[24, 24]" class="content-row">
        <a-col
          v-for="capp in displayedCapps"
          :key="capp.id"
          :span="6"
          class="content-col"
        >
          <CAppCard
            :id="capp.id"
            :name="capp.name"
            :icon="capp.icon"
            :category="capp.category"
            :rating="capp.rating"
            :dailyDownloads="capp.dailyDownloads"
            :weeklyDownloads="capp.weeklyDownloads"
            :totalDownloads="capp.totalDownloads"
            :publishDate="capp.publishDate"
            :isNew="capp.isNew"
            @click="goToDetails(capp.id)"
          />
        </a-col>
      </a-row>
    </div>
    
    <div class="button-container">
      <a-pagination
        :current="currentPage"
        :pageSize="pageSize"
        :total="totalRow"
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
  ToolOutlined,
  DollarOutlined,
  WalletOutlined,
  RobotOutlined,
  TeamOutlined
} from '@ant-design/icons-vue';
import CAppCard from "./CAppCard.vue";

const emit = defineEmits(['viewCAppDetails']);

const searchValue = ref<string>('');
const selectedCategory = ref<string>('');
const sortBy = ref<string>('hot');

// 排序选项
const sortOptions = [
  { value: 'hot', name: '🔥 热度' },
  { value: 'time', name: '🕐 最新' },
  { value: 'downloads', name: '📥 下载量' },
  { value: 'rating', name: '⭐ 评分' },
];

// CApp分类
const cappCategories = [
  { key: '', label: '全部', icon: AppstoreOutlined },
  { key: 'dev-tools', label: '开发工具', icon: ToolOutlined },
  { key: 'finance', label: '金融分析', icon: DollarOutlined },
  { key: 'asset', label: '资产管理', icon: WalletOutlined },
  { key: 'agent', label: 'Agent服务', icon: RobotOutlined },
  { key: 'social', label: '社交网络', icon: TeamOutlined },
];

// 模拟数据 - 实际应该从API获取
const mockCapps = ref([
  {
    id: 1,
    name: 'VS Code Extension',
    icon: 'https://pic1.imgdb.cn/item/69889816ac0326447d74a5e0.png',
    category: 'dev-tools',
    rating: 4.8,
    dailyDownloads: 1250,
    weeklyDownloads: 8500,
    totalDownloads: 125000,
    publishDate: '2026-01-15',
    isNew: true,
  },
  {
    id: 2,
    name: 'DeFi Analytics Pro',
    icon: 'https://pic1.imgdb.cn/item/69889816ac0326447d74a5dc.png',
    category: 'finance',
    rating: 4.6,
    dailyDownloads: 980,
    weeklyDownloads: 6800,
    totalDownloads: 98000,
    publishDate: '2026-01-10',
    isNew: false,
  },
  {
    id: 3,
    name: 'Wallet Manager',
    icon: 'https://pic1.imgdb.cn/item/69889816ac0326447d74a5df.png',
    category: 'asset',
    rating: 4.9,
    dailyDownloads: 2100,
    weeklyDownloads: 14500,
    totalDownloads: 256000,
    publishDate: '2025-12-20',
    isNew: false,
  },
  {
    id: 4,
    name: 'AI Trading Bot',
    icon: 'https://pic1.imgdb.cn/item/69889816ac0326447d74a5e1.png',
    category: 'agent',
    rating: 4.7,
    dailyDownloads: 1580,
    weeklyDownloads: 11000,
    totalDownloads: 187000,
    publishDate: '2026-01-05',
    isNew: true,
  },
  {
    id: 5,
    name: 'Web3 Social Hub',
    icon: 'https://pic1.imgdb.cn/item/69889816ac0326447d74a5de.png',
    category: 'social',
    rating: 4.5,
    dailyDownloads: 890,
    weeklyDownloads: 6200,
    totalDownloads: 75000,
    publishDate: '2026-01-20',
    isNew: true,
  },
  {
    id: 6,
    name: 'Smart Contract IDE',
    icon: 'https://pic1.imgdb.cn/item/69889816ac0326447d74a5dd.png',
    category: 'dev-tools',
    rating: 4.8,
    dailyDownloads: 1350,
    weeklyDownloads: 9400,
    totalDownloads: 142000,
    publishDate: '2025-12-28',
    isNew: false,
  },
  {
    id: 7,
    name: 'Portfolio Tracker',
    icon: 'https://pic1.imgdb.cn/item/698898c0ac0326447d74a5e8.png',
    category: 'finance',
    rating: 4.7,
    dailyDownloads: 1120,
    weeklyDownloads: 7800,
    totalDownloads: 112000,
    publishDate: '2026-01-08',
    isNew: false,
  },
  {
    id: 8,
    name: 'NFT Asset Manager',
    icon: 'https://pic1.imgdb.cn/item/698898c0ac0326447d74a5ea.png',
    category: 'asset',
    rating: 4.6,
    dailyDownloads: 950,
    weeklyDownloads: 6600,
    totalDownloads: 89000,
    publishDate: '2026-01-12',
    isNew: true,
  },
]);

const displayedCapps = ref([]);
const currentPage = ref(1);
const pageSize = ref(8);
const totalRow = ref(0);

async function fetchCAppList() {
  // 模拟API调用 - 实际应该调用真实API
  let filteredCapps = [...mockCapps.value];
  
  // 分类筛选
  if (selectedCategory.value) {
    filteredCapps = filteredCapps.filter(capp => capp.category === selectedCategory.value);
  }
  
  // 搜索筛选
  if (searchValue.value) {
    filteredCapps = filteredCapps.filter(capp => 
      capp.name.toLowerCase().includes(searchValue.value.toLowerCase())
    );
  }
  
  // 排序
  switch (sortBy.value) {
    case 'time':
      filteredCapps.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
      break;
    case 'downloads':
      filteredCapps.sort((a, b) => b.totalDownloads - a.totalDownloads);
      break;
    case 'rating':
      filteredCapps.sort((a, b) => b.rating - a.rating);
      break;
    case 'hot':
    default:
      filteredCapps.sort((a, b) => b.weeklyDownloads - a.weeklyDownloads);
      break;
  }
  
  totalRow.value = filteredCapps.length;
  
  // 分页
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  displayedCapps.value = filteredCapps.slice(start, end);
}

onMounted(async () => {
  await fetchCAppList();
});

const onSearch = (value: string) => {
  currentPage.value = 1;
  fetchCAppList();
};

const selectCategory = (key: string) => {
  selectedCategory.value = key;
  currentPage.value = 1;
  fetchCAppList();
};

watch(sortBy, () => {
  currentPage.value = 1;
  fetchCAppList();
});

const goToDetails = (id: number) => {
  emit('viewCAppDetails', id);
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchCAppList();
};
</script>

<style scoped>
.capp-store {
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
  position: relative;
  z-index: 100;
  overflow: visible;
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

.logo-text {
  font-size: 1.6rem;
  font-weight: 800;
  background: linear-gradient(135deg, #a7d9fe 0%, #8ab4f8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
  white-space: nowrap;
}

.filter-section {
  display: flex;
  align-items: center;
  gap: 16px;
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
  position: relative;
  overflow: visible;
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
  min-height: 70%;
  padding: 0 4px;
  margin-bottom: 20px;
}

.content-row {
  min-height: 400px;
}

.content-col {
  padding: 8px;
  min-height: 220px;
}

.button-container {
  margin: 10px 16px 20px;
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
