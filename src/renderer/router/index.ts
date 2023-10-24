import {createRouter, createWebHashHistory} from "vue-router";
import {transferRoutes} from "./modules/transfers";
import {usersRoutes} from "./modules/users";
import {storageRoutes} from "./modules/storage";
import {computingRoutes} from "./modules/computing";
import {consensusRoutes} from "./modules/consensus";
import {governanceRoutes} from "./modules/governance";
import {exchangeRoutes} from "./modules/exchange";
import {networkRoutes} from "./modules/network";
import {collectionRoutes} from "./modules/collection";
import {cryptoRoutes} from "./modules/crypto";
import {desktopRoutes} from "./modules/desktop";
import {homeRoutes} from "./modules/home";

const routerMap = [
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
    path: "/exchange",
    name: "Exchange",
    redirect: '/exchange/index',
    children: exchangeRoutes,
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


export default createRouter({
  history: createWebHashHistory(),
  routes: routerMap
})
