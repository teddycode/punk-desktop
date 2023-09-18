import governancePage from "@/views/Governance/index.vue";
import proposalHomePage from "@/views/Governance/proposalHomePage.vue";
import RicardianContract from "@/views/Governance/RicardianContract.vue";
import OneProposals from "@/views/Governance/OneProposals.vue";
import EmergencyResponse from "@/views/Governance/EmergencyResponse.vue";

let governanceRoutes = [
    {
        path: "index",
        name: "GovernancePage",
        component: governancePage,
    },
    {
        path: "proposal",
        name: "ProposalHomePage",
        component: proposalHomePage,
    },
    {
        path: "ricardianContract",
        name: "RicardianContract",
        component: RicardianContract,
    },
    {
        path: "oneProposals",
        name: "OneProposals",
        component: OneProposals,
    },
    {
        path: "emergencyResponse",
        name: "EmergencyResponse",
        component: EmergencyResponse,
    },
];

export {governanceRoutes};
