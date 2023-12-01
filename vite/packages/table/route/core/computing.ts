import HomePage from '@page/core/Computing/index.vue';
import { CodeOutlined, FileOutlined } from '@ant-design/icons-vue';

//  三级路由-计算组
export default {
  path: 'computing',
  redirect: { name: 'ComputingHomePage' },
  component: HomePage,
  meta: {
    icon: CodeOutlined,
  },
  children: [
    {
      path: 'index',
      name: 'ComputingHomePage',
      component: HomePage,
      meta: {
        icon: FileOutlined,
        title: '首页',
      },
    },
    //   添加子路由
  ],
};
