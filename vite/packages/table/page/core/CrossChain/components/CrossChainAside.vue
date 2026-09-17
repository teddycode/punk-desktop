<template>
  <nav class="cc-aside">
    <template v-for="group in groups" :key="group.title">
      <div class="cc-aside-group">{{ group.title }}</div>
      <router-link
        v-for="item in group.items"
        :key="item.routeName"
        class="cc-aside-item"
        :class="{ 'is-active': isActive(item) }"
        :to="{ name: item.routeName }"
      >
        <component :is="item.icon" class="cc-aside-icon" />
        <span>{{ item.label }}</span>
      </router-link>
    </template>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import {
  AppstoreOutlined,
  CloudUploadOutlined,
  DeploymentUnitOutlined,
  GlobalOutlined,
  ProfileOutlined,
  SettingOutlined,
} from '@ant-design/icons-vue'

interface NavItem {
  routeName: string
  label: string
  icon: any
  /** 命中该前缀时视为选中（用于详情页高亮父级） */
  matchPrefix?: string
}

const route = useRoute()

const groups: Array<{ title: string; items: NavItem[] }> = [
  {
    title: '跨链业务',
    items: [
      { routeName: 'CrossChainDashboard', label: '跨链工作台', icon: AppstoreOutlined, matchPrefix: 'CrossChainDashboard' },
      { routeName: 'CrossChainCreate', label: '发起跨链', icon: CloudUploadOutlined, matchPrefix: 'CrossChainCreate' },
      { routeName: 'CrossChainMyTasks', label: '我的任务', icon: ProfileOutlined, matchPrefix: 'CrossChainTask' },
      { routeName: 'CrossChainNetwork', label: '跨链网络', icon: GlobalOutlined, matchPrefix: 'CrossChainNetwork' },
    ],
  },
  {
    title: '运营与管理',
    items: [
      { routeName: 'CrossChainRelay', label: '中继工作台', icon: DeploymentUnitOutlined, matchPrefix: 'CrossChainRelay' },
      { routeName: 'CrossChainManage', label: '跨链管理', icon: SettingOutlined, matchPrefix: 'CrossChainManage' },
    ],
  },
]

function isActive(item: NavItem): boolean {
  const current = String(route.name || '')
  if (current === item.routeName) return true
  if (!item.matchPrefix) return false
  return current.startsWith(item.matchPrefix)
}
</script>
