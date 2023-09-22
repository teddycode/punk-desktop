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
        name: "TransactionPage",
        component: transactionPage,
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

export {transactionRoutes};
