import DetailsPage from '@page/core/Consensus/detail.vue';
import BasePage from '@page/core/Consensus/index.vue';
import myConsensus from '@page/core/Consensus/self.vue';
import { CodeOutlined } from '@ant-design/icons-vue';

export default {
  path: 'consensusHome',
  redirect: { name: 'ConsensusPage' },
  component: BasePage,
  meta: {
    icon: CodeOutlined,
  },
  children: [
    {
      path: '/consensus',
      name: 'ConsensusPage',
      component: DetailsPage,
      meta: {
        title: '共识',
        icon: CodeOutlined,
      },
    },
    {
      path: 'self',
      name: 'ConsensusSelf',
      meta: {
        title: '我的共识',
        icon: CodeOutlined,
      },
      component: myConsensus,
    },
  ],
};
