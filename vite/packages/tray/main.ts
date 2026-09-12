import { createApp } from 'vue';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import App from './App.vue';
import { createStore } from 'vuex';
import { createRouter, createWebHashHistory } from 'vue-router';
import Home from './page/Home.vue';
import './styles/flex-class.css'; // 引入flex快写样式
import './styles/box.css';
import './styles/text.css';

const store = createStore({
  state() {
    return {
      user: {},
    };
  },
  mutations: {
    setUser(state, user) {
      if (user.uid === -1 || user.uid === -2) {
        state.user = {
          uid: user.uid,
        };
        return;
      }
      state.user = user;
    },
  },
});
const routes = [
  {
    path: '/',
    component: Home,
  },
];
const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

createApp(App).use(Antd).use(store).use(router).mount('#app');
