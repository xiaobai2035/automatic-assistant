import Vue from "vue";
import axios from "axios";

import "./styles/reset.css";

import "./element";

import * as filters from "./common/filter";
Object.keys(filters).forEach((key) => {
  Vue.filter(key, filters[key]);
});

import App from "./App";
import router from "./router";
import store from "./store";

if (!process.env.IS_WEB) Vue.use(require("vue-electron"));
Vue.http = Vue.prototype.$http = axios;
Vue.config.productionTip = false;

var vue = new Vue({
  components: { App },
  router,
  store,
  template: "<App/>",
}).$mount("#app");

export default vue;
