<template>
  <!-- 会话列表 -->
  <li
      :id="conversation.conversationID"
      ref="content"
      :class="[
      currentID === conversation.conversationID && 'selected',
      conversation.isPinned && 'pinned',
      isH5 ? 'list-item-h5' : '',
    ]"
      class="TUI-conversation-content"
  >
    <div v-if="conversation.isPinned" class="badge"></div>
    <div
        v-TUILongPress.self="toggleDialog"
        class="TUI-conversation-item"
        @click.prevent.stop="handleListItem(conversation)"
        @click.prevent.right="toggleDialog"
    >
      <aside class="left">
        <a-avatar v-if="conversation.type === 'C2C'" :size="32"
                  :src="handleConversation?.avator(conversation)"></a-avatar>
        <a-avatar v-else :size="32" :src="handleConversation?.avator(conversation)" shape="square"></a-avatar>

        <div v-if="showUserOnlineStatus()"
             :class="userStatusList?.get(conversation?.userProfile?.userID)?.statusType === 1 ? 'online-status-online' : 'online-status-offline'"
             class="online-status"
        >
        </div>

        <span v-if="conversation.unreadCount > 0 && conversation.messageRemindType !== 'AcceptNotNotify'" class="num">
        {{ conversation.unreadCount > 99 ? '99+' : conversation.unreadCount }}
      </span>

        <span v-if="conversation.unreadCount > 0 && conversation.messageRemindType === 'AcceptNotNotify'"
              class="num-notify">
      </span>
      </aside>

      <!-- <aside class="left">
         <div
           class="online-status"
           :class="
             userStatusList?.get(conversation?.userProfile?.userID)?.statusType === 1
               ? 'online-status-online'
               : 'online-status-offline'
           "
           v-if="showUserOnlineStatus()"
         ></div>
         <span class="num" v-if="conversation.unreadCount > 0 && conversation.messageRemindType !== 'AcceptNotNotify'">
           {{ conversation.unreadCount > 99 ? '99+' : conversation.unreadCount }}
         </span>
         <span class="num-notify" v-if="conversation.unreadCount > 0 && conversation.messageRemindType === 'AcceptNotNotify'"
         ></span>
       </aside> -->

      <div class="content">
        <div class="content-header">
          <label>
            <p class="name">{{ handleConversation?.name(conversation) }}
              <a-badge :count="conversation.conversationID==='GROUP'+liveRoom?'全员':''"
                       :number-style="{border:'none !important'}"
                       style="margin-top: -1px;zoom:0.9"></a-badge>
            </p>
          </label>
          <div class="middle-box">
            <span
                v-if="conversation.type === 'GROUP' && conversation.groupAtInfoList.length > 0"
                class="middle-box-at"
            >{{ handleConversation?.showAt(conversation) }}</span
            >
            <p>{{ handleConversation?.showMessage(conversation) }}</p>
          </div>
        </div>
        <div class="content-footer flex items-end">
          <span class="time">{{ handleConversation?.time(conversation.lastMessage.lastTime) }}</span>
          <Icon v-if="conversation.messageRemindType === 'AcceptNotNotify'" icon="notification-off"></Icon>
        </div>
      </div>
    </div>

    <div v-if="toggle" ref="dialog" class="dialog dialog-item flex flex-col">
      <div class="rounded-lg conversation-options flex items-center justify-center" @click.stop="handleItem('delete')">
        <span>{{ $t('TUIConversation.删除会话') }}</span>
      </div>

      <div v-if="!conversation.isPinned"
           class="rounded-lg conversation-options flex items-center justify-center" @click.stop="handleItem('ispinned')"
      >
        <span>{{ $t('TUIConversation.置顶会话') }}</span>
      </div>

      <div v-if="conversation.isPinned" class="rounded-lg conversation-options flex items-center justify-center"
           @click.stop="handleItem('dispinned')">
        <span>{{ $t('TUIConversation.取消置顶') }}</span>
      </div>

      <div v-if="conversation.messageRemindType === '' || conversation.messageRemindType === 'AcceptAndNotify'"
           class="rounded-lg conversation-options flex items-center justify-center"
           @click.stop="handleItem('mute')">
        <span>{{ $t('TUIConversation.消息免打扰') }}</span>
      </div>

      <div v-if="conversation.messageRemindType === 'AcceptNotNotify'"
           class="flex items-center justify-center rounded-lg conversation-options" @click.stop="handleItem('notMute')">
        {{ $t('TUIConversation.取消免打扰') }}
      </div>
    </div>
  </li>
