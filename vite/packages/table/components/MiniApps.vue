<template>
  <div style="padding: 1em; width: 100%">
    <vue-custom-scrollbar :settings="outerSettings" style="position: relative; height: calc(100vh - 14em); width: 100%">
      <a-dropdown v-for="app in apps" :trigger="['contextmenu']">
        <div class="app" @click="executeApp(app)">
          <a-avatar :size="70" :src="app.logo"></a-avatar>
          <div class="name text-more">
            {{ app.name }}
          </div>
        </div>
        <template #overlay>
          <a-menu>
            <a-menu-item key="executeApp" @click="executeApp(app)">运行应用</a-menu-item>
            <a-menu-item v-if="!app.isSystemApp" key="uninstall" @click="uninstall(app)">删除应用</a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
      <a-dropdown>
        <div class="app" style="height: 120px" @click="addIcons()">
          <div class="flex justify-center items-center w-full h-full" style="">
            <Icon class="xt-text" icon="tianjia2" style="font-size: 30px"></Icon>
          </div>
        </div>
      </a-dropdown>
    </vue-custom-scrollbar>
  </div>
</template>

<script>
import { Modal } from 'ant-design-vue';

const { appModel } = window.$models;
export default {
  name: 'MiniApps',
  computed: {
    // ...mapWritableState(apps,['myApps','qingApps'])
  },
  data() {
    return {
      apps: [],
      outerSettings: {
        useBothWheelAxes: true,
        swipeEasing: true,
        suppressScrollY: false,
        suppressScrollX: true,
        wheelPropagation: true,
      },
    };
  },
  async mounted() {
    this.apps = await appModel.getAllApps({ where: { type: 'web' } });
  },
  methods: {
    addIcons() {
      this.$emit('addIcons');
    },
    // 运行app
    executeApp(app) {
      ipc.send('executeApp', { app: JSON.parse(JSON.stringify(app)) }); // 传给appManager.js执行
    },
    uninstall(app) {
      let that = this;
      let appId = app.nanoid;
      Modal.confirm({
        centered: true,
        title: '确定卸载此应用？',
        content: '此操作将卸载应用并清空所有应用数据，且无法还原。请谨慎操作。',
        okText: '确认',
        okType: 'danger',
        cancelText: '取消',
        onOk() {
          appModel.uninstall(app.nanoid).then(
            (success) => {
              for (let i = 0; i < that.apps.length; i++) {
                if (that.apps[i].nanoid === appId) {
                  that.apps.splice(i, 1);
                }
              }
              ipc.send('message', {
                type: 'success',
                config: { content: '卸载应用成功。' },
              });
              ipc.send('deleteApp', { nanoid: appId });
            },
            (err) => {
              ipc.send('message', {
                type: 'success',
                config: { content: '卸载失败。' },
              });
            },
          );
        },
        onCancel() {},
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.app {
  cursor: pointer;
  text-align: center;
  display: inline-block;
  width: 6em;
  vertical-align: top;
  padding: 1em;
  border-radius: 0.2em;

  &:hover {
    background: var(--primary-bg);
    border-radius: 10px;
  }

  .name {
    font-size: 0.8em;
    margin-top: 0.5em;
  }
}
</style>
