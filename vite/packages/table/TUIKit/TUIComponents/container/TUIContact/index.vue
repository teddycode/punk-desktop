<template>
  <transition>
    <div :class="[env.isH5 ? 'TUI-contact-H5' : '']" class="TUI-contact">
      <aside class="TUI-contact-left">
        <div v-for="item in sideList" :class="{'active-bg':sideIndex === item.index}" class="flex pointer items-center"
             style="padding: 16px;" @click="select(item)"
        >
          <div :style="{background:`${item.color}`}" class="flex items-center justify-center rounded-lg w-8 h-8">
            <Icon :icon="item.icon" style="color: var(--active-text);"></Icon>
          </div>

          <div v-if="item.index === 'group' " class="font-16" style="color: var(--primary-text);margin-left: 12px;">
            {{ item.title }}
            ({{ groupList?.length }}个)
          </div>

          <div v-if="item.index === 'friend' " class="font-16" style="color: var(--primary-text);margin-left: 12px;">
            {{ item.title }}
            ({{ friendLists?.length }}个)
          </div>

          <div v-if="item.index === 'system' " class="font-16" style="color: var(--primary-text);margin-left: 12px;">
            {{ item.title }}
            ({{ num.noticeNum }}个)
          </div>

        </div>
      </aside>

      <main class="TUI-contact-main">

        <!-- 系统通知 -->
        <div v-if="sideIndex === 'system'" class="TUI-contact-system">
          <header v-if="!env.isH5" class="TUI-contact-system-header">
            <div class="font-16" style="color:var(--primary-text);">{{ $t('TUIContact.群聊通知') }}</div>
          </header>
          <MessageSystem :data="systemMessageList" :isEmpty="isUndefined"
                         :isH5="env.isH5" :types="types" @application="handleGroupApplication"
          />
        </div>

        <!-- 群聊 -->
        <div v-else-if="sideIndex === 'group' " class="TUI-contact-main-info">
          <Group :list="groupList"></Group>
        </div>

        <!-- 好友 -->
        <div v-else-if="sideIndex === 'friend' " class="TUI-contact-main-info">
          <Friend :list="friendLists"></Friend>
        </div>
      </main>
    </div>
  </transition>
</template>

<script>
import { computed, defineComponent, onMounted, reactive, toRefs, watch } from 'vue'
import { appStore } from '../../../../store'
import { isArrayEqual } from '../utils'
import { chatStore } from '../../../../store/chat'

import Group from './addressbook/group.vue'
import Friend from './addressbook/friend.vue'
import MessageSystem from './components/message-system.vue'

const TUIContact = defineComponent({
  components: {
    Group, Friend, MessageSystem,
  },

  props: ['displayOnlineStatus'],

  setup (props, ctx) {
    const TUIServer = TUIContact.TUIServer
    const store = appStore()
    const chat = chatStore()

    const data = reactive({
      groupList: [],
      searchGroup: {},
      searchID: '',
      currentGroup: null,
      systemConversation: {
        unreadCount: 0,
      },
      systemMessageList: [],
      columnName: '',
      types: TUIServer.TUICore.TIM.TYPES,
      isSearch: false,
      env: TUIServer.TUICore.TUIEnv,
      friendList: [],
      userIDList: [],
      currentFriend: {},
      displayOnlineStatus: false,
      onlineStatus: false,
      userStatusList: new Map(),
      sideList: [
        { title: '通知', icon: 'notification', color: 'var(--active-bg)', index: 'system' },
        { title: '群聊', icon: 'message', color: 'var(--success)', index: 'group' },
        { title: '好友', icon: 'smile', color: 'var(--warning)', index: 'friend' },
      ],
      sideIndex: 'system', // 接收通讯录侧边列表项下标
      isUndefined: TUIServer.store.systemConversation === undefined,
    })

    TUIServer.bind(data)

    const select = async (item) => {
      data.sideIndex = item.index
      if (item.name === 'system') {
        await TUIServer.getSystemMessageList()
        await TUIServer.setMessageRead()
      } else if (item.name === 'group') {
        (data.currentGroup) = data.groupList[0]
      } else if (item.name === 'friend') {
        const index = data.friendList.filter((item) => {
          return parseInt(item.userID) !== parseInt(store.$state?.userInfo?.uid)
        });
        (data.currentGroup) = index
      }
    }

    watch(() => data.userIDList, (newVal, oldVal) => {
      if (isArrayEqual(newVal, oldVal)) return
      TUIServer.handleUserStatus(data.displayOnlineStatus, data.userIDList)
    })

    watch(() => props.displayOnlineStatus, async (newVal, oldVal) => {
      if (newVal === oldVal) return
      data.displayOnlineStatus = newVal
      TUIServer.handleUserStatus(data.displayOnlineStatus, data.userIDList)
    }, { immediate: true, })

    const isNeedPermission = computed(() => {
      const isHaveSeif = (data.currentGroup).selfInfo.userID
      const isPermission = (data.currentGroup).joinOption === TUIServer.TUICore.TIM.TYPES.JOIN_OPTIONS_NEED_PERMISSION
      return !isHaveSeif && isPermission
    })

    const friendLists = computed(() => {
      const list = data.friendList.filter((item) => {
        return parseInt(item.userID) !== parseInt(store.$state?.userInfo?.uid)
      })
      return list
    })

    const num = computed(() => {
      // console.log('排查为什么数据不更新问题',chat.$state.contactsSet)
      return chat.$state.contactsSet
    })

    const handleGroupApplication = (params) => {
      TUIServer.handleGroupApplication(params)
    }

    onMounted(async () => {
      // 解决通讯录初始化
      if (data.sideIndex === 'system') {
        await TUIServer.getSystemMessageList()
        await TUIServer.setMessageRead()
      }
    })

    return {
      isNeedPermission, friendLists,
      num,
      ...toRefs(data), select, handleGroupApplication
    }
  }
})
export default TUIContact
</script>

<style lang="scss" scoped src="./style/index.scss"></style>
<style lang="scss" scoped>
.font-16 {

  font-size: 16px;
  font-weight: 400;
}

:deep(.active-bg) {
  background: var(--active-secondary-bg);
}

:deep(.TUI-contact-main-info) {
  padding: 0 16px !important;
}
</style>
