import GameCapture from '@page/gameAssistant/GameCapture.vue';
import GameMedia from '@page/gameAssistant/GameMedia.vue';
import GameIndex from '@page/gameAssistant/GameIndex.vue';
import GameSetting from '@page/gameAssistant/GameSetting.vue';
import GameCommunity from '@page/gameAssistant/GameCommunity.vue';
import GameDiscount from '@page/gameAssistant/GameDiscount.vue';
import GameIntroduction from '@page/gameAssistant/GameIntroduction.vue';
import MyGame from '@page/gameAssistant/MyGame.vue';
import GameDiscountDetail from '@page/gameAssistant/GameDiscountDetail.vue';

export default [
  {
    path: '/gameIndex',
    name: 'gameIndex',
    component: GameIndex,
    meta: {
      tab1: 'game',
    },
  },
  {
    path: '/gameSetting',
    name: 'gameSetting',
    component: GameSetting,
    meta: {
      tab1: 'game',
    },
  },
  {
    path: '/gameCommunity',
    name: 'gameCommunity',
    component: GameCommunity,
    meta: {
      tab1: 'game',
    },
  },
  {
    path: '/gameMedia',
    name: 'gameMedia',
    component: GameMedia,
    meta: {
      tab1: 'game',
    },
  },
  {
    path: '/gameDiscount',
    name: 'recommend',
    component: GameDiscount,
    meta: {
      tab1: 'game',
    },
  },
  {
    path: '/gameIntroduction',
    name: 'gameIntroduction',
    component: GameIntroduction,
    meta: {
      tab1: 'game',
    },
  },
  {
    path: '/myGame',
    name: 'myGame',
    component: MyGame,
    meta: {
      tab1: 'game',
    },
  },
  {
    path: '/GameDiscountDetail',
    name: 'GameDiscountDetail',
    component: GameDiscountDetail,
    props: true,
    meta: {
      tab1: 'game',
    },
  },
  {
    path: '/GameCapture',
    name: 'GameCapture',
    component: GameCapture,
    meta: {
      tab1: 'game',
    },
  },
];
