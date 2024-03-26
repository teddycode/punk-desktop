<template>
  <div class="flex justify-center h-full ml-3">
    <div class="pl-3 pr-3">
      <div class="flex justify-between h-[40px] mb-3">
        <div @click="OnBack" class="xt-text font-16 hover_underline" style="line-height: 40px;">
          返回
        </div>
      </div>
      <div style="height: 100%;">
        <vue-custom-scrollbar :key="currentPage" ref="threadListRef" :settings="settingsScroller"
                              class="w-full thread-list"
                              style="height: calc(100% - 90px );overflow: hidden;flex-shrink: 0;width: 100%;">
          <a-card  style="margin-bottom: 30px" :bordered="false">
            <template #cover>
              <div class="image-container">
                <img
                  :src="UserDetail.backgroundImg"
                  class="centered-image"
                />
              </div>
            </template>
            <div class="spacebetween">
              <a-card-meta :title="UserDetail.nickname">
                <template #description>
                  <u-fold line="1">
                    <p style="width: 200px;">{{ UserDetail.description }}</p>
                  </u-fold>
                </template>
                <template #avatar>
                  <a-avatar size="large" :src="UserDetail.avatar" />
                </template>
              </a-card-meta>
              <div style="width: 600px;display: flex;justify-content: space-around;align-items: center">
                <div style="padding :10px 0;text-align:center;">
                  <p style="font-weight:bold;margin: 0;padding: 0">帖子</p>
                  <p style="margin: 0;padding: 0">{{ UserDetail.forumNum }}</p>
                </div>
                <div style="padding :10px 0;text-align:center;">
                  <p class="hover_underline" @click="router.push({name: 'userFollowers', query: {id: UserDetail.id, activeKey: '1' }})" style="font-weight:bold;margin: 0;padding: 0">关注者</p>
                  <p style="margin: 0;padding: 0">{{ UserDetail.fanNum }}</p>
                </div>
                <div style="padding :10px 0;text-align:center;">
                  <p class="hover_underline" @click="router.push({name: 'userFollowers', query: {id: UserDetail.id, activeKey: '2' }})" style="font-weight:bold;margin: 0;padding: 0">正在关注</p>
                  <p style="margin: 0;padding: 0">{{ UserDetail.followNum }}</p>
                </div>
                <a-button v-if="store.isFollowed(UserDetail.id)" type="primary" size="large" danger @click="store._userUnFollow(UserDetail)">取消关注</a-button>
                <a-button v-else size="large" style="background-color: var(--active-bg);" @click="store._userFollow(UserDetail)">关注</a-button>
              </div>
            </div>

            <div class="icon-text"> <CalendarOutlined style="margin-right: 10px" />注册于：{{UserDetail.createTime}}</div>
            <div>
              <a-tabs  v-model:activeKey="activeKey" size="large" centered>
                <a-tab-pane key="1" tab="帖子">
                  <div class="flex flex-col justify-center content">
                    <!-- {{ checkMenuList.value[currentIndex.value].order }} -->
                    <!-- 循环渲染多个 ComCard -->
                    <a-empty v-if="UserForums?.length === 0" description="暂无内容" image="/img/test/load-ail.png"
                             style="margin-top: 30%;"></a-empty>
                    <template v-else>
                      <ComList v-for="(card, index) in UserForums" :key="index" :cardData="card"
                               class="xt-bg">

                      </ComList>
                    </template>
                  </div>
                </a-tab-pane>
                <a-tab-pane key="2" tab="点赞" force-render>
                  <div class="flex flex-col justify-center content">
                    <!-- {{ checkMenuList.value[currentIndex.value].order }} -->
                    <!-- 循环渲染多个 ComCard -->
                    <a-empty v-if="UserLoves?.length === 0" description="暂无内容" image="/img/test/load-ail.png"
                             style="margin-top: 30%;"></a-empty>
                    <template v-else>
                      <ComList v-for="(card, index) in UserLoves" :key="index" :cardData="card">
                      </ComList>
                    </template>
                  </div>
                </a-tab-pane>
                <a-tab-pane key="3" tab="收藏" force-render>
                  <div class="flex flex-col justify-center content">
                    <!-- {{ checkMenuList.value[currentIndex.value].order }} -->
                    <!-- 循环渲染多个 ComCard -->
                    <a-empty v-if="UserCollects?.length === 0" description="暂无内容" image="/img/test/load-ail.png"
                             style="margin-top: 30%;"></a-empty>
                    <template v-else>
                      <ComList v-for="(card, index) in UserCollects" :key="index" :cardData="card">
                      </ComList>
                    </template>
                  </div>
                </a-tab-pane>
              </a-tabs>
            </div>

          </a-card>
        </vue-custom-scrollbar>
      </div>

    </div>
  </div>
</template>
<script lang='ts' setup>
import { CalendarOutlined } from '@ant-design/icons-vue'
import {topicData,users,comCards} from './mock';
import { useRoute,useRouter } from 'vue-router';
import { ref, reactive } from 'vue';
import {UFold} from "undraw-ui";
import VueCustomScrollbar from "../../../../src/components/vue-scrollbar.vue";
import ComList from "@page/chat/com/ComList.vue";
const currentPage = ref(1)
import { comStore } from '../../store/com'
const store = comStore();

const settingsScroller = reactive({
  useBothWheelAxes: true,
  swipeEasing: true,
  suppressScrollY: false,
  suppressScrollX: true,
  wheelPropagation: true,
});
const route  = useRoute()
const router = useRouter()


import { getUserDetail } from "@package/../src/api/socialNetwork_user";
console.log('这里是用户详情页面')
console.log('用户id：'+route.query.id)
const activeKey = ref('1');
const UserDetail = ref({})
const UserForums = ref([]);
const UserLoves = ref([]);
const UserCollects = ref([]);

function fetchUserDetailData() {
  getUserDetail(route.query.id).then(response=>{
    UserDetail.value = response.data.user;
    UserForums.value = response.data.forumList;
    UserLoves.value = response.data.loveList;
    UserCollects.value = response.data.collectList;
  })
}
fetchUserDetailData();
// if(route.query.id){
//   UserDetail.value = users.find(item=>item.id == route.query.id)
//   const UserLikeids = users.find(item=>item.id == route.query.id).likeIds
//   comCards.list.forEach(item=>{
//     if(UserLikeids.includes(item.id)){
//       UserLikes.value.push(item)
//     }
//   })
// }
// //遍历comCards.list，找到用户的帖子
// comCards.list.forEach(item=>{
//   if(item.user.id == route.query.id){
//     UserForums.value.push(item)
//   }
// })



function OnBack() {
  router.back()
}

</script>
<style lang="scss" scoped>
.spacebetween{
  display: flex;
  justify-content: space-between;
}
.image-container {
  height: 250px; /* 指定容器高度 */
  overflow: hidden; /* 隐藏溢出部分 */

  /* 使用 flex 布局使图片在容器中水平和垂直居中 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.centered-image {
  /* 使图片保持宽高比，不拉伸或压缩 */
  object-fit: cover;
  /* 使图片显示中间部分 */
  object-position: center center;
  /* 使图片完全覆盖容器，可能会裁剪部分图片 */
  width: 100%;
  height: 100%;
}
//icon-text图标和文字居中
.icon-text{
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
}
</style>
