import {createApp} from 'vue'
// import {createPinia} from 'pinia'

import './permission'
import App from './App.vue'
import router from './router'
import store from "./store";
import {errorHandler} from './error'

const app = createApp(App)

// older code
import vClickOutside from 'v-click-outside'
import '@fortawesome/fontawesome-free/css/all.css'
import dataV from '@kjgl77/datav-vue3'
import $ from 'jquery';
import * as echarts from 'echarts'
import "@renderer/assets/iconfont/iconfont.css";
import "@renderer/assets/css/global.scss";
import 'primevue/resources/themes/saga-blue/theme.css' //主题
import 'primevue/resources/primevue.min.css' //核心样式
import 'primeicons/primeicons.css' //icons
import Mock from './mock' // 项目引入mock
import PrimeVue from "primevue/config";
import {library} from '@fortawesome/fontawesome-svg-core'
import {
  faAngleRight,
  faBookReader,
  faCalculator,
  faDatabase,
  faEdit,
  faExchangeAlt,
  faFileAlt,
  faFire,
  faGavel,
  faGem,
  faHandHoldingUsd,
  faHandsHelping,
  faSitemap,
  faVideo,
  faWrench
} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import ElementPlus from 'element-plus'
import 'element-plus/theme-chalk/index.css';
import '@element-plus/icons-vue'
import '@renderer/assets/css/icon.css'
import 'jquery/dist/jquery.min.js'
import 'bootstrap/dist/js/bootstrap.min.js'

window.$ = $;
window.jQuery = $;

library.add(faExchangeAlt, faHandHoldingUsd, faGem, faSitemap, faGavel, faHandsHelping, faCalculator, faDatabase, faWrench, faFire, faEdit, faVideo, faBookReader, faFileAlt, faAngleRight)
app.component('font-awesome-icon', FontAwesomeIcon)
app.use(vClickOutside)
app.use(dataV)
app.use(PrimeVue)
app.use(ElementPlus)
app.config.globalProperties.$echarts = echarts

// const store = createPinia()
app.use(router)
app.use(store)
errorHandler(app)

app.mount("#app")
