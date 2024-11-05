import { createApp } from 'vue'
import Antd from 'ant-design-vue'
import './style.css'
import App from './App.vue'
import 'ant-design-vue/dist/antd.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import Print from "vue3-print-nb";
import { vSize } from './directives'



const app = createApp(App)
app.directive('size', vSize)
app.use(ElementPlus).use(Antd).use(Print).mount('#app')
