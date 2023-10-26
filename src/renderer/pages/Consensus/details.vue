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
import {useStore} from "vuex";
import vSidebar from "@renderer/components/common/Sidebar.vue";
import vTags from "@renderer/components/common/Tags.vue";
import MainBackground from "@renderer/components/common/MainBackground.vue";

export default {
  components: {
    MainBackground,
    vSidebar,
    vTags,
  },
  setup() {
    const store = useStore();
    const tagsList = computed(() =>
      store.state.tagsList.map((item) => item.name)
    );
    const collapse = computed(() => store.state.collapse);
    return {
      tagsList,
      collapse,
    };
  },
};
</script>
