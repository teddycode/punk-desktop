<template>
  <div class="flex justify-center h-full ml-3">
    <div class="pl-3 pr-3">
      <div class="flex justify-between h-[40px] mb-3">
        <div class="xt-text font-16" style="line-height: 40px;">
          喜欢
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
  </div>
</template>
<script lang='ts' setup>
import {onMounted, reactive, ref} from 'vue'
import {Icon as newIcon} from '@iconify/vue'
import ComList from '../chat/com/ComList.vue';
import {comCards,topicData} from './mock';
import {comStore} from '../../store/com'
import {storeToRefs} from 'pinia'
const store = comStore();
const { user } = storeToRefs(store)

import {useRouter} from "vue-router";
const router = useRouter()

const list = ref([]);
list.value = store.loveList;
// function getList(){
//   for(var i=0;i<user.value.likeIds.length;i++){
//     list.value.push(comCards.list[user.value.likeIds[i]]);
//   }
// }
// onMounted(()=>{
//   getList()
// })


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
function showDetail(index){
  console.log('点击了'+index +'文章')
  router.push({
    name:'forumDetail',
    query:{
      id:index
    }
  })
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
