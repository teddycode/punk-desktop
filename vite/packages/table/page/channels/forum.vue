<template>
  <div class="flex justify-center h-full ml-3">
    <div class="pl-3 pr-3" >
      <div class="flex justify-between h-[40px] mb-3">
        <div class="xt-text font-16" style="line-height: 40px;">
          首页
        </div>
        <div class="w-[83px] h-[40px] ">
          <xt-button
            style="color: var(--active-bg); width: 83px;height: 40px;border-radius: 12px;background: rgba(80, 139, 254, 0.20);"
            @click="visibleModal">
            <newIcon class="pr-1 text-xl xt-theme-text " icon="akar-icons:circle-plus-fill"
                     style="vertical-align: sub;font-size: 22px;margin-right: 6px;"/>
            发布
          </xt-button>
        </div>
      </div>
      <div style="height: 100%;">
        <vue-custom-scrollbar :key="currentPage" ref="threadListRef" :settings="settingsScroller"
                              class="w-full thread-list"
                              style="height: calc(100% - 90px );overflow: hidden;flex-shrink: 0;width: 100%;">
          <div class="flex flex-col justify-center content">
            <!-- {{ checkMenuList.value[currentIndex.value].order }} -->
            <!-- 循环渲染多个 ComCard -->
            <a-empty v-if="list?.length === 0" description="暂无内容" image="/img/test/load-ail.png"
                     style="margin-top: 30%;"></a-empty>
            <template v-else>
<!--              <ComList v-for="(card, index) in list" :key="index" :cardData="card"-->
<!--                       @collect="forumcollect"-->
<!--                       @like="forumlike">-->

<!--              </ComList>-->
              <ComList v-for="(card, index) in list" :key="index" :cardData="card">
              </ComList>
            </template>
          </div>

        </vue-custom-scrollbar>
        <!-- <div class="flex justify-center">
          <a-pagination v-model:current="currentPage" :total="50" class="pagination" show-less-items/>
        </div> -->
      </div>
    </div>

    <publishModal v-if="publishVisible" @handle-ok="forumadd"/>
  </div>
</template>

<script lang='ts' setup>
import {onMounted, reactive, ref} from 'vue'
import {Icon as newIcon} from '@iconify/vue'
import ComList from '../chat/com/ComList.vue';
import publishModal from '../chat/com/publishModal.vue';
import {comCards,topicData} from './mock';
import { comStore } from '../../store/com'
import {storeToRefs} from 'pinia'
const store = comStore();
const { user } = storeToRefs(store)

import {useRouter} from "vue-router";
const router = useRouter()

const list = ref([]);
//list.value = comCards.list;
import {getForumList} from '../../../../src/api/socialNetwork_forum'
import {ok} from "assert";
async function fetchForumsData(){
  await getForumList().then(response=>{
    list.value = response.data
  })
}
onMounted(async()=>{
  await fetchForumsData()
})

const publishVisible = ref(false)
const currentPage = ref(1)
const currentIndex = ref(0)

const settingsScroller = reactive({
  useBothWheelAxes: true,
  swipeEasing: true,
  suppressScrollY: false,
  suppressScrollX: true,
  wheelPropagation: true,
});
const selectedIndex = ref(-1)
const visibleModal = () => {
  console.log(publishVisible.value);

  publishVisible.value = true
}
// function forumlike(id){
//   var index = user.value.likeIds.findIndex(item => item == id)
//   if(index == -1){  //未点赞
//     list.value.at(id).likeCount++;
//     user.value.likeIds.push(id)
//   }
//   else{
//     list.value.at(id).likeCount--;
//     user.value.likeIds.splice(index,1);
//   }
// }
// function forumcollect(id){
//   var index = user.value.collectIds.findIndex(item => item == id)
//   if(index == -1){ //未收藏
//     list.value.at(id).collectCount++
//     user.value.collectIds.push(id);
//   }
//   else{
//     list.value.at(id).collectCount--;
//     user.value.collectIds.splice(index,1)
//   }
// }
function forumadd(){
  publishVisible.value = false
  fetchForumsData();
}


</script>
<style lang='scss' scoped>
.font-16 {

  font-size: 16px;
  font-weight: 500;
}

.action {
  background: var(--active-bg);
  border-radius: 8px;
  cursor: pointer;
  width: 96px;
  height: 32px;
  border-left: 0px;
  padding: 0px;
  margin-right: 0px;
  text-align: center;
  color: var(--active-text);
  border: none;
}

:deep(.ant-pagination-item) {
  background: var(--primary-bg);
  border-radius: 8px;
  border: none;
  width: 40px;
  height: 40px;

  & a {
    display: block;
    height: 40px;
    text-align: center;
    margin-top: 4px;
    color: var(--primary-text) !important;
  }
}

:deep(.ant-pagination-item-active a) {
  color: var(--active-bg) !important;
}

:deep(.ant-pagination-prev) {
  background: var(--primary-bg);
  border-radius: 8px;
  border: none;
  width: 40px;
  height: 40px;
}

:deep(.ant-pagination-next) {
  background: var(--primary-bg);
  border-radius: 8px;
  border: none;
  width: 40px;
  height: 40px;
}

:deep(.ant-pagination-prev .ant-pagination-item-link) {
  color: var(--primary-text);
  border: none;
}

:deep(.ant-pagination-next .ant-pagination-item-link) {
  color: var(--primary-text);
  border: none;
}
</style>
