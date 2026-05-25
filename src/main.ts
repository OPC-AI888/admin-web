import 'element-plus/dist/index.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { setupGuards } from './router/guards'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { vPermission } from '@/directives/permission'

const app = createApp(App)
const pinia = createPinia()

// 注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
setupGuards(router)
app.use(router)
app.directive('permission', vPermission)

app.mount('#app')
