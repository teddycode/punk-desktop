import ThirdLayout from '@page/core/Layouts/ThirdLayout.vue';
import MultichainView from '@page/core/CrossChain/Multichain.vue';
import BridgeView from "@page/core/CrossChain/Bridge.vue";
import RelayView from '@page/core/CrossChain/Relay.vue';
import TransportView from '@page/core/CrossChain/Transport.vue';
import TransactionView from '@page/core/CrossChain/Transaction.vue';
import BlockView from '@page/core/CrossChain/Block.vue';
import ManagerView from "@page/core/CrossChain/Manager.vue";
import UserView from '@page/core/CrossChain/User.vue';
import CrossChainTasksView from '@page/core/CrossChain/CrossChainTasks.vue';
import CrossTasksCreatedView from '@page/core/CrossChain/CrossTasksCreated.vue';


import { CodeOutlined } from '@ant-design/icons-vue';

export default {
  path: 'crosschain',
  name: 'CrossChainPage',
  redirect: { name: 'Multichain' },
  component: ThirdLayout,
  meta: {
    icon: CodeOutlined,
  },
  children: [
    {
      path: '/multi',
      name: 'Multichain',
      component: MultichainView,
      meta: { title: '浏览器' },
    },
    {
      path: '/multi/bridge/:chain_id',
      name: 'Bridge',
      component: BridgeView,
      meta: { title: '跨链桥', noShow: true },
    },
    {
      path: '/relayer',
      name: 'Relay',
      component: RelayView,
      meta: { title: '跨链中继' }
    },
    // {
    //   path: '/transport',
    //   name: 'Transport',
    //   component: TransportView,
    //   meta: { title: '跨链传输' }
    // },
    {
      path: '/multi/tx/:tx_hash',
      name: 'Tx',
      component: TransactionView,
      meta: { title: '中继链交易', noShow: true }
    },
    {
      path: '/multi/block/:block_hash',
      name: 'Block',
      component: BlockView,
      meta: { title: '中继链区块', noShow: true }
    },
    {
      path: '/manager',
      name: 'Manager',
      component: ManagerView,
      meta: { title: '管理者' }
    },
    // {
    //   path: '/user',
    //   name: 'User',
    //   component: UserView,
    //   meta: { title: '用户中心' }
    // },
    {
      path: '/tasks',
      name: 'Tasks',
      component: CrossChainTasksView,
      meta: { title: '跨链任务' }
    },
    {
      path: '/tasks_created',
      name: 'TasksCreated',
      component: CrossTasksCreatedView,
      meta: { title: '已创建任务' }
    },
  ],
};
