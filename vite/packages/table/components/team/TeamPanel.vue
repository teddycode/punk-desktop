<template>
  <div
    :class="{ fix: showDetail }"
    :style="{ height: showDetail ? '100%' : 'auto' }"
    class="flex s-bg rounded-lg"
    style="overflow: hidden; background: var(--modal-bg); color: var(--primary-text)"
  >
    <div
      v-if="showDetail"
      style="width: 445px; height: 100%; position: relative; display: flex; flex-direction: column"
    >
      <a-row style="height: 100%">
        <a-col :span="4">
          <ul class="nav-list">
            <li class="flex pointer items-center justify-center mb-3" @click="closeDetail">
              <div class="rounded-lg" style="background: var(--secondary-bg)">
                <Icon icon="doubleright" style="font-size: 0.9233em"></Icon>
              </div>
            </li>
            <li
              :class="{ 'nav-active': currentTab === 'barrage' }"
              class="flex items-center justify-center"
              @click="currentTab = 'barrage'"
            >
              <div>
                <icon icon="xiaoxi" style="font-size: 0.9233em"></icon>
              </div>
            </li>
            <li
              :class="{ 'nav-active': currentTab === 'devote' }"
              class="flex items-center justify-center"
              @click="currentTab = 'devote'"
            >
              <div>
                <icon icon="thunderbolt" style="font-size: 0.9233em"></icon>
              </div>
            </li>
            <li
              :class="{ 'nav-active': currentTab === 'info' }"
              class="flex items-center justify-center"
              @click="currentTab = 'info'"
            >
              <div>
                <icon icon="tishi-xianxing" style="font-size: 0.9233em"></icon>
              </div>
            </li>
            <li
              :class="{ 'nav-active': currentTab === 'store' }"
              class="flex items-center justify-center"
              @click="currentTab = 'store'"
            >
              <div>
                <Icon icon="gift" style="font-size: 0.9233em"></Icon>
              </div>
            </li>
          </ul>
        </a-col>
        <a-col :span="20" style="height: 100%; display: flex; flex-direction: column">
          <a-row v-if="showDetail && currentTab !== 'store'" :gutter="20" class="" @click="">
            <a-col style="padding: 0 !important">
              <div class="ml-5 pt-2" style="width: 90px; height: 90px; position: relative">
                <!-- <img :src="avatar_url" class="w-full h-full object-cover" alt=""> -->
                <a-avatar :size="50" :src="team.avatar" class="mt-3 ml-3 avatar-top" shape="square"></a-avatar>
              </div>
              <!--  -->
            </a-col>
            <a-col>
              <div class="mt-3 mb-1 font-bold truncate">{{ team.name }}</div>
              <div class="rounded-md px-2 bg-mask inline-block font-bold"># {{ team.no }}</div>
            </a-col>
          </a-row>
          <div v-if="showDetail && currentTab === 'info'">
            <TeamDetail
              :effect="effect"
              :online="online"
              :team="team"
              :teamLeader="teamLeader"
              @closeDetail="closeDetail"
              @closeTeam="closeTeam"
              @onReceiveTeamEarnings="receiveTeamEarnings"
            ></TeamDetail>
          </div>
          <div v-if="showDetail && currentTab === 'barrage'" style="flex: 1; height: 0">
            <BarragePanel :defaultChannel="'team'"></BarragePanel>
          </div>
          <div
            v-if="showDetail && currentTab === 'devote'"
            style="height: 100%; position: relative; width: 100%; flex: 1; height: 0"
          >
            <TeamDevote :team="team" :teamLeader="teamLeader" :teamMembers="teamMembers"></TeamDevote>
          </div>
          <div v-if="showDetail && currentTab === 'store'" style="height: 100%">
            <FrameStoreWidget :team="team" :teamLeader="teamLeader" :teamMembers="teamMembers"></FrameStoreWidget>
          </div>
        </a-col>
      </a-row>
    </div>
    <div v-if="userDetail" class="xt-bg" style="width: 300px; height: 500px; position: relative">
      <div
        class="p-2 rounded-md inline-block m-2 pointer bg-mask"
        style="position: absolute; right: 0; width: 2.8em; text-align: center; z-index: 99"
        @click="closeDetail"
      >
        <Icon icon="guanbi" style="font-size: 1.2em"></Icon>
      </div>
      <vue-custom-scrollbar :settings="outerSettings" style="position: relative; height: calc(100% - 60px)">
        <div class="mb-10">
          <UserDetail
            :key="userInfoKey"
            :joinedTime="showUserMemberInfo.joinedTime"
            :memberInfo="showUserMemberInfo"
            :userInfo="showUserInfo"
          ></UserDetail>
        </div>
      </vue-custom-scrollbar>

      <div class="px-2" style="position: absolute; bottom: 0; left: 0; right: 0">
        <a-row :gutter="10" class="m-5 mb-2">
          <a-col v-if="this.showUserInfo.uid !== userInfo.uid" :span="12">
            <AddFriendButton
              v-show="relationship === 'not'"
              :key="this.showUserInfo.uid"
              :uid="this.showUserInfo.uid"
              @relationshipChanged="updateRelationship"
            ></AddFriendButton>
            <SendMessageButton
              v-show="relationship === 'yes'"
              :enable="true"
              :uid="this.showUserInfo.uid"
            ></SendMessageButton>
          </a-col>

          <a-col :span="12">
            <div
              v-if="
                Number(teamLeader.userInfo.uid) === Number(userInfo.uid) &&
                Number(this.showUserInfo.uid) !== Number(userInfo.uid)
              "
              class="rounded-lg bg-mask px-6 py-3 pointer"
              @click="kick(this.showUserInfo.uid)"
            >
              <icon icon="shanchu" style="font-size: 1.3em; vertical-align: text-bottom"></icon>
              移出小队
            </div>
          </a-col>
        </a-row>
      </div>
    </div>
    <!-- 快速搜索 小队右边栏 -->
    <div
      :style="showDetail === false ? { width: '80px' } : { width: '100px' }"
      class="common-panel flex"
      style="flex-direction: column; padding-bottom: 0"
    >
      <div
        v-if="!showDetail"
        class="p-2 pt-2 p-3 truncate font-large text-center pointer"
        style="font-size: 1.1em"
        @click="showBarragePanel"
      >
        <div>
          <a-avatar :size="50" :src="team.avatar" shape="square"></a-avatar>
        </div>
      </div>
      <div v-if="showDetail" class="text-center">小队成员</div>
      <!-- <a-divider style="margin-top: 10px;margin-bottom: 10px;color: red;"></a-divider> -->
      <div style="margin-top: 10px; margin-bottom: 10px; text-align: center">—————</div>
      <vue-custom-scrollbar :settings="outerSettings" style="position: relative; height: 100%; padding-top: 5px">
        <div
          v-if="teamLeader.userInfo"
          :class="{ active: this.showUserInfo === teamLeader.userInfo }"
          class="text-center mb-3 mt-2 pointer pt-2"
          @click="showUserDetail(teamLeader.userInfo, teamLeader)"
        >
          <UserAvatar
            :avatar="teamLeader.userInfo.avatar"
            :frame="teamLeader.userInfo.equippedItems?.frameDetail"
            :frameUrl="teamLeader.userInfo.equippedItems?.frameDetail?.image"
            :online="teamLeader.online"
            :showDetail="showDetail"
            :tag="teamLeader.userInfo.uid === userInfo.uid ? '我' : '队长'"
          ></UserAvatar>

          <div
            v-if="showDetail"
            :title="teamLeader.userInfo.nickname"
            class="pt-1 truncate mt-3"
            style="font-size: 0.9em"
          >
            {{ teamLeader.userInfo.nickname }}
          </div>
        </div>
        <div
          v-for="user in teamMembers"
          :class="{ active: this.showUserInfo === user.userInfo }"
          class="text-center mb-3 pointer pt-2"
          @click="showUserDetail(user.userInfo, user)"
        >
          <UserAvatar
            :avatar="user.userInfo.avatar"
            :frame="user.userInfo.equippedItems?.frameDetail"
            :frameUrl="user.userInfo.equippedItems?.frameDetail?.image"
            :online="user.online"
            :showDetail="showDetail"
            :tag="user.userInfo.uid === userInfo.uid ? '我' : ''"
          ></UserAvatar>
          <div v-if="showDetail" :title="user.userInfo.nickname" class="pt-1 truncate" style="font-size: 0.9em">
            {{ user.userInfo.nickname }}
          </div>
        </div>
        <div
          v-if="team.leader === userInfo.uid && team.member_count < team.member_limit"
          class="text-center pb-2"
          title="邀请"
        >
          <a-avatar :size="50" style="color: var(--primary-text) !important">
            <PlusOutlined />
          </a-avatar>
        </div>
      </vue-custom-scrollbar>
    </div>
  </div>
