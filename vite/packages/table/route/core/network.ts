import networkPage from '@page/core/Network/index.vue';
import vpnPage from '@page/core/Network/components/vpn.vue';
import accountPage from '@page/core/Network/components/account.vue';
import managementPage from '@page/core/Network/components/management.vue'
import nodePage from '@page/core/Network/components/node.vue';
import stakePage from '@page/core/Network/components/stake.vue';
import MainBackground from '@page/core/components/MainBackground.vue';
import { CodeOutlined } from '@ant-design/icons-vue';

export default {
  path: 'network',
  redirect: { name: 'NetworkPage' },
  component: MainBackground,
  meta: {
    icon: CodeOutlined,
  },
  children: [
    {
      path: '',
      name: 'NetworkPage',
      redirect: { name: 'VpnPage' },
      component: networkPage,
      meta: {
        icon: CodeOutlined,
      },
      children: [
        { path: 'account', name: 'AccountPage', component: accountPage },
        { path: 'vpn', name: 'VpnPage', component: vpnPage },
        { path: 'management', name: 'ManagementPage', component: managementPage },
        { path: 'node', name: 'NodePage', component: nodePage },
        { path: 'stake', name: 'StakePage', component: stakePage },
      ]
    },
  ],
};
