<template>
  <background>
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
  </background>
</template>

<script>
import {computed} from "vue";
import vSidebar from "@page/core/components/Sidebar.vue";
import vTags from "@page/core/components/Tags.vue";
import Background from "@page/core/components/Background.vue";
import {useBaseStore} from "@store/baseboard";

export default {
  components: {
    Background,
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