</template>

<script>
import { PlusOutlined } from '@ant-design/icons-vue';
import { teamStore } from '../../store/team';
import { mapActions, mapState, mapWritableState } from 'pinia';
import { appStore } from '../../store';
import { Modal } from 'ant-design-vue';
import UserDetail from './UserDetail.vue';
import UserAvatar from '../small/UserAvatar.vue';
import LevelIcon from '../small/LevelIcon.vue';
import HorizontalPanel from '../HorizontalPanel.vue';
import TeamDevote from './TeamDevote.vue';
import TeamDetail from './TeamDetail.vue';
import FrameStoreWidget from './FrameStoreWidget.vue';
import TeamBarrage from '../comp/TeamBarrage.vue';
import BarrageSender from '../comp/BarrageSender.vue';
import BarragePanel from '../comp/BarragePanel.vue';
import AddFriendButton from '../sns/AddFriendButton.vue';
import SendMessageButton from '../sns/SendMessageButton.vue';

export default {
  name: 'TeamPanel',
  components: {
    SendMessageButton,
    AddFriendButton,
    BarragePanel,
    BarrageSender,
    TeamBarrage,
    TeamDetail,
    TeamDevote,
    LevelIcon,
    UserAvatar,
    UserDetail,
    PlusOutlined,
    HorizontalPanel,
    FrameStoreWidget,
  },
  computed: {
    teamLeader() {
      return teamLeader;
    },
    ...mapWritableState(teamStore, ['team', 'teamVisible', 'teamLeader', 'teamMembers']),
    ...mapState(appStore, ['userInfo']),
    effect() {
      let online = this.teamLeader.online ? 1 : 0;
      this.teamMembers.forEach((member) => {
        if (member.online) {
          online++;
        }
      });
      if (online <= 1) {
        //防止用户数量穿透
        online = 1;
      }
      this.online = online;

      return (online - 1) * 5 + 100;
    },
  },
  data() {
    return {
      online: 0,
      currentTab: 'barrage',
      outerSettings: {
        useBothWheelAxes: true,
        swipeEasing: true,
        suppressScrollY: false,
        suppressScrollX: true,
        wheelPropagation: true,
      },
      userDetail: false,
      showDetail: false,
      showBarrage: true,
      teamDetail: false,
      showUid: 0,
      rarity: 4, // 稀有度
      avatar_url: '/img/mg.png',
      showUserInfo: {},
      showUserMemberInfo: {}, //成员信息
      timer: null, //用于定期刷新队伍信息
      userInfoKey: Date.now(),
      earningsShow: false,
      relationship: 'unload',
    };
  },
  mounted() {
    if (this.team.status) {
      this.updateTeamShip(this.team.no, {
        userCache: 0,
      }).then();
      this.timer = setInterval(() => {
        console.info('定期更新小队信息');
        this.updateTeamShip(this.team.no);
      }, 30000);
    }
  },
  unmounted() {
    clearInterval(this.timer);
  },

  methods: {
    ...mapActions(teamStore, ['updateTeamShip', 'quitByNo', 'updateMy', 'closeTeam', 'updateTeam']),
    updateRelationship(e) {
      this.relationship = e.relationship;
      console.log(e, '更新关系');
    },
    showBarragePanel() {
      this.userDetail = false;
      this.showDetail = true;
    },
    showUserDetail(userInfo, memberInfo) {
      this.showUserMemberInfo = memberInfo;
      if (this.showUserMemberInfo.uid === this.teamLeader.uid) {
        this.showUserMemberInfo.joinedTime = this.team.createTime;
      } else {
        this.showUserMemberInfo.joinedTime = memberInfo.updateTime;
      }
      this.showUid = userInfo.uid;
      this.showUserInfo = userInfo;
      // this.userInfoKey = Date.now()
      this.showDetail = false;
      this.userDetail = true;
    },
    closeDetail() {
      this.userDetail = false;
      this.teamDetail = false;
      this.showDetail = false;
      this.showUserInfo = {};
      this.earningsShow = false;
    },
    showTeamDetail() {
      this.showBarrage = false;
      this.userDetail = false;
      this.updateTeam(this.team.no).then();
      this.teamDetail = true;
      this.showDetail = true;
    },
    cleanTeam() {
      this.teamVisible = false;
      this.team = {
        status: false,
      };
    },
    /**踢人
     *
     * @param uid
     */
    kick(uid) {
      Modal.confirm({
        content: '将队员移出队伍后，此人将无法再为小队做出贡献，但是历史贡献记录将被保留，其再次加入队伍后可继承。',
        centered: true,
        okText: '请离',
        onOk: async () => {
          let rs = await this.quitByNo(this.team.no, uid);
          if (rs.code === 1000) {
            if (rs.data.status) {
              this.closeDetail();
              this.updateTeamShip(this.team.no).then();
              this.updateMy().then();
              Modal.info({ content: '将队员请离队伍成功', centered: true });
            } else {
              this.updateMy().then();
              Modal.error({ content: '请离失败', centered: true });
            }
          } else {
            this.updateMy().then();
            Modal.error({ content: '请离意外失败', centered: true });
          }
        },
      });
    },
    exit() {
      Modal.info({
        content: '此功能暂未完成',
        centered: true,
      });
      // this.team = {
      //   status: false
      // }
      // this.teamVisible = false
    },
    // 点击领取收益弹出事件
    receiveTeamEarnings() {
      this.currentTab = 'devote';
    },
  },
};
</script>

