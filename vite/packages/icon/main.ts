import { createApp } from 'vue';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import App from './App.vue';
import tools from '../../src/util/tools.js';
createApp(App).use(Antd).mount('#app');
tools.getWindowArgs(window);
