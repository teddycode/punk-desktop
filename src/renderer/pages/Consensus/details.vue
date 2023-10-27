<template>
  <MainBackground>
    <div class="about">
      <v-sidebar/>
      <div :class="{ 'content-collapse': collapse }" class="content-box">
        <div class="content">
          <router-view v-slot="{ Component }">
            <transition mode="out-in" name="move">
              <keep-alive :include="tagsList">
                <component :is="Component"/>
              </keep-alive>
            </transition>
          </router-view>
          <!-- <el-backtop target=".content"></el-backtop> -->
        </div>
      </div>
    </div>
  </MainBackground>
</template>

<script>
import {computed} from "vue";
import vSidebar from "@components/common/Sidebar.vue";
import vTags from "@components/common/Tags.vue";
import MainBackground from "@components/common/MainBackground.vue";
import {useBaseStore} from "@store/baseboard";

export default {
  components: {
    MainBackground,
    vSidebar,
    vTags,
  },
  setup() {
    const store = useBaseStore();
    const tagsList = computed(() =>
        store.tagsList.map((item) => item.name)
    );
    const collapse = computed(() => store.state.collapse);
    return {
      tagsList,
      collapse,
    };
  },
};
</script>
