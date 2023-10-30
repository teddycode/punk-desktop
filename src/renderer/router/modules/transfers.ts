import TransferPage from "@pages/Transfers/index.vue";
import TransferRecord from "@pages/Transfers/componnets/TransferRecord.vue";

export const transferRoutes: any[] = [
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
