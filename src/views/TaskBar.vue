<template>
    <div class="taskbar">
        <div class="tabs-container">
            <div class="tab-item home-tab" @click="navigateToHomePage">
                <div class="home-content">
                    <font-awesome-icon :icon="['fas', 'home']"  style="color: white;"></font-awesome-icon>
                    Home
                </div>
            </div>
            <div v-for="(page, index) in openedPages" :key="index" class="tab-item home-tab">
                <div class="home-content" @click="navigateToFeature(page)">
                    <font-awesome-icon :icon="page.icon" style="color: white;"></font-awesome-icon>
                    {{ page.title }}
                </div>
                <button @click.stop="closePage(index)" class="close-tab">×</button>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
    name: "TaskBar",
    computed: {
        ...mapGetters(['openedPages']) // 使用 Vuex 的 getters 获取 openedPages
    },
    mounted() {
        console.log("TaskBar openedPages:", this.openedPages);
    },
    methods: {
        ...mapActions(['addPage', 'removePage']), // 使用 Vuex 的 actions
        navigateToHomePage() {
            console.log("Home tab clicked!");
            this.$router.push({ name: 'HomePage' });
        },
        navigateToFeature(page) {
            console.log("navigateToFeature:", page);
            const routeName = this.getFeatureRoute(page.title);
            this.$router.push({ name: routeName });
        },
        closePage(pageIndex) {
            this.removePage(pageIndex); // 使用 Vuex 的 action 移除页面
        },
        getFeatureRoute(title) {
            switch (title) {
                case '共识':
                    return 'myConsensus';
                case '存储':
                    return 'myStorage';
                case '计算':
                    return 'myCalculation';
                case '交易':
                    return 'myTransaction'; // 注意这里，不要返回 '/myTransaction'
                case '转账':
                    return 'myTransfer';
                case '治理':
                    return 'myGovernance';
                case '网络':
                    return 'myNetwork';
                case '藏品':
                    return 'myCollection';
                default:
                    return 'HomePage';  // 默认路由，返回 'HomePage' 而不是 '/'
            }
        },
    }
}
</script>

<style lang="scss">
.taskbar {
  width: 8%;
  height: 100%;
  background-color: transparent;
  border-right: 1px solid white;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  padding-top: 5%;
}

.tabs-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
}

.tab-item {
  color: white;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
  padding-right: 25px;
}

.close-tab {
  display: none;
  background-color: rgba(255, 255, 255, 0.5);
  border: none;
  cursor: pointer;
  padding: 2px 5px;
  margin-left: 5px;
  margin-right: -10px;
}

.home-tab {
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 5px 10px;
  border-radius: 5px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: darkblue;
  }

  .home-content {
    display: flex;
    align-items: center;
    gap: 5px;
  }
}
.home-tab:hover .close-tab {
  display: inline-block;
}
</style>
