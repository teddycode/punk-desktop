import Lock from '@page/Lock.vue'
import Wizard from '@page/Wizard.vue'
//设置
import Splash from '@page/Splash.vue'
//import index from './index'
// 快捷键
import CreativeMarket from "@apps/shortcutKey/page/CreativeMarket.vue"

import main from './main/index'

const routes = [
    ...main,
    {
        path: '/lock',
        name: 'lock',
        component: Lock,
        children: []
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

export default routes
