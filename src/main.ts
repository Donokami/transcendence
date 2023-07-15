import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Icon } from '@iconify/vue'

import App from './App.vue'
import router from './router'
import VeeValidatePlugin from './includes/validation.js'
import Tres from '@tresjs/core'
import io from 'socket.io-client'
import { VueQueryPlugin } from '@tanstack/vue-query'

import './assets/base.css'

const app = createApp(App)

// Plug-in registration
app.use(createPinia())
app.use(router)
app.use(VeeValidatePlugin)
app.use(Tres)
app.use(VueQueryPlugin)

app.component('iconify-icon', Icon)

app.mount('#app')
