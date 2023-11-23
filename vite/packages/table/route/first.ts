import Lock from '@page/Lock.vue'
import Wizard from '@page/Wizard.vue'
//设置
import Splash from '@page/Splash.vue'
//import index from './index'
// 快捷键
import CreativeMarket from "@apps/shortcutKey/page/CreativeMarket.vue"

import MainLayout from "@page/MainLayout.vue";
import SecondRoutes from "./second.ts";
import {RouteRecordRaw} from "vue-router";

// 一級路由
export const routes: RouteRecordRaw[] = [
  {
    path: "/main",
    name: "main",
    component: MainLayout,
    children: SecondRoutes,
  },
  {
    path: '/lock',
    name: 'lock',
    component: Lock,
  },
  {
    path: '/splash',
    name: 'splash',
    component: Splash
  },
  {
    path: '/wizard',
    name: 'wizard',
    component: Wizard
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
  }
]

