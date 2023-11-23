import DetailsPage from "@page/core/Consensus/details.vue";
import HomePage from "@page/core/Consensus/index.vue";
import SelfPage from '@page/core/Consensus/self.vue'
import {CodeOutlined} from "@ant-design/icons-vue";

export default {
  path: "consensus",
  redirect: {name: "ConsensusHomePage"},
  component: HomePage,
  meta: {
    icon: CodeOutlined
  },
  children: [
    {
      path: "index",
      name: "ConsensusHomePage",
      component: HomePage,
      meta: {
        icon: CodeOutlined
      }
    },
    {
      path: "details",
      name: "ConsensusDetails",
      component: DetailsPage,
      meta: {
        icon: CodeOutlined
      }
    },
    {
      path: "self",
      name: "ConsensusSelf",
      meta: {
        title: "我的共识",
        icon: CodeOutlined
      },
      component: SelfPage,
    },
  ]
}


