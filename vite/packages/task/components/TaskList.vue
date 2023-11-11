<script lang="ts">
import {CheckOutlined, CloseOutlined, DeleteOutlined} from '@ant-design/icons-vue'

const ipc = eval('require')('electron').ipcRenderer
export default {
  components: {CloseOutlined, CheckOutlined, DeleteOutlined},
  props: {
    list: Array,
    selectedKeys: Array,
    config: Object
  },
  emits: ['update:selectedKeys', 'remove'],
  data() {
    return {
      dataList: [],
      selectedKeysData: []
    }
  },
  computed: {
    dataList() {
      return this.list.map(task => {
        task.icon = this.getIcon(task.data.tabs[0].favicon)
        return task
      })
    }
  },
  mounted() {
    this.ipc = eval('require')('electron').ipcRenderer
  },
  methods: {
    remove(id) {
      this.$emit('remove', id)
    },
    getUserIconName(userIcon) {
      let iconPath = userIcon.split('.')
      return iconPath[2]
    },
    selected(task) {
      let index = this.selectedKeysData.indexOf(task.id)
      if (index > -1) {
        this.selectedKeysData.splice(index, 1)
      } else {
        this.selectedKeysData.push(task.id)
      }
      this.$emit('update:selectedKeys', this.selectedKeysData)
    },
    //获取图标的方法
    getIcon(favicon) {
      var defaultIcon = '../../icons/empty.png'
      if (typeof favicon == 'undefined') {
        return defaultIcon
      } else if (favicon == null) {
        return defaultIcon
      } else {
        return favicon.url
      }
    },
  }
}
</script>

<template>
  <div style="padding-bottom:40px;height: 100%; overflow-y: auto">
    <div style="padding: 20px;height: 100%;">
      <a-row :gutter="16">
        <a-col v-for="(task,index) in dataList" :key="index" :span="8">
          <a-card :bordered="false" :class="{'selected':this.selectedKeysData.indexOf(task.id)>-1}"
                  class="task" @click="selected(task)">
            <div slot="title" slot-scope="title" @click.stop="()=>{}">
              <div style="position: relative">
                <svg v-if="task.data.userIcon" aria-hidden="true" class="icon task-icon">
                  <use v-bind:xlink:href="'#icon-'+getUserIconName(task.data.userIcon)"></use>
                </svg>
                <img v-else :src="task.icon" class="icon" onerror="this.src='/icons/default.svg'"/>
                &nbsp; {{ task.data.name || '标签组' }}

                <img v-if="task.data.partition !=='persist:webcontent'" class="single-avatar"
                     src="/public/icons/randomuser.svg">
                <div class="operation" style="position:absolute;right: 0;top: 0">
                  <DeleteOutlined @click="remove(task.id)"/>
                </div>
              </div>
            </div>
            <div class="time">{{ new Date(task.createTime).toLocaleString() }}</div>
            <div style="border-top: 1px solid #f1f1f1"></div>
            <ul class="tabs" style="height: 220px; overflow-y: auto; margin-right: -10px">
              <li
                  v-for="(tab, Dindex) in task.data.tabs"
                  :key="Dindex"
                  class="tab-title"
                  @click="selectTab(task, tab, task.id, Dindex)"
              >
                <a-avatar :src="getIcon(tab.favicon)" class="tab-icon" shape="square" size="small"></a-avatar>
                {{
                  tab.title == '' ? '新标签' : tab.title
                }}
              </li>
            </ul>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </div>
</template>
<style>

</style>
<style lang="scss" scoped>

</style>
