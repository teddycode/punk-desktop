import limitOrder from "@/views/Transaction/limitOrder.vue";
import depositToken from "@/views/Transaction/depositToken.vue";
import myExchange from "@/views/Transaction/myExchange.vue";
import transactionPage from "@/views/Transaction/index.vue";
import tokenPage from "@/views/Transaction/tokenPage.vue";
import tradePage from "@/views/Transaction/myTrade.vue";
import orderPage from "@/views/Transaction/orderPage.vue";

let transactionRoutes = [
    {
        path: "index",
        name: "transactionPage",
        component: transactionPage,
    },
    {
        path: "myExchange",
        name: "myExchange",
        component: myExchange,
    },
    {
        path: "myToken",
        name: "myToken",
        component: tokenPage,
    },
    {
        path: "myTrade",
        name: "myTrade",
        component: tradePage,
    },
    {
        path: "limitOrder",
        name: "limitOrder",
        component: limitOrder,
    },
    {
        path: "myOrder",
        name: "myOrder",
        component: orderPage,
    },
    {
        path: "depositToken",
        name: "depositToken",
        component: depositToken,
    },
];

export {transactionRoutes};
