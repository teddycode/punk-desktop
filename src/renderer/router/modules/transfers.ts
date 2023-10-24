import TransferPage from "@pages/Transfers/TransferMain.vue";
import TransferRecord from "@pages/Transfers/TransferRecord.vue";

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
