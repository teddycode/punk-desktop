import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from "@/store";
import vClickOutside from 'v-click-outside'
import '@fortawesome/fontawesome-free/css/all.css'


createApp(App).use(router).use(store).use(vClickOutside).mount('#app');
