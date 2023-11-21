import governancePage from "@page/core/Governance/index.vue";
import proposalHomePage from "@page/core/Governance/proposalHomePage.vue";
import RicardianContract from "@page/core/Governance/RicardianContract.vue";
import OneProposals from "@page/core/Governance/OneProposals.vue";
import EmergencyResponse from "@page/core/Governance/EmergencyResponse.vue";

export default [
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

