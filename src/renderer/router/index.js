import {createRouter, createWebHistory} from "vue-router";
import {transferRoutes} from "./modules/transfers";
import {usersRoutes} from "@/router/modules/users";
import {storageRoutes} from "@/router/modules/storage";
import {computingRoutes} from "@/router/modules/computing";
import {consensusRoutes} from "@/router/modules/consensus";
import {governanceRoutes} from "@/router/modules/governance";
import {transactionRoutes} from "@/router/modules/transaction";
import {networkRoutes} from "@/router/modules/network";
import {collectionRoutes} from "@/router/modules/collection";
import {cryptoRoutes} from "@/router/modules/crypto";
import {desktopRoutes} from "@/router/modules/desktop";
import {homeRoutes} from "@/router/modules/home";

const routes = [
    {
        path: "/",
        name: "Index",
        redirect: "/home",
        children: homeRoutes,
    },
    {
        path: "/users",
        name: 'Users',
        redirect: '/users/index',
        children: usersRoutes,
    },
    {
        path: "/transfer",
        name: 'Transfer',
        redirect: '/transfer/index',
        children: transferRoutes,
    },
    {
        path: "/storage",
        name: "Storage",
        redirect: '/storage/index',
        children: storageRoutes,
    },
    {
        path: "/computing",
        name: "Computing",
        redirect: '/computing/index',
        children: computingRoutes,
    },
    {
        path: "/consensus",
        name: "Consensus",
        redirect: '/consensus/index',
        children: consensusRoutes,
    },
    {
        path: "/governance",
        name: "Governance",
        redirect: '/governance/index',
        children: governanceRoutes,
    },
    {
        path: "/transaction",
        name: "Transaction",
        redirect: '/transaction/index',
        children: transactionRoutes,
    },
    {
        path: "/network",
        name: "Network",
        redirect: "/network/index",
        children: networkRoutes,
    },
    {
        path: "/collection",
        name: "Collection",
        redirect: "/collection/index",
        children: collectionRoutes,
    },
    {
        path: "/crypto",
        name: "Crypto",
        redirect: '/crypto/index',
        children: cryptoRoutes,
    },
    {
        path: '/desktop',
        name: 'Desktop',
        redirect: '/desktop/index',
        children: desktopRoutes,
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
//TODO afterEach监听二级页面导航，实现功能下小界面的保存与跳转。
