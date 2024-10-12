<template>
  <!-- 导航栏 -->
  <a-menu :default-selected-keys="activeIndex" theme="dark" mode="horizontal">
    <a-menu-item key="1" @click="goAnchor('#cryptography')">密码学库 </a-menu-item>
    <a-menu-item key="2" @click="goAnchor('#developer')">进入社区</a-menu-item>
    <a-menu-item key="3" @click="goAnchor('#more')">了解更多</a-menu-item>
  </a-menu>
  <!-- 页面内容 -->
  <div class="PageContent">
    <div id="developer" class="DeveloperEntrance">
      <div class="developer-title">成为磐古开发者</div>
      <div class="developer-description">想要在磐古系统中加入你的设计？来治理社区提交你的提案吧。</div>
      <div class="buttons-container">
        <shape-button class="developer-button-left" color="blue" @click="gotoGovernance">进入治理社区 </shape-button>
        <shape-button class="developer-button-right" color="blue" @click="gotoNewProposal">创建新提案 </shape-button>
      </div>
    </div>

    <!-- Tab 区域 -->
    <div id="cryptography">
      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="hash">
          <template #tab>
            <strong>哈希函数</strong>
          </template>
          <a-table :columns="hashColumns" :dataSource="hashData" rowKey="name" />
        </a-tab-pane>
        <a-tab-pane key="sig">
          <template #tab>
            <strong>数字签名</strong>
          </template>
          <a-table :columns="sigColumns" :dataSource="sigData" rowKey="name" />
        </a-tab-pane>
        <a-tab-pane key="ke">
          <template #tab>
            <strong>密钥交换</strong>
          </template>
          <a-table :columns="keyExchangeColumns" :dataSource="keyExchangeData" rowKey="name" />
        </a-tab-pane>
        <a-tab-pane key="commit">
          <template #tab>
            <strong>秘密承诺</strong>
          </template>
          <a-table :columns="commitmentColumns" :dataSource="commitmentData" rowKey="name" />
        </a-tab-pane>
        <a-tab-pane key="share">
          <template #tab>
            <strong>秘密分享</strong>
          </template>
          <a-table :columns="secretSharingColumns" :dataSource="secretSharingData" rowKey="name" />
        </a-tab-pane>
        <a-tab-pane key="vrf">
          <template #tab>
            <strong>可验证随机数</strong>
          </template>
          <a-table :columns="vrfColumns" :dataSource="vrfData" rowKey="name" />
        </a-tab-pane>
        <a-tab-pane key="vdf">
          <template #tab>
            <strong>可验证延迟函数</strong>
          </template>
          <a-table :columns="vdfColumns" :dataSource="vdfData" rowKey="name" />
        </a-tab-pane>
        <a-tab-pane key="zkp">
          <template #tab>
            <strong>零知识证明</strong>
          </template>
          <a-table :columns="zkpColumns" :dataSource="zkpData" rowKey="name" />
        </a-tab-pane>
      </a-tabs>
    </div>

    <!-- 底部栏 -->
    <div id="more" class="PageTitle">了解更多</div>
    <a-row gutter="40">
      <a-col :span="12">
        <div class="document-button">
          <read-outlined />
          <span class="doc-text">阅读文档</span>
          <right-circle-outlined />
        </div>
      </a-col>
      <a-col :span="12">
        <div class="document-button">
          <login-outlined />
          <span class="doc-text">进入论坛</span>
          <right-circle-outlined />
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { Button, Col, Menu, MenuItem, Row, SubMenu, Table } from 'ant-design-vue';
import ShapeButton from '@page/core/components/ShapeButton.vue';
import { LoginOutlined, ReadOutlined, RightCircleOutlined } from '@ant-design/icons-vue';
import {
  hashColumns,
  hashData,
  sigColumns,
  sigData,
  keyExchangeColumns,
  keyExchangeData,
  commitmentColumns,
  commitmentData,
  secretSharingColumns,
  secretSharingData,
  vrfColumns,
  vrfData,
  vdfColumns,
  vdfData,
  zkpColumns,
  zkpData,
} from './data';

export default defineComponent({
  name: 'Crypto',
  components: {
    'a-menu': Menu,
    'a-sub-menu': SubMenu,
    'a-menu-item': MenuItem,
    'a-button': Button,
    'a-table': Table,
    'a-row': Row,
    'a-col': Col,
    'shape-button': ShapeButton,
    'read-outlined': ReadOutlined,
    'right-circle-outlined': RightCircleOutlined,
    'login-outlined': LoginOutlined,
  },
  methods: {
    goAnchor(selector) {
      document.querySelector(selector).scrollIntoView({
        behavior: 'smooth',
      });
    },
    gotoGovernance() {
      this.$router.push({ name: 'GovernancePage' });
    },
    gotoNewProposal() {
      this.$router.push({ name: 'ProposalHomePage' });
    },
  },
  data() {
    return {
      activeIndex: '1',
      hashColumns: hashColumns,
      hashData: hashData,
      sigColumns: sigColumns,
      sigData: sigData,
      keyExchangeColumns: keyExchangeColumns,
      keyExchangeData: keyExchangeData,
      commitmentColumns: commitmentColumns,
      secretSharingColumns: secretSharingColumns,
      secretSharingData: secretSharingData,
      commitmentData: commitmentData,
      vrfColumns: vrfColumns,
      vrfData: vrfData,
      vdfColumns: vdfColumns,
      vdfData: vdfData,
      zkpColumns: zkpColumns,
      zkpData: zkpData,
    };
  },
});
</script>

<style scoped>
.PageContent {
  color: #000;
  text-align: left;
  margin: 0 5%;
  overflow-y: auto;
  max-height: calc(100% - 60px);
  position: relative;
}

.PageTitle {
  font-size: 28px;
  text-align: left;
  margin: 10px 0;
  font-weight: bold;
}

.DeveloperEntrance {
  margin-top: 2%;
  border-radius: 10px;
  position: relative;
  background: url('/images/crypto/developer-bg.jpg');
  background-size: cover;
  height: 400px;
  opacity: 0.9;
}

.developer-title {
  position: absolute;
  left: 50%;
  top: 5%;
  transform: translateX(-50%);
  font: bold 2.5rem/1.5 'Helvetica Neue', sans-serif;
  color: #fff;
}

.developer-description {
  width: 36%;
  position: absolute;
  left: 75%;
  top: 40%;
  transform: translateX(-50%);
  font: 1.5rem/1.5 'Helvetica Neue', sans-serif;
  color: #fff;
}

.developer-button {
  position: absolute;
  left: 50%;
  top: 80%;
  transform: translateX(-50%);
  font-size: 20px;
  color: #000;
  background-color: transparent !important;
}

.buttons-container {
  position: absolute;
  display: flex;
  justify-content: space-between;
  width: 100%;
  bottom: 10%;
}

.developer-button-left,
.developer-button-right {
  font-size: 20px;
  color: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 15%;
}

a {
  text-decoration: none;
  color: #000;
  font-size: 20px;
}

.bg-img {
  max-width: 100%;
  height: auto;
}

::-webkit-scrollbar {
  display: none;
}

.document-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 2px solid blue;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.document-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.doc-icon {
  font-size: 24px;
  background: linear-gradient(to right, red, yellow);
  -webkit-background-clip: text;
  color: transparent;
  margin-right: 10px;
}

.doc-text {
  margin-left: 10px;
  color: black;
  font-weight: bold;
}

.right-icon {
  margin-left: auto;
}
</style>
