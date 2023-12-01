import Setting from '@page/Setting.vue';
import Weather from '@page/app/Weather.vue';
import Watch from '@page/app/watch/Index.vue';
import Social from '@page/Social.vue';
import BasicSetting from '@page/settings/Basic.vue';
import Apps from '@page/Apps.vue';
import AppFrame from '@page/AppFrame.vue';
import Music from '@page/Music.vue';
import Status from '@page/Status.vue';
import Main from '@page/Main.vue';
import Home from '@page/Home.vue';
import SetupCard from '@page/app/card/SetupClock.vue';
import Sensor from '@page/Sensor.vue';
import Dashboard from '@page/app/watch/Dashboard.vue';
import CPUIndex from '@page/app/CPUIndex.vue';
import Gallery from '@page/Gallery.vue';
import GalleryChild from './galllery';
import GameAssistant from '@page/gameAssistant/GameAssistant.vue';

import Inspector from '@page/app/Inspector.vue';

import BrowserMain from '@page/app/browser/Browser.vue';
import BrowserChild from './browser';

import BasicSettingsChild from './basicSetting';

import SocialChild from './social';
import MarketIndex from '@page/market/MarketIndex.vue';
import MarketChild from './market';
import RemoteCommunity from '@page/app/card/RemoteCommunity.vue';
import GameAssistChild from './GameAssist';
/*办公助手*/
import WorkIndex from '@page/work/WorkIndex.vue';
import WorkChild from './work';

import ChatIndex from '@page/chat/index.vue';
import ChatChild from './chat';

import Power from '@page/Power.vue';

export default [
  {
    path: '/main',
    name: 'main',
    component: Main,
    children: [
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
        component: ChatIndex,
        name: 'chatIndex',
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
        redirect: '/desk',
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
    ],
  },
];
