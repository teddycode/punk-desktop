<template>
  <div class="flex justify-center h-full ml-3">
    <div class="pl-3 pr-3" style="width: 60%;">
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
              <ComList v-for="(card, index) in list" :key="index" :cardData="card"
                       :style="{ backgroundColor: selectedIndex === index ? 'var(--active-secondary-bg) !important' : 'var(--primary-bg) !important', flex: 1 }" class="xt-bg"
                       @collect="forumcollect"
                       @like="forumlike">

              </ComList>
            </template>
          </div>

        </vue-custom-scrollbar>
        <!-- <div class="flex justify-center">
          <a-pagination v-model:current="currentPage" :total="50" class="pagination" show-less-items/>
        </div> -->
      </div>
    </div>
    <div class="pl-3 pr-3" style="width: 30%;">
      <a-card title="热搜话题" class="xt-bg" :bordered="false" style="width: 300px;border-radius: 10px">
        <template #extra><router-link :to="{name: 'topic'}">more</router-link></template>
        <div v-for="(item,index) in topicData">
          <div v-if="index<3" style="display: flex;justify-content: space-between">
            <a-card-meta>
              <template #title>
                <router-link style="text-decoration-color: #0c0c0c" :to="{name: 'topic'}">{{ item.title }}</router-link>
              </template>
              <template #description>
                <p>{{ item.description }}</p>
              </template>

            </a-card-meta>
<!--            <trend-->
<!--              :data="[1, 5, 2, 10, 4]"-->
<!--              :gradient="['#000000']"-->
<!--              auto-draw-->
<!--              smooth-->
<!--              height="50"-->
<!--              width="50"-->
<!--            >-->
<!--            </trend>-->
          </div>
        </div>
      </a-card>
      <a-card class="xt-bg" title="公告" :bordered="false" style="width: 300px;border-radius: 10px;margin-top: 80px">
        <template #extra><router-link :to="{name: 'notification'}">more</router-link></template>
        <p>welcome！磐古</p>
        <p>项目说明</p>
      </a-card>
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
function getList(){
  for(var i=0;i<user.value.likeIds.length;i++){
    list.value.push(comCards.list[user.value.likeIds[i]]);
  }
}
onMounted(()=>{
  getList()
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
function forumlike(id){
  var index = user.value.likeIds.findIndex(item => item == id)
  if(index == -1){  //未点赞
    var pos = list.value.findIndex((item) => item.id==id)
    list.value.at(pos).support_count++;
    user.value.likeIds.push(id)
  }
  else{
    var pos = list.value.findIndex((item) => item.id==id)
    list.value.at(pos).support_count--;
    user.value.likeIds.splice(index,1);
  }
}
function forumcollect(id){
  var index = user.value.collectIds.findIndex(item => item == id)
  if(index == -1){ //未收藏
    list.value.at(id).view_count++
    user.value.collectIds.push(id);
  }
  else{
    list.value.at(id).view_count--;
    user.value.collectIds.splice(index,1)
  }
}
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
