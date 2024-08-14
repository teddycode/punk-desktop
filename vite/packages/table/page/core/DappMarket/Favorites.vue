<template>
  <div class="favorites-page">
    <div class="sidebar">
      <input type="text" v-model="searchQuery" placeholder="搜索" class="search-input" />
      <div class="all-button" @click="toggleAll">
        <span>{{ allExpanded ? '➖' : '➕' }}</span> 全部 <span>（{{ displayedDapps.length }}）</span>
      </div>
      <div v-if="allExpanded" class="dapp-list">
        <div
          v-for="dapp in displayedDapps"
          :key="dapp.id"
          @click="goToDetails(dapp.id)"
          class="dapp-item"
        >
          <img :src="dapp.logo" alt="Logo" class="dapp-logo" />
          <span class="dapp-title" v-tooltip="{ content: dapp.name }">{{ dapp.name }}</span>
        </div>
      </div>
    </div>
    <div class="content">
      <a-row :gutter="[24, 24]" class="content-row">
        <a-col
          v-for="dapp in displayedDapps"
          :key="dapp.id"
          :span="6"
          class="content-col"
        >
          <div class="dapp-card" @click="goToDetails(dapp.id)">
            <img :src="dapp.imgs[0].img" alt="Dapp Image" class="dapp-image" />
            <div class="dapp-title">{{ dapp.name }}</div>
          </div>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref, computed, onMounted} from 'vue';
import { useRouter } from 'vue-router';
import {getUserCollects} from "@js/service/dappMarket";

const router = useRouter();
const selectedDapp = ref<number | null>(null);
const searchQuery = ref<string>('');
const allExpanded = ref<boolean>(true);
const displayedDapps = ref([]);
async function fetchUserCollects() {
  await getUserCollects(1).then(response => {
    displayedDapps.value = response.data
  })
}
onMounted(async () => {
   await fetchUserCollects();
});

const navigateTo = (routeName: string) => {
  router.push({ name: routeName });
};

const selectDapp = (id: number) => {
  selectedDapp.value = id;
};

const goToDetails = (id: number) => {
  router.push({ name: 'DappDetails', params: { id } });
};

const toggleAll = () => {
  allExpanded.value = !allExpanded.value;
};
</script>

<style scoped>
.favorites-page {
  display: flex;
  height: 100vh; /* Ensure the page takes the full height */
  /*overflow: hidden; !* Prevent the entire page from scrolling *!*/
}

.sidebar {
  width: 200px;
  padding-right: 16px;
  /*border-right: 1px solid #d9d9d9;*/
  /*background-color: #2c3e50;*/
  /*color: white;*/
  /*height: 100vh; !* Ensure the sidebar takes the full height *!*/
  /*overflow-y: auto; !* Make the sidebar scrollable *!*/
}

.search-input {
  width: 100%;
  padding: 8px;
  margin-bottom: 16px;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
  color: black;
}

.all-button {
  cursor: pointer;
  padding: 8px 0;
  margin-bottom: 16px;
  font-weight: bold;
}


.dapp-item {
  display: flex;
  align-items: center;
  padding: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dapp-item:hover {
  background-color: #34495e;
}

.dapp-logo {
  width: 24px;
  height: 24px;
  margin-right: 12px;
}

.content {
  flex: 1;
  padding: 16px;
  height: 100vh; /* Ensure the content takes the full height */
  overflow-y: auto; /* Make the content scrollable */
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
  padding: 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.dapp-card:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.dapp-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 8px;
}

.dapp-title {
  font-size: 16px;
  font-weight: bold;
  text-align: center;
}
</style>
