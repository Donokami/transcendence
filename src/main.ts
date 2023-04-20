import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Icon } from '@iconify/vue'

import App from './App.vue'
import router from './router'
import VeeValidatePlugin from './includes/validation.js'

import './assets/base.css'

const app = createApp(App)

// Plug-in registration
app.use(createPinia())
app.use(router)
app.use(VeeValidatePlugin)

app.component('iconify-icon', Icon)

app.mount('#app')
