import limitOrder from '@page/core/Exchange/components/LimitOrder.vue';
import depositToken from '@page/core/Exchange/components/DepositToken.vue';
import myExchange from '@page/core/Exchange/components/MyExchange.vue';
import exchangePage from '@page/core/Exchange/index.vue';
import tokenPage from '@page/core/Exchange/components/TokenPage.vue';
import tradePage from '@page/core/Exchange/components/Trade.vue';
import orderPage from '@page/core/Exchange/components/OrderPage.vue';
import { CodeOutlined } from '@ant-design/icons-vue';
import BaseLayout2 from '../../page/core/Layouts/BaseLayout2.vue';
//  三级路由-交易组
export default {
  path: 'exchange',
  redirect: { name: 'ExchangePage' },
  component: BaseLayout2,
  meta: {
    icon: CodeOutlined,
  },
  children: [
    {
      path: 'home',
      name: 'ExchangePage',
      component: exchangePage,
      meta: {
        icon: CodeOutlined,
      },
    },
    {
      path: 'myExchange',
      name: 'MyExchange',
      component: myExchange,
      meta: {
        icon: CodeOutlined,
      },
    },
    {
      path: 'myToken',
      name: 'MyToken',
      component: tokenPage,
      meta: {
        icon: CodeOutlined,
      },
    },
    {
      path: 'myTrade',
      name: 'MyTrade',
      component: tradePage,
      meta: {
        icon: CodeOutlined,
      },
    },
    {
      path: 'limitOrder',
      name: 'LimitOrder',
      component: limitOrder,
      meta: {
        icon: CodeOutlined,
      },
    },
    {
      path: 'myOrder',
      name: 'MyOrder',
      component: orderPage,
      meta: {
        icon: CodeOutlined,
      },
    },
    {
      path: 'depositToken',
      name: 'DepositToken',
      component: depositToken,
      meta: {
        icon: CodeOutlined,
      },
    },
  ],
};
