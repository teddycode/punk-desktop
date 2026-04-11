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
          title: '权限设置',
          route: {
            name: 'userSettings',
          },
          type: 'route',
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
      logoutLoading: false,
    };
  },
  computed: {
    ...mapWritableState(teamStore, ['team', 'teamVisible']),
    ...mapWritableState(taskStore, ['isTaskDrawer']),
    ...mapWritableState(appStore, ['userInfo', 'resetUserInfo','deleteUserInfo']),
    logoutNickname() {
      return (this.userInfo && this.userInfo.nickname) || '访客';
    },
  },
  mounted() {},
  methods: {
    async jump(type, val) {
      console.log('菜单跳转：', type, val);
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
      if (!uid) {
        message.error('未获取到用户信息，请稍后重试！');
        return;
      }
      this.logoutLoading = true;
      try {
        await this.deleteUserInfo();
        const res = await ipc.invoke('direct-logout', uid);
        if (res) {
          message.success('帐号退出成功！');
          this.isLogoutVisible = false;
          this.$router.replace('/');
        } else {
          message.error('账号退出失败，请重试！');
        }
      } catch (error) {
        console.error('logout error', error);
        message.error('退出过程中发生错误，请稍后重试！');
      } finally {
        this.logoutLoading = false;
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
        :title="null"
        v-model:visible="isLogoutVisible"
        :centered="true"
        :width="460"
        :confirm-loading="logoutLoading"
        :destroy-on-close="true"
        wrap-class-name="logout-modal"
        ok-text="确认退出"
        cancel-text="暂不退出"
        @ok="handleLogout(userInfo && userInfo.uid)"
      >
        <div class="logout-modal__body">
          <div class="logout-modal__header">
            <span class="logout-modal__tag">安全提醒</span>
            <h3 class="logout-modal__title">退出帐号 · {{ logoutNickname }}</h3>
            <p class="logout-modal__subtitle">退出不会影响链上数据，可随时重新登录。</p>
          </div>
          <div class="logout-modal__content">
            <ul>
              <li>退出后暂时无法访问当前帐号桌面与个性化配置。</li>
              <li>重新连接钱包登录，即可继续使用所有空间。</li>
            </ul>
          </div>
        </div>
      </a-modal>
    </div>
  </div>
</template>

<style lang="scss" scoped>
:global(.logout-modal .ant-modal-content) {
  border-radius: 18px;
  padding: 0;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.98), rgba(243, 248, 255, 0.94));
  box-shadow: 0 20px 60px rgba(17, 36, 55, 0.15);
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  overflow: hidden;
}

:global(.logout-modal .ant-modal-footer) {
  border-top: none;
  padding: 0 32px 18px;
}

.logout-modal__body {
  padding: 26px 32px 18px;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 18px 18px 0 0;
}

.logout-modal__header {
  text-align: left;
  margin-bottom: 16px;
}

.logout-modal__tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  color: #ff9b0f;
  background: rgba(255, 155, 15, 0.15);
}

.logout-modal__title {
  margin: 12px 0 4px;
  font-size: 20px;
  font-weight: 600;
  color: #0c1d34;
}

.logout-modal__subtitle {
  margin: 0;
  font-size: 13px;
  color: #647087;
}

.logout-modal__content {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 16px 18px;
  box-shadow: inset 0 0 0 1px rgba(56, 116, 255, 0.08);
}

.logout-modal__content ul {
  padding-left: 18px;
  margin: 0;
  color: #3a4661;
  line-height: 1.6;
  font-size: 15px;
  font-weight: 500;
}

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
