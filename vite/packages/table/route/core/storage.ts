import storageHomePage from '@page/core/Storage/index.vue';
import MainBackground from '@page/core/components/MainBackground.vue';

export default {
  path: 'storage',
  redirect: { name: 'StoragePage' },
  component: MainBackground,
  children: [
    {
      path: 'index',
      name: 'StoragePage',
      component: storageHomePage,
    },
  ],
};