</template>

<script lang="ts">
import {onClickOutside, useElementBounding} from '@vueuse/core';
import {defineComponent, nextTick, reactive, ref, toRefs, watch, watchEffect} from 'vue';
import {Conversation} from '../../interface';
import config from '@page/chat/config'

const ListItem: any = defineComponent({
  props: [
    'conversation', 'handleConversation', 'currentID',
    'toggleID', 'isH5', 'displayOnlineStatus', 'userStatusList',
    'types'
  ],


  setup(props: any, ctx: any) {
    const data = reactive({
      conversation: {} as Conversation,
      currentID: '',
      currentConversation: {},
      toggle: false,
      currentuserID: '',
      conversationType: '',
      loop: 0,
      displayOnlineStatus: false,
      userStatusList: new Map(),
      liveRoom: config.liveRoom//全网聊天室
    });

    const dialog: any = ref();
    const content: any = ref();

    onClickOutside(content, () => {
      if (data.toggle === true) {
        ctx.emit('toggle', '');
      }
    });

    watchEffect(() => {
      data.conversation = props.conversation;
      data.currentID = props.currentID;
      data.toggle = false;
      data.displayOnlineStatus = props.displayOnlineStatus;
      data.userStatusList = props.userStatusList;
      props.toggleID === props.conversation.conversationID && (data.toggle = true);
    });

    watch(
        () => data.toggle,
        (val: boolean) => {
          if (val) {
            nextTick(() => {
              const DialogBound = useElementBounding(dialog);
              const ParentEle = content?.value?.offsetParent;
              const ParentBound = useElementBounding(ParentEle);
              if (DialogBound.top.value - ParentBound.top.value - DialogBound.height.value - 30 > 0) {
                dialog.value.style.top = 'auto';
                dialog.value.style.bottom = '30px';
              }
            });
          }
        }
    );

    const handleListItem = (item: any) => {
      ctx.emit('open', item);
      ctx.emit('toggle', '');
    };

    const toggleDialog = (e?: any) => {
      if (e?.target?.oncontextmenu) {
        e.target.oncontextmenu = function () {
          return false;
        };
      }
      ctx.emit('toggle', (data.conversation as any).conversationID);
    };

    const handleItem = (name: string) => {
      ctx.emit('handle', {
        name,
        conversation: data.conversation,
      });
      ctx.emit('toggle', '');
    };

    const showUserOnlineStatus = () => {
      if (data.displayOnlineStatus && data.conversation?.type === props.types.CONV_C2C) return true;
      return false;
    };

    return {
      ...toRefs(data),
      handleListItem,
      handleItem,
      dialog,
      content,
      toggleDialog,
      showUserOnlineStatus,

    };
  },
});
export default ListItem;
</script>

<style lang="scss" scoped src="./style/index.scss"></style>
<style lang="scss" scoped>
/**
.TUI-conversation .pinned{
  background: var(--active-secondary-bg) !important;
}
**/

.badge::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-bottom: 12px solid transparent;
  border-right: 12px solid var(--active-bg);
}

.TUI-conversation .dialog-item {
  padding: 8px !important;
  border: 1px solid var(--divider) !important;
  background: var(--secondary-bg) !important;
  width: 120px !important;
  left: 100px !important;
}

.conversation-options {

  cursor: pointer !important;
  font-size: 16px !important;
  color: var(--primary-text) !important;
  font-weight: 400 !important;
  padding: 22px 0 !important;

  &:hover {
    //  opacity: 0.8 !important;
    background: var(--active-secondary-bg) !important;
  }

  &:active {
    filter: brightness(0.8) !important;
  }
}
</style>

