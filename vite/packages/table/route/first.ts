import Lock from '@page/Lock.vue';
//设置
import Splash from '@page/Splash.vue';
// 快捷键
import CreativeMarket from '@apps/shortcutKey/page/CreativeMarket.vue';

import MainLayout from '@page/MainLayout.vue';
import SecondRoutes from './second.ts';
import { RouteRecordRaw } from 'vue-router';

// 一級路由
export const routes: RouteRecordRaw[] = [
  {
    path: '/main',
    name: 'main',
    component: MainLayout,
    children: SecondRoutes,
  },
  {
    path: '/lock',
    name: 'lock',
    component: Lock,
  },
  {
    path: '',
    name: 'splash',
    component: Splash,
  },
  {
    path: '/creativeMarket',
    name: 'creativeMarket',
    component: CreativeMarket,
    // children: [
    //   {
    //     path:'/marketList',
    //     name:'marketList',
    //     component: MarketList
    //   },
    // ]
  },
  // 钱包集成测试路由
  {
    path: '/test/wallet',
    name: 'WalletTestIndex',
    component: () => import('@page/test/TestIndex.vue'),
    meta: {
      title: '钱包集成测试中心'
    }
  },
  {
    path: '/test/wallet/basic',
    name: 'WalletTestBasic',
    component: () => import('@page/test/Test1_BasicWalletService.vue'),
    meta: {
      title: '测试1: 基础钱包服务'
    }
  },
  {
    path: '/test/wallet/splash',
    name: 'WalletTestSplash',
    component: () => import('@page/test/Test2_SplashEnvironment.vue'),
    meta: {
      title: '测试2: Splash环境'
    }
  },
  {
    path: '/test/wallet/component',
    name: 'WalletTestComponent',
    component: () => import('@page/test/Test3_VueComponent.vue'),
    meta: {
      title: '测试3: Vue组件'
    }
  },
  {
    path: '/test/wallet/browser',
    name: 'WalletTestBrowser',
    component: () => import('@page/test/Test4_InternalBrowser.vue'),
    meta: {
      title: '测试4: 内嵌浏览器'
    }
  },
  {
    path: '/test/wallet/iframe',
    name: 'WalletTestIframe',
    component: () => import('@page/test/Test5_IframeBridge.vue'),
    meta: {
      title: '测试5: iframe桥接'
    }
  },
  {
    path: '/test/wallet/dapp',
    name: 'WalletTestDapp',
    component: () => import('@page/test/Test6_DappDetails.vue'),
    meta: {
      title: '测试6: Dapp详情页'
    }
  },
];
