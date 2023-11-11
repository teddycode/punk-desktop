<template>
  <div class="container"
       style="margin:10vh;background: white;padding: 20px;border-radius: 8px;height: 80vh;overflow-y: auto">

    <h3>全部开发中的项目
      <a-button style="float: right" type="primary" @click="createNew">创建新项目</a-button>
    </h3>
    <div style="padding: 20px">
      <a-list
          :data-source="devApps"
          class="demo-loadmore-list"
          item-layout="horizontal"
      >
        <template #renderItem="{ item }">
          <a-list-item>
            <template #actions>
              <a key="list-loadmore-edit" @click="loadDevApp(item)">
                <edit-outlined key="edit"/>
                进入项目
              </a>
              <a key="list-loadmore-more" @click="deleteDevApp(item)">删除项目</a>
            </template>
            <a-skeleton :loading="!!item.loading" :title="false" active avatar>
              <a-list-item-meta>
                <template #description>
                  <p>
                    {{ item.summary }}
                  </p>
                  <p v-if="item.assignAppsInfo.length>0">
                    关联的应用：
                    <a-tag v-for="app in item.assignAppsInfo">{{ app.name }} <span
                        style="color:grey">{{ app.nanoid }}</span></a-tag>
                  </p>
                </template>
                <template #title>
                  <a @click="loadDevApp(item)">{{ item.name }} <span
                      style="font-size: 12px;color: #999">{{ item.nanoid }}</span></a>
                </template>
                <template #avatar>
                  <a-avatar :src="item.logo"/>
                </template>
              </a-list-item-meta>
            </a-skeleton>
          </a-list-item>
        </template>
      </a-list>

    </div>

  </div>

</template>

<script>
import {EditOutlined, EllipsisOutlined, SettingOutlined} from '@ant-design/icons-vue'
import {mapActions} from 'pinia'
import {appStore} from '../store'
import {message, Modal} from 'ant-design-vue'

const {devAppModel, appModel} = window.$models
export default {
  name: 'AllDevApps',
  components: {
    SettingOutlined,
    EditOutlined,
    EllipsisOutlined,
  },
  data() {
    return {
      devApps: []
    }
  },
  async mounted() {
    this.devApps = await devAppModel.getAll()

    this.devApps.forEach(devApp => {

      let assignApps = JSON.parse(devApp.assign_apps)

      devApp.assignAppsInfo = []
      assignApps.forEach(async appId => {
        let assignApp = await appModel.get({nanoid: appId})
        if (assignApp) {
          devApp.assignAppsInfo.push(assignApp)
        }
      })
    })

  },
  methods: {
    async createNew() {
      this.setDevApp(await devAppModel.create())
      this.$router.push('/dev/')
    },
    async loadDevApp(devApp) {
      await this.setDevApp(devApp)
      this.$router.push('/dev/')
    },
    deleteDevApp(app) {
      Modal.confirm({
        centered: true,
        content: `是否删除「${app.name}」ID：${app.nanoid}？删除后无法还原，请谨慎操作。`,
        onOk: () => {
          devAppModel.delete(app.nanoid)
          this.devApps.splice(this.devApps.findIndex(devApp => devApp === app), 1)
          message.success('删除项目成功。')
        }
      })
    },
    ...mapActions(appStore, ['setDevApp'])
  }
}
</script>
<style>
body {
  background: #f1f1f1;
}
</style>
<style scoped>
.container {
  height: 100vh;
}
</style>
