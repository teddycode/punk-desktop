<script>
import { defineComponent } from 'vue';
import { message, Modal } from 'ant-design-vue';
import Emoji from '../comp/Emoji.vue';
import MyProp from '../team/MyProp.vue';
import { appStore } from '@store';
import { teamStore } from '@store/team';
import { taskStore } from '@apps/task/store';
import BorderAvatar from '../avatar/BorderAvatar.vue';
import { mapWritableState } from 'pinia';

export default defineComponent({
  name: 'UserEntry',
  components: { Emoji, MyProp, BorderAvatar },
  data() {
    return {
      teamList: [
        {
          img: '/img/bottomPanel/my.png',
          title: '个人信息',
          route: {
            name: 'socialMy',
          },
          type: 'route',
        },
        {
          img: '/img/bottomPanel/team.png',
          title: '我的组织',
          route: {
            name: 'dao',
          },
          type: 'route',
        },
        {
          img: '/img/bottomPanel/wallet.png',
          title: '我的钱包',
          route: {
            name: 'myWallets',
          },
          type: 'route',
        },
        {
          img: '/img/bottomPanel/transaction.png',
          title: '交易记录',
          route: {
            name: 'myTransList',
          },
          type: 'route',
        },
        {
          img: '/img/bottomPanel/keymgr.png',
          title: '密钥管理',
          type: 'task',
        },
        {
          img: '/img/bottomPanel/logout.png',
          title: '退出登录',
          type: 'logout',
        },
      ],
      //显示小组提示
      showTeamTip: false,
      openTeam: false,
      showMyProp: false,
      teamKey: Date.now(),
      isLogoutVisible: false,
    };
  },
  computed: {
    ...mapWritableState(teamStore, ['team', 'teamVisible']),
    ...mapWritableState(taskStore, ['isTaskDrawer']),
    ...mapWritableState(appStore, ['userInfo', 'resetUserInfo','deleteUserInfo']),
  },
  mounted() {},
  methods: {
    async jump(type, val) {
      switch (type) {
        case 'route':
          this.$router.push(val.route);
          break;
        case 'team':
          await this.updateMy(0);
          if (this.team.status === false) {
            this.teamKey = Date.now();
            this.showTeamTip = true;
          } else {
            this.teamVisible = !this.teamVisible;
          }
          break;
        case 'prop':
          this.showMyProp = true;
          break;
        case 'task':
          this.isTaskDrawer = true;
          break;
        case 'logout':
          this.isLogoutVisible = true;
          break;
      }
      this.openTeam = false;
    },
    toggleTeam() {
      this.openTeam = !this.openTeam;
    },
    closeMyProp(val) {
      this.showMyProp = val;
    },
    async login() {
      await this.resetUserInfo();
      this.$router.replace('/');
    },
    async handleLogout(uid) {
      this.isLogoutVisible = false;
      await this.deleteUserInfo();
      let res = await ipc.invoke('direct-logout', uid);
      if (res) {
        message.success('帐号退出成功！');
        this.$router.replace('/');
      } else {
        message.error('账号退出失败，请重试！');
      }
    },
  },
});
</script>

<template>
  <div v-if="!userInfo.uid">
    <!-- need login  -->
    <div style="padding: 0.5em" @click="login">
      <emoji icon="unlogin" style="width: 52px; height: 52px"></emoji>
    </div>
  </div>
  <div v-else>
    <div class="team-module">
      <div
        style="margin-left: 0; padding: 0.6em !important; color: var(--primary-text); background: var(--primary-bg)"
        @click="toggleTeam"
      >
        <div v-if="userInfo.avatar">
          <BorderAvatar :avatarSize="50" :avatarUrl="userInfo.avatar" />
        </div>
        <div v-else>
          <emoji icon="unlogin" style="width: 52px; height: 52px"></emoji>
        </div>
      </div>
      <div v-if="openTeam" class="team-box">
        <div v-for="t in teamList" :key="t.title" class="team-item" @click="jump(t.type, t)">
          <a-avatar :size="40" :src="t.img"></a-avatar>
          <span>{{ t.title }}</span>
        </div>
      </div>
    </div>
    <div>
      <a-modal
        title="退出此帐号: {{ userInfo.nickname }}"
        v-model="isLogoutVisible"
        :centered="true"
        :confirm-loading="true"
        :destroy-on-close="true"
        ok-text="确认"
        cancel-text="取消"
        @ok="handleLogout(userInfo?.uid)"
      >
        <p>退出帐号并不会影响帐号数据，仅仅是将本地帐号退出。但是退出后无法再使用此帐号下的所有空间。</p>
      </a-modal>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.team-module {
  position: relative;

  .team-box {
    position: absolute;
    top: -200px;
    right: -200px;
    border-radius: 12px;
    width: 288px;
    height: 200px;
    z-index: 999;
    background: var(--main-mask-bg);
    // background: rgba(26,26,26,0.65);
    backdrop-filter: blur(8px);
    box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    display: flex;
    flex-wrap: wrap;
    padding: 12px 6px;

    .team-item {
      width: 80px;
      height: 80px;
      border-radius: 12px;
      margin: 0 6px 12px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0 6px;
      cursor: pointer;
      color: var(--primary-text);
    }

    .team-item:hover {
      background: rgba(80, 139, 254, 0.2);
    }
  }
}
</style>
