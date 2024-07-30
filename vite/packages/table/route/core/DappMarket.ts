import DappMarketPage from '../../page/core/DappMarket/DappMarketPage.vue';
import SecondLayout from '../../page/core/Layouts/SecondLayout.vue';
import DappDetails from  '../../page/core/DappMarket/DappDetails.vue';
import myInfoPage from  '../../page/core/DappMarket/myInfoPage.vue';
import Overview from '../../page/core/DappMarket/Overview.vue';
import MyProjects from '../../page/core/DappMarket/MyProjects.vue';
import Favorites from '../../page/core/DappMarket/Favorites.vue';
import API from '../../page/core/DappMarket/API.vue';
import submitDapp from '../../page/core/DappMarket/submitDapp.vue';
import ProjectDetails from '../../page/core/DappMarket/ProjectDetails.vue';

export default {
  path: 'DappMarket',
  component: SecondLayout,
  children: [
    {
      path: '',
      name: 'DappMarketPage',
      component: DappMarketPage,
    },
    {
      path: 'details/:id',
      name: 'DappDetails',
      component: DappDetails,
      props: true,
    },
    {
      path: 'myInfoPage',
      name: 'myInfoPage',
      component: myInfoPage,
      children: [
        {
          path: '',
          name: 'overview',
          redirect: { name: 'overview' }
        },
        {
          path: 'submitDapp',
          name: 'submitDapp',
          component: submitDapp
        },
        {
          path: 'overview',
          name: 'overview',
          component: Overview
        },
        {
          path: 'myProjects',
          name: 'myProjects',
          component: MyProjects
        },
        {
          path: 'favorites',
          name: 'favorites',
          component: Favorites
        },
        {
          path: 'api',
          name: 'api',
          component: API
        },
        {
          path: '/project/:id',
          name: 'ProjectDetails',
          component: ProjectDetails,
          props: true,
        }
      ]
    }
  ],
}
