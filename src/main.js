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

const electron = require("electron");
electron.ipcRenderer.on("hello", (event, arg) => {
  console.log(event, arg);
  console.log(App);
  App.methods.openFileDialog();
});