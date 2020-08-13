import Vue from 'vue'
import App from './App.vue'

import { BootstrapVue } from 'bootstrap-vue'

// Install BootstrapVue
Vue.use(BootstrapVue)

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'


Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')

//import router from './router'
const electron = require('electron')

electron.ipcRenderer.on('hello', (event, arg) => {
  // Get the current Vue instance (i.e. which component/route is currently active)
  console.log(event, arg);
  //let component = router.currentRoute.matched[0].instances.default

  //component.someReactiveData = 'Received message from main process';
})