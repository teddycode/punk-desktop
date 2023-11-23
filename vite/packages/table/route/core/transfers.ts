import TransferPage from "@page/core/Transfers/index.vue";
import TransferRecord from "@page/core/Transfers/componnets/TransferRecord.vue";
import {CodeOutlined} from "@ant-design/icons-vue";

export default {
  path: "transfer",
  redirect: {name: "TransferPage"},
  component: TransferPage, meta: {
    icon: CodeOutlined
  },
  children: [
    {
      path: "index",
      name: "TransferPage",
      component: TransferPage, meta: {
        icon: CodeOutlined
      },
    },
    {
      path: "record",
      name: "TransferRecord",
      component: TransferRecord, meta: {
        icon: CodeOutlined
      },
    },
  ]
};
