<template>
  <div class="flex justify-center h-full">
    <div class="" style="margin-top: 54px">
      <div class="flex flex-col w-[108px] h-[268px] justify-center items-center xt-bg rounded-lg">
        <div
          v-for="(item, index) in selectList"
          :key="index"
          class="w-[96px] h-[32px] mt-1 mb-2 text-center leading-8 font-16"
          :class="[{ action: currentIndex == index }]"
          style="cursor: pointer"
          @click="setCurrentIndex(index, item)"
        >
          {{ item.name }}
        </div>
      </div>
    </div>
    <div style="width: 70%" class="pl-3 pr-3">
      <div class="flex justify-between h-[40px] mb-3">
        <div class="xt-text font-16" style="line-height: 40px">
          {{ selectList[currentIndex].name }}
        </div>
        <div class="w-[83px] h-[40px]">
          <xt-button
            style="
              color: var(--active-bg);
              width: 83px;
              height: 40px;
              border-radius: 12px;
              background: rgba(80, 139, 254, 0.2);
            "
            @click="visibleModal"
          >
            <newIcon
              class="pr-1 text-xl xt-theme-text"
              style="vertical-align: sub; font-size: 22px; margin-right: 6px"
              icon="akar-icons:circle-plus-fill"
            />发布
          </xt-button>
        </div>
      </div>
      <div style="height: 100%">
        <vue-custom-scrollbar
          ref="threadListRef"
          :key="currentPage"
          class="w-full thread-list"
          :settings="settingsScroller"
          style="height: calc(100% - 90px); overflow: hidden; flex-shrink: 0; width: 100%"
        >
          <div class="flex flex-col justify-center content">
            <!-- {{ checkMenuList.value[currentIndex.value].order }} -->
            <!-- 循环渲染多个 ComCard -->
            <a-empty
              v-if="comCards.list?.length === 0"
              description="暂无内容"
              image="/img/test/load-ail.png"
              style="margin-top: 30%"
            ></a-empty>
            <template v-else>
              <ComList
                :key="index"
                :cardData="comCards.list[0]"
                @click="showDetail(index)"
                class="xt-bg"
                :style="{
                  backgroundColor:
                    selectedIndex === index ? 'var(--active-secondary-bg) !important' : 'var(--primary-bg) !important',
                  flex: 1,
                }"
              >
              </ComList>
              <u-comment :config="config" @submit="submit" @like="like" relative-time>
                <!-- <div>导航栏卡槽</div> -->
                <!-- <template #header>头部卡槽</template> -->
                <!-- <template #info>用户信息卡槽</template> -->
                <!-- <template #card>用户信息卡片卡槽</template> -->
                <!-- <template #opearte>操作栏卡槽</template> -->
                <!-- <template #func>功能区域卡槽</template> -->
              </u-comment>
              <!-- <ComList v-for="(card, index) in comCards.list" :key="index" :cardData="card"
                                @click="showDetail(index)" class="xt-bg"
                                :style="{ backgroundColor: selectedIndex === index ? 'var(--active-secondary-bg) !important' : 'var(--primary-bg) !important', flex: 1 }">
                            </ComList>
                            <ComList v-for="(card, index) in comCards.list" :key="index" :cardData="card"
                                @click="showDetail(index)" class="xt-bg"
                                :style="{ backgroundColor: selectedIndex === index ? 'var(--active-secondary-bg) !important' : 'var(--primary-bg) !important', flex: 1 }">
                            </ComList>
                            <ComList v-for="(card, index) in comCards.list" :key="index" :cardData="card"
                                @click="showDetail(index)" class="xt-bg"
                                :style="{ backgroundColor: selectedIndex === index ? 'var(--active-secondary-bg) !important' : 'var(--primary-bg) !important', flex: 1 }">
                            </ComList>
                            <ComList v-for="(card, index) in comCards.list" :key="index" :cardData="card"
                                @click="showDetail(index)" class="xt-bg"
                                :style="{ backgroundColor: selectedIndex === index ? 'var(--active-secondary-bg) !important' : 'var(--primary-bg) !important', flex: 1 }">
                            </ComList>
                            <ComList v-for="(card, index) in comCards.list" :key="index" :cardData="card"
                                @click="showDetail(index)" class="xt-bg"
                                :style="{ backgroundColor: selectedIndex === index ? 'var(--active-secondary-bg) !important' : 'var(--primary-bg) !important', flex: 1 }">
                            </ComList>
                            <ComList v-for="(card, index) in comCards.list" :key="index" :cardData="card"
                                @click="showDetail(index)" class="xt-bg"
                                :style="{ backgroundColor: selectedIndex === index ? 'var(--active-secondary-bg) !important' : 'var(--primary-bg) !important', flex: 1 }">
                            </ComList>
                            <ComList v-for="(card, index) in comCards.list" :key="index" :cardData="card"
                                @click="showDetail(index)" class="xt-bg"
                                :style="{ backgroundColor: selectedIndex === index ? 'var(--active-secondary-bg) !important' : 'var(--primary-bg) !important', flex: 1 }">
                            </ComList>
                            <ComList v-for="(card, index) in comCards.list" :key="index" :cardData="card"
                                @click="showDetail(index)" class="xt-bg"
                                :style="{ backgroundColor: selectedIndex === index ? 'var(--active-secondary-bg) !important' : 'var(--primary-bg) !important', flex: 1 }">
                            </ComList>
                            <ComList v-for="(card, index) in comCards.list" :key="index" :cardData="card"
                                @click="showDetail(index)" class="xt-bg"
                                :style="{ backgroundColor: selectedIndex === index ? 'var(--active-secondary-bg) !important' : 'var(--primary-bg) !important', flex: 1 }">
                            </ComList> -->
            </template>
          </div>
        </vue-custom-scrollbar>
