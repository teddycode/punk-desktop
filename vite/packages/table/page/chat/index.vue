<template>
  <!-- 团队聊天主页面 -->
  <div class="flex" style="width: 100%; height: 100%;background-color:whitesmoke; border-radius: 10px;" >
    <!-- 左侧tab切换 -->
    <div style="flex: 1;">
      <SecondPanel style="margin-left: 50px" v-if="!fullScreen" @changeTab="changeTab" :menus="menus"></SecondPanel>
    </div>

    <!-- 右侧内容显示 -->
    <div class="middle-content" style="flex: 3; height: 100%">
      <div
        class="mt-3"
        style="height: calc(100% - 1em); border-radius: 10px; overflow: hidden; "
      >
        <router-view></router-view>
      </div>
    </div>

    <div class="mt-3" style="flex: 1; height: 100%;margin-right: 50px">
      <RightSide ></RightSide>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import SecondPanel from '../../components/SecondPanel.vue';
import RightSide from '../channels/components/RightSide.vue';
import { chatStore } from '../../store/chat';
import {comStore} from "@store/com";
import { mapActions, mapState } from 'pinia';
import { appStore } from '../../store';

export default defineComponent({
  name: 'index',
  components: { SecondPanel, RightSide },
  data() {
    return {
      menus: [
        // {
        //   title:'桌面',index:'desk',icon:'desktop',
        //   route:{name:'chatDesk'},
        // },
        // {
        //   title: '聊天',
        //   index: 'chat',
        //   icon: 'message',
        //   tab: 'chat',
        //   route: { name: 'chat' },
        // },
        {
          title: '首页',
          icon: 'home',
          route: { name: 'forum' },
        },
        {
          title: '话题',
          icon: 'message',
          route: { name: 'tag' },
        },
        {
          title: '用户',
          icon: 'user',
          route: { name: 'users' },
        },
        {
          title: '通知',
          icon: 'notification',
          route: { name: 'notification' },
        },
        {
          title: '喜欢',
          icon: 'star',
          route: { name: 'likes' },
        },
        {
          title: '收藏',
          icon: 'moon',
          route: { name: 'collects' },
        },
        // {
        //   title: '测试',
        //   icon: 'chat',
        //   route: { name: 'test' },
        // },

        // {
        //   title: '聊天',
        //   index: 'chat',
        //   icon: 'message',
        //   tab: 'chat',
        //   route: { name: 'chat' },
        // },
        // {
        //   title: '通讯录',index: 'contact',icon:'team',
        //   route:{ name: 'contact' }
        // },
        // {
        //   title: '小队',
        //   index: 'team',
        //   icon: 'smile',
        //   route: { name: 'hall' },
        //   tab: 'team',
        // },
        // {
        //   title: '社区',
        //   index: 'channel',
        //   icon: 'star',
        //   route: { name: 'channel' },
        //   tab: 'channel',
        // },
        // {
        //   title: '弹幕',
        //   index: 'barrage',
        //   icon: 'text-align-left',
        //   route: { name: 'barrage' },
        //   tab: 'barrage',
        // },

      ],
    };
  },
  mounted() {
    chatStore().login();
    comStore()._updateUserInfo();
  },
  computed: {
    ...mapState(appStore, ['fullScreen']),
  },
  methods: {
    ...mapActions(chatStore, ['login']),
    changeTab(args) {
      this.$router.push(args.menu.route);
      this.tab = args.index;
    },
  },
});
</script>

<style scoped lang="scss">
//middle-content左右两侧显示阴影边框
.middle-content {
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
}

</style>
