<template>
<!--  <div>这里是文章详情页面啦啦啦啦,id:{{ route.query.id }}</div>-->
  <div class="flex justify-center h-full ml-3">
    <div class="pl-3 pr-3" style="width: 60%;">
      <div class="flex justify-between h-[40px] mb-3">
        <div @click="OnBack" class="xt-text font-16 back-hover" style="line-height: 40px;">
          返回
        </div>
      </div>
      <div style="height: 100%;">
        <vue-custom-scrollbar :key="currentPage" ref="threadListRef" :settings="settingsScroller"
                              class="w-full thread-list"
                              style="height: calc(100% - 90px );overflow: hidden;flex-shrink: 0;width: 100%;">
        <ComList v-if="article" :cardData="article"
                  style="background-color: white"
                  @like="forumDetailLike"
                  @collect="forumDetailcollect"
        >
        </ComList>

        <u-comment class="xt-bg" upload :config="config" @submit="submit" @like="like" relative-time>
<!--           <div style="margin-top: -20px;"></div>-->
<!--           <template #header>头部卡槽</template>-->
<!--           <template #info>用户信息卡槽</template>-->
<!--           <template #card>用户信息卡片卡槽</template>-->
<!--           <template #opearte>操作栏卡槽</template>-->
<!--           <template #func>功能区域卡槽</template>-->
        </u-comment>
        </vue-custom-scrollbar>
      </div>

    </div>
    <div   class="pl-3 pr-3" style="width: 30%;">
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
import {comCards, topicData} from './mock';
import { useRoute,useRouter } from 'vue-router';
import {ref, reactive, onMounted, onBeforeMount} from 'vue';
import ComList from '../chat/com/ComList.vue';
import emoji from '../../assets/emoji'
import { CommentApi, ConfigApi, SubmitParamApi, UToast, createObjectURL, dayjs } from 'undraw-ui'
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


const config = reactive<ConfigApi>({
  user: {} as any,
  emoji: emoji,
  comments: [],
  showLevel: false,
  showHomeLink: false,
  showAddress: false,
  showLikes: false
  // user: {
  //   id: 1,
  //   username: 'jack',
  //   avatar: 'https://static.juzicon.com/avatars/avatar-200602130320-HMR2.jpeg?x-oss-process=image/resize,w_100',
  //   // 评论id数组 建议:存储方式用户uid和评论id组成关系,根据用户uid来获取对应点赞评论id,然后加入到数组中返回
  //   // likeIds: [1, 2, 3]
  // },
  // emoji: emoji,
  // comments: [],
  // total: 10,
})
// 评论数据
// setTimeout(() => {
//   config.user = {
//     id: 1,
//     username: 'jack',
//     avatar: 'https://static.juzicon.com/avatars/avatar-200602130320-HMR2.jpeg?x-oss-process=image/resize,w_100'
//   }
//   config.comments = [
//     {
//       id: '1',
//       parentId: 0,
//       uid: '1',
//       content: '等闲识得东风面，万紫千红总是春。',
//       createTime: '2023-04-30 16:22',
//       user: {
//         username: '团团喵喵',
//         avatar: 'https://static.juzicon.com/user/avatar-23ac4bfe-ae93-4e0b-9f13-f22f22c7fc12-221001003441-Y0MB.jpeg'
//       }
//     },
//     {
//       id: '2',
//       parentId: 0,
//       uid: '2',
//       content: '长风破浪会有时，直挂云帆济沧海。',
//       createTime: '2023-04-28 09:00',
//       user: {
//         username: '且美且独立',
//         avatar: 'https://static.juzicon.com/avatars/avatar-20200926115919-a45y.jpeg'
//       }
//     }
//   ]
// }, 500)

import { getCommentList } from "@package/../src/api/comment";

function fetchCommentList() {
  getCommentList(route.query.id).then(response => {
    config.comments = response.data;
    console.log(response.data);
  })
}
fetchCommentList();

let temp_id = 100
// 提交评论事件
// const submit = ({ content, parentId, files, finish, reply }: SubmitParamApi) => {
//   let str = '提交评论:' + content + ';\t父id: ' + parentId + ';\t图片:' + files + ';\t被回复评论:'
//   console.log(str, reply)
//
//   /**
//    * 上传文件后端返回图片访问地址，格式以'||'为分割; 如:  '/static/img/program.gif||/static/img/normal.webp'
//    */
//   let contentImg = files?.map(e => createObjectURL(e)).join('||')
//
//   temp_id += 1
//   const comment: CommentApi = {
//     id: String(temp_id),
//     parentId: parentId,
//     uid: config.user.id,
//     address: '来自江苏',
//     content: content,
//     likes: 0,
//     createTime: dayjs().subtract(5, 'seconds').toString(),
//     contentImg: contentImg,
//     user: {
//       username: config.user.username,
//       avatar: config.user.avatar,
//       level: 6,
//       homeLink: `/${(temp_id)}`
//     },
//     reply: null
//   }
//   setTimeout(() => {
//     finish(comment)
//     UToast({ message: '评论成功!', type: 'info' })
//   }, 200)
// }
const submit = ({ content, parentId, files, finish }: SubmitParamApi) => {
  console.log('提交评论: ' + content, parentId, files)

  const comment: CommentApi = {
    id: String((temp_id += 1)),
    parentId: parentId,
    uid: config.user.id,
    content: content,
    createTime: '1分钟前',
    user: {
      username: config.user.username,
      avatar: config.user.avatar
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


import {comStore} from '../../store/com'
import {storeToRefs} from 'pinia'
import VueCustomScrollbar from "../../../../src/components/vue-scrollbar.vue";
import {getForumDetail} from'@package/../src/api/forum'
const store = comStore();
const { user } = storeToRefs(store)
const article = ref(null)
console.log('这里是帖子详情页面')
console.log('文章id：'+route.query.id)
function fetchForumDetail(id){
  getForumDetail(id).then(response=>{
    article.value = response.data
    config.user.username = response.data.user.nickname
    config.user.avatar = response.data.user.avatar
  })
}
fetchForumDetail(route.query.id)
// async function fetchForumDetail(id){
//   await getForumDetail(id).then(response=>{
//     article.value = response.data
//     console.log(response.data)
//   })
// }
// // fetchForumDetail(route.query.id)
// onBeforeMount(async()=>{
//   await fetchForumDetail(route.query.id)
// })


function forumDetailLike(id){
  var index = user.value.likeIds.findIndex(item => item == id)
  if(index == -1){  //未点赞
    article.value.support_count++;
    user.value.likeIds.push(id)
  }
  else{
    article.value.support_count--;
    user.value.likeIds.splice(index,1);
  }
}
function forumDetailcollect(id){
  var index = user.value.collectIds.findIndex(item => item == id)
  if(index == -1){ //未收藏
    article.value.view_count++
    user.value.collectIds.push(id);
  }
  else{
    article.value.view_count--;
    user.value.collectIds.splice(index,1)
  }
}
const OnBack = () =>{
  router.back()
}
</script>
<style lang='scss' scoped>
//back-hover 鼠标悬浮，文字加下划线
.back-hover{
  cursor: pointer;
  &:hover{
    text-decoration: underline;
    color:var(--active-bg);
  }
}

::v-deep .u-comment .comment-list-wrapper .comment-list .comment .comment-primary .reply-box{
  background: var(--primary-bg) !important;
}

</style>
