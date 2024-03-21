<template>
  <!-- {{ props.cardData }} -->
  <div class="w-full card">
    <div class="card-content">
      <!-- {{ Imageheight.width }} -->
      <div class="w-full card-top">
        <div class="top-left">
          <a-avatar :size="32" :src="cardData.user.avatar" class="pointer" @click.stop="showCard(uid, userInfo)">
            <template #icon>
              <UserOutlined />
            </template>
          </a-avatar>
          <div class="user-msg">
            <div class="text-sm username" style="color: var(--primary-text)">
              {{ cardData.user.nickname }}
            </div>
            <div class="text-xs self-msg xt-text-2">
              <span class="date">{{ createTime[0] }}</span>
              <span class="time">{{ createTime[1] }}</span>
<!--              <span class="ip">{{ cardData.user.ip_home.region }}</span>-->
            </div>
          </div>
        </div>
      </div>

      <div class="w-full">
        <div class="flex">
          <!-- 单个图片 -->
          <template v-if="cardData.imgs.length === 1 && !cardData.data?.video">
            <!-- <div > -->
            <img
              :src="cardData.imgs[0].img"
              class="object-cover mr-2 overflow-hidden rounded-md cover-im"
              :class="{ 'hide-images-video': detailVisible }"
              style="flex-shrink: 0; "
            />
            <!-- </div> -->
          </template>
          <video
            class="object-cover mr-2 rounded-md cover-im"
            v-if="cardData.data?.video"
            :class="{ 'hide-images-video': detailVisible }"
          >
            <source :src="cardData.data?.video" type="video/mp4" />
            <source :src="cardData.data?.video" type="video/webm" />
          </video>
          <!-- 正文内容 -->
          <div class="flex flex-col justify-between" style="flex-shrink: 1">
            <div
              id="title"
              style="color: var(--primary-text)"
              v-if="cardData.title"
              :class="{ 'omit-title': cardData.imgs.length === 1 || cardData.data?.video }"
              :innerHTML="title"
              @click="forumDetail"
            ></div>
            <div
              id="context"
              style="color: var(--secondary-text); text-align: left"
              :class="{ omit: cardData.imgs.length === 1 || cardData.data?.video }"
              :innerHTML="content"
            ></div>
<!--            <div v-for="(item,index) in cardData.tags"-->
<!--                 :key="index"-->
<!--                 class="tag-box"-->
<!--                @click="null">-->
<!--              #{{ item }}</div>-->
            <div class="flex tag-box">
<!--              <a-tag v-for="(item,index) in cardData.tags" :key="index" :bordered="false" color="orange">#{{ item }}</a-tag>-->
            <router-link v-for="(item,index) in cardData.tags" class="tag-box" :key="index"  :to="{name: 'topic'}"># {{ item.tagName}}</router-link>
            </div>
          </div>
        </div>
        <template v-if="cardData.imgs.length > 1">
          <div class="flex w-full p-0 mt-3 -mb-1 whitespace-pre-wrap cover-wrapper">
            <!-- <div> -->
            <img
              :src="item.img"
              alt=""
              :key="index"
              v-for="(item, index) in cardData.imgs"
              class="object-cover mr-2 overflow-hidden rounded-md cover-sm"
            />
            <!-- </div> -->
          </div>
        </template>
      </div>

      <div class="text-xs card-bottom" style="display: flex;color: var(--secondary-text)">
        <span class="center like">
          <like-outlined :style="{ color: islike ? 'red' : null }" @click="emitLike" />
          <span style="padding-left: 8px; cursor: auto">
           {{ cardData.loveCount }}
          </span>
        </span>
        <span class="center like">
          <star-outlined :style="{ color: iscollect ? 'red' : null }" @click="emitCollect" />
          <span style="padding-left: 8px; cursor: auto">
          {{ cardData.collectCount }}
          </span>
        </span>
        <span class="center">
          <message-outlined @click="forumDetail" />
          <span style="padding-left: 8px; cursor: auto">
           {{ cardData.commentCount }}
          </span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive,ref } from 'vue';
import { UserOutlined, StarOutlined, LikeOutlined, MessageOutlined, LikeFilled } from '@ant-design/icons-vue';
import { appStore } from '../../../../table/store';
import emojiReplace from '../../../js/chat/emoji';
import {useRouter} from "vue-router";
// import { user } from '../../channels/mock';
import { comStore } from '../../../store/com';
import {comCards} from "@page/channels/mock";
const store = comStore()
const router = useRouter()
const useUserStore = appStore();

const props = defineProps({
  detailVisible: Boolean,
  cardData: {
    type: Object,
    default: () => [],
  },
});

