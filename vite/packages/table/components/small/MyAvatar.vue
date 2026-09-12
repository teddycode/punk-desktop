<script>
import BorderAvatar from '../avatar/BorderAvatar.vue';
import FrameAvatar from '../avatar/FrameAvatar.vue';
import { mapWritableState } from 'pinia';
import { messageStore } from '../../store/message';
import { appStore } from '../../store';
import Emoji from '../comp/Emoji.vue';
import { isMain } from '../../js/common/screenUtils';

export default {
  components: {
    Emoji,
    BorderAvatar,
    FrameAvatar,
  },
  data() {
    return {
      messages: [],
      myFrameUrl: '',
    };
  },
  props: ['size', 'chat'],
  computed: {
    ...mapWritableState(messageStore, ['messageIndex', 'totalCount']),
    ...mapWritableState(appStore, ['userInfo', 'settings', 'simple']),
  },
  mounted() {
    this.lastTime = Number(localStorage.getItem('lastBarrageMessageTime'));
    // this.loadMessages()
    // setInterval(() => {
    //   this.loadMessages()
    // }, 10000)
  },
  methods: {
    isMain,
    // async loadMessages() {
    //   this.messages = await messageModel.allList()
    //   this.messages.forEach(mes => {
    //     //修正一下登录小助手的
    //     if (mes.title === '登录小助手') {
    //       mes.body = '[提醒]'
    //     }
    //   })
    //   if (this.lastTime === 0) {
    //     let barrages = this.messages.slice(0, 10)
    //     window.$manager.sendChat(barrages)
    //     if (barrages.length > 0) {
    //       this.lastTime = barrages[0].create_time//重新设置指标
    //     } else {
    //       this.lastTime = Date.now()
    //     }
    //   } else {
    //     let readyToSend = this.messages.filter(mes => {
    //       return mes.create_time > this.lastTime
    //     })
    //     //readyToSend.splice(0,10)
    //     if (readyToSend.length > 0) {
    //       window.$manager.sendChat(readyToSend)
    //     }
    //     if (this.messages.length > 0) {
    //       this.lastTime = this.messages[0].create_time//重新设置指标
    //     } else {
    //       this.lastTime = Date.now()
    //     }
    //
    //     localStorage.setItem('lastBarrageMessageTime', this.lastTime)
    //   }
    //   if (this.messages.length > 2) {
    //     this.messages.splice(2)
    //   }
    //
    // },
    login() {
      tsbApi.user.login((data) => {
        ipc.send('getDetailUserInfo');
      });
    },
    social() {
      // if (this.totalCount) {
      //   this.$router.push({name: 'message'})
      // } else {
      //
      // }
      this.$router.push({ name: 'socialMy' });
    },
  },
};
</script>

<template>
  <div v-if="!userInfo">
    <div style="padding: 0.5em" @click="login">
      <a-avatar :size="size || 54" class="xt-text">未登录</a-avatar>
      <div></div>
      <div></div>
    </div>
  </div>

  <div v-else-if="!simple" :style="{ width: '11em' }">
    <div class="pointer" @click="social">
      <div v-if="!simple" :span="24" class="user-info" style="padding: 0.6em; position: relative">
        <a-row :gutter="10" style="text-align: left">
          <a-col :span="12" :style="{ paddingLeft: simple ? '20px' : '5px' }">
            <FrameAvatar
              :avatarSize="size || 50"
              :avatarUrl="userInfo.avatar"
              :frameUrl="userInfo.frame"
              class="frame"
            ></FrameAvatar>
          </a-col>
        </a-row>
      </div>
    </div>
  </div>
  <template v-else>
    <div v-if="isMain()" class="btn" @click="social">
      <FrameAvatar
        :avatarSize="size || 33"
        :avatarUrl="userInfo.avatar"
        :frameUrl="userInfo.frame"
        class="frame"
      ></FrameAvatar>
      <div>我的</div>
    </div>
  </template>
</template>

<style lang="scss" scoped>
.level-badge {
  left: 0;
  bottom: 0;
  border-radius: 100px;
  width: 2em;
  font-size: 1.1em;
  height: 2em;
  text-align: center;
  line-height: 2em;
  display: inline-block;
  background: rgba(42, 40, 40, 0.51);
}

:deep(.ant-badge-count) {
  box-shadow: none;
}
</style>
