import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Icon } from '@iconify/vue'
import Toast, { type PluginOptions, POSITION } from 'vue-toastification'
import 'vue-toastification/dist/index.css'

import App from './App.vue'
import router from './router'
import VeeValidatePlugin from './includes/validation.js'
import Tres from '@tresjs/core'
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

const options: PluginOptions = {
  position: POSITION.TOP_CENTER
}

app.use(Toast, options)

app.mount('#app')
