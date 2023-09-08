import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../views/HomePage.vue";
import myStorage from "@/views/myStorage.vue";
import myTransfer from "@/views/myTransfer.vue";
import myCalculation from "@/views/myCalculation.vue";
import myConsensus from "@/views/Consensus/myConsensus.vue";
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

import SignUp from "@/views/SignUp.vue";
import AdminPage from "@/views/AdminPage.vue";
import limitOrder from "@/views/Transactions/limitOrder.vue";
import myOrder from "@/views/Transactions/myOrder.vue";
import depositToken from "@/views/Transactions/depositToken.vue";

import FileEdit from "@/views/localFileManage/FileEdit.vue";
// 治理
import myGovernance from "@/views/myGovernance.vue";
import OneProposals from "@/views/Governances/OneProposals.vue";
import NewProposal from "@/views/Governances/newProposal.vue";
import EmergencyResponse from "@/views/Governances/EmergencyResponse.vue";
import proposalHomePage from "@/views/Governances/proposalHomePage.vue";
import RicardianContract from "@/views/Governances/RicardianContract.vue";
// 密码组
import CryptoPage from "@/views/Crypto/CryptoPage.vue";




const routes = [
  {
    path: "/",
    name: "HomePage",
    component: HomePage,
  },
  {
    path: "/myAbout",
    name: "myAbout",
    component: myAbout,
  },
  {
    path: "/myLogin",
    name: "myLogin",
    component: myLogin,
  },
  {
    path: "/SignUp",
    name: "SignUp",
    component: SignUp,
  },
  {
    path: "/myStorage",
    name: "myStorage",
    component: myStorage,
  },
  {
    path: "/myTransfer",
    name: "myTransfer",
    component: myTransfer,
    children: [
      {
        path: "",
        name: "myTransfer",
        component: TransferMain,
      },
      {
        path: "TransferMain",
        name: "TransferMain",
        component: TransferMain,
      },
      {
        path: "TransferRecord",
        name: "TransferRecord",
        component: TransferRecord,
      },
    ],
  },
  {
    path: "/myCalculation",
    name: "myCalculation",
    component: myCalculation,
  },
  {
    path: "/Consensus",
    name: "myConsensus",
    component: myConsensus,
    children: [
      {
        path: "/consensus",
        name: "consensus",
        meta: {
          title: "共识",
        },
        component: () =>
          import(
            /* webpackChunkName: "consensus" */ "../views/Consensus/Consensus.vue"
          ),
      },
      {
        path: "/myConsensus",
        name: "myConsensus",
        meta: {
          title: "我的共识",
        },
        component: () =>
          import(
            /* webpackChunkName: "consensus" */ "../views/Consensus/SelfConsensus.vue"
          ),
      },
    ],
  },
  {
    path: "/myGovernance",
    name: "myGovernance",
    component: myGovernance,
  },
  {
    path: "/Governances/proposalHomePage",
    name: "proposalHomePage",
    component: proposalHomePage,
  },
  {
    path: "/Governances/RicardianContract",
    name: "RicardianContract",
    component: RicardianContract,
  },
  {
    path: "/Governances/OneProposals",
    name: "OneProposals",
    component: OneProposals,
  },
  {
    path: "/Governances/newProposal",
    name: "NewProposal",
    component: NewProposal,
  },
  {
    path: "/Governances/EmergencyResponse",
    name: "EmergencyResponse",
    component: EmergencyResponse,
  },
  {
    path: "/myTransaction",
    name: "myTransaction",
    component: myTransaction,
    children: [
      {
        path: "",
        name: "myTransaction",
        component: myExchange,
      },
      {
        path: "myExchange",
        name: "myExchange",
        component: myExchange,
      },
      {
        path: "myToken",
        name: "myToken",
        component: myToken,
      },
      {
        path: "myTrade",
        name: "myTrade",
        component: myTrade,
      },
      {
        path: "limitOrder",
        name: "limitOrder",
        component: limitOrder,
      },
      {
        path: "myOrder",
        name: "myOrder",
        component: myOrder,
      },
      {
        path: "depositToken",
        name: "depositToken",
        component: depositToken,
      },
    ],
  },
  {
    path: "/myNetwork",
    name: "myNetwork",
    component: myNetwork,
  },
  {
    path: "/myCollection",
    name: "myCollection",
    component: myCollection,
  },
  {
    path: "/CollectionDetails/:name",
    name: "CollectionDetails",
    component: CollectionDetails,
  },
  {
    path: "/AdminPage",
    name: "AdminPage",
    component: AdminPage,
  },
  {
    path: "/FileEdit",
    name: "FileEdit",
    component: FileEdit,
  },
  // 其他路由配置
  // 密码组
  {
    path: "/Crypto",
    name: "Crypto",
    component: CryptoPage,
  },

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
//TODO afterEach监听二级页面导航，实现功能下小界面的保存与跳转。
