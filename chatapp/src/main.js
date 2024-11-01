import Vue from 'vue';
import axios from 'axios';
import store from "./vuex/store";
import VueAxios from 'vue-axios';
import Mixin from "./mixins/GlobalMixins";
import linkify from 'vue-linkify'
Vue.directive('linkified', linkify);

import App from './components/App.vue';
import widgetChatApp from './components/widgetChatApp.vue';
import jQuery from 'jquery';
import VueCroppie from 'vue-croppie';
import 'croppie/croppie.css'
Vue.use(VueCroppie);

import RuntimeTemplateCompiler from "vue-runtime-template-compiler"
Vue.use(RuntimeTemplateCompiler)

axios.defaults.baseURL = window.wpguppy_scripts_vars.restapiurl;
axios.defaults.headers.common['Authorization'] = `Bearer ` + window.wpguppy_scripts_vars.authToken;
import VueSweetalert2 from 'vue-sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
Vue.use(VueSweetalert2);

Vue.use(VueAxios, axios);
Vue.config.productionTip = true;
Vue.mixin(Mixin); 
Vue.directive('click-outside', {
  bind: function (el, binding, vnode) {
    el.clickOutsideEvent = function (event) {
      // here I check that click was outside the el and his children
      if (!(el == event.target || el.contains(event.target))) {
        // and if it did, call method provided in attribute value
        vnode.context[binding.expression](event);
      }
    };
    document.body.addEventListener('click', el.clickOutsideEvent)
  },
  unbind: function (el) {
    document.body.removeEventListener('click', el.clickOutsideEvent)
  },
});

// Filters
Vue.filter('capitalize', function (value) {
  if (!value) return ''
  value = value.toString()
  return value.charAt(0).toUpperCase() + value.slice(1)
});
// messanger chat
if( jQuery('#wpguppy-messanger-chat').length && window.wpguppy_scripts_vars.userId ) {
  new Vue({
    store,
    render: h => h(App),
  }).$mount('#wpguppy-messanger-chat')
}else if( jQuery('#wpguppy-widget-chat').length) { // for widget chat
  new Vue({
    store,
    render: h => h(widgetChatApp),
  }).$mount('#wpguppy-widget-chat')
}

