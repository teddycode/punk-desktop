<template>
  <a-layout class="layout cc-shell">
    <a-layout-header>
      <!-- 复用共享顶栏：钱包地址/余额、网络状态、主菜单都在这里，与其它模块完全一致 -->
      <layoutHeader :style="'position: fixed;z-index:10;width:100%;'"></layoutHeader>
    </a-layout-header>
    <a-layout-content>
      <div class="cc-shell-content">
        <a-config-provider :theme="antdTheme">
          <div class="crosschain-module">
            <CrossChainAside />
            <div class="cc-main">
              <router-view />
            </div>
          </div>
        </a-config-provider>
      </div>
    </a-layout-content>
    <layout-footer />
  </a-layout>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { theme } from 'ant-design-vue'
import layoutHeader from '@page/core/Layouts/components/layout-header.vue'
import LayoutFooter from '@page/core/Layouts/components/layout-footer.vue'
import CrossChainAside from '../components/CrossChainAside.vue'
import { crossChainState, ensureLoaded } from '../services/store'

/**
 * 跨链模块外壳
 *
 * 为什么自带外框而不直接用 ThirdLayout：
 *   ThirdLayout 内部是 `<keep-alive><router-view/></keep-alive>`（Vue Router 明确不支持该写法），
 *   在它与其页面之间再插一层布局组件会抛
 *   `TypeError: Cannot read properties of null (reading 'parentNode')` 导致整页空白。
 *   因此这里照搬 ThirdLayout 的外框结构，并**直接复用同一个顶栏/页脚组件**
 *   （layoutHeader / layout-footer），保证钱包余额、网络状态、主题行为与其它模块一致，
 *   同时不改动共享布局、不影响其它功能区。
 *
 * 若将来 ThirdLayout 改成官方写法：
 *   <router-view v-slot="{ Component }"><keep-alive><component :is="Component" /></keep-alive></router-view>
 * 则本文件可简化为只渲染 aside + router-view。
 */

const isDark = computed(() => {
  if (typeof document === 'undefined') return false
  const root = document.documentElement
  const container = document.querySelector('.a-container')
  return root.classList.contains('dark-model') || Boolean(container?.classList.contains('dark'))
})

/** antd 主题与设计 token 对齐，避免模块内出现默认蓝 */
const antdTheme = computed(() => ({
  algorithm: isDark.value ? theme.darkAlgorithm : theme.defaultAlgorithm,
  token: {
    colorPrimary: isDark.value ? '#B4EB00' : '#8DB800',
    colorLink: isDark.value ? '#B4EB00' : '#759900',
    borderRadius: 12,
    colorBgLayout: isDark.value ? '#0C1210' : '#F7FAF9',
    colorBgContainer: isDark.value ? '#192421' : '#FFFFFF',
    colorBorder: isDark.value ? 'rgba(39,53,48,0.8)' : 'hsl(156 8% 87%)',
    colorText: isDark.value ? '#DCE5E2' : 'hsl(162 17% 12%)',
    colorTextSecondary: isDark.value ? '#9BB0A9' : 'hsl(165 9% 38%)',
  },
}))

onMounted(() => {
  void ensureLoaded()
})

;(window as any).__crossChainState = crossChainState
</script>

<style src="@assets/CrossChain/tokens.scss"></style>
<style src="@assets/CrossChain/layout.scss"></style>

<style>
/* 与 ThirdLayout 保持一致的底色与滚动承载（模块内部因此不再嵌套滚动，避免双滚动条） */
.cc-shell {
  min-height: 100vh;
  background: var(--cc-bg, #f7faf9);
}

.cc-shell-content {
  background: var(--cc-bg, #f7faf9);
  min-height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.cc-shell .ant-layout-content {
  background: var(--cc-bg, #f7faf9);
}
</style>
