<template>
  <teleport to="body">
    <div class="popContainer"></div>
    <div class="controller drag" style="color: var(--primary-text)">
      <div class="header">
        <div class="left">
          <div
            @click="handleBackClick"
            class="pointer flex items-center rounded-lg justify-center no-drag"
            style="
              background: var(--secondary-bg);
              width: 48px;
              height: 48px;
              font-size: 16px;
              color: var(--primary-text);
            "
          >
            <Icon icon="xiangzuo" style="font-size: 1.5em"></Icon>
          </div>
          <div class="box-title no-drag">Web3应用广场</div>
        </div>
        <div class="flex no-grag">
        </div>
      </div>
      <div class="mian">
        <!-- Show sidebar only when not viewing details -->
        <div class="left" v-if="currentView === 'menu'">
          <div
            class="no-drag nav"
            style="color: var(--primary-text)"
            :class="{ 'xt-active-btn': navIndex == index }"
            @click="updateNavIndex(index)"
            v-for="(item, index) in menuItems"
            :key="index"
          >
            {{ item.label }}
          </div>
        </div>
        <div class="right no-drag" :class="{ 'full-width': currentView !== 'menu' }">
          <!-- DApp Details View -->
          <div v-if="currentView === 'dappDetails'" class="page-content dapp-details-view">
            <DappDetailsContent :id="String(selectedDappId)" @back="handleBackToMenu" @stake="handleStakeDapp" />
          </div>
          
          <!-- Project Details View -->
          <div v-else-if="currentView === 'projectDetails'" class="page-content">
            <ProjectDetailsContent :projectId="selectedProjectId" @back="handleBackToMenu" />
          </div>

          <!-- Contract Details View -->
          <div v-else-if="currentView === 'contractDetails'" class="page-content">
            <ContractDetailsContent 
              :address="selectedContractAddress" 
              @back="handleBackToMenu" 
              @viewContract="handleViewContractDetails"
              @stake="handleStakeContract"
            />
          </div>

          <!-- DApp Staking View -->
          <div v-else-if="currentView === 'dappStaking'" class="page-content">
            <DappStakingContent 
              :dappId="selectedDappId"
              :contractAddress="selectedContractAddress"
              @back="handleBackToMenu" 
              @success="handleStakingSuccess"
              @viewContract="handleViewContractDetails"
            />
          </div>

          <!-- Staking Details View -->
          <div v-else-if="currentView === 'stakingDetails'" class="page-content">
            <StakingDetailsContent 
              :stakingId="selectedStakingId" 
              @back="handleBackToMenu"
              @withdraw="handleWithdrawSuccess"
              @viewContract="handleViewContractDetails"
            />
          </div>
          
          <!-- CApp Details View -->
          <div v-else-if="currentView === 'cappDetails'" class="page-content">
            <CAppDetailsContent :id="String(selectedCAppId)" @back="handleBackToMenu" />
          </div>
          
          <!-- Menu Views -->
          <template v-else-if="currentView === 'menu'">
            <!-- DApp Market Page -->
            <div v-if="navIndex === 0" class="page-content">
              <DappMarketContent @viewDappDetails="handleViewDappDetails" />
            </div>

            <!-- CApp Store Page -->
            <div v-else-if="navIndex === 1" class="page-content">
              <CAppStoreContent @viewCAppDetails="handleViewCAppDetails" />
            </div>

            <!-- Contract Market Page -->
            <div v-else-if="navIndex === 2" class="page-content">
              <ContractMarketContent 
                @viewContractDetails="handleViewContractDetails" 
                @stakeContract="handleStakeContract"
              />
            </div>
            
            <!-- Favorites Page -->
            <div v-else-if="navIndex === 3" class="page-content">
              <FavoritesContent @viewDapp="handleViewDappDetails" />
            </div>

            <!-- My Investment Page -->
            <div v-else-if="navIndex === 4" class="page-content">
              <MyInvestmentContent 
                @viewDapp="handleViewDappDetails" 
                @viewStakingDetails="handleViewStakingDetails"
                @goToMarket="() => updateNavIndex(0)"
              />
            </div>
            
            <!-- My Info Page -->
            <div v-else-if="navIndex === 5" class="page-content">
              <MyInfoContent @viewProject="handleViewProjectDetails" />
            </div>

          </template>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script>
import DappMarketContent from '../../core/DappMarket/DappMarketPage.vue';
import MyInfoContent from '../../core/DappMarket/myInfoPage.vue';
import FavoritesContent from '../../core/DappMarket/Favorites.vue';
import DappDetailsContent from '../../core/DappMarket/DappDetails.vue';
import ProjectDetailsContent from '../../core/DappMarket/ProjectDetails.vue';
import ContractMarketContent from '../../core/DappMarket/ContractMarketPage.vue';
import ContractDetailsContent from '../../core/DappMarket/ContractDetails.vue';
import MyInvestmentContent from '../../core/DappMarket/MyInvestmentPage.vue';
import DappStakingContent from '../../core/DappMarket/DappStakingPage.vue';
import StakingDetailsContent from '../../core/DappMarket/StakingDetailsPage.vue';
import CAppStoreContent from '../../core/DappMarket/CAppStorePage.vue';
import CAppDetailsContent from '../../core/DappMarket/CAppDetails.vue';

