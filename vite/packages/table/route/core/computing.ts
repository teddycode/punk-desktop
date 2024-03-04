import HomePage from '@page/core/Computing/index.vue';
import { CodeOutlined, FileOutlined } from '@ant-design/icons-vue';
import BaseLayout from "../../page/core/Layouts/BaseLayout.vue";

//  三级路由-计算组
export default {
  path: 'computing',
  redirect: { name: 'ComputingPage' },
  component: BaseLayout,
  meta: {
    icon: CodeOutlined,
  },
  children: [
    {
      path: 'index',
      name: 'ComputingPage',
      component: HomePage,
      meta: {
        icon: FileOutlined,
        title: '首页',
      },
    },
    //   添加子路由
  ],
};
