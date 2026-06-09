import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueFire, VueFireAuth } from 'vuefire'
import { firebaseApp } from './firebase/index.js'
import router from './router/index.js'
import { useAppStore } from './stores/app.js'
import App from './App.vue'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(VueFire, {
  firebaseApp,
  modules: [VueFireAuth()],
})

const store = useAppStore()
store.initDarkMode()

app.mount('#app')
