import Setting from '@page/Setting.vue';
import Weather from '@page/app/Weather.vue';
import Watch from '@page/app/watch/Index.vue';
import Social from '@page/Social.vue';
import BasicSetting from '@page/settings/Basic.vue';
import Apps from '@page/Apps.vue';
import AppFrame from '@page/AppFrame.vue';
import Music from '@page/Music.vue';
import Status from '@page/Status.vue';
import Home from '@page/Home.vue';
import SetupCard from '@page/app/card/SetupClock.vue';
import Sensor from '@page/Sensor.vue';
import Dashboard from '@page/app/watch/Dashboard.vue';
import CPUIndex from '@page/app/CPUIndex.vue';
import Gallery from '@page/Gallery.vue';
import GalleryChild from './main/galllery';
import GameAssistant from '@page/gameAssistant/GameAssistant.vue';

import Inspector from '@page/app/Inspector.vue';

import BrowserMain from '@page/app/browser/Browser.vue';
import BrowserChild from './main/browser';

import BasicSettingsChild from './main/basicSetting';

import SocialChild from './main/social';
import MarketIndex from '@page/market/MarketIndex.vue';
import MarketChild from './main/market';
import RemoteCommunity from '@page/app/card/RemoteCommunity.vue';
import GameAssistChild from './main/GameAssist';
/*办公助手*/
import WorkIndex from '@page/work/WorkIndex.vue';
import WorkChild from './main/work';

import ChatIndex from '@page/chat/index.vue';
import ChatChild from './main/chat';

import Power from '@page/Power.vue';
// import coreBasicLayout from "@page/core/Layouts/BaseLayout.vue";
import SecondLayout from '../page/core/Layouts/SecondLayout.vue';
import computing from './core/computing';
import consensus from './core/consensus';
import crypto from './core/crypto';
import exchange from './core/exchange';
import governance from './core/governance';
import network from './core/network';
import transfer from './core/transfers';
import collection from './core/collection';
import storage from './core/storage';
import wallets from './core/wallets';
import Explorer from './core/explorer';
// import BackgroundPage from "@page/core/components/BackgroundPage.vue";

// 二级路由，
export default [
  {
    // 系统核心功能路由
    path: '/core',
    name: 'core',
    component: SecondLayout,
    meta: {
      title: '核心功能',
    },
    children: [
      computing,
      consensus,
      crypto,
      exchange,
      governance,
      network,
      transfer,
      collection,
      storage,
      wallets,
      Explorer,
    ],
  },
  {
    // 其他Dapp功能路由
    path: '/dapps',
    name: 'dapps',
    component: SecondLayout,
  },
  {
    path: '/power',
    name: 'power',
    component: Power,
  },
  {
    path: '/inspector',
    name: 'inspector',
    component: Inspector,
  },
  {
    path: '',
    name: 'home',
    component: Home,
    meta: {
      tab1: 'home',
    },
  },
  {
    path: '/app',
    name: 'app',
    component: AppFrame,
    children: [],
  },
  {
    path: '/watch',
    name: 'watch',
    component: Watch,
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
  },
  {
    path: '/social',
    name: 'social',
    component: Social,
    children: SocialChild,
  },
  {
    path: '/apps',
    name: 'apps',
    component: Apps,
  },
  {
    path: '/browser',
    component: BrowserMain,
    children: BrowserChild,
  },
  {
    path: '/chat',
    name: 'chatIndex',
    component: ChatIndex,
    rememberChildrenPosition: true,
    redirect: {
      name: 'chat',
    },
    children: ChatChild,
  },
  {
    path: '/music',
    name: 'music',
    component: Music,
  },
  {
    path: '/weather',
    name: 'weather',
    component: Weather,
  },
  {
    path: '/gameAssistant',
    name: 'gameAssistant',
    component: GameAssistant,
    children: GameAssistChild,
  },
  {
    path: '/work',
    name: 'work',
    component: WorkIndex,
    meta: {
      rememberChildrenPosition: true,
    },
    redirect: 'desk',
    children: WorkChild,
  },

  {
    path: '/status',
    name: 'status',
    component: Status,
  },
  {
    path: '/sensor',
    name: 'sensor',
    component: Sensor,
  },
  {
    path: '/setting',
    name: 'setting',
    component: Setting,
  },
  {
    path: '/basicSetting',
    name: 'basicSetting',
    component: BasicSetting,
    children: BasicSettingsChild,
  },
  {
    path: '/setting',
    name: 'addCardSetting',
    component: SetupCard,
  },
  {
    path: '/CPUIndex',
    name: 'CPUIndex',
    component: CPUIndex,
  },
  {
    path: '/gallery',
    name: 'gallery',
    component: Gallery,
    children: GalleryChild,
  },
  {
    path: '/market',
    name: 'marketIndex',
    component: MarketIndex,
    children: MarketChild,
  },
  {
    path: '/remoteCommunity',
    name: 'remoteCommunity',
    component: RemoteCommunity,
  },
];
