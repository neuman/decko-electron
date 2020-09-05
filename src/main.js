import Vue from 'vue'
import App from './App.vue'
import './theme/darkly.scss'

import { BootstrapVue } from 'bootstrap-vue'
var path = require("path");

if (process.env.NODE_ENV !== 'development') {
  global.__static = path.join(__dirname, '/static')
  }else{
    global.__static = __dirname;
  }

// Install BootstrapVue
Vue.use(BootstrapVue)




Vue.config.productionTip = false


new Vue({
  render: h => h(App),
}).$mount('#app')


