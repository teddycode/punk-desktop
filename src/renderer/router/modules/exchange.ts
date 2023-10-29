import limitOrder from "@pages/Exchange/components/LimiOrder/index.vue";
import depositToken from "@pages/Exchange/components/DepositToken/index.vue";
import myExchange from "@pages/Exchange/components/MyExchange/index.vue";
import exchangePage from "@pages/Exchange/index.vue";
import tokenPage from "@pages/Exchange/components/TokenPage/index.vue";
import tradePage from "@pages/Exchange/components/Trade/index.vue";
import orderPage from "@pages/Exchange/components/OrderPage/index.vue";

export const exchangeRoutes = [
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

