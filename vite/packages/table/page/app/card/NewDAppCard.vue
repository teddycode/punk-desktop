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
          <div class="box-title no-drag">DApp市场</div>
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
          <div v-if="currentView === 'dappDetails'" class="page-content">
            <DappDetailsContent :dappId="selectedDappId" @back="handleBackToMenu" />
          </div>
          
          <!-- Project Details View -->
          <div v-else-if="currentView === 'projectDetails'" class="page-content">
            <ProjectDetailsContent :projectId="selectedProjectId" @back="handleBackToMenu" />
          </div>
          
          <!-- Menu Views -->
          <template v-else-if="currentView === 'menu'">
            <!-- DApp Market Page -->
            <div v-if="navIndex === 0" class="page-content">
              <DappMarketContent @viewDappDetails="handleViewDappDetails" />
            </div>
            
            <!-- My Info Page -->
            <div v-else-if="navIndex === 1" class="page-content">
              <MyInfoContent />
            </div>
            
            <!-- Favorites Page -->
            <div v-else-if="navIndex === 2" class="page-content">
              <FavoritesContent @viewDapp="handleViewDappDetails" />
            </div>
            
            <!-- My Projects Page -->
            <div v-else-if="navIndex === 3" class="page-content">
              <MyProjectsContent @viewProject="handleViewProjectDetails" />
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
import MyProjectsContent from '../../core/DappMarket/MyProjects.vue';
import DappDetailsContent from '../../core/DappMarket/DappDetails.vue';
import ProjectDetailsContent from '../../core/DappMarket/ProjectDetails.vue';

export default {
  name: 'NewDAppCard',
  components: {
    DappMarketContent,
    MyInfoContent,
    FavoritesContent,
    MyProjectsContent,
    DappDetailsContent,
    ProjectDetailsContent,
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
      currentView: 'menu', // 'menu', 'dappDetails', 'projectDetails'
      selectedDappId: null,
      selectedProjectId: null,
      menuItems: [
        { label: '市场首页', key: 'market' },
        { label: '我的信息', key: 'myinfo' },
        { label: '我的收藏', key: 'favorites' },
        { label: '我的项目', key: 'myprojects' },
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
    handleBackToMenu() {
      this.currentView = 'menu';
      this.selectedDappId = null;
      this.selectedProjectId = null;
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
  z-index: 9999;
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
