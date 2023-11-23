import governancePage from "@page/core/Governance/index.vue";
import proposalHomePage from "@page/core/Governance/proposalHomePage.vue";
import RicardianContract from "@page/core/Governance/RicardianContract.vue";
import OneProposals from "@page/core/Governance/OneProposals.vue";
import EmergencyResponse from "@page/core/Governance/EmergencyResponse.vue";
import {CodeOutlined} from "@ant-design/icons-vue";

// 三级路由-治理组
export default {
  path: 'governance',
  redirect: {name: "GovernancePage"},
  component: governancePage,
  meta: {
    icon: CodeOutlined
  },
  children: [
    {
      path: "index",
      name: "GovernancePage",
      component: governancePage, meta: {
        icon: CodeOutlined
      },
    },
    {
      path: "proposal",
      name: "ProposalHomePage",
      component: proposalHomePage, meta: {
        icon: CodeOutlined
      },
    },
    {
      path: "ricardianContract",
      name: "RicardianContract",
      component: RicardianContract, meta: {
        icon: CodeOutlined
      },
    },
    {
      path: "oneProposals",
      name: "OneProposals",
      component: OneProposals, meta: {
        icon: CodeOutlined
      },
    },
    {
      path: "emergencyResponse",
      name: "EmergencyResponse",
      component: EmergencyResponse, meta: {
        icon: CodeOutlined
      },
    },
  ]
}

