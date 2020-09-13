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


import { library } from '@fortawesome/fontawesome-svg-core'
import { faCode, faChevronDown, faDatabase, faHashtag, faDiceFive, faFile, faImage } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
library.add([faCode, faChevronDown, faDatabase, faHashtag, faDiceFive, faFile, faImage])
Vue.component('font-awesome-icon', FontAwesomeIcon)



Vue.config.productionTip = false


new Vue({
  render: h => h(App),
}).$mount('#app')


