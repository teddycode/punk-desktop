import BarrageRoute from '../../apps/barrage/route';
// import ImTeam from '@page/chat/team.vue'
import ChatMain from '@page/chat/page/chatMain.vue';
import CommunityIndex from '@page/chat/page/communityIndex.vue';
import ChatFind from '@page/chat/page/chatFind.vue';
import MyCommunity from '@page/chat/page/communityDetail.vue';
import Channel from '@page/channels/Channels.vue';
import ChannelIndex from '@page/channels/ChannelsIndex.vue';
import Circle from '@page/channels/Groups.vue';
import CircleDetail from '@page/channels/GroupsDetail.vue';


import  Forum from '@page/channels/forum.vue';
import ForumDetail from "@page/channels/forumDetail.vue";
import Tag from "../../page/channels/tag.vue"
import Notification from "@page/channels/notification.vue"
import Likes from "@page/channels/likes.vue"
import Collects from "../../page/channels/collects.vue";
import Users from "../../page/channels/users.vue"
import UserDetail from "../../page/channels/userDetail.vue"
import TagDetail from "../../page/channels/tagDetail.vue";
/**聊天团队模式结束**/
//导入应用路由
import ChatAdmin from '@page/chat/page/admin.vue';
/**聊天团队模式开始**/
import ChatDesk from '@page/chat/chatDesk.vue';
import Contact from '@page/chat/contact.vue';
import Chat from '@page/chat/chat.vue';
import Team from '@page/Team.vue';
import Hall from '@page/team/Hall.vue';

// import Test from'@page/channels/test.vue'
import BaseLayout from "../../page/core/Layouts/BaseLayout.vue";

export default [
  BarrageRoute,
  {
    path: '/chatDesk',
    name: 'chatDesk',
    component: ChatDesk,
  },

  {
    path: '/chatHome',
    name: 'chat',
    component: Chat,
    meta: {
      rememberChildrenPosition: true,
    },
    redirect: {
      name: 'chatMain',
    },
    children: [
      {
        path: '/contact',
        name: 'contact',
        component: Contact,
        meta: {
          type: 'contact',
          tab1: 'community',
          tab2: 'chat',
          tab3: 'contact',
        },
      },
      {
        path: '/chatMain',
        name: 'chatMain',
        component: ChatMain,
        meta: {
          type: 'chat',
          tab1: 'community',
          tab2: 'chat',
          tab3: 'session',
        },
      },
      {
        path: '/chatAdmin',
        name: 'chatAdmin',
        component: ChatAdmin,
        meta: {
          type: 'chatAdmin',
          tab1: 'community',
          tab2: 'chat',
          tab3: 'admin',
        },
      },
      {
        path: '/chatFind',
        name: 'chatFind',
        component: ChatFind,
        meta: {
          type: 'find',
          tab1: 'community',
          tab2: 'chat',
          tab3: 'find',
        },
      },
      {
        path: '/community',
        name: 'defaultCommunity',
        component: CommunityIndex,
        props: true,
        meta: {
          tab1: 'community',
          tab2: 'chat',
          tab3: 'community',
        },
      },
      {
        path: '/myCommunity/:no',
        name: 'myCommunity',
        component: MyCommunity,
        props: true,
        meta: {
          tab1: 'community',
          tab2: 'chat',
          tab3: 'community_{no}',
        },
      },
    ],
  },

  {
    path: '/team',
    name: 'team',
    component: Team,
    children: [
      {
        path: '',
        name: 'hall',
        meta: {
          tab1: 'community',
          tab2: 'team',
        },
        component: Hall,
      },
    ],
  },
  {
    path: "/forum",
    name: "forum",
    component: Forum
  },
  {
    path: "/forumDetail",
    name: "forumDetail",
    component: ForumDetail
  },
  {
    path: '/test',
    name: 'test',
    component: BaseLayout,
  },
  {
    path: "/tag",
    name: "tag",
    component: Tag
  },
  {
    path: "/users",
    name: "users",
    component: Users
  },
  {
    path: "/userDetail",
    name: "userDetail",
    component: UserDetail
  },
  {
    path: "/tagDetail",
    name: "tagDetail",
    component: TagDetail
  },
  {
    path: "/notification",
    name: "notification",
    component: Notification
  },
  {
    path: "/likes",
    name: "likes",
    component: Likes
  },
  {
    path: "/collects",
    name: "collects",
    component: Collects
  },
  {
    path: '/channel',
    name: 'channel',
    component: Channel,
    // meta:{
    //   tab1:'channel'
    // },
    redirect: {
      name: 'channelsIndex',
    },
    children: [
      {
        path: '',
        name: 'channelsIndex',
        meta: {
          tab1: 'community',
          tab2: 'channel',
        },
        component: ChannelIndex,
      },
      {
        path: '',
        name: 'circle',
        meta: {
          tab1: 'community',
          tab2: 'channel',
        },
        component: Circle,
      },
      {
        path: '',
        name: 'circleDetail',
        meta: {
          tab1: 'community',
          tab2: 'channel',
        },
        component: CircleDetail,
      },
    ],
  },
];
