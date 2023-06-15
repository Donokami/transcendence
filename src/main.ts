import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Icon } from '@iconify/vue'

import App from './App.vue'
import router from './router'
import VeeValidatePlugin from './includes/validation.js'
import Tres from '@tresjs/core';

import './assets/base.css'

// const chatSocket = io('http://localhost:3002/chat', {
//     transportOptions: {
//         polling: {
//             cors : {
//                 origin: 'http://localhost:3002',
//                 methods: ['GET,POST,DELETE'],
//                 credentials: true,
//             }
//         }
//     }
// })

// const gameSocket = io('http://localhost:3002/game', {
//     transportOptions: {
//         polling: {
//             cors : {
//                 origin: 'http://localhost:3002',
//                 methods: ['GET,POST,DELETE'],
//                 credentials: true,
//             }
//         }
//     }
// })

const app = createApp(App)

// Plug-in registration
app.use(createPinia())
app.use(router)
app.use(VeeValidatePlugin)
app.use(Tres)

// app.config.globalProperties.$chatSocket = chatSocket
// app.config.globalProperties.$gameSocket = gameSocket

app.component('iconify-icon', Icon)

app.mount('#app')
