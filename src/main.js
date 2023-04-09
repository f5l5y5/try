import { createApp } from 'vue'
import Antd from 'ant-design-vue'
import './style.css'
import App from './App.vue'
import 'ant-design-vue/dist/antd.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)
app.use(ElementPlus).use(Antd).mount('#app')
