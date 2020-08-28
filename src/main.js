import Vue from 'vue'
import App from './App.vue'
import './theme/darkly.scss'

import { BootstrapVue } from 'bootstrap-vue'

// Install BootstrapVue
Vue.use(BootstrapVue)




Vue.config.productionTip = false


new Vue({
  render: h => h(App),
}).$mount('#app')


