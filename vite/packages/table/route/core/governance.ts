import governancePage from '@page/core/Governance/index.vue';
import proposalHomePage from '@page/core/Governance/proposalHomePage.vue';
import RicardianContract from '@page/core/Governance/RicardianContract.vue';
import OneProposals from '@page/core/Governance/OneProposals.vue';
import EmergencyResponse from '@page/core/Governance/EmergencyResponse.vue';
import MainBackground from '@page/core/components/MainBackground.vue';
import TreasuryPage from "@page/core/Governance_v1/Treasury.vue";
import ProposalListPage from "@page/core/Governance_v1/ProposalList.vue";
import ProposalPage from "@page/core/Governance_v1/Proposal.vue";
import CreateProposalPage from "@page/core/Governance_v1/CreateProposal.vue";
import StakePage from "@page/core/Governance_v1/Stake.vue";
import { CodeOutlined } from '@ant-design/icons-vue';
import ThirdLayout from "@page/core/Layouts/ThirdLayout.vue";

// 三级路由-治理组
export default {
  path: 'governance',
  redirect: { name: 'GovernancePage' },
  component: ThirdLayout,
  meta: {
    icon: CodeOutlined,
  },
  children: [
    {
      path: 'ProposalList',
      name: 'GovernancePage',
      component: ProposalListPage,
      meta: {
        title: '提案',
        icon: CodeOutlined,
      },
    },
    {
      path: '/proposal/:id',
      name: 'Proposal',
      component: ProposalPage,
      meta: {
        title: '提案详情',
        icon: CodeOutlined,
        noShow: true,
      },
    },
    {
      path: 'CreateProposal',
      name: 'CreateProposal',
      component: CreateProposalPage,
      meta: {
        title: '创建提案',
        icon: CodeOutlined,
        noShow: true,
      },
    },
    {
      path: 'GovernanceStake',
      name: 'GovernanceStakePage',
      component: StakePage,
      meta: {
        title: '质押',
        icon: CodeOutlined,
      },
    },
    {
      path: 'Treasury',
      name: 'TreasuryPage',
      component: TreasuryPage,
      meta: {
        title: '国库',
        icon: CodeOutlined,
      },
    },
  ],
};
// export default {
//   path: 'governance',
//   redirect: { name: 'GovernancePage' },
//   component: MainBackground,
//   meta: {
//     icon: CodeOutlined,
//   },
//   children: [
//     {
//       path: 'index',
//       name: 'GovernancePage',
//       component: governancePage,
//       meta: {
//         icon: CodeOutlined,
//       },
//     },
//     {
//       path: 'proposal',
//       name: 'ProposalHomePage',
//       component: proposalHomePage,
//       meta: {
//         icon: CodeOutlined,
//       },
//     },
//     {
//       path: 'ricardianContract',
//       name: 'RicardianContract',
//       component: RicardianContract,
//       meta: {
//         icon: CodeOutlined,
//       },
//     },
//     {
//       path: 'oneProposals',
//       name: 'OneProposals',
//       component: OneProposals,
//       meta: {
//         icon: CodeOutlined,
//       },
//     },
//     {
//       path: 'emergencyResponse',
//       name: 'EmergencyResponse',
//       component: EmergencyResponse,
//       meta: {
//         icon: CodeOutlined,
//       },
//     },
//   ],
// };
