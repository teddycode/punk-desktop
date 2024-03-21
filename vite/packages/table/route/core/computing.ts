import HomePage from '@page/core/Computing/index.vue';
import { CodeOutlined, FileOutlined } from '@ant-design/icons-vue';
import ThirdLayout from '@page/core/Layouts/ThirdLayout.vue';

//  三级路由-计算组
export default {
  path: 'computing',
  redirect: { name: 'ComputingPage' },
  component: ThirdLayout,
  meta: {
    icon: CodeOutlined,
  },
  children: [
    {
      path: 'index',
      name: 'LightComputingPage',
      component: HomePage,
      meta: {
        icon: FileOutlined,
        title: '首页',
      },
    },
    //   添加子路由
  ],
};
