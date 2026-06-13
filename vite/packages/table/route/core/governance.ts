import TreasuryPage from "@page/core/Governance_v1/Treasury.vue";
import GovernanceHomePage from "@page/core/Governance_v1/Home.vue";
import ProposalsPage from "@page/core/Governance_v1/Proposals.vue";
import ParameterProposalDetailPage from "@page/core/Governance_v1/ProposalDetail.vue";
import UpgradeProposalDetailPage from "@page/core/Governance_v1/UpgradeProposalDetail.vue";
import CreateProposalPage from "@page/core/Governance_v1/CreateProposal.vue";
import StakePage from "@page/core/Governance_v1/Stake.vue";
import SystemSpecialTransactionPage from "@page/core/Governance_v1/SystemSpecialTransaction.vue";
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
      path: 'index',
      name: 'GovernancePage',
      component: GovernanceHomePage,
      meta: {
        title: '治理',
        icon: CodeOutlined,
      },
    },
    {
      path: 'ProposalList',
      name: 'GovernanceProposals',
      component: ProposalsPage,
      meta: {
        title: '提案',
        icon: CodeOutlined,
      },
    },
    {
      path: 'proposal/:id',
      name: 'Proposal',
      redirect: (to) => ({ name: 'ParameterProposalDetail', params: to.params }),
      meta: {
        title: '提案详情',
        icon: CodeOutlined,
        noShow: true,
      },
    },
    {
      path: 'proposal/parameter/:id',
      name: 'ParameterProposalDetail',
      component: ParameterProposalDetailPage,
      meta: {
        title: '参数提案详情',
        icon: CodeOutlined,
        noShow: true,
      },
    },
    {
      path: 'proposal/upgrade/:id',
      name: 'UpgradeProposalDetail',
      component: UpgradeProposalDetailPage,
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
    {
      path: 'SystemSpecialTransaction',
      name: 'SystemSpecialTransactionPage',
      component: SystemSpecialTransactionPage,
      meta: {
        title: '系统特殊交易',
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

