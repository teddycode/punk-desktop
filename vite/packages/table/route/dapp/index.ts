import computing from '../core/computing'
import consensus from '../core/consensus'
import crypto from '../core/crypto'
import exchange from '../core/exchange'
import governance from '../core/governance'
import network from '../core/network'
import socialNet from '../core/socialNet'
import transfer from '../core/transfers'
import collection from '../core/collection'
import dappHome from '@page/dapp/index.vue'
import walletHome from '@page/wallet/index.vue'
import coreFuncApp from "@page/core/App.vue";

export default [
  {   // 其他Dapp区功能路由
    path: "/dapps",
    name: "dapps",
    component: dappHome,
    children: [],
  },
  {   // 钱包区路由
    path: "/wallet",
    name: "wallet",
    component: walletHome,
    children: [],
  },
  {   // 系统核心功能区路由
    path: "/core",
    name: "core",
    component: coreFuncApp,
    children: [
      ...computing,
      ...consensus,
      ...crypto,
      ...exchange,
      ...governance,
      ...network,
      ...socialNet,
      ...transfer,
      ...collection,
    ],
  },
];
