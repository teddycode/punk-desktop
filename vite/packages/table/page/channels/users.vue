<template>
  <div class="flex justify-center h-full ml-3">
    <div class="pl-3 pr-3" style="width: 95%">
      <div class="flex justify-between h-[40px] mb-3">
        <div class="xt-text font-16" style="line-height: 40px">用户</div>
      </div>
      <div style="height: 100%">
        <vue-custom-scrollbar
          :key="currentPage"
          ref="threadListRef"
          :settings="settingsScroller"
          class="w-full thread-list"
          style="height: calc(100% - 90px); overflow: hidden; flex-shrink: 0; width: 100%"
        >
          <a-empty
            v-if="userList?.length === 0"
            description="暂无内容"
            image="/img/test/load-ail.png"
            style="margin-top: 30%"
          />
          <a-card v-else v-for="item in userList" style="margin-bottom: 30px">
            <template #cover>
              <div class="image-container">
                <img :src="item?.backgroundImg" class="centered-image" />
              </div>
            </template>
            <div class="spacebetween">
              <a-card-meta>
                <template #title>
                  <div class="hover_underline" @click="userDetail(item)">{{ item?.nickname }}</div>
                </template>
                <template #description>
                  <u-fold v-if="item && item?.description" line="1">
                    <p style="width: 200px">{{ item?.description }}</p>
                  </u-fold>
                </template>
                <template #avatar>
                  <a-avatar size="large" :src="item?.avatar" />
                </template>
              </a-card-meta>
              <div style="width: 600px; display: flex; justify-content: space-around; align-items: center">
                <div style="padding: 10px 0; text-align: center">
                  <p style="font-weight: bold; margin: 0; padding: 0">帖子</p>
                  <p style="margin: 0; padding: 0">{{ item?.forumNum }}</p>
                </div>
                <div style="padding: 10px 0; text-align: center">
                  <p style="font-weight: bold; margin: 0; padding: 0">关注者</p>
                  <p style="margin: 0; padding: 0">{{ item?.fanNum }}</p>
                </div>
                <div style="padding: 10px 0; text-align: center">
                  <p style="font-weight: bold; margin: 0; padding: 0">正在关注</p>
                  <p style="margin: 0; padding: 0">{{ item?.followNum }}</p>
                </div>
                <a-button
                  v-if="store.isFollowed(item?.id)"
                  type="primary"
                  size="large"
                  danger
                  @click="store._userUnFollow(item)"
                  >取消关注</a-button
                >
                <a-button
                  v-else
                  size="large"
                  style="background-color: var(--active-bg)"
                  @click="store._userFollow(item)"
                  >关注</a-button
                >
              </div>
            </div>
          </a-card>
        </vue-custom-scrollbar>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { SettingOutlined, EditOutlined, EllipsisOutlined } from '@ant-design/icons-vue';
import { topicData, users } from './mock';
import { useRoute, useRouter } from 'vue-router';
import { ref, reactive, onMounted } from 'vue';
import { UFold } from 'undraw-ui';
import VueCustomScrollbar from '../../../../src/components/vue-scrollbar.vue';
import Template from '@package/user/pages/Template.vue';
import Import from '@page/deck/Import.vue';
import { getUserList } from '@js/service/socialNetwork_user';
import { comStore } from '@store/com';
const store = comStore();
const currentPage = ref(1);
let userList = ref([]);
//userList.value = users;//假数据
async function fetchUserListData() {
  try {
    const res = await getUserList();
    if (res && res?.data) {
      return res?.data?.filter((item) => item?.id !== store.user?.id);
    }
  } catch (e) {
    console.error(e);
  }
  return [];
}
onMounted(async () => {
  if (userList) {
    fetchUserListData().then((result) => {
      console.log('获取list：', result, userList);
      userList.value = result; // TODO bug here
    });
  }
});
console.log(store.followList);
// const isFollowed = (followId) =>{
//   var index = store.followList.findIndex(item => item.id == followId);
//   return index != -1
// }
// function follow(user){
//   store.followList.push(user);
//   store._userFollow(user.id)
// }
// function unfollow(user) {
//   var index = store.followList.findIndex(item => item.id == user.id);
//   store.followList.splice(index,1);
//   store._userFollow(user.id)
// }

const settingsScroller = reactive({
  useBothWheelAxes: true,
  swipeEasing: true,
  suppressScrollY: false,
  suppressScrollX: true,
  wheelPropagation: true,
});

const router = useRouter();

function userDetail(item) {
  router.push({ name: 'userDetail', query: { id: item.id } });
}
</script>

<style lang="scss" scoped>
.spacebetween {
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
