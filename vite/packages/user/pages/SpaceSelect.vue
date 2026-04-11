<template>
  <div class="space-select-root" :class="{ embedded }">
    <a-layout :style="layoutStyle">
      <a-layout-sider :width="230" :style="siderStyle">
        <a-row style="padding: 10px">
          <a-col :span="12">
            <span style="font-size: 12px; color: grey">{{ scopeLabel }} · {{ spaces.length }} 个空间</span>
          </a-col>
          <a-col :span="12" style="text-align: right">
            <a-dropdown>
              <template #overlay>
                <a-menu>
                  <a-menu-item @click.stop="() => {}" v-if="this.user.uid === 0">
                    <a-checkbox @change="loadSpaces" @click.stop="() => {}" v-model:checked="showBackup"
                      >显示离线空间</a-checkbox
                    >
                  </a-menu-item>
                  <a-menu-item @click="importFromLocal" v-if="user.uid" key="1">
                    <import-outlined />
                    导入
                  </a-menu-item>
                </a-menu>
              </template>
              <a-button size="small" @click="showCreateSpace" type="primary">
                创建
                <DownOutlined />
              </a-button>
            </a-dropdown>
          </a-col>
        </a-row>

        <div v-if="loading"></div>
        <vue-custom-scrollbar :settings="settings" :style="spaceListStyle">
          <SpaceList
            :currentSpace="currentSpace"
            @reloadSpaces="loadSpaces"
            :spaces="spaces"
            :user="user"
            @setActive="setActive"
          ></SpaceList>
        </vue-custom-scrollbar>
      </a-layout-sider>
      <a-layout>
        <a-layout-content style="overflow: hidden">
          <div v-if="this.activeSpace.nanoid === ''" style="padding: 40px">
            <a-result>
              <template #title>
                <h3 style="font-size: 18px">请选择空间</h3>
                <p style="font-size: 14px; margin-bottom: 10px">
                  <zoom-in-outlined />
                  单击：预览空间
                </p>
                <p style="font-size: 14px">
                  <swap-outlined />
                  双击：切换空间
                </p>
              </template>
              <template #extra>
                <a-button key="console" type="primary" @click="showCreateSpace">创建空间</a-button>
              </template>
            </a-result>
          </div>
          <div style="padding: 10px; position: relative">
            {{ activeSpace.name }}
            <span v-if="this.activeVersion.nanoid" style="color: red"> — {{ activeVersion.name }}</span>
            <div v-if="activeSpace.nanoid" style="position: absolute; right: 10px; top: 10px">
              <a-dropdown>
                <template #overlay>
                  <a-menu>
                    <a-menu-item @click="toggleHistory" key="history">
                      <history-outlined />
                      历史版本
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
              <a-button @click="toggleHistory" type="text"> <history-outlined /> 版本历史 </a-button>
            </div>
          </div>
          <vue-custom-scrollbar :settings="settings" :style="taskListStyle">
            <TaskList
              v-if="activeSpace.nanoid !== ''"
              :list="spaceData.state.tasks"
              v-model:selectedKeys="selectedKeys"
            ></TaskList>
          </vue-custom-scrollbar>

          <div>
            <a-modal
              centered
              v-model:visible="visibleCreate"
              title="创建空间"
              ok-text="创建"
              cancel-text="取消"
              width="300px"
              @ok="doCreateSpace"
            >
              <p>输入空间名称</p>
              <p>
                <a-input
                  ref="spaceNameInput"
                  @keyup.enter="doCreateSpace"
                  v-model:value="newSpaceName"
                  placeholder="空间名称"
                ></a-input>
              </p>
              <p></p>
            </a-modal>
            <a-modal
              centered
              v-model:visible="visibleImport"
              title="导入本机空间"
              ok-text="导入"
              cancel-text="取消"
              width="400px"
              @ok="doImportSpaces"
            >
              <p>
                请选择本机空间导入，可一次导入多个空间。<br />注意：如果导入<strong>当前使用的空间</strong>，后续的改动<strong>不会被同步</strong>到新导入的云端空间。
              </p>
              <p>
                <a-select
                  mode="multiple"
                  placeholder="可多选"
                  style="width: 100%"
                  v-model:value="selectedImportSpaces"
                  :options="localOptions"
                ></a-select>
              </p>
            </a-modal>
          </div>
        </a-layout-content>
        <a-layout-sider :style="historySiderStyle" v-if="showHistory">
          <h3>
            <history-outlined />
            备份版本 <span v-if="versions.length" style="font-size: 12px; color: grey">（{{ versions.length }}）</span>
            <close-outlined class="close-btn" @click="this.showHistory = false" />
          </h3>
          <p style="font-size: 13px">
            单击预览；<br />
            双击重置空间到此版本；
            <br />系统仅备份不同的版本。
          </p>
          <vue-custom-scrollbar :settings="settings" :style="taskListStyle">
            <VersionList @restoreVersion="restoreVersion" @setActive="setTaskList" :versions="versions"></VersionList>
          </vue-custom-scrollbar>
        </a-layout-sider>
      </a-layout>
    </a-layout>
  </div>
