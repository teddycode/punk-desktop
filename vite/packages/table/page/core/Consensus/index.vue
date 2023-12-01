<template>
  <div class="about">
    <v-sidebar />
    <div :class="{ 'content-collapse': collapse }" class="content-box">
      <div class="content">
        <router-view v-slot="{ Component }">
          <transition mode="out-in" name="move">
            <keep-alive :include="tagsList">
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
        <!-- <el-backtop target=".content"></el-backtop> -->
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import vSidebar from './componnents/Sidebar.vue';
import vTags from './componnents/Tags.vue';
import { useBaseStore } from '@store/baseboard';
export default {
  components: {
    vSidebar,
    vTags,
  },
  setup() {
    const store = useBaseStore();
    const tagsList = computed(() => store.tagsList.map((item) => item.name));
    const collapse = computed(() => store.collapse);
    return {
      tagsList,
      collapse,
    };
  },
};
</script>
