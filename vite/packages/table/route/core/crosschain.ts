import ThirdLayout from '@page/core/Layouts/ThirdLayout.vue';
import MultichainView from '@page/core/CrossChain/Multichain.vue';
import BridgeView from "@page/core/CrossChain/Bridge.vue";
import RelayView from '@page/core/CrossChain/Relay.vue';
import TransportView from '@page/core/CrossChain/Transport.vue';
import TransactionView from '@page/core/CrossChain/Transaction.vue';
import BlockView from '@page/core/CrossChain/Block.vue';
import ManagerView from "@page/core/CrossChain/Manager.vue";

import { CodeOutlined } from '@ant-design/icons-vue';

export default {
  path: 'crosschain',
  redirect: { name: 'CrossChainPage' },
  component: ThirdLayout,
  meta: {
    icon: CodeOutlined,
  },
  children: [
    {
      path: '/crosschain/index',
      name: 'CrossChainPage',
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
      path: '/relay',
      name: 'Relay',
      component: RelayView,
      meta: { title: '跨链中继' }
    },
    {
      path: '/multi/tx/:tx_hash',
      name: 'Tx',
      component: TransportView,
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
      meta: { title: '跨链管理' },
      //component: () => import('../views/Address.vue')
      component: ManagerView
    },
    {
      path: '/transport',
      name: 'Transport',
      component: TransportView,
      meta: { title: '跨链传输' }
    },
  ],
};
