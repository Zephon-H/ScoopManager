import { createApp } from 'vue'
import App from './App.vue'
// import './samples/node-api'
// element
import ElementPlus from 'element-plus';
import 'element-plus/theme-chalk/index.css'

createApp(App)
  .use(ElementPlus)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })
