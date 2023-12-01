import Promotion from '../../apps/promotion/page/index.vue';
import Rank from '@page/social/Rank.vue';
import BillingRecord from '@page/social/BillingRecord.vue';
import Message from '@page/social/Message.vue';
import Com from '@page/social/Com.vue';
import SocialMy from '@page/social/My.vue';
import Invite from '@page/social/Invite.vue';
import Grade from '@page/social/Grade.vue';

export default [
  {
    path: '',
    name: 'com',
    component: Com,
  },
  {
    path: '/my',
    name: 'socialMy',
    component: SocialMy,
  },
  {
    path: '/invite',
    name: 'invite',
    component: Invite,
  },
  {
    path: '/grade',
    name: 'grade',
    component: Grade,
  },
  {
    path: '/message',
    name: 'message',
    component: Message,
  },
  {
    path: '/rank',
    name: 'rank',
    component: Rank,
  },
  {
    path: '/bill',
    name: 'bill',
    component: BillingRecord,
  },
  {
    path: '/promotion',
    name: 'promotion',
    component: Promotion,
  },
];
