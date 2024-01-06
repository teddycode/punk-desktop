import DetailsPage from '@page/core/Consensus/detail.vue';
import ThirdLayout from '@page/core/Layouts/ThirdLayout.vue';
import myConsensus from '@page/core/Consensus/self.vue';
import nodeManager from '@page/core/Consensus/node.vue';
import { CodeOutlined } from '@ant-design/icons-vue';

export default {
  path: 'consensusHome',
  redirect: { name: 'ConsensusPage' },
  component: ThirdLayout,
  meta: {
    icon: CodeOutlined,
  },
  children: [
    {
      path: '/consensus',
      name: 'ConsensusPage',
      component: DetailsPage,
      meta: {
        title: '共识概览',
        icon: CodeOutlined,
      },
    },
    {
      path: '/self',
      name: 'ConsensusSelf',
      meta: {
        title: '我的共识',
        icon: CodeOutlined,
      },
      component: myConsensus,
    },
    {
      path: '/node',
      name: 'ConsensusNode',
      meta: {
        title: '我的节点',
        icon: CodeOutlined,
      },
      component: nodeManager,
    },
  ],
};
