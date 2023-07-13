import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import FloatingVue from 'floating-vue'
import './index.css';

const app = createApp(App)

app.use(router)
app.use(FloatingVue)

app.mount('#app')
