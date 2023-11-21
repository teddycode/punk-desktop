import consensusDetailsPage from "@page/core/Consensus/details.vue";
import consensusHomePage from "@page/core/Consensus/index.vue";
import consensusSelfPage from '@page/core/Consensus/self.vue'

export default [
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
