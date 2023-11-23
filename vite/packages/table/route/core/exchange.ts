import limitOrder from "@page/core/Exchange/components/LimiOrder/index.vue";
import depositToken from "@page/core/Exchange/components/DepositToken/index.vue";
import myExchange from "@page/core/Exchange/components/MyExchange/index.vue";
import exchangePage from "@page/core/Exchange/index.vue";
import tokenPage from "@page/core/Exchange/components/TokenPage/index.vue";
import tradePage from "@page/core/Exchange/components/Trade/index.vue";
import orderPage from "@page/core/Exchange/components/OrderPage/index.vue";
import {CodeOutlined} from "@ant-design/icons-vue";
//  三级路由-交易组
export default {
  path: 'exchange',
  redirect: {name: "ExchangePage"},
  component: exchangePage,
  meta: {
    icon: CodeOutlined
  },
  children: [
    {
      path: "home",
      name: "ExchangePage",
      component: exchangePage,
      meta: {
        icon: CodeOutlined
      },
    },
    {
      path: "myExchange",
      name: "MyExchange",
      component: myExchange,
      meta: {
        icon: CodeOutlined
      },
    },
    {
      path: "myToken",
      name: "MyToken",
      component: tokenPage,
      meta: {
        icon: CodeOutlined
      },
    },
    {
      path: "myTrade",
      name: "MyTrade",
      component: tradePage,
      meta: {
        icon: CodeOutlined
      },
    },
    {
      path: "limitOrder",
      name: "LimitOrder",
      component: limitOrder,
      meta: {
        icon: CodeOutlined
      },
    },
    {
      path: "myOrder",
      name: "MyOrder",
      component: orderPage,
      meta: {
        icon: CodeOutlined
      },
    },
    {
      path: "depositToken",
      name: "DepositToken",
      component: depositToken,
      meta: {
        icon: CodeOutlined
      },
    },
  ],
}
;

