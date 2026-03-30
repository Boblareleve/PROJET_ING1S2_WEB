import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { useAuthStore } from '@/auth/auth'

const app = createApp(App)
app.use(createPinia())
app.use(router)



async function init(){
    const auth=useAuthStore()
    app.mount('#app')
}


init()