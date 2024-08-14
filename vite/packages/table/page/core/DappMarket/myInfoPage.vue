<template>
  <div>
    <NavBar />
    <div class="main-container">
      <div class="sidebar">
        <a-button type="primary" block class="submit-dapp-button" @click="navigateTo('submitDapp')">Submit dapp</a-button>
        <a-menu mode="vertical" class="menu" defaultSelectedKeys="['overview']">
          <a-menu-item key="overview" @click="navigateTo('overview')">
            <AppstoreOutlined />
            Overview
          </a-menu-item>
          <a-menu-item key="myProjects" @click="navigateTo('myProjects')">
            <ProjectOutlined />
            My Projects
          </a-menu-item>
          <a-menu-item key="favorites" @click="navigateTo('favorites')">
            <StarOutlined />
            Favorites
          </a-menu-item>
          <a-menu-item key="api" @click="navigateTo('api')">
            <ApiOutlined />
            API
          </a-menu-item>
        </a-menu>
      </div>
      <div class="content">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import NavBar from './NavBar.vue';
import {
  AppstoreOutlined,
  ProjectOutlined,
  StarOutlined,
  ApiOutlined,
} from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const navigateTo = (routeName: string) => {
  router.push({ name: routeName });
};
</script>

<style scoped>
.main-container {
  /*height: 100%;*/
  /*overflow-y: auto;*/
  display: flex;
}

.sidebar {
  width: 200px;
  padding: 16px;
  border-right: 1px solid #d9d9d9;
}

.submit-dapp-button {
  margin-bottom: 16px;
}

.menu {
  border: none;
}

.menu .ant-menu-item {
  font-size: 18px; /* 增大字体 */
  cursor: pointer;
}

.content {
  flex: 1;
  padding: 16px;
}
</style>
