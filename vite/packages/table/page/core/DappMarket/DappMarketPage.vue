<template>
  <div class="dappmarket">
    <NavBar></NavBar>
    <div class="header-box">
      <a-row class="navigation" align="middle">
        <a-col class="logo" :span="2">推荐</a-col>
        <a-col :span="17">
          <div class="nav-buttons">
            <a-button
              v-for="button in buttons"
              :key="button.key"
              type="text"
              :class="{'nav-button': true, 'selected': selectedButton === button.key}"
              @click="selectButton(button.key)"
            >
              <template #icon>
                <component :is="button.icon" />
              </template>
              {{ button.label }}
            </a-button>
          </div>
        </a-col>
        <a-col :span="5">
          <a-input-search
            v-model:value="searchValue"
            placeholder="搜索"
            @search="onSearch"
            class="search-bar"
          />
        </a-col>
      </a-row>
    </div>
    <div class="content">
      <a-row :gutter="[24, 24]" class="content-row-large">
        <a-col
          v-for="dapp in largeDapps"
          :key="dapp.id"
          :span="12"
          class="content-col-large"
        >
          <DappCard
            :image="dapp.imgs[0].img"
            :title="dapp.name"
            :description="dapp.description"
            :id="dapp.id"
            @click="goToDetails(dapp.id)"
          />
        </a-col>
      </a-row>
      <a-row :gutter="[24, 24]" class="content-row">
        <a-col
          v-for="dapp in smallDapps"
          :key="dapp.id"
          :span="6"
          class="content-col"
        >
          <DappCard
            :image="dapp.imgs[0].img"
            :title="dapp.name"
            :description="dapp.description"
            :id="dapp.id"
            @click="goToDetails(dapp.id)"
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { AppstoreOutlined, FundOutlined, NodeExpandOutlined, PieChartOutlined, AppstoreAddOutlined, DatabaseOutlined } from '@ant-design/icons-vue';
import DappCard from "./DappCard.vue";
import NavBar from "./NavBar.vue";
import { getDapplist } from "../../../js/service/dappMarket.ts";

const searchValue = ref<string>('');
const selectedButton = ref<string>('');
const router = useRouter();

const buttons = [
  { key: '', label: '全部', icon: AppstoreOutlined },
  { key: 'eth', label: '以太坊', icon: FundOutlined },
  { key: 'tron', label: '波场', icon: NodeExpandOutlined },
  { key: 'filecoin', label: 'Filecoin', icon: PieChartOutlined },
  { key: 'bnb', label: 'BNB Chain', icon: AppstoreAddOutlined },
  { key: 'solana', label: 'Solana', icon: DatabaseOutlined },
];
const displayedDapps = ref([]);
const currentPage = ref(1);
const pageSize = ref(6);
const totalRow = ref(0);  // 使用totalRow来表示总行数

async function fetchDappList() {
  await getDapplist(currentPage.value, pageSize.value, selectedButton.value, searchValue.value).then(res => {
    displayedDapps.value = res.data.records;
    totalRow.value = res.data.totalRow; // 确保 totalRow 正确设置
    console.log('totalRow:', res.data.totalRow);
    console.log('records:', res.data.records);
  });
}

onMounted(async () => {
  await fetchDappList();
});

const onSearch = (value: string) => {
  fetchDappList();
};

const selectButton = (key: string) => {
  selectedButton.value = key;
  fetchDappList();
};

const goToDetails = (id: number) => {
  router.push({ name: 'DappDetails', params: { id } });
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchDappList();
};

const largeDapps = computed(() => displayedDapps.value.slice(0, 2));
const smallDapps = computed(() => displayedDapps.value.slice(2));
</script>

<style scoped>
.dappmarket {
  height: 100%;
  overflow-y: auto;
}

.header-box {
  padding: 2% 2% 1% 2%;
}

.navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-buttons {
  display: flex;
  gap: 10px;
}

.nav-button {
  display: flex;
  align-items: center;
  color: white;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.nav-button > .anticon {
  margin-right: 8px;
}

.nav-button.selected {
  background-color: #a7d9fe;
  color: #ffffff;
  border-radius: 8px;
  padding: 0 12px;
}

.search-bar {
  width: 90%;
}

.content {
  height: 85%;
  padding: 16px;
}

.content-row-large {
  height: 60%;
  margin-bottom: 1%;
}

.content-row {
  height: 40%;
  margin-bottom: 1%;
}

.content-col {
  padding: 8px;
}

.content-col-large {
  padding: 8px;
}

.button-container {
  margin: 10px 16px 20px;
  display: flex;
  justify-content: center;
}
</style>