<!--        <div>-->
<!--          <router-link to="/team">team</router-link>-->
<!--          <u-comment :config="config" @submit="submit" @like="like" relative-time>-->
<!--            &lt;!&ndash; <div>导航栏卡槽</div> &ndash;&gt;-->
<!--            &lt;!&ndash; <template #header>头部卡槽</template> &ndash;&gt;-->
<!--            &lt;!&ndash; <template #info>用户信息卡槽</template> &ndash;&gt;-->
<!--            &lt;!&ndash; <template #card>用户信息卡片卡槽</template> &ndash;&gt;-->
<!--            &lt;!&ndash; <template #opearte>操作栏卡槽</template> &ndash;&gt;-->
<!--            &lt;!&ndash; <template #func>功能区域卡槽</template> &ndash;&gt;-->
<!--          </u-comment>-->
<!--        </div>-->
        <div class="flex justify-center">
          <a-pagination v-model:current="currentPage" :total="50" show-less-items class="pagination" />
        </div>
      </div>
    </div>
    <PublishModal v-if="publishVisible" @handle-ok="publishVisible = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { Icon as newIcon } from '@iconify/vue';
import ComList from '../chat/com/ComList.vue';
import PublishModal from '../chat/com/PublishModal.vue';
import { comCards } from './mock';

import emoji from '../../assets/emoji'
import { CommentApi, ConfigApi, SubmitParamApi, UToast, createObjectURL, dayjs } from 'undraw-ui'

const config = reactive<ConfigApi>({
  user: {
    id: 1,
    username: 'jack',
    avatar: 'https://static.juzicon.com/avatars/avatar-200602130320-HMR2.jpeg?x-oss-process=image/resize,w_100',
    // 评论id数组 建议:存储方式用户uid和评论id组成关系,根据用户uid来获取对应点赞评论id,然后加入到数组中返回
    likeIds: [1, 2, 3]
  },
  emoji: emoji,
  comments: [],
  total: 10
})

let temp_id = 100
// 提交评论事件
const submit = ({ content, parentId, files, finish, reply }: SubmitParamApi) => {
  let str = '提交评论:' + content + ';\t父id: ' + parentId + ';\t图片:' + files + ';\t被回复评论:'
  console.log(str, reply)

  /**
   * 上传文件后端返回图片访问地址，格式以'||'为分割; 如:  '/static/img/program.gif||/static/img/normal.webp'
   */
  let contentImg = files?.map(e => createObjectURL(e)).join('||')

  temp_id += 1
  const comment: CommentApi = {
    id: String(temp_id),
    parentId: parentId,
    uid: config.user.id,
    address: '来自江苏',
    content: content,
    likes: 0,
    createTime: dayjs().subtract(5, 'seconds').toString(),
    contentImg: contentImg,
    user: {
      username: config.user.username,
      avatar: config.user.avatar,
      level: 6,
      homeLink: `/${(temp_id)}`
    },
    reply: null
  }
  setTimeout(() => {
    finish(comment)
    UToast({ message: '评论成功!', type: 'info' })
  }, 200)
}
// 点赞按钮事件 将评论id返回后端判断是否点赞，然后在处理点赞状态
const like = (id: string, finish: () => void) => {
  console.log('点赞: ' + id)
  setTimeout(() => {
    finish()
  }, 200)
}

config.comments = [
  {
    id: '1',
    parentId: null,
    uid: '1',
    address: '',
    content:
      '缘生缘灭，缘起缘落，我在看别人的故事，别人何尝不是在看我的故事?别人在演绎人生，我又何尝不是在这场戏里?谁的眼神沧桑了谁?我的眼神，只是沧桑了自己[喝酒]',
    likes: 2,
    contentImg: 'https://gitee.com/undraw/undraw-ui/raw/master/public/docs/normal.webp',
    createTime: dayjs().subtract(10, 'minute').toString(),
    user: {
      username: '落🤍尘',
      avatar: 'https://static.juzicon.com/avatars/avatar-200602130320-HMR2.jpeg?x-oss-process=image/resize,w_100',
      level: 0,
      homeLink: '/1'
    }
  }
]
const selectList = ref([
  {
    name: '推荐',
    type: 'interduce',
  },
  {
    name: '全站',
    type: 'all',
  },
  {
    name: '最新发布',
    type: 'last',
  },
  {
    name: '关注',
    type: 'focus',
  },
  {
    name: '圈子',
    type: 'circle',
  },
  {
    name: '视频',
    type: 'video',
  },
]);
const publishVisible = ref(false);
const currentPage = ref(1);
const currentIndex = ref(0);
const setCurrentIndex = (index, item) => {
  currentIndex.value = index;
};
const settingsScroller = reactive({
  useBothWheelAxes: true,
  swipeEasing: true,
  suppressScrollY: false,
  suppressScrollX: true,
  wheelPropagation: true,
});
const selectedIndex = ref(-1);
const visibleModal = () => {
  console.log(publishVisible.value);

  publishVisible.value = true;
};
</script>
<style lang="scss" scoped>
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
