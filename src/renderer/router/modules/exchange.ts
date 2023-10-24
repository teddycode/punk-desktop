import limitOrder from "@pages/Exchange/limitOrder.vue";
import depositToken from "@pages/Exchange/depositToken.vue";
import myExchange from "@pages/Exchange/myExchange.vue";
import exchangePage from "@pages/Exchange/index.vue";
import tokenPage from "@pages/Exchange/tokenPage.vue";
import tradePage from "@pages/Exchange/myTrade.vue";
import orderPage from "@pages/Exchange/orderPage.vue";

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

