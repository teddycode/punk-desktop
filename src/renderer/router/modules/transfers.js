import TransferPage from "@/views/Transfers/TransferMain.vue";
import TransferRecord from "@/views/Transfers/TransferRecord.vue";

let transferRoutes = [
    {
        path: "index",
        name: "TransferPage",
        component: TransferPage,
    },
    {
        path: "record",
        name: "TransferRecord",
        component: TransferRecord,
    },
];

export {transferRoutes};
