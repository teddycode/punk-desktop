<script lang="ts">
import {CheckOutlined, CloseOutlined, DeleteOutlined} from '@ant-design/icons-vue'
import '../assets/task-list.css';
import vueCustomScrollbar from '../../../src/components/vue-scrollbar.vue'

const ipc = eval('require')('electron').ipcRenderer

export default {
  components: {vueCustomScrollbar, CloseOutlined, CheckOutlined, DeleteOutlined},
  props: {
    list: Array,
    selectedKeys: Array,
    config: Object
  },
  emits: ['update:selectedKeys', 'remove'],
  data() {
    return {
      selectedKeysData: [],
      settings: {
        swipeEasing: true,
        suppressScrollY: false,
        suppressScrollX: true,
        wheelPropagation: true
      },
    }
  },
  computed: {
    dataList() {
      return this.list.map(task => {
        task.icon = this.getIcon(task.tabs[0].favicon)
        return task
      })
    }
  },
  mounted() {
    this.ipc = eval('require')('electron').ipcRenderer
  },
  methods: {
    getTabName(tab) {
      let title = tab.title == '' ? '新标签' : tab.title
      if (tab.newName) {
        title = `<span style="color:#2181ff;font-weight: bold">${tab.newName}</span>` + "|" + `<span style="color: grey">${title}</span>`
      } else {
        title = `<span style="">${title}</span>`
      }
      return title
    },
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
  <div>
    <div>
      <a-row :gutter="16">
        <a-col v-if="dataList.length===0" :span="24" style="text-align: center;padding-top: 20vh">
          <a-empty description="全新空间，进入后自动初始化">
          </a-empty>
        </a-col>
        <a-col v-for="(task,index) in dataList" :key="index" :lg="8" :sm="12" :xl="6" :xxl="4">
          <a-card
              :bordered="false" class="task">
            <div slot="title" slot-scope="title">
              <div class="task-title" style="position: relative">
                <svg v-if="task.userIcon" aria-hidden="true" class="icon task-icon">
                  <use v-bind:xlink:href="'#icon-'+getUserIconName(task.userIcon)"></use>
                </svg>
                <img v-else :src="task.icon" class="icon" onerror="this.src='/icons/default.svg'"/>
                &nbsp; {{ task.name || '标签组' }}

                <img v-if="task.partition !=='persist:webcontent'" class="single-avatar"
                     src="/public/icons/randomuser.svg">
              </div>
            </div>
            <vue-custom-scrollbar :settings="settings" style="position:relative;height: 250px ;margin-right: -10px">
              <ul class="tabs">
                <li
                    v-for="(tab, Dindex) in task.tabs"
                    :key="Dindex"
                    class="tab-title"
                    @click="selectTab(task, tab, task.id, Dindex)"
                >
                  <a-avatar :src="getIcon(tab.favicon)" class="tab-icon" shape="square" size="small"></a-avatar>
                  <span v-html="getTabName(tab)"></span>
                </li>
              </ul>
            </vue-custom-scrollbar>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </div>
</template>
<style>
.ant-card-body {
  padding: 10px !important;
}
</style>
<style lang="scss" scoped>

</style>
