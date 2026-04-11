<template>
  <div class="info-container">
    <div class="asset-card">
      <div class="asset-header">
        <h1 class="info-title">个人信息</h1>
        <a-tag color="blue">{{ currentScopeLabel }}</a-tag>
      </div>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">代币余额</div>
          <div class="info-value">{{ formatValue(balance) }}</div>
        </div>
        <div class="info-item">
          <div class="info-label">投票权</div>
          <div class="info-value">{{ formatValue(votingPower) }}</div>
        </div>
      </div>
    </div>

    <a-tabs v-model:activeKey="activeTab" class="info-tabs">
      <a-tab-pane key="space" tab="单个空间">
        <div class="panel-host">
          <SpaceSelect :uid="spaceUid" :embedded="true" />
        </div>
      </a-tab-pane>
      <a-tab-pane key="template" tab="空间模板">
        <div class="panel-host template-host">
          <TemplatePage />
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import { ethers } from 'ethers';
import { governToken, tokenPower, userAddr } from '@page/core/Governance/services/address';
import SpaceSelect from '../../../../../user/pages/SpaceSelect.vue';
import TemplatePage from '../../../../../user/pages/Template.vue';

const { spaceModel, userModel } = window.$models;

export default {
  name: 'selfInfo',
  components: {
    SpaceSelect,
    TemplatePage,
  },
  data() {
    return {
      balance: null,
      votingPower: null,
      activeTab: 'space',
      spaceUid: 0,
      currentScopeLabel: '本机空间',
    };
  },
  async mounted() {
    await Promise.all([this.loadGovernanceInfo(), this.loadSpaceScope()]);
  },
  methods: {
    formatValue(value) {
      if (value === null || typeof value === 'undefined') {
        return '--';
      }
      return Number(value).toFixed(4);
    },
    async loadGovernanceInfo() {
      let temp = await governToken.balanceOf(userAddr);
      this.balance = ethers.utils.formatEther(temp);
      temp = await tokenPower.getCurrentVotingPower(userAddr);
      this.votingPower = ethers.utils.formatEther(temp);
    },
    async loadSpaceScope() {
      let currentSpace = null;
      try {
        currentSpace = await spaceModel.getCurrent();
      } catch (e) {
        console.warn('读取当前空间失败', e);
      }

      if (currentSpace && currentSpace.spaceType === 'cloud' && currentSpace.uid) {
        this.spaceUid = currentSpace.uid;
        const user = await userModel.get({ uid: currentSpace.uid });
        this.currentScopeLabel = user?.user_info?.nickname || '当前账号空间';
        return;
      }

      const currentUser = await userModel.getCurrent();
      if (currentUser?.status === 1 && currentUser.data?.uid) {
        this.spaceUid = currentUser.data.uid;
        this.currentScopeLabel = currentUser.data.user_info?.nickname || '当前账号空间';
      } else {
        this.spaceUid = 0;
        this.currentScopeLabel = '本机空间';
      }
    },
  },
};
</script>

<style scoped>
.info-container {
  color: white;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: auto;
  padding: 12px;
  box-sizing: border-box;
}

.asset-card {
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.04);
}

.asset-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.info-title {
  font-size: 1.5rem;
  margin: 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.info-item {
  border-radius: 10px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.05);
  text-align: left;
}

.info-label {
  font-size: 0.9rem;
  opacity: 0.7;
}

.info-value {
  font-size: 1.2rem;
  font-weight: 600;
  margin-top: 8px;
}

.info-tabs {
  flex: 1;
  min-height: 0;
}

.panel-host {
  min-height: 620px;
  height: min(70vh, 760px);
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.06);
}

.template-host {
  overflow: auto;
  padding: 8px;
  box-sizing: border-box;
}

:deep(.ant-tabs-nav) {
  margin-bottom: 12px;
}

:deep(.ant-tabs-tab) {
  color: rgba(255, 255, 255, 0.7);
}

:deep(.ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn) {
  color: #ffffff;
}

:deep(.ant-tabs-ink-bar) {
  background: #3b82f6;
}
</style>