export default {
  name: 'NewDAppCard',
  components: {
    DappMarketContent,
    MyInfoContent,
    FavoritesContent,
    DappDetailsContent,
    ProjectDetailsContent,
    ContractMarketContent,
    ContractDetailsContent,
    MyInvestmentContent,
    DappStakingContent,
    StakingDetailsContent,
    CAppStoreContent,
    CAppDetailsContent,
  },
  emits: ['onClose', 'close'],
  props: {
    desk: {
      type: Object,
      default: () => {},
    },
    panelIndex: {
      type: Number,
      default: () => 0,
    },
    deskList: {
      type: Array,
    },
  },
  data() {
    return {
      navIndex: 0,
      currentView: 'menu', // 'menu', 'dappDetails', 'projectDetails', 'contractDetails', 'dappStaking', 'stakingDetails', 'cappDetails'
      selectedDappId: null,
      selectedProjectId: null,
      selectedContractAddress: null,
      selectedStakingId: null,
      selectedCAppId: null,
      menuItems: [
        { label: 'DApp Store', key: 'market' },
        { label: 'CApp Store', key: 'cappstore' },
        { label: '合约广场', key: 'contracts' },
        { label: '我的收藏', key: 'favorites' },
        { label: '我的投资', key: 'investment' },
        { label: '我的信息', key: 'myinfo' },
      ],
    };
  },

  mounted() {
    // Default to showing DApp Market
    this.navIndex = 0;
  },

  methods: {
    handleBackClick() {
      // If viewing details, go back to menu
      if (this.currentView !== 'menu') {
        this.handleBackToMenu();
      } else {
        // Otherwise close the modal
        this.onBack();
      }
    },
    onBack() {
      this.$emit('close');
      this.$emit('onClose');
    },
    updateNavIndex(index) {
      this.navIndex = index;
      this.currentView = 'menu';
    },
    handleViewDappDetails(dappId) {
      this.selectedDappId = dappId;
      this.currentView = 'dappDetails';
    },
    handleViewProjectDetails(projectId) {
      this.selectedProjectId = projectId;
      this.currentView = 'projectDetails';
    },
    handleViewContractDetails(address) {
      this.selectedContractAddress = address;
      this.currentView = 'contractDetails';
    },
    handleStakeDapp(dappId) {
      this.selectedDappId = dappId;
      this.selectedContractAddress = null;
      this.currentView = 'dappStaking';
    },
    handleStakeContract(address) {
      this.selectedContractAddress = address;
      this.selectedDappId = null;
      this.currentView = 'dappStaking';
    },
    handleViewStakingDetails(stakingId) {
      this.selectedStakingId = stakingId;
      this.currentView = 'stakingDetails';
    },
    handleStakingSuccess(stakingData) {
      // 质押成功后跳转到我的投资
      this.navIndex = 3;
      this.currentView = 'menu';
    },
    handleWithdrawSuccess(stakingId) {
      // 退出成功后返回我的投资
      this.currentView = 'menu';
      this.navIndex = 3;
    },
    handleBackToMenu() {
      this.currentView = 'menu';
      this.selectedDappId = null;
      this.selectedProjectId = null;
      this.selectedContractAddress = null;
      this.selectedStakingId = null;
      this.selectedCAppId = null;
    },
    handleViewCAppDetails(cappId) {
      this.selectedCAppId = cappId;
      this.currentView = 'cappDetails';
    },
  },
};
</script>

<style lang="scss" scoped>
.popContainer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: var(--mask-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(50px);
  backdrop-filter: blur(28px);
}

.controller {
  z-index: 1000;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 24px;

  :deep(.ant-select-selector) {
    border: none !important;
    box-shadow: none !important;
  }

  .header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;

    .left {
      display: flex;
    }
  }

  .mian {
    margin-top: 20px;
    box-sizing: border-box;
    height: 95%;
    display: flex;

    .left {
      height: 100%;
      width: 140px;
      overflow: auto;
      padding-bottom: 40px;

      .nav {
        width: 112px;
        height: 56px;
        border-radius: 12px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        margin-bottom: 8px;
        font-size: 16px;
        text-align: center;
        transition: all 0.3s ease;
      }

      .nav:hover {
        background: var(--secondary-bg);
        opacity: 0.8;
      }

      .xt-active-btn {
        background: var(--secondary-bg);
      }
    }

    .left::-webkit-scrollbar,
    .right::-webkit-scrollbar {
      display: none;
    }

    .right {
      width: 100%;
      height: 100%;
      overflow: auto;
      display: flex;
      flex-direction: column !important;
      padding-left: 20px;

      &.full-width {
        padding-left: 0;
      }

      .page-content {
        width: 100%;
        height: 100%;
        overflow: auto;
      }

      .dapp-details-view {
        overflow: visible !important;
      }
    }
  }
}

.box-title {
  display: flex;
  align-items: center;
  margin-left: 16px;
  font-size: 18px;
  color: var(--primary-text);
  font-weight: 600;
}
</style>

<style lang="scss">
/* 全局样式 - 确保表情选择器显示在最高层 */
/* 必须比 .controller (z-index: 1000) 更高 */
.emoji-picker,
.u-emoji-picker,
.emoji-picker-container,
.u-emoji-container,
[class*="emoji-picker"],
[class*="u-emoji"] {
  z-index: 99999 !important;
}
</style>
