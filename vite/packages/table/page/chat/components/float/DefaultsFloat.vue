<template>
  <div class="flex flex-col">
    <div class="w-full mb-2.5 flex  justify-between items-center">
      <span class=" font-bold text-lg truncate" style="color:var(--primary-text);">{{ defaultCategory?.name }}</span>
      <ChatDropDown :list="floatList"/>
    </div>

    <div :style="isDoubleColumn ? { width:'312px' } : {width:'215px'} " class="font-14 mb-2"
         style="color:var(--secondary-text);">
      {{ defaultCategory?.summary }}
    </div>

    <div class="ml-1 category-14-400 mb-2" style="color:var(--primary-text);">
      社群号：{{ defaultCategory?.no }}
    </div>
    <div>
      <a-row :gutter="10">
        <a-col class="mt-1 text-right" flex="55px">
          <span class="px-2 rounded-full xt-active-bg">0 级</span>
        </a-col>
        <a-col flex="auto" style="padding-top: 3px">
          <a-progress :percent="10" :show-info="false" strokeColor="var(--active-bg)"></a-progress>
        </a-col>

      </a-row>
    </div>

  </div>

  <a-divider style="height: 2px;margin: 12px 0; background-color: var(--divider)"/>

  <vue-custom-scrollbar :settings="settingsScroller" style="height: 100%;">
    <div v-for="item in defaultCategory?.tree">
      <ChatFold :no="defaultCategory?.no" :show="false" :title="item.name">

        <div v-if="isDoubleColumn === false" class="flex flex-col">

          <div v-for="item in item.children" :class="{'active-bg': currentID ===item.id}"
               class="flex items-center rounded-lg p-2 pointer group-item"
               @click="currentItem(item)"
          >
            <div class="flex items-center">
              <template v-if="item.type === 'group'">
                <communityIcon icon="fluent-emoji-flat:thought-balloon" style="font-size: 2em;"/>
              </template>
              <template v-if="item.type === 'link'">
                <communityIcon icon="fluent-emoji-flat:globe-with-meridians" style="font-size: 2em;"/>
              </template>
              <template v-if="item.type === 'forum'">
                <communityIcon icon="fluent-emoji-flat:placard" style="font-size: 2em;"/>
              </template>
            </div>
            <span class="font-16 ml-2 truncate" style="color: var(--primary-text);">{{ item.name || item.title }}</span>
            <SelectOutlined v-if="item.type === 'link' && item.name !== 'Roadmap'" class="ml-1 xt-text-2 flip "
                            style="font-size: 14px"/>
          </div>

        </div>

        <div v-else class="flex grid grid-cols-2 gap-1">

          <div v-for="item in item.children" :class="{'active-bg':currentID === item.id}"
               class="flex items-center px-3.5 py-2 rounded-lg pointer group-item"
               @click="currentItem(item)"
          >
            <div class="flex items-center">
              <template v-if="item.type === 'group'">
                <communityIcon icon="fluent-emoji-flat:thought-balloon" style="font-size: 2em;"/>
              </template>
              <template v-if="item.type === 'link'">
                <communityIcon icon="fluent-emoji-flat:globe-with-meridians" style="font-size: 2em;"/>
              </template>
              <template v-if="item.type === 'forum'">
                <communityIcon icon="fluent-emoji-flat:placard" style="font-size: 2em;"/>
              </template>
            </div>
            <span class="font-16 ml-2 truncate" style="color: var(--primary-text);">{{ item.name || item.title }}</span>
            <SelectOutlined v-if="item.type === 'link' && item.name !== 'Roadmap'" class="ml-1 xt-text-2 flip "
                            style="font-size: 14px"/>
          </div>

        </div>

      </ChatFold>
    </div>
  </vue-custom-scrollbar>
</template>

<script>
import { mapWritableState } from 'pinia'
import { chatList, memberDropList, memberShowList } from '../../../../js/data/chatList'
import { chatStore } from '../../../../store/chat'
import { Icon as CommunityIcon } from '@iconify/vue'

import ChatDropDown from './ChatsDropDown.vue'
import ChatFold from './ChatFolds.vue'

export default {
  props: ['float'],

  components: {
    ChatDropDown, ChatFold, CommunityIcon
  },

  data () {
    return {
      defaultCategory: {
        name: chatList[0]?.name,
        summary: chatList[0]?.summary,
        no: 1,
        tree: chatList[0].channelList
      },

      currentID: '',

      settingsScroller: {
        useBothWheelAxes: true,
        swipeEasing: true,
        suppressScrollY: false,
        suppressScrollX: true,
        wheelPropagation: true
      },

    }
  },

  computed: {
    ...mapWritableState(chatStore, ['settings']),
    isDoubleColumn () {
      return this.settings.showDouble
    },
    floatList () {
      if (this.float && this.settings.enableHide) {
        return memberShowList
      } else {
        return memberDropList
      }
    }
  },

  methods: {
    currentItem (item) {
      this.currentID = item.id
      this.$emit('clickItem', item)
    },

  }

}
</script>

<style lang="scss" scoped>
.active-bg {
  background: var(--active-secondary-bg);
}
</style>
