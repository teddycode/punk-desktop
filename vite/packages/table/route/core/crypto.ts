import CryptoPage from '@page/core/Crypto/index.vue';
import { CodeOutlined } from '@ant-design/icons-vue';

export default {
  path: 'crypto',
  redirect: { name: 'CryptoPage' },
  component: CryptoPage,
  meta: {
    icon: CodeOutlined,
  },
  children: [
    {
      path: 'index',
      name: 'CryptoPage',
      component: CryptoPage,
      meta: {
        icon: CodeOutlined,
        title: 'cryptoHome',
      },
    },
  ],
};
