<template>
  <div class="team-module">
    <div
      class="common-panel s-bg pointer"
      style="margin-left: 0; padding: 0.6em !important; color: var(--primary-text); background: var(--primary-bg)"
      @click="toggleTeam"
    >
      <emoji icon="glassface" style="width: 52px; height: 52px"></emoji>
    </div>
    <div v-if="openTeam" class="team-box">
      <div v-for="t in teamList" :key="t.title" class="team-item" @click="jump(t.type, t)">
        <a-avatar :size="40" :src="t.img"></a-avatar>
        <span>{{ t.title }}</span>
      </div>
    </div>
  </div>
  <TeamTip :key="teamKey" v-model:visible="showTeamTip"></TeamTip>
  <MyProp :showMyProp="showMyProp" @closeMyProp="closeMyProp"></MyProp>
</template>

<script>
import TeamTip from '../TeamTip.vue';
import { mapActions, mapWritableState } from 'pinia';
import { teamStore } from '@store/team';
import MyProp from '../team/MyProp.vue';
import Emoji from '../comp/Emoji.vue';
import { taskStore } from '@apps/task/store';

export default {
  name: 'Team',
  components: {
    Emoji,
    TeamTip,
    MyProp,
  },
  props: {},
  data() {
    return {
      teamList: [
        {
          img: '/img/bottomPanel/my.png',
          title: '个人信息',
          route: {
            name: '',
          },
          type: 'route',
        },
        {
          img: '/img/bottomPanel/team.png',
          title: '我的组织',
          type: 'team',
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
          type: 'prop',
        },
        {
          img: '/img/bottomPanel/history.png',
          title: '登录历史',
          route: {
            name: 'prop',
          },
          type: 'route',
        },
        {
          img: '/img/bottomPanel/contact.png',
          title: '联系人列表',
          type: 'task',
        },
      ],
      //显示小组提示
      showTeamTip: false,
      openTeam: false,
      showMyProp: false,
    };
  },
  computed: {
    ...mapWritableState(teamStore, ['team', 'teamVisible']),
    ...mapWritableState(taskStore, ['isTaskDrawer']),
  },
  methods: {
    ...mapActions(teamStore, ['updateMy']),
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
      }
      this.openTeam = false;
    },
    toggleTeam() {
      this.openTeam = !this.openTeam;
    },
    closeMyProp(val) {
      this.showMyProp = val;
    },
  },
};
</script>

<style lang="scss" scoped>
.team-module {
  position: relative;

  .team-box {
    position: absolute;
    top: -200px;
    right: 10px;
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
