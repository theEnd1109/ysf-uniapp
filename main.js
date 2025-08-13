import App from './App'

import VueI18n from 'vue-i18n'
import messages from './lang'
import { jump } from '@/utils/jump'

Vue.use(VueI18n)

const locale =
  uni.getStorageSync('lang') ||
  (uni.getLocale() === 'zh-Hans' ? 'zh-cn' : uni.getLocale()) ||
  'zh-cn'
  
const i18n = new VueI18n({
  locale,
  fallbackLocale: 'zh-cn',
  messages,
})

Vue.prototype.$jump = jump // 全局挂载

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  i18n,
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  app.use(i18n)
  return {
    app,
	i18n
  }
}
// #endif