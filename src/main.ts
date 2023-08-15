import { ApiError, HttpError } from './utils/fetcher'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Icon } from '@iconify/vue'
import Toast, {
  type PluginOptions,
  POSITION,
  useToast
} from 'vue-toastification'
import 'vue-toastification/dist/index.css'

import App from './App.vue'
import router from './router'
import VeeValidatePlugin from './includes/validation.js'
import Tres from '@tresjs/core'

import './assets/base.css'

const app = createApp(App)

// Plug-in registration
app.use(createPinia())
app.use(router)
app.use(VeeValidatePlugin)
app.use(Tres)

app.component('iconify-icon', Icon)

const options: PluginOptions = {
  position: POSITION.TOP_CENTER
}

app.use(Toast, options)

app.config.errorHandler = (err, vm, info) => {
  if (err instanceof ApiError) {
    useToast().error(err.message)
  } else {
    throw err
  }
}

app.mount('#app')
