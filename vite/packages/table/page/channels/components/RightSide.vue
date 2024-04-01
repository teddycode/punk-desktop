<template>
  <div class="pl-3 pr-3">
    <a-card hoverable title="热搜话题"  style="width: 300px;border-radius: 10px;">
      <template #extra><router-link :to="{name: 'tag'}">more</router-link></template>
      <div v-for="(item,index) in store.topTagList">
        <div  style="display: flex;justify-content: space-between">
          <a-card-meta>
            <template #title>
              <router-link  :to="{name: 'tagDetail',query:{id:item.id,tagName:item.tagName}}"># {{ item.tagName}}</router-link>
            </template>
            <template #description>
              <p>共被提到 {{item.forumCount}} 次</p>
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
          <TrendChart :tag-data="item.trend"></TrendChart>
        </div>
      </div>
    </a-card>
    <a-card title="推荐关注" hoverable style="width: 300px;border-radius: 10px;margin-top: 80px">
      <template #extra><router-link :to="{name: 'users'}">more</router-link></template>
      <div v-for="(item,index) in store.topUserList">
        <div style="display: flex;justify-content: space-between;align-items: center;margin-bottom: 10px">
          <a-card-meta>
            <template #title>
              <div class="hover_underline" @click="userDetail(item)">{{item.nickname}}</div>
            </template>
            <template #description>
              <u-fold line="1">
                <p style="width: 180px;margin: 0">{{ item.description }}</p>
              </u-fold>
            </template>
            <template #avatar>
              <a-avatar size="large" :src="item.avatar" />
            </template>
          </a-card-meta>
          <a-button v-if="store.isFollowed(item.id)" size="small" type="primary" shape="round" danger @click="store._userUnFollow(item)">取消关注</a-button>
          <a-button v-else size="small" shape="round" style="background-color: var(--active-bg);" @click="store._userFollow(item)">关注</a-button>
        </div>
      </div>
    </a-card>
<!--    <a-card  title="公告"  style="width: 300px;border-radius: 10px;margin-top: 80px">-->
<!--      <template #extra><router-link :to="{name: 'notification'}">more</router-link></template>-->
<!--      <p>welcome！磐古</p>-->
<!--      <p>项目说明</p>-->
<!--    </a-card>-->
  </div>
</template>
<script setup lang="ts">
import {topicData} from "@page/channels/mock";
import { getTopTagList } from "../../../../../src/api/socialNetwork_tag";
import {onMounted, ref} from "vue";
import TrendChart from "@page/channels/components/TrendChart.vue";
import { comStore } from "@store/com";
import Template from "@package/user/pages/Template.vue";
import {UFold} from "undraw-ui";
import {useRoute, useRouter} from "vue-router";
const store = comStore();
const router = useRouter()
function userDetail(item) {
  router.push({name: 'userDetail', query: {id: item.id}})
}

// const topTagList = ref([]);
// const fetchTopTagListData = async () => {
//   const res = await getTopTagList(3);
//   topTagList.value = res.data;
// };
// fetchTopTagListData();
</script>

<style scoped lang="scss">

</style>
