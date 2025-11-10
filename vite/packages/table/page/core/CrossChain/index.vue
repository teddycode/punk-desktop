<script lang="ts" setup>
import { useRoute } from 'vue-router';
const route = useRoute();  // 获取当前路由信息
</script>

<template>
  <a-layout class="main-layout">
    <!-- 顶部导航栏 -->
    <a-layout-header class="header-bar">
      <div class="header-left">
        <div class="logo">
          <img src="https://cryptologos.cc/logos/bitcoin-btc-logo.png" alt="Logo" />
          <span>盘古系统跨链区</span>
        </div>
        <ul class="menu-links">
          <li><router-link :to="{name: 'CrossChainPage'}">首页</router-link></li>
          <li><router-link :to="{name: 'CrossChainPage'}">浏览器</router-link></li>
          <li><router-link :to="{name: 'Relay'}">搬运工</router-link></li>
          <li><router-link :to="{name: 'Manager'}">用户</router-link></li>
          <li><router-link :to="{name: 'Manager'}">管理者</router-link></li>
        </ul>
      </div>
      <div class="header-right">
        <div class="search-box">
          <input
            type="text"
            placeholder="请输入关键字"
            class="search-input"
          />
          <button class="search-btn">搜索</button>
        </div>
      </div>
    </a-layout-header>

    <!-- 面包屑导航 -->
    <div class="breadcrumb-container">
      <a-breadcrumb>
        <a-breadcrumb-item>
          <router-link :to="{name: 'CrossChainPage'}">跨链区概览</router-link>
        </a-breadcrumb-item>
        <a-breadcrumb-item>
          <span class="current-path">跨链桥详情</span>
        </a-breadcrumb-item>
      </a-breadcrumb>
    </div>

    <!-- 主体内容 -->
    <a-layout-content class="main1-content">
      <router-view />
    </a-layout-content>
  </a-layout>
</template>

<style scoped lang="scss">
.main-layout {
  min-height: 300vh;
  display: flex;
  flex-direction: column;

  /* 顶部导航栏样式 */
  /* 主布局调整 */
  .header-bar {
    display: flex;
    align-items: center; /* 使整个导航区域的内容完全垂直对齐 */
    justify-content: space-between; /* 左右内容分布 */
    height: 64px; /* 顶部栏固定高度 */
    padding: 0 24px;
    background: #fff;
    border-bottom: 1px solid #e0e0e0;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);

    /* 左侧部分(LOGO + 导航菜单) */
    .header-left {
      display: flex;
      align-items: center; /* 垂直居中对齐 */
      gap: 32px; /* LOGO 与菜单之间的间距（可调） */

      .logo {
        display: flex;
        align-items: center; /* LOGO 与文字垂直居中 */
        margin-right: 32px;

        img {
          height: 32px; /* LOGO 图片尺寸 */
          width: 32px;
          margin-right: 8px; /* LOGO和文字的间距 */
        }

        span {
          font-size: 18px;
          font-weight: bold;
          color: #333;
          line-height: 64px; /* 与 header-bar 的高度匹配，确保基线对齐 */
        }
      }

      /* 菜单选项 */
      .menu-links {
        display: flex;
        list-style: none;
        margin: 0;
        padding: 0;

        li {
          margin: 0 16px;

          a {
            color: #555;
            font-size: 14px;
            font-weight: 500;
            text-decoration: none;
            line-height: 64px; /* 确保文字对齐 header-bar 高度 */
            transition: color 0.3s ease;

            &:hover {
              color: #1890ff;
            }
          }
        }
      }
    }

    /* 搜索栏部分 */
    .header-right {
      .search-box {
        display: flex;
        align-items: center; /* 垂直居中对齐 */
        justify-content: space-between;
        padding: 0 8px; /* 减小整体内边距 */
        border: 1px solid #d9d9d9;
        background: #ffffff;
        border-radius: 16px; /* 更小圆角 */
        height: 32px; /* 搜索框高度与导航菜单文字匹配 */
        min-width: 280px;
        transition: border-color 0.3s;

        &:hover {
          border-color: #40a9ff;
        }

        .search-input {
          flex: 1;
          border: none;
          outline: none;
          padding: 0 8px; /* 调整左右间距 */
          font-size: 14px; /* 字体大小与菜单一致 */
          line-height: 32px; /* 确保占位符文字对齐 */
          color: #333;
          background: transparent;

          &::placeholder {
            color: #aaaaaa;
            line-height: 32px; /* 等同于 search-box 高度 */
          }
        }

        .search-btn {
          margin-left: 8px;
          height: 32px; /* 与搜索框高度一致 */
          padding: 0 12px;
          line-height: 32px; /* 文字居中 */
          background: #1890ff;
          color: #ffffff;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          cursor: pointer;

          &:hover {
            background: #40a9ff;
          }

          &:active {
            background: #096dd9;
          }
        }
      }
    }
  }
  /* 面包屑样式 */
  .breadcrumb-container {
    background: #fff;
    padding: 12px 24px;
    border-bottom: 1px solid #e8e8e8;
    margin-top: 8px;

    a-breadcrumb {
      font-size: 14px;

      :deep(.ant-breadcrumb-link a) {
        color: #555;
        font-weight: 500;
        text-decoration: none;
        transition: color 0.3s;

        &:hover {
          color: #1890ff;
        }
      }

      :deep(.ant-breadcrumb-separator) {
        color: #ccc;
        margin: 0 8px;
      }

      :deep(.current-path) {
        font-weight: bold;
        color: #1890ff;
      }
    }
  }

  /* 主体内容 */
  .main1-content {
    flex: 1;
    padding: 24px;
    background: #f0f2f5;
  }
}

</style>