</template>

<script>
import VersionList from '../components/VersionList.vue';

const { userModel, spaceModel, spaceVersionModel } = window.$models;
import { message, Modal } from 'ant-design-vue';
import SpaceList from '../components/SpaceList.vue';
import TaskList from '../components/TaskList.vue';

import {
  ZoomInOutlined,
  SwapOutlined,
  DownOutlined,
  ImportOutlined,
  HistoryOutlined,
  CloseOutlined,
} from '@ant-design/icons-vue';
import vueCustomScrollbar from '../../../src/components/vue-scrollbar.vue';

export default {
  name: 'SpaceSelect',
  props: {
    uid: {
      type: [Number, String],
      default: undefined,
    },
    embedded: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    VersionList,
    vueCustomScrollbar,
    SpaceList,
    TaskList,
    ZoomInOutlined,
    SwapOutlined,
    DownOutlined,
    ImportOutlined,
    HistoryOutlined,
    CloseOutlined,
  },
  data() {
    return {
      versions: [],
      activeVersion: {},
      showHistory: false,
      settings: {
        swipeEasing: true,
        suppressScrollY: false,
        suppressScrollX: true,
        wheelPropagation: false,
      },
      user: {
        uid: 0,
        spaces: [],
        clientId: '',
        user_info: {},
      },
      spaces: [],
      activeSpace: { nanoid: '' },
      spaceData: {
        state: {
          tasks: [],
        },
      },
      selectedKeys: [],

      currentSpace: {},
      pwd: '',

      visibleImport: false,
      localSpaces: [],
      localOptions: [],
      selectedImportSpaces: [],

      visibleCreate: false,
      newSpaceName: '',

      clientId: '',
      showBackup: false,
      loading: true,
      tipCopyRead: '0',
    };
  },
  computed: {
    layoutStyle() {
      return {
        overflow: 'hidden',
        height: this.embedded ? '100%' : '100vh',
      };
    },
    siderStyle() {
      return {
        background: '#f1f1f1',
        height: this.embedded ? '100%' : '100vh',
        borderRight: '1px solid #dadada',
      };
    },
    spaceListStyle() {
      return {
        position: 'relative',
        height: this.embedded ? 'calc(100% - 45px)' : 'calc(100vh - 45px)',
      };
    },
    taskListStyle() {
      return {
        position: 'relative',
        height: this.embedded ? 'calc(100% - 50px)' : 'calc(100vh - 50px)',
        padding: '10px',
      };
    },
    historySiderStyle() {
      return {
        background: 'white',
        padding: '10px',
        boxShadow: '0 0 8px rgba(0, 0, 0, 0.38)',
      };
    },
    scopeLabel() {
      return this.user.uid === 0 ? '本机空间' : this.user.user_info?.nickname || '当前账号';
    },
  },
  watch: {
    uid() {
      if (this.embedded) {
        this.init(this.resolveUid());
      }
    },
  },
  async mounted() {
    await this.init(this.resolveUid());
  },
  methods: {
    resolveUid() {
      if (typeof this.uid !== 'undefined' && this.uid !== null && this.uid !== '') {
        return Number(this.uid);
      }
      if (this.$route && this.$route.params && typeof this.$route.params.uid !== 'undefined') {
        return Number(this.$route.params.uid);
      }
      return 0;
    },
    async setTaskList(version) {
      this.activeVersion = version;
      this.spaceData = JSON.parse(version.data);
    },
    restoreVersion(version) {
      if (this.currentSpace.spaceId === this.activeSpace.nanoid) {
        Modal.confirm({
          content: '当前空间正在使用中，此操作将自动重启浏览器，请确认当前所有的网页内容均已保存。',
          okText: '已保存，重启还原',
          cancelText: '取消',
          okType: 'danger',
          type: 'danger',
          onOk: () => {
            this.doRestoreVersion(version);
          },
        });
      } else if (this.activeSpace.isUsing) {
        Modal.error('不可还原其他设备使用中的空间。请在其他设备上退出空间后，再尝试还原操作。');
      } else {
        Modal.confirm({
          content: '确定还原此版本？',
          okText: '还原版本',
          cancelText: '取消',
          okType: 'danger',
          type: 'danger',
          onOk: () => {
            this.doRestoreVersion(version);
          },
        });
      }
    },
    async doRestoreVersion(version) {
      if (this.activeSpace.type === 'local') {
        let rs = await spaceVersionModel.restore(this.activeSpace.nanoid, version.nanoid, 'local');
        if (rs.status === 1) {
          await this.loadSpaces();
          await this.syncActiveSpace(this.activeSpace.nanoid);
          message.success('成功还原版本。');
        }
      } else {
        let rs = await spaceVersionModel.restore(this.activeSpace.nanoid, version.nanoid, 'cloud');
        if (rs.status === 1) {
          await this.loadSpaces();
          await this.syncActiveSpace(this.activeSpace.nanoid);
          message.success('成功还原版本。');
        }
      }
    },
    async toggleHistory() {
      if (!this.activeSpace.nanoid) {
        return;
      }
      this.showHistory = !this.showHistory;
      if (this.showHistory) {
        let rs = await spaceVersionModel.list(this.activeSpace.nanoid);
        if (rs.status) {
          this.versions = rs.data;
        }
      }
    },
    async init(uid) {
      this.loading = true;
      this.resetActive();
      this.tipCopyRead = localStorage.getItem('tipCopyRead');
      let user = {};
      if (!Number(uid)) {
        user = {
          user_info: {
            nickname: '本机空间',
            avatar: '../../icons/logo128.png',
          },
          spaces: [],
          uid: 0,
        };
        this.user = user;
      } else {
        user = await userModel.get({ uid: uid });
        if (user) {
          this.user = user;
        } else {
          message.error('获取用户信息失败，登录信息过期或用户帐号异常。');
          this.spaces = [];
          this.loading = false;
          return;
        }
      }
      this.user.clientId = userModel.getClientId();
      try {
        this.currentSpace = await spaceModel.getCurrent();
      } catch (e) {
        console.warn(e);
      }
      await this.loadSpaces();
      await this.syncActiveSpace();
      this.loading = false;
    },
    setTipCopyRead() {
      localStorage.setItem('tipCopyRead', '1');
    },
    async importFromLocal() {
      let spaces = await spaceModel.getLocalSpaces();
      this.localSpaces = [];
      this.localOptions = [];
      this.selectedImportSpaces = [];

      spaces.forEach((space) => {
        space.data = JSON.parse(space.data);
        if (space.data) {
          if (space.nanoid === this.currentSpace.spaceId) {
            this.localOptions.push({
              label: space.name + '（ ' + space.data.state.tasks.length + ' 标签组）← 当前',
              value: space.nanoid,
            });
          } else {
            this.localOptions.push({
              label: space.name + '（ ' + space.data.state.tasks.length + ' 标签组）',
              value: space.nanoid,
            });
          }
          this.localSpaces.push(space);
        }
      });

      this.visibleImport = true;
    },
    async doImportSpaces() {
      let currentIndex = undefined;
      try {
        let selectedSpaces = this.selectedImportSpaces.map((space) => {
          let item = this.localSpaces.find((localItem) => {
            return localItem.nanoid === space;
          });
          return {
            data: item.data,
            name: item.name + '_导入',
          };
        });
        if (selectedSpaces.length === 0) {
          message.error('请选择需要导入的空间。');
          return;
        }
        currentIndex = this.selectedImportSpaces.find((op) => {
          return op === this.currentSpace.spaceId;
        });

        let result = await spaceModel.setUser(this.user).importFromLocal(selectedSpaces);
        if (result.status === 1) {
          this.visibleImport = false;
          this.selectedImportSpaces = [];
          await this.loadSpaces();
          await this.syncActiveSpace();
          if (currentIndex) {
            Modal.info({
              title: '空间导入成功',
              content:
                '导入空间成功。导入的空间中包括当前使用中的空间，后续对当前空间的改动不会再影响到到导入后的云端空间。',
            });
          } else {
            message.success('导入空间成功。');
          }
        } else {
          message.error('导入空间失败。' + result.data);
        }
      } catch (e) {
        console.warn(e);
        message.error('导入空间失败。未知异常。');
      }
    },
    async loadSpaces() {
      let spaces = [];
      try {
        let result = await spaceModel.setUser(this.user).getUserSpaces({ showBackup: this.showBackup });

        if (result.status === 1) {
          spaces = result.data;
          if (this.user.uid) {
            spaces = spaces.map((sp) => {
              sp.id = sp.nanoid;
              return sp;
            });
          }
        } else {
          message.error('获取用户空间失败。失败原因：' + result.info);
          return;
        }
      } catch (e) {
        if (e.toString().indexOf('ECONNREFUSED') > -1) {
          message.error('无法连接到服务器，服务器异常，请稍后再试。');
        } else {
          message.error('获取用户空间失败，可稍后重试。');
        }
        return;
      }
      this.spaces = spaces;
      if (!this.loading) {
        await this.syncActiveSpace();
      }
    },
    goLogin() {
      ipc.send('login');
    },
    async doCreateSpace() {
      try {
        let result = await spaceModel.setUser(this.user).addSpace({ name: this.newSpaceName });
        if (result.status === 1) {
          const createdSpaceId = result.data.nanoid;
          this.newSpaceName = '';
          message.success('创建空间成功。');
          await this.loadSpaces();
          await this.syncActiveSpace(createdSpaceId);
          this.visibleCreate = false;
        } else {
          message.error('空间名称长度在1-10个汉字，请重新输入。');
          this.$refs.spaceNameInput.input.select();
        }
      } catch (e) {
        message.error('创建空间失败。');
        console.warn(e);
      }
    },
    showCreateSpace() {
      this.visibleCreate = true;
      setTimeout(() => {
        this.$refs.spaceNameInput.input.focus();
      }, 200);
    },
    resetActive() {
      this.showHistory = false;
      this.activeVersion = {};
      this.activeSpace = { nanoid: '' };
      this.spaceData = {
        state: {
          tasks: [],
        },
      };
    },
    async syncActiveSpace(targetSpaceId) {
      if (!this.spaces.length) {
        this.resetActive();
        return;
      }
      let nextSpace = null;
      if (targetSpaceId) {
        nextSpace = this.spaces.find((space) => space.nanoid === targetSpaceId);
      }
      if (!nextSpace && this.activeSpace.nanoid) {
        nextSpace = this.spaces.find((space) => space.nanoid === this.activeSpace.nanoid);
      }
      if (!nextSpace && this.currentSpace?.spaceId) {
        nextSpace = this.spaces.find((space) => space.nanoid === this.currentSpace.spaceId);
      }
      if (!nextSpace) {
        nextSpace = this.spaces[0];
      }
      if (nextSpace) {
        await this.setActive(nextSpace);
      }
    },
    async setActive(space) {
      this.showHistory = false;
      this.activeSpace = space;
      this.activeVersion = {};
      if (this.user.uid !== 0) {
        try {
          let spaceRs = await spaceModel.setUser(this.user).getSpace(space.nanoid);
          if (spaceRs.status === 1) {
            this.spaceData = spaceRs.data.data;
          } else {
            this.spaceData = {
              state: {
                tasks: [],
              },
            };
          }
        } catch (e) {
          console.warn('载入失败', e);
        }
      } else {
        let spaceRs = await spaceModel.setUser(this.user).getSpace(space.nanoid);
        this.spaceData = JSON.parse(spaceRs.data);
      }
    },
  },
};
</script>

<style scoped lang="scss">
.space-select-root {
  height: 100vh;
  overflow: hidden;
}

.space-select-root.embedded {
  height: 100%;
  min-height: 100%;
  overflow: hidden;
  border-radius: 12px;
  background: #fff;
}

.close-btn {
  position: absolute;
  right: 10px;
  top: 10px;
  color: #ccc;
  &:hover {
    color: #999;
  }
}
</style>