function forumDetail(){
  router.push({
    name:'forumDetail',
    query:{
      id:postData.value.id
    }
  })
}
const postData = computed(() => {
  return props.cardData;
});
let uid = postData.value.user.id;
let userInfo = {
  uid: postData.value.user.id,
  nickname: postData.value.user.nickname,
  avatar: postData.value.user.avatar,
};
const showCard = (uid, userInfo) => {
  useUserStore.showUserCard(uid, userInfo);
};
const createTime = computed(() => {
  let [date, time] = props.cardData.createTime.split(' ');
  return [date, time];
});
// 用于在动态和评论中使用的表情
// str.replace(/\[([^(\]|\[)]*)\]/g,(item,index) => {})
// https://sad.apps.vip/public/static/emoji/emojistatic/
const content = computed(() => {
  let result = emojiReplace(props.cardData.content);
  return result;
});
const title = computed(() => {
  let result = emojiReplace(props.cardData.title);
  return result;
});
const islike = computed(()=>{
  var index = store.loveList.findIndex(item => item.id == postData.value.id);
  return index != -1
  // let result = false;
  // for(var i=0;i<store.loveList.length;i++){
  //   if(store.loveList[i].id == postData.value.id){
  //     result = true;
  //   }
  // }
  // return result
})
const iscollect = computed(()=>{
  var index = store.collectList.findIndex(item => item.id == postData.value.id);
  return index != -1
  // let result = false;
  // for(var i=0;i<store.collectList.length;i++){
  //   if(store.collectList[i].id == postData.value.id){
  //     result = true;
  //   }
  // }
  // return result
})

// 自定义事件，并返回 emit 函数
// const emits = defineEmits(['like','collect'])
function emitLike() {
  // 触发自定义事件 like，并传递参数帖子id
  // emits('like',postData.value.id)
  //先更新前端，后面后端处理后再重新赋值
  if(islike.value){
    postData.value.loveCount--;
    var index = store.loveList.findIndex(item => item.id == postData.value.id);
    store.loveList.splice(index,1);
  }
  else{
    postData.value.loveCount++;
    store.loveList.push(postData.value)
  }

  store._userLove(postData.value.id);
}
function emitCollect() {
  // emits('collect',postData.value.id)
  if(iscollect.value){
    postData.value.collectCount--;
    var index = store.collectList.findIndex(item => item.id == postData.value.id);
    store.collectList.splice(index,1);
  }
  else{
    postData.value.collectCount++;
    store.collectList.push(postData.value)
  }
  store._userCollect(postData.value.id);
}

</script>
<style lang="scss" scoped>
.card {
  background-color: white;
  .cover-wrapper {
    flex-wrap: wrap;
  }

  .cover-sm {
    margin-bottom: 10px;
    width: 100px;
    height: 100px;
    aspect-ratio: 1 / 1;
  }

  .cover-im {
    // margin-bottom: 10px;
    width: 150px;
    height: 100px;
  }

  display: flex;
  // 占满整个父元素
  flex-grow: 1;
  // width: 600px;
  // background: rgba(0, 0, 0, 0.30);
  border-radius: 12px;
  margin-bottom: 12px;

  .card-content {
    margin: 12px;

    .card-top {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      justify-content: space-between;

      .top-left {
        display: flex;
        align-items: center;
      }

      .user-msg {
        margin-left: 8px;

        .user-name {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.85);
          font-weight: 400;
        }

        .self-msg {
          // font-size: 12px;
          // color: rgba(255, 255, 255, 0.40);
          font-weight: 400;

          .date {
            margin-right: 3px;
          }

          .time::after {
            content: '·';
            margin-left: 5px;
            margin-right: 5px;
          }
        }
      }

      .top-right {
        background: #000000;
      }
    }

    .card-content {
      font-size: 16px;
      color: rgba(255, 255, 255, 0.85);
      text-align: justify;
      line-height: 22px;
      font-weight: 400;
    }

    .omit-title {
      white-space: pre-wrap;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .omit {
      white-space: pre-wrap;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .tag-box {
      margin-right: 5px;
      color: var(--active-bg);
    }
    .hide-images-video {
      display: none;
    }

    #title {
      font-size: 16px;
      // color: rgba(255, 255, 255, 0.85);
      text-align: left;
      line-height: 22px;
      font-weight: 500;
      white-space: normal;
      word-break: break-all;

      cursor: pointer;
      &:hover{
        text-decoration: underline;
      }
    }

    #context {
      font-size: 14px;
      // color: rgba(255, 255, 255, 0.60);
      text-align: left;
      line-height: 22px;
      font-weight: 400;
      white-space: pre-wrap;
      word-wrap: break-word;
      word-break: break-all;
      // overflow: scroll;
    }

    .card-bottom {
      margin-top: 12px;

      .view::after {
        content: '·';
        margin-left: 5px;
        margin-right: 5px;
      }

      .like::after {
        content: '·';
        margin-left: 5px;
        margin-right: 5px;
      }
      .center{
        width: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
}
</style>
