import governancePage from "@pages/Governance/index.vue";
import proposalHomePage from "@pages/Governance/proposalHomePage.vue";
import RicardianContract from "@pages/Governance/RicardianContract.vue";
import OneProposals from "@pages/Governance/OneProposals.vue";
import EmergencyResponse from "@pages/Governance/EmergencyResponse.vue";

export const governanceRoutes = [
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

