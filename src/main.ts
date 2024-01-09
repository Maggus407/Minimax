import { createApp } from 'vue'
import router from './router'
import App from './App.vue'
import { createPinia } from 'pinia'
import i18n from './i18n'
import VueKonva from 'vue-konva';
import './assets/tailwind.css'
import '@fortawesome/fontawesome-free/css/all.css'
import '@fortawesome/fontawesome-free/js/all.js'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(VueKonva)

app.mount('#app')
