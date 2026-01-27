<template>
  <div class="main-container">
    <div class="sidebar">
      <a-menu mode="vertical" class="menu" v-model:selectedKeys="selectedKeys">
        <a-menu-item key="overview" @click="currentPage = 'overview'">
          <AppstoreOutlined />
          概览
        </a-menu-item>
        <a-menu-item key="submitDapp" @click="currentPage = 'submitDapp'">
          <CloudUploadOutlined />
          提交DApp
        </a-menu-item>
        <a-menu-item key="api" @click="currentPage = 'api'">
          <ApiOutlined />
          API文档
        </a-menu-item>
      </a-menu>
    </div>
    <div class="content">
      <Overview v-if="currentPage === 'overview'" />
      <SubmitDapp v-else-if="currentPage === 'submitDapp'" />
      <APIContent v-else-if="currentPage === 'api'" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import {
  AppstoreOutlined,
  CloudUploadOutlined,
  ApiOutlined,
} from '@ant-design/icons-vue';
import Overview from './Overview.vue';
import SubmitDapp from './submitDapp.vue';
import APIContent from './API.vue';

const currentPage = ref<string>('overview');
const selectedKeys = ref<string[]>(['overview']);
</script>

<style scoped>
.main-container {
  display: flex;
  height: 100%;
  color: var(--primary-text);
  gap: 12px;
}

.sidebar {
  width: 160px;
  padding: 20px 16px;
  background: transparent;
  position: relative;
}

.sidebar::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 1px;
  background: linear-gradient(180deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.1) 10%, 
    rgba(255, 255, 255, 0.2) 50%, 
    rgba(255, 255, 255, 0.1) 90%, 
    transparent 100%
  );
}

:deep(.menu) {
  border: none;
  background: transparent;
}

:deep(.menu .ant-menu-item) {
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  margin-bottom: 4px;
  padding: 10px 16px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px;
}

:deep(.menu .ant-menu-item:hover) {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.95);
}

:deep(.menu .ant-menu-item-selected) {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  font-weight: 600;
}

:deep(.menu .ant-menu-item .anticon) {
  font-size: 18px;
  transition: all 0.3s ease;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 4px;
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
</style>
