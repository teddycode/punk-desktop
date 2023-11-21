import limitOrder from "@page/core/Exchange/components/LimiOrder/index.vue";
import depositToken from "@page/core/Exchange/components/DepositToken/index.vue";
import myExchange from "@page/core/Exchange/components/MyExchange/index.vue";
import exchangePage from "@page/core/Exchange/index.vue";
import tokenPage from "@page/core/Exchange/components/TokenPage/index.vue";
import tradePage from "@page/core/Exchange/components/Trade/index.vue";
import orderPage from "@page/core/Exchange/components/OrderPage/index.vue";

export default [
  {
    path: "index",
    name: "ExchangePage",
    component: exchangePage,
  },
  {
    path: "myExchange",
    name: "MyExchange",
    component: myExchange,
  },
  {
    path: "myToken",
    name: "MyToken",
    component: tokenPage,
  },
  {
    path: "myTrade",
    name: "MyTrade",
    component: tradePage,
  },
  {
    path: "limitOrder",
    name: "LimitOrder",
    component: limitOrder,
  },
  {
    path: "myOrder",
    name: "MyOrder",
    component: orderPage,
  },
  {
    path: "depositToken",
    name: "DepositToken",
    component: depositToken,
  },
];

