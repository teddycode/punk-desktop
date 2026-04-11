<template>
  <vueCustomScrollbar
    :settings="scrollbarSettings"
    @touchstart.stop
    @touchmove.stop
    @touchend.stop
    class="my-scroll"
  >
    <div class="my-page">
      <div class="summary-grid">
        <div class="card profile-card">
          <userCard :key="key" :uid="userInfo.uid" :userInfo="userInfo"> </userCard>
          <span @click="toggleFrameStore()" class="avatar-frame-trigger px-3 py-1 xt-active-bg rounded-full pointer">
            <icon icon="gift" style="font-size: 18px"></icon> 头像框
          </span>
        </div>

        <div class="summary-stack">
          <div class="card summary-card">
            <ComPanel></ComPanel>
          </div>
          <div class="card summary-card">
            <ComActionPanel @infoUpdated="infoUpdated"></ComActionPanel>
          </div>
        </div>

        <div class="card summary-card">
          <GroupPanel></GroupPanel>
        </div>
      </div>

      <div class="card manager-card">
        <div class="manager-header">
          <div>
            <div class="manager-title">空间管理</div>
            <div class="manager-subtitle">原独立空间窗口已迁移到个人信息页内，统一在这里管理。</div>
          </div>
          <a-tag color="blue">{{ currentScopeLabel }}</a-tag>
        </div>

        <a-tabs v-model:activeKey="managerTab" class="manager-tabs">
          <a-tab-pane key="space" tab="单个空间">
            <div class="panel-host">
              <SpaceSelect :uid="spaceUid" :embedded="true" />
            </div>
          </a-tab-pane>
          <a-tab-pane key="template" tab="空间模板">
            <div class="panel-host template-host">
              <TemplatePage />
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
  </vueCustomScrollbar>

  <div v-if="secondaryVisible === false">
    <UpdateMyInfo @infoUpdated="infoUpdated" ref="myInfoRef"></UpdateMyInfo>
  </div>
</template>

<script>
import ComPanel from '../../components/comp/ComPanel.vue';
import ComActionPanel from '../../components/comp/ComActionPanel.vue';
import GroupPanel from '../../components/comp/GroupPanel.vue';
import UserCard from '../../components/small/UserCard.vue';
import UpdateMyInfo from '../../components/comp/UpdateMyInfo.vue';
import SpaceSelect from '../../../user/pages/SpaceSelect.vue';
import TemplatePage from '../../../user/pages/Template.vue';
import { message, Modal } from 'ant-design-vue';
import { mapActions, mapState } from 'pinia';
import { appStore } from '../../store';
import FrameStoreWidget from '../../components/team/FrameStoreWidget.vue';
import { defaultAvatar } from '../../js/common/teamAvatar';
import _ from 'lodash-es';

const { spaceModel, userModel } = window.$models;

