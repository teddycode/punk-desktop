<template>
  <div class="taskbar">
    <div class="tabs-container">
      <div class="tab-item home-tab" @click="navigateTo('HomePage')">
        <div class="home-content">
          <font-awesome-icon :icon="['fas', 'home']" style="color: white;"></font-awesome-icon>
          Home
        </div>
      </div>
      <div v-for="(page, index) in openedPages" :key="index" class="tab-item home-tab"
           :class="{ 'active-tab': currentPage === page.title }">
        <div class="home-content" @click="navigateTo(page.routeName)">
          <font-awesome-icon :icon="page.icon" style="color: white;"></font-awesome-icon>
          {{ page.title }}
        </div>
        <font-awesome-icon class="close-tab-icon" @click.stop="store.dispatch('removePage', index)"
                           :icon="['fas', 'times']"></font-awesome-icon>
      </div>
    </div>
    <div class="current-time">{{ currentTime }}</div>
  </div>
</template>

<script>
import {ref, computed, onMounted} from 'vue';
import {useRouter} from 'vue-router';
import {library} from '@fortawesome/fontawesome-svg-core';
import {faHome, faTimes} from '@fortawesome/free-solid-svg-icons';
import {useBaseStore} from "@store/baseboard";

library.add(faHome, faTimes);

export default {
  name: "TaskBar",
  setup() {
    const store = useBaseStore();
    const router = useRouter();
    const openedPages = computed(() => store.openedPages);
    const currentPage = computed(() => store.currentPage);
    const currentTime = ref(getCurrentTime());

    onMounted(() => {
      console.log("TaskBar openedPages:", openedPages.value);
      setInterval(() => {
        currentTime.value = getCurrentTime();
      }, 1000);
    });

    function navigateTo(routeName) {
      store.setCurrentPage(routeName);
      router.push({name: routeName});
    }

    function getCurrentTime() {
      const date = new Date();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }

    return {
      openedPages,
      currentPage,
      currentTime,
      navigateTo,
      store
    }
  }
}
</script>

<style lang="scss" scoped>
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
  justify-content: space-between;
  padding-top: 5%;
  padding-bottom: 2%;
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
  padding-right: 20px;
  transition: all 0.3s ease; // 添加过渡效果

  &.active-tab {
    border-right: 5px solid lightskyblue;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2); // 为激活的标签页添加阴影
  }

  &:hover {
    box-shadow: 3px 3px 15px rgba(0, 0, 0, 0.3); // 鼠标悬停时增加阴影深度
  }
}


.close-tab-icon {
  color: white;
  display: none; // 默认不显示
  cursor: pointer;
  margin-left: 5px;
  margin-right: -10px;
}

.home-tab:hover .close-tab-icon {
  display: inline-block; // 鼠标悬停时显示
}


.home-tab {
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 5px 10px;
  border-radius: 5px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: grey;
  }

  .home-content {
    display: flex;
    align-items: center;
    gap: 5px;
  }
}

.current-time {
  color: white;
  font-size: 2.5em;
  align-self: center; // 将时间居中
  margin-top: auto;
  margin-bottom: 5%; // 为时间提供一些底部间距
}
</style>
