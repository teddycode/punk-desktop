import CollectionPage from '@page/core/Collections/index.vue';
import { CodeOutlined } from '@ant-design/icons-vue';

export default {
  path: 'collection',
  redirect: { name: 'CollectionsPage' },
  component: CollectionPage,
  meta: {
    icon: CodeOutlined,
  },
  children: [
    {
      path: 'index/:data',
      name: 'CollectionsPage',
      component: CollectionPage,
      meta: {
        icon: CodeOutlined,
      },
    },
  ],
};
