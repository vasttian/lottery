import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import Element from 'element-ui';
import VueHotkey from 'v-hotkey';
import '@/assets/style/index.scss';
import 'element-ui/lib/theme-chalk/index.css';
import '@/assets/lib/tagcanvas.js';
import SvgSprite from 'ym-svg-sprite';

Vue.use(SvgSprite);
const requireAll = requireContext => requireContext.keys().map(requireContext);
const req = require.context('./assets/sprites', false, /\.svg$/);
requireAll(req);

Vue.config.productionTip = false;

Vue.use(Element);
Vue.use(VueHotkey);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
