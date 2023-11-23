import networkPage from "@page/core/Network/index.vue";
import {CodeOutlined} from "@ant-design/icons-vue";

export default {
  path: "network",
  redirect: {name: "NetworkPage"},
  component: networkPage, meta: {
    icon: CodeOutlined
  },
  children: [
    {
      path: "index",
      name: "NetworkPage",
      component: networkPage, meta: {
        icon: CodeOutlined
      },
    }
  ]
};