export default {
  name: 'My',
  components: { UserCard, GroupPanel, ComActionPanel, ComPanel, FrameStoreWidget, UpdateMyInfo, SpaceSelect, TemplatePage },
  computed: {
    ...mapState(appStore, ['userInfo', 'secondaryVisible']),
  },
  data() {
    return {
      frameStoreVisible: false,
      hideAdmin: false,
      scrollbarSettings: {
        useBothWheelAxes: false,
        swipeEasing: true,
        suppressScrollY: false,
        suppressScrollX: true,
        wheelPropagation: true,
      },
      key: Date.now(),
      managerTab: 'space',
      spaceUid: 0,
      currentScopeLabel: '本机空间',
      loginCallbackHandler: null,
      handledActionKey: '',
    };
  },
  async mounted() {
    await this.loadSpaceScope();
    this.consumeUserManagementQuery();

    this.loginCallbackHandler = async () => {
      message.success('登录状态已更新。');
      this.managerTab = 'space';
      await this.loadSpaceScope();
      this.key = Date.now();
    };
    window.ipc.on('loginCallback', this.loginCallbackHandler);

    this.$nextTick(() => {
      if (!this.secondaryVisible) {
        const avatar = this.userInfo.avatar;
        const regex = new RegExp(avatar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        const isUrlExists = _.some(defaultAvatar, function (o) {
          return regex.test(o.default_url);
        });
        if (isUrlExists) {
          this.$refs.myInfoRef.openMyInfo();
        }
      } else {
        return;
      }
    });
  },
  beforeUnmount() {
    if (this.loginCallbackHandler) {
      window.ipc.removeListener('loginCallback', this.loginCallbackHandler);
    }
  },
  watch: {
    updateInfoVisible: {
      handler(newVal) {
        if (newVal === false) {
          console.log('更新用户卡片');
          setTimeout(() => {
            this.key = Date.now();
          }, 2000);
        }
      },
    },
    '$route.query.userActionAt': {
      handler() {
        this.consumeUserManagementQuery();
      },
    },
  },
  methods: {
    ...mapActions(appStore, ['setSecondaryVisible']),
    toggleFrameStore() {
      window.toggleFrameStore();
    },
    infoUpdated() {
      this.key = Date.now();
    },
    normalizeQueryValue(value) {
      if (Array.isArray(value)) {
        return value[0] || '';
      }
      return value || '';
    },
    async loadSpaceScope() {
      let currentSpace = null;
      try {
        currentSpace = await spaceModel.getCurrent();
      } catch (e) {
        console.warn('读取当前空间失败', e);
      }

      if (currentSpace && currentSpace.spaceType === 'cloud' && currentSpace.uid) {
        this.spaceUid = currentSpace.uid;
        const user = await userModel.get({ uid: currentSpace.uid });
        this.currentScopeLabel = user?.user_info?.nickname || '当前账号空间';
        return;
      }

      const currentUser = await userModel.getCurrent();
      if (currentUser?.status === 1 && currentUser.data?.uid) {
        this.spaceUid = currentUser.data.uid;
        this.currentScopeLabel = currentUser.data.user_info?.nickname || '当前账号空间';
      } else {
        this.spaceUid = 0;
        this.currentScopeLabel = '本机空间';
      }
    },
    consumeUserManagementQuery() {
      const query = this.$route?.query || {};
      const actionKey = this.normalizeQueryValue(query.userActionAt);
      const tab = this.normalizeQueryValue(query.userTab);
      const tip = this.normalizeQueryValue(query.userTip);
      const modal = this.normalizeQueryValue(query.userModal);
      const title = this.normalizeQueryValue(query.userTitle);
      const description = this.normalizeQueryValue(query.userDescription);

      if (tab) {
        this.managerTab = tab;
      }

      if (!actionKey || this.handledActionKey === actionKey) {
        return;
      }

      this.handledActionKey = actionKey;

      if (modal === 'true' && title) {
        Modal.warn({
          title,
          content: description,
          centered: true,
        });
      }

      if (tip.indexOf('重新登录') > -1) {
        this.tipExpired(tip);
        return;
      }

      if (tip) {
        message.warning(tip);
      }
    },
    tipExpired(content = '账号登录信息已过期，请重新登录。') {
      Modal.confirm({
        content,
        okText: '重新登录',
        onOk() {
          ipc.send('login');
        },
        cancelText: '取消',
      });
    },
  },
};
</script>

<style scoped>
.card {
  background: #252525;
}

.my-scroll {
  padding: 15px;
  height: 100%;
}

.my-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.summary-grid {
  display: grid;
  grid-template-columns: minmax(300px, 340px) minmax(360px, 420px) minmax(320px, 1fr);
  gap: 16px;
  align-items: start;
}

.profile-card {
  position: relative;
  min-height: 220px;
  padding: 0;
  color: var(--primary-text);
  background: var(--primary-bg);
}

.avatar-frame-trigger {
  position: absolute;
  right: 20px;
  top: 40px;
}

.summary-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summary-card {
  padding: 1em;
  color: var(--primary-text);
  background: var(--primary-bg);
}

.manager-card {
  padding: 16px;
  color: var(--primary-text);
  background: var(--primary-bg);
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.manager-title {
  font-size: 20px;
  font-weight: 600;
}

.manager-subtitle {
  margin-top: 6px;
  color: rgba(255, 255, 255, 0.65);
  font-size: 13px;
}

.manager-tabs {
  min-height: 0;
}

.panel-host {
  min-height: 420px;
  height: clamp(420px, 48vh, 520px);
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.06);
}

.template-host {
  overflow: auto;
  padding: 8px;
  box-sizing: border-box;
}

:deep(.ant-tabs-nav) {
  margin-bottom: 12px;
}

:deep(.ant-tabs-tab) {
  color: rgba(255, 255, 255, 0.7);
}

:deep(.ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn) {
  color: #ffffff;
}

:deep(.ant-tabs-ink-bar) {
  background: #3b82f6;
}

@media (max-width: 1400px) {
  .summary-grid {
    grid-template-columns: minmax(280px, 340px) minmax(320px, 1fr);
  }
}

@media (max-width: 1080px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .panel-host {
    height: clamp(400px, 52vh, 500px);
  }
}
</style>
