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
<!--          <a-input-search-->
<!--            v-model:value="searchValue"-->
<!--            placeholder="搜索"-->
<!--            @search="onSearch"-->
<!--            class="search-bar"-->
<!--          />-->
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
            :image="dapp.images[0]"
            :title="dapp.title"
            :description="dapp.description"
            :id="dapp.id"
            @click="goToDetails"
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
            :image="dapp.images[0]"
            :title="dapp.title"
            :description="dapp.description"
            :id="dapp.id"
            @click="goToDetails"
          />
        </a-col>
      </a-row>
    </div>
    <div class="button-container">
      <a-button type="default" block>更多Dapp</a-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { AppstoreOutlined, FundOutlined, NodeExpandOutlined, PieChartOutlined, AppstoreAddOutlined, DatabaseOutlined } from '@ant-design/icons-vue';
import DappCard from "./DappCard.vue";
import { dapps } from './data';
import NavBar from "./NavBar.vue";

// const searchValue = ref<string>('');
const selectedButton = ref<string>('all');
const router = useRouter();

const buttons = [
  { key: 'all', label: '全部', icon: AppstoreOutlined },
  { key: 'eth', label: '以太坊', icon: FundOutlined },
  { key: 'tron', label: '波场', icon: NodeExpandOutlined },
  { key: 'filecoin', label: 'Filecoin', icon: PieChartOutlined },
  { key: 'bnb', label: 'BNB Chain', icon: AppstoreAddOutlined },
  { key: 'solana', label: 'Solana', icon: DatabaseOutlined },
];

// const onSearch = (value: string) => {
//   console.log('Search:', value);
// };

const selectButton = (key: string) => {
  selectedButton.value = key;
};

const goToDetails = (id: number) => {
  router.push({ name: 'DappDetails', params: { id } });
};

const displayedDapps = computed(() => {
  if (selectedButton.value === 'all') {
    return dapps;
  }
  return dapps.filter(dapp => dapp.chain === selectedButton.value);
});

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
  /*border: 1px solid black;*/
}

.content-row-large {
  height: 60%;
  margin-bottom: 1%;
}

.content-row {
  height: 40%;
  margin-bottom: 1%;
  /*border: 1px solid black;*/
}

.content-col {
  padding: 8px;
  /*border: 1px solid black;*/
}

.content-col-large {
  padding: 8px;
}

.button-container {
  margin: 10px 16px 20px;
  display: flex;
  justify-content: center; /* 水平居中对齐 */
}
</style>
