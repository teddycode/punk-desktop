<template>
  <div id="main" class="bg">
    <task-bar/>
    <div class="header">
      <div class="bg-header">
        <div class="t-title fa-solid">{{ i18nt.home.title }}</div>
      </div>
      <top-navigator/>
    </div>
    <login-button/>
    <wallets show/>
    <div class="search-bar">
      <search-bar/>
    </div>
    <div class="data-content">
      <div class="data-main">
        <div class="main-left">
          <div class="main-left-top">
            <div class="main-left-top-left">
              <main-left-top/>
            </div>
            <div class="main-left-top-right">
              <main-center-top/>
            </div>
          </div>
          <div class="main-left-bottom">
            <div class="bottom-div-left">
              <main-left-bottom/>
            </div>
            <div class="main-center-bottom">
              <main-center-bottom/>
            </div>
          </div>
        </div>
        <div class="main-right">
          <div class="right-top-spacing"></div>
          <main-right-top @featureClicked="onFeatureClicked"/>
          <div class="right-middle-spacing"></div>
          <main-right-bottom/>
          <div class="right-bottom-spacing"></div>
        </div>
      </div>
      <div class="frequency-div">
        <div class="toolbar">
          <div class="frequency-title">常用工具栏</div>
          <div class="app-grid">
            <div v-for="app in frequencyApps" :key="app.name" class="app-card">
              <img :src="app.icon" alt="" class="app-icon">
              <p class="app-name">{{ app.name }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import {defineComponent, computed, reactive} from 'vue';
import {useStore} from 'vuex';
import TopNavigator from "@renderer/components/navigate/TopNavigator.vue";
import LoginButton from "@renderer/components/buttons/loginButton.vue";
import Wallets from "@renderer/components/common/Wallets.vue";
import SearchBar from "@renderer/components/common/SearchBar.vue";
import TaskBar from "@renderer/components/common/TaskBar.vue";

import MainLeftTop from "@pages/DashBoard/components/main-left/top/index.vue";
import MainLeftBottom from "@pages/DashBoard/components/main-left/bottom/index.vue";

import MainRightTop from "@pages/DashBoard/components/main-right/top/index.vue";
import MainRightBottom from "@pages/DashBoard/components/main-right/bottom/index.vue";

import MainCenterTop from "@pages/DashBoard/components/main-center/top/index.vue";
import MainCenterBottom from "@pages/DashBoard/components/main-center/bottom/index.vue";

import {i18nt} from "@renderer/i18n"

export default defineComponent({
  components: {
    Wallets,
    MainCenterTop,
    MainRightBottom,
    MainLeftBottom,
    SearchBar,
    MainRightTop,
    MainLeftTop,
    LoginButton,
    TopNavigator,
    TaskBar,
    MainCenterBottom,
  },
  setup() {
    const store = useStore();
    const openedPages = computed(() => store.state.openedPages);

    const onFeatureClicked = (feature: any) => {
      console.log("onFeatureClicked received", feature);
      if (!openedPages.value.some((p: any) => p.title === feature.title)) {
        store.commit("ADD_PAGE", feature);
      }
      console.log("onFeatureClicked", openedPages.value);
    };

    const frequencyApps = reactive([
      {name: 'Uniswap', icon: '/images/dapps/uniswap.png'},
      {name: 'MakerDAO', icon: '/images/dapps/maker.webp'},
      {name: 'Compound', icon: '/images/dapps/compound.png'},
    ]);

    return {
      i18nt,
      openedPages,
      frequencyApps,
      onFeatureClicked,
    };
  },
});
</script>

<style lang="scss" scoped>
.header {
  width: 100%;
  height: 80px;
  padding: 0 20px;

  .bg-header {
    width: 100%;
    height: 80px;
    background: url(@renderer/assets/data/title.png) no-repeat;
    background-size: 100% 100%;

    .t-title {
      width: 100%;
      height: 100%;
      text-align: center;
      font-size: 2em;
      line-height: 80px;
      color: #fff;
    }
  }
}

#main {
  background-image: url('@renderer/assets/images/main-backgroud.png');
  background-size: cover;
  overflow: hidden;
  //min-width: 1600px;
  background-repeat: no-repeat; // 防止背景重复
  background-attachment: fixed; // 背景图像固定
  //min-width: 100vw;
  //min-height: 100vh; // 这确保主容器至少有视口的高度
  width: 100%;
  height: 100%;
}

.host-body {
  padding: 1rem;
}

.title-text {
  color: white;
  font-size: xx-large;
}

.search-bar {
  display: flex;
  justify-content: center;
  align-items: center;
}

.data-content {
  margin-left: 8%;
  height: 850px;
  padding-bottom: 20px;

  .data-main {
    width: calc(100% - 80px);
    margin-bottom: 40px;
    margin-left: 40px;
    height: 85%;

    .main-left {
      margin-right: 4%;
      float: left;
      width: 72%;
      height: 95%;

      .main-left-top {
        margin-bottom: 5%;
        height: 65%;
        display: flex;
        justify-content: space-between;

        .main-left-top-left {
          width: 30%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-right: 5%; /* Added margin to the right side */
        }

        .main-left-top-right {
          width: 65%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }

      .main-left-bottom {
        height: 35%;
        display: flex;
        justify-content: space-between;

        .bottom-div {
          width: 30%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }
    }

    .main-center-bottom {
      width: 65%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .main-right {
      float: left;
      width: 24%;
      height: 100%;
      display: flex;
      flex-direction: column;

      .right-top-spacing {
        flex: 2.5; /* This represents 10% height */
      }

      .right-middle-spacing {
        flex: 3.5; /* This represents 10% height */
      }

      .right-bottom-spacing {
        flex: 1.5; /* This represents 10% height */
      }

      main-right-dapp {
        flex: 4.5; /* This represents 35% height */
      }

    }
  }
}

.frequency-div {
  width: 80%;
  height: 10%;
  border: 1px solid white;
  border-radius: 10px;
  margin: 0 auto; /* Center the div */
  position: relative;
  align-items: center;
}

.toolbar {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px; /* Space between title and icons */
}

.frequency-title {
  margin-bottom: 20px;
  font-size: 1.5rem;
  color: #5ab1ef;
}

.app-grid {
  display: flex;
  justify-content: flex-start; /* Align icons to the left */
  align-items: center;
  gap: 10px; /* Space between icons */
}

.app-card {
  margin-top: 15px;
  flex-direction: column;
  align-items: center;
}

.app-icon {
  width: 50px;
  height: 50px;
}

</style>
