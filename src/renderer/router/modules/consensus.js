import consensusDetailsPage from "@/views/Consensus/details.vue";
import consensusHomePage from "@/views/Consensus/index.vue";
import consensusSelfPage from '@/views/Consensus/self.vue'

let consensusRoutes = [
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

export {consensusRoutes};
