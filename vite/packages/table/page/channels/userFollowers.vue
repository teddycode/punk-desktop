<template>
  <div class="flex justify-center h-full ml-3">
    <div class="pl-3 pr-3" style="width: 100%">
      <div class="flex justify-between h-[40px] mb-3">
        <div class="xt-text font-16" style="line-height: 40px;">
          {{ UserDetail.nickname }}
        </div>
        <div @click="router.back()" class="xt-text font-16 hover_underline" style="line-height: 40px;">
          返回
        </div>
      </div>
      <div style="height: 100%;">
        <vue-custom-scrollbar :key="currentPage" ref="threadListRef" :settings="settingsScroller"
                              class="w-full thread-list"
                              style="height: calc(100% - 90px );overflow: hidden;flex-shrink: 0;width: 100%;">
          <div>
            <a-tabs  v-model:activeKey="activeKey" size="large" centered>
              <a-tab-pane key="1" tab="关注者">
                <div class="flex flex-col justify-center content">

                  <a-empty v-if="UserFans?.length === 0" description="暂无关注者" image="/img/test/load-ail.png"
                           style="margin-top: 30%;"></a-empty>
                  <template v-else>
                    <a-list item-layout="horizontal" :data-source="UserFans" >
                      <template #renderItem="{ item }">
                        <a-list-item>
                          <a-list-item-meta>
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
                          </a-list-item-meta>
                          <a-button v-if="store.isFollowed(item.id)" type="primary" size="large" danger @click="store._userUnFollow(item)">取消关注</a-button>
                          <a-button v-else size="large" style="background-color: var(--active-bg);" @click="store._userFollow(item)">关注</a-button>
                        </a-list-item>
                      </template>
                    </a-list>
                  </template>
                </div>
              </a-tab-pane>
              <a-tab-pane key="2" tab="正在关注" force-render>
                <div class="flex flex-col justify-center content">

                  <a-empty v-if="UserFollowers?.length === 0" description="暂无正在关注" image="/img/test/load-ail.png"
                           style="margin-top: 30%;"></a-empty>
                  <template v-else>
                    <a-list item-layout="horizontal" :data-source="UserFollowers" >
                      <template #renderItem="{ item }">
                        <a-list-item>
                          <a-list-item-meta>
                            <template #title>
                              <div class="hover_underline" @click="userDetail(item)">{{item.nickname}}</div>
                            </template>
                            <template #description>
                              <u-fold line="1">
                                <p style="width: 200px;">{{ item.description }}</p>
                              </u-fold>
                            </template>
                            <template #avatar>
                              <a-avatar size="large" :src="UserDetail.avatar" />
                            </template>
                          </a-list-item-meta>
                          <a-button v-if="store.isFollowed(item.id)" type="primary" size="large" danger @click="store._userUnFollow(item)">取消关注</a-button>
                          <a-button v-else size="large" style="background-color: var(--active-bg);" @click="store._userFollow(item)">关注</a-button>
                        </a-list-item>
                      </template>
                    </a-list>
                  </template>
                </div>
              </a-tab-pane>
            </a-tabs>
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
import { getUserDetail } from "@js/service/socialNetwork_user";
import {useRoute, useRouter} from "vue-router";
import Template from "@package/user/pages/Template.vue";
import {UFold} from "undraw-ui";
const route  = useRoute()
const router = useRouter()
const UserDetail = ref({});
const UserFollowers = ref([]);
const UserFans = ref([]);
const activeKey = ref('1');
activeKey.value = <string>route.query.activeKey;

function fetchUserDetailData() {
  getUserDetail(route.query.id).then(response=>{
    UserDetail.value = response.data.user;
    UserFollowers.value = response.data.followList;
    UserFans.value = response.data.fansList;
  })
}
fetchUserDetailData();

const currentPage = ref(1)

const settingsScroller = reactive({
  useBothWheelAxes: true,
  swipeEasing: true,
  suppressScrollY: false,
  suppressScrollX: true,
  wheelPropagation: true,
});
const selectedIndex = ref(-1)
function userDetail(item) {
  router.push({name: 'userDetail', query: {id: item.id}})
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
