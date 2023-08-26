<template>
    <MainBackground>
        <div class="about">
            <v-sidebar />
            <div class="content-box" :class="{ 'content-collapse': collapse }">
                <div class="content">
                    <router-view v-slot="{ Component }">
                        <transition name="move" mode="out-in">
                            <keep-alive :include="tagsList">
                                <component :is="Component" />
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
import { computed } from "vue";
import { useStore } from "vuex";
import vSidebar from "../../components/Sidebar.vue";
import vTags from "../../components/Tags.vue";
import MainBackground from "@/components/MainBackground.vue";

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
