import TransferPage from "@page/core/Transfers/index.vue";
import TransferRecord from "@page/core/Transfers/componnets/TransferRecord.vue";

export default [
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
