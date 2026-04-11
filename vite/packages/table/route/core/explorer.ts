import Explorer from '../../page/core/Explorer/index.vue';
import ThirdLayout from '../../page/core/Layouts/ThirdLayout.vue';
import BlockList from '../../page/core/Explorer/BlockList.vue';
import TransactionList from '../../page/core/Explorer/TransactionList.vue';
import BlockInfo from '../../page/core/Explorer/BlockInfo.vue';
import TransactionInfo from '../../page/core/Explorer/TransactionInfo.vue';
import AccountInfo from '../../page/core/Explorer/AccountInfo.vue';
import { AppstoreOutlined, DatabaseOutlined, SwapOutlined, SearchOutlined } from '@ant-design/icons-vue';

// 区块链浏览器区路由

export default {
  path: 'Explorer',
  redirect: { name: 'Explorer' },
  component: ThirdLayout,
  meta: {
    icon: SearchOutlined,
  },
  children: [
    {
      path: 'Blockchain/index',
      name: 'Explorer',
      component: Explorer,
      meta: {
        title: '概览',
        icon: AppstoreOutlined,
      },
    },
    {
      path: 'Blockchain/BlockList', // 新的路由路径
      name: 'BlockList', // 路由名称
      component: BlockList, // 对应的组件
      meta: {
        title: '区块',
        icon: DatabaseOutlined,
      },
    },
    {
      path: 'Blockchain/TransactionList', // 新的路由路径
      name: 'TransactionList', // 路由名称
      component: TransactionList, // 对应的组件
      meta: {
        title: '交易',
        icon: SwapOutlined,
      },
    },
    {
      path: 'Blockchain/BlockInfo/:number', // 新的路由路径
      name: 'BlockInfo', // 路由名称
      component: BlockInfo, // 对应的组件
      props: true,
      meta: {
        title: '区块详情',
        noShow: true,
      },
    },
    {
      path: 'Blockchain/TransactionInfo/:txnHash', // 新的路由路径
      name: 'TransactionInfo', // 路由名称
      component: TransactionInfo, // 对应的组件
      props: true,
      meta: {
        title: '交易详情',
        noShow: true,
      },
    },
    {
      path: 'Blockchain/AccountInfo/:address',
      name: 'AccountInfo',
      component: AccountInfo,
      props: true,
      meta: {
        title: '账户详情',
        noShow: true,
      },
    },
  ],
};
