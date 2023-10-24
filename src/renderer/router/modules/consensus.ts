import consensusDetailsPage from "@pages/Consensus/details.vue";
import consensusHomePage from "@pages/Consensus/index.vue";
import consensusSelfPage from '@pages/Consensus/self.vue'

export const consensusRoutes = [
  {
    path: "/index",
    name: "ConsensusPage",
    meta: {
      title: "共识",
    },
    component: consensusHomePage,
  },
  {
    path: "/details",
    name: "ConsensusDetails",
    component: consensusDetailsPage,
  },
  {
    path: "/self",
    name: "ConsensusSelf",
    meta: {
      title: "我的共识",
    },
    component: consensusSelfPage,
  },
];
