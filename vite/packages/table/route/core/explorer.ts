import Explorer from '../../page/core/Explorer/index.vue';
import SecondLayout from '../../page/core/Layouts/SecondLayout.vue';
import BlockList from '../../page/core/Explorer/BlockList.vue';
import TransactionList from '../../page/core/Explorer/TransactionList.vue';
import BlockInfo from '../../page/core/Explorer/BlockInfo.vue';
import TransactionInfo from '../../page/core/Explorer/TransactionInfo.vue';
// 区块链浏览器区路由

export default {
  path: 'Explorer',
  component: SecondLayout,
  children: [
    {
      path: 'Blockchain/index',
      name: 'Explorer',
      component: Explorer,
    },
    {
      path: 'Blockchain/BlockList', // 新的路由路径
      name: 'BlockList', // 路由名称
      component: BlockList, // 对应的组件
    },
    {
      path: 'Blockchain/TransactionList', // 新的路由路径
      name: 'TransactionList', // 路由名称
      component: TransactionList, // 对应的组件
    },
    {
      path: 'Blockchain/BlockInfo/:number', // 新的路由路径
      name: 'BlockInfo', // 路由名称
      component: BlockInfo, // 对应的组件
      props: true,
    },
    {
      path: 'Blockchain/TransactionInfo/:txnHash', // 新的路由路径
      name: 'TransactionInfo', // 路由名称
      component: TransactionInfo, // 对应的组件
      props: true,
    },
  ],
};
