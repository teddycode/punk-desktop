<template>
  <!--  <div>这里是文章详情页面啦啦啦啦,id:{{ route.query.id }}</div>-->
  <div class="flex justify-center h-full ml-3">
    <div class="pl-3 pr-3" style="width: 100%;">
      <div class="flex justify-between h-[40px] mb-3">
        <div  class="xt-text font-16" style="line-height: 40px;">
          话题
        </div>
      </div>
      <div style="height: 100%;">
        <vue-custom-scrollbar :key="currentPage" ref="threadListRef" :settings="settingsScroller"
                              class="w-full thread-list"
                              style="height: calc(100% - 90px );overflow: hidden;flex-shrink: 0;width: 100%;">
          <a-list item-layout="horizontal" :data-source="tagList" >
            <template #renderItem="{ item }">
              <a-list-item  style="padding: 10px;margin-bottom: 5px;border-radius: 10px;background-color: white">
                <a-list-item-meta>
                  <template #description>
                    <p>共被提到 {{item.forumCount}} 次</p>
                  </template>
                  <template #title>
                    <router-link  :to="{name: 'tagDetail',query:{id:item.id,tagName:item.tagName}}"># {{ item.tagName}}</router-link>
                  </template>
                </a-list-item-meta>
                <div>
  <!--                <trend-->
  <!--                  :data="[1, 5, 2, 10, 4]"-->
  <!--                  :gradient="['#000000']"-->
  <!--                  auto-draw-->
  <!--                  smooth-->
  <!--                  height="60"-->
  <!--                  width="60"-->
  <!--                >-->
  <!--                </trend>-->
                </div>
              </a-list-item>
            </template>
          </a-list>
        </vue-custom-scrollbar>
      </div>
    </div>
  </div>
</template>
<script lang='ts' setup>
import {topicData} from './mock';
import { useRoute,useRouter } from 'vue-router';
import { ref, reactive } from 'vue';
import { getTagList } from "../../../../src/api/socialNetwork_tag";
import VueCustomScrollbar from "../../../../src/components/vue-scrollbar.vue";
const route  = useRoute()
const router = useRouter()
const currentPage = ref(1)
const settingsScroller = reactive({
  useBothWheelAxes: true,
  swipeEasing: true,
  suppressScrollY: false,
  suppressScrollX: true,
  wheelPropagation: true,
});


const tagList = ref([]);
const fetchTagListData = async () => {
  const res = await getTagList();
  tagList.value = res.data;
};
fetchTagListData();



</script>
<style lang="scss" scoped>
.spacebetween{
  display: flex;
  justify-content: space-between;
}
</style>
