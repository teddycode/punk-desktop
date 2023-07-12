import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import myStorage from "@/views/myStorage.vue";
import myTransfer from "@/views/myTransfer.vue";
import myCalculation from "@/views/myCalculation.vue";
import myConsensus from "@/views/myConsensus.vue";
import myGovernance from "@/views/myGovernance.vue";
import myTransaction from "@/views/myTransaction.vue";
import myAbout from "@/views/myAbout.vue";
import myNetwork from "@/views/myNetwork.vue";
import myCollection from "@/views/myCollection.vue";
import myTrade from "@/views/Transactions/myTrade.vue";
import myExchange from "@/views/Transactions/myExchange.vue";
import myToken from "@/views/Transactions/myToken.vue";
import myLogin from "@/views/myLogin.vue";
import TransferMain from "@/views/Transfers/TransferMain.vue";
import TransferRecord from "@/views/Transfers/TransferRecord.vue";
import CollectionDetails from "@/views/Collections/CollectionDetails.vue";


const routes = [
    {
        path: '/',
        name: 'HomePage',
        component: HomePage,
    },
    {
        path: '/myAbout',
        name: 'myAbout',
        component: myAbout,
    },
    {
        path: '/myLogin',
        name: 'myLogin',
        component: myLogin,
    },
    {
        path: '/myStorage',
        name: 'myStorage',
        component: myStorage,
    },
    {
        path: '/myTransfer',
        name: 'myTransfer',
        component: myTransfer,
        children: [
            {
                path:'',
                name:'myTransfer',
                component:TransferMain,
            },
            {
                path:'TransferMain',
                name:'TransferMain',
                component:TransferMain,
            },
            {
                path:'TransferRecord',
                name:'TransferRecord',
                component:TransferRecord,
            },
        ]
    },
    {
        path: '/myCalculation',
        name: 'myCalculation',
        component: myCalculation,
    },
    {
        path: '/myConsensus',
        name: 'myConsensus',
        component: myConsensus,
    },
    {
        path: '/myGovernance',
        name: 'myGovernance',
        component: myGovernance,
    },
    {
        path: '/myTransaction',
        name: 'myTransaction',
        component: myTransaction,
        children:[
            {
                path:'',
                name:'myTransaction',
                component:myExchange,
            },
            {
                path:'myExchange',
                name:'myExchange',
                component:myExchange,
            },
            {
                path:'myToken',
                name:'myToken',
                component:myToken,
            },

            {
                path:'myTrade',
                name:'myTrade',
                component:myTrade,
            },
        ]
    },
    {
        path: '/myNetwork',
        name: 'myNetwork',
        component: myNetwork
    },
    {
        path: '/myCollection',
        name: 'myCollection',
        component: myCollection,
    },
    {
        path: '/CollectionDetails/:name',
        name: 'CollectionDetails',
        component: CollectionDetails
    },

    // 其他路由配置
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
