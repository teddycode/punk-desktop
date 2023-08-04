import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from "@/store";
import vClickOutside from 'v-click-outside'
import '@fortawesome/fontawesome-free/css/all.css'
import dataV from '@kjgl77/datav-vue3'
// import './assets/scss/style.scss';
// 引入 eCharts
import * as echarts from 'echarts'

import "./assets/iconfont/iconfont.css";
import "./assets/css/global.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import 'primevue/resources/themes/saga-blue/theme.css'       //主题
import 'primevue/resources/primevue.min.css'                 //核心样式
import 'primeicons/primeicons.css'                           //icons
import PrimeVue from "primevue/config";
import { library } from '@fortawesome/fontawesome-svg-core'
import { faExchangeAlt, faHandHoldingUsd, faGem, faSitemap, faGavel, faHandsHelping, faCalculator, faDatabase } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import ElementPlus from 'element-plus'
import 'element-plus/theme-chalk/index.css';
import '@element-plus/icons-vue'
library.add(faExchangeAlt, faHandHoldingUsd, faGem, faSitemap, faGavel, faHandsHelping, faCalculator, faDatabase)


const app = createApp(App)
app.component('font-awesome-icon', FontAwesomeIcon)
app.use(router)
app.use(store)
app.use(vClickOutside)
app.use(dataV)
app.use(PrimeVue)
app.use(ElementPlus)
// createApp(App).use(router).use(store).use(vClickOutside).use(dataV).mount('#app');
app.config.globalProperties.$echarts = echarts


// eslint-disable-next-line vue/multi-word-component-names

app.mount('#app')