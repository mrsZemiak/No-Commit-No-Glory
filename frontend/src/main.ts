import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth.ts'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'

// Create the app instance
const app = createApp(App)

// Use plugins
app.use(vuetify)
app.use(router)
app.use(createPinia())

const authStore = useAuthStore()

// Mount the app to the DOM
authStore.loadAuthState().then(() => {
  app.mount('#app')
})
