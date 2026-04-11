import UserSettingsPage from '@page/core/userSettings/index.vue';
import ThirdLayout from '@page/core/Layouts/ThirdLayout.vue';
import { AuditOutlined, FileOutlined } from '@ant-design/icons-vue';

// 三级路由 - 用户设置
export default {
  path: 'userSettings',
  name: 'userSettings',
  component: ThirdLayout,
  redirect: { name: 'UserSettingsPage' },
  meta: {
    icon: AuditOutlined,
  },
  children: [
    {
      path: 'index',
      name: 'UserSettingsPage',
      component: UserSettingsPage,
      meta: {
        icon: FileOutlined,
        title: '权限设置',
      },
    },
  ],
};