import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Vant from 'vant'
import ElementPlus from 'element-plus'
import 'vant/lib/index.css'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import './styles/tokens.css'
import './styles/base.css'
import './styles/admin.css'
import './styles/merchant.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(Vant)
app.use(ElementPlus)
app.mount('#app')