<style lang="scss" scoped>
:deep(.ant-avatar) {
  border-radius: 50%;
}

.active {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.fix {
  position: fixed;
  max-height: 550px;
  right: 0;
  top: 50%;
  z-index: 99999;
  -webkit-app-region: no-drag;
  transform: translateY(-50%);
}

.btn-active:active {
  filter: brightness(0.8);
  background: rgba(80, 139, 254, 0.8);
}

.nav-list-container {
  background: rgba(255, 255, 255, 0.2) !important;
  border-radius: 8px !important;
}

.nav-list-container :deep(.s-item) {
  border-radius: 6px !important;
}

.ant-divider-horizontal {
  margin: 16px 0 16px 0 !important;
}

.receive-active:active {
  filter: brightness(0.8);
  background: rgba(0, 0, 0, 0.4);
}

:deep(.ant-avatar-image) {
  position: relative;
  top: -5px;
}

.nav-list {
  height: 100%;
  border-right: 1px solid var(--divider);
  padding-left: 0;

  li {
    list-style: none;
    font-size: 26px;
    padding-top: 10px;
    /**
    text-align: center;
    padding-left: 10px;
    padding-top: 10px;
    text-align: center;
    **/
    cursor: pointer;

    & > div {
      padding: 4px 8px 4px 8px;
      width: 42px;
      height: 42px;
    }

    svg {
      margin-top: -13px;
      vertical-align: middle;
      display: inline-block;
    }

    &:hover,
    &.nav-active {
      & > div {
        background: var(--active-bg);
        border-radius: 10px;
        color: var(--active-text);
      }
    }
  }
}

:deep(.nav-item) {
  width: 50% !important;
}

:deep(.ps__rail-y) {
  display: none !important;
}

.avatar-top {
  position: absolute;
  top: 13px;
  left: 10px;
  z-index: -3;
}
</style>
