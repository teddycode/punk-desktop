import MarketPage from '@page/core/Storage/offchainStorage/Market.vue';
import OrdersPage from '@page/core/Storage/offchainStorage/Orders.vue';
import ResourcePage from '@page/core/Storage/offchainStorage/Resource.vue';
import ThirdLayout from '@page/core/Layouts/ThirdLayout.vue';
import { CodeOutlined } from '@ant-design/icons-vue';

export default {
  path: 'storage',
  name: 'StoragePage',
  redirect: { name: 'MarketPage' },
  component: ThirdLayout,
  meta: {
    icon: CodeOutlined,
  },
  children: [
    {
      path: 'market',
      name: 'MarketPage',
      component: MarketPage,
      meta: {
        title: '链下存储区状态',
        icon: CodeOutlined,
      },
    },
    {
      path: 'orders',
      name: 'OrdersPage',
      component: OrdersPage,
      meta: {
        title: '链下存储区用户',
        icon: CodeOutlined,
      },
    },
    {
      path: 'resource',
      name: 'ResourcePage',
      component: ResourcePage,
      meta: {
        title: '链下存储区资源提供者',
        icon: CodeOutlined,
      },
    },
  ],
};
