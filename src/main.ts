import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import router from './router'
import App from './App.vue'
import '@/layouts/layout.css'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)


import { useUserStore } from '@/stores/user.stores'
const userStore = useUserStore() // force l'hydratation

app.use(router)
app.mount('#app')