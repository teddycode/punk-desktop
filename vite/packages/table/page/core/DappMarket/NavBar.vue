<template>
  <div class="header-box">
    <a-row class="navigation" align="middle">
      <a-col class="logo" :span="2">Logo</a-col>
      <a-col :span="12">
        <div class="nav-buttons">
          <a-button
            type="text"
            class="nav-button"
            @click="navigateTo('DappMarketPage')"
          >
            Home
          </a-button>
          <a-button
            type="text"
            class="nav-button"
            @click="navigateTo('myInfoPage')"
          >
            My Info
          </a-button>
        </div>
      </a-col>
      <a-col :span="5">
<!--        <div class="search-container">-->
<!--          <a-input-search-->
<!--            v-model:value="searchValue"-->
<!--            placeholder="Search NFT collections"-->
<!--            @search="onSearch"-->
<!--            class="search-bar"-->
<!--            enter-button-->
<!--          />-->
<!--        </div>-->
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const navigateTo = (routeName: string) => {
  router.push({ name: routeName });
};
</script>

<style scoped>
.header-box {
  padding: 2% 2% 1% 2%;
  background-color: #333;
  color: white;
}

.navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}

.nav-buttons {
  display: flex;
  gap: 10px;
}

.nav-button {
  display: flex;
  align-items: center;
  color: white !important;
  font-size: 1rem;
  font-weight: bold !important;
  transition: background-color 0.3s;
  padding: 8px 16px; /* 确保padding在悬停时保持不变 */
}

.nav-button:hover {
  background-color: #1890ff;
  color: white !important;
  border-radius: 8px;
}


.search-bar .ant-input-search-button {
  background-color: #ffc107; /* 亮黄色 */
  border: none;
  color: #333; /* 深灰色 */
  font-weight: bold;
}

.search-bar input {
  border-radius: 24px;
  background-color: #3366ff;
  color: #fff !important;
  font-weight: bold !important;
  border: none;
}
</style>
