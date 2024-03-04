<template>
  <div class="flex justify-center h-full ml-3">
    <div class="pl-3 pr-3" style="width: 60%;">
      <div class="flex justify-between h-[40px] mb-3">
        <div  class="xt-text font-16" style="line-height: 40px;">
          用户
        </div>
      </div>
      <div style="height: 100%;">
        <vue-custom-scrollbar :key="currentPage" ref="threadListRef" :settings="settingsScroller"
                              class="w-full thread-list"
                              style="height: calc(100% - 90px );overflow: hidden;flex-shrink: 0;width: 100%;">
          <a-empty v-if="users?.length === 0" description="暂无内容" image="/img/test/load-ail.png"
                   style="margin-top: 30%;"></a-empty>
        <a-card v-else v-for="item in userList" class="xt-bg" style="margin-bottom: 30px" :bordered="false">
          <template #cover>
            <div class="image-container">
              <img
                :src="item.backgroundImg"
                class="centered-image"
              />
            </div>
          </template>
          <div class="spacebetween">
            <a-card-meta>
              <template #title>
                <div class="hover_underline" @click="userDetail(item)">{{item.nickname}}</div>
              </template>
              <template #description>
                <u-fold line="1">
                  <p style="width: 200px;">{{ item.description }}</p>
                </u-fold>
              </template>
              <template #avatar>
                <a-avatar size="large" :src="item.avatar" />
              </template>
            </a-card-meta>
            <div style="width: 600px;display: flex;justify-content: space-around;align-items: center">
              <div style="padding :10px 0;text-align:center;">
                <p style="font-weight:bold;margin: 0;padding: 0">帖子</p>
                <p style="margin: 0;padding: 0">{{ item.forumNum }}</p>
              </div>
              <div style="padding :10px 0;text-align:center;">
                <p style="font-weight:bold;margin: 0;padding: 0">关注者</p>
                <p style="margin: 0;padding: 0">{{ item.fanNum }}</p>
              </div>
              <div style="padding :10px 0;text-align:center;">
                <p style="font-weight:bold;margin: 0;padding: 0">正在关注</p>
                <p style="margin: 0;padding: 0">{{ item.followNum }}</p>
              </div>
              <button style="color: var(--active-bg);width: 83px;height: 40px;">关注</button>
            </div>
          </div>
        </a-card>
        </vue-custom-scrollbar>
      </div>

    </div>
    <div class="pl-3 pr-3" style="width: 30%;">
      <a-card title="热搜话题" class="xt-bg" :bordered="false" style="width: 300px;border-radius: 10px">
        <template #extra><router-link :to="{name: 'topic'}">more</router-link></template>
        <div v-for="(item,index) in topicData">
          <div v-if="index<3" class="spacebetween">
            <a-card-meta>
              <template #title>
                <router-link :to="{name: 'topic'}">{{ item.title }}</router-link>
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
import { SettingOutlined, EditOutlined, EllipsisOutlined } from '@ant-design/icons-vue'
import {topicData,users} from './mock';
import { useRoute,useRouter } from 'vue-router';
import { ref, reactive, onMounted } from 'vue';
import {UFold} from "undraw-ui";
import VueCustomScrollbar from "../../../../src/components/vue-scrollbar.vue";
import Template from "@package/user/pages/Template.vue";
import Import from "@page/deck/Import.vue";
import { getUserList } from "@package/../src/api/socialNetwork_user";
const currentPage = ref(1)
const userList = ref([]);
//userList.value = users;//假数据
async function fetchUserListData() {
  const res = await getUserList();
  userList.value = res.data;
}
onMounted(async()=>{
  await fetchUserListData();
})

const settingsScroller = reactive({
  useBothWheelAxes: true,
  swipeEasing: true,
  suppressScrollY: false,
  suppressScrollX: true,
  wheelPropagation: true,
});

const route  = useRoute()
const router = useRouter()

function userDetail(item) {
  router.push({name: 'userDetail', query: {id: item.id}})
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
</style>
