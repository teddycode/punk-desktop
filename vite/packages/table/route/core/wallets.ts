import wallets from '../../page/core/Wallets/index.vue';
import ThirdLayout from '../../page/core/Layouts/ThirdLayout.vue';
import { CodeOutlined } from '@ant-design/icons-vue';

// 钱包区路由
export default {
  path: 'wallets',
  name: 'wallets',
  component: ThirdLayout,
  children: [
    {
      path: 'index',
      name: 'myWallets',
      component: wallets,
      meta: {
        title: '我的钱包资产',
        icon: CodeOutlined,
      },
    },
  ],
};
