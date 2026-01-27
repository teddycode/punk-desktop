<template>
  <div class="favorites-page">
    <div class="content">
      <div class="header">
        <div class="header-left">
          <h2 class="page-title">我的收藏 <span class="count">（{{ displayedDapps.length }}）</span></h2>
        </div>
        <div class="header-right">
          <input type="text" v-model="searchQuery" placeholder="搜索收藏的DApp..." class="search-input" />
        </div>
      </div>
      <a-row :gutter="[24, 24]" class="content-row">
        <a-col
          v-for="dapp in filteredDapps"
          :key="dapp.id"
          :span="6"
          class="content-col"
        >
          <div class="dapp-card" @click="goToDetails(dapp.id)">
            <img :src="dapp.imgs[0].img" alt="Dapp Image" class="dapp-image" />
            <div class="dapp-info">
              <div class="dapp-title" v-tooltip="{ content: dapp.name }">{{ dapp.name }}</div>
              <div class="dapp-description" v-if="dapp.description">{{ dapp.description }}</div>
            </div>
          </div>
        </a-col>
      </a-row>
      <div v-if="filteredDapps.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <div class="empty-text">{{ searchQuery ? '未找到匹配的DApp' : '暂无收藏的DApp' }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref, computed, onMounted} from 'vue';
import {getUserCollects} from "@js/service/dappMarket";

const emit = defineEmits(['viewDapp']);

const searchQuery = ref<string>('');
const displayedDapps = ref([]);

async function fetchUserCollects() {
  await getUserCollects(1).then(response => {
    displayedDapps.value = response.data
  })
}

onMounted(async () => {
   await fetchUserCollects();
});

const filteredDapps = computed(() => {
  if (!searchQuery.value) {
    return displayedDapps.value;
  }
  return displayedDapps.value.filter(dapp => 
    dapp.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const goToDetails = (id: number) => {
  emit('viewDapp', id);
};
</script>

<style scoped>
.favorites-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  color: var(--primary-text);
}

.content {
  flex: 1;
  padding: 24px;
  height: 100%;
  overflow-y: auto;
}

.content::-webkit-scrollbar {
  width: 6px;
}

.content::-webkit-scrollbar-track {
  background: transparent;
}

.content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 20px;
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: #000000;
}

.count {
  font-size: 18px;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.6);
  margin-left: 8px;
}

.header-right {
  flex-shrink: 0;
}

.search-input {
  width: 280px;
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.08);
  color: var(--primary-text);
  font-size: 14px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.05);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.content-row {
  display: flex;
  flex-wrap: wrap;
}

.content-col {
  padding: 8px;
}

.dapp-card {
  width: 100%;
  background: var(--secondary-bg);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.dapp-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.dapp-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.dapp-info {
  padding: 16px;
  height: 80px;
  display: flex;
  flex-direction: column;
}

.dapp-title {
  font-size: 16px;
  font-weight: 600;
  color: #000000;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dapp-description {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.6);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 16px;
  color: rgba(0, 0, 0, 0.5);
}
</style>
