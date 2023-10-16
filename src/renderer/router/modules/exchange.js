import limitOrder from "@/views/Exchange/limitOrder.vue";
import depositToken from "@/views/Exchange/depositToken.vue";
import myExchange from "@/views/Exchange/myExchange.vue";
import exchangePage from "@/views/Exchange/index.vue";
import tokenPage from "@/views/Exchange/tokenPage.vue";
import tradePage from "@/views/Exchange/myTrade.vue";
import orderPage from "@/views/Exchange/orderPage.vue";

let exchangeRoutes = [
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

export {exchangeRoutes};
