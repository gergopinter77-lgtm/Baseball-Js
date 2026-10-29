import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { reveal } from './directives/reveal'

// Lazy images fade in once loaded (or failed, so nothing stays invisible)
const markLoaded = (e) => e.target.tagName === 'IMG' && e.target.classList.add('img-loaded')
document.addEventListener('load', markLoaded, true)
document.addEventListener('error', markLoaded, true)

const app = createApp(App)

app.use(router)
app.directive('reveal', reveal)

app.mount('#app')
