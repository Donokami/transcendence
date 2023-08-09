<template>
  <site-header
    v-if="route.path !== '/auth' && route.path !== '/mfa'"></site-header>
  <auth-header v-else></auth-header>
  <div
    class="max-w-screen-xl mx-auto min-h-[calc(100vh-164px)] sm:min-h-[calc(100vh-135px)] flex flex-col">
    <router-view></router-view>
  </div>
  <app-footer></app-footer>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useRoute } from 'vue-router'

import { storeToRefs } from 'pinia'

import AppFooter from '@/components/AppFooter.vue'
import AuthHeader from '@/components/AuthHeader.vue'
import SiteHeader from '@/components/SiteHeader.vue'
import { appSocket } from '@/includes/appSocket'
import { useUserStore } from '@/stores/UserStore'
import type { User } from '@/types'


const route = useRoute()

const userStore = useUserStore()

const { loggedUser, friendList } = storeToRefs(userStore)

watch(loggedUser, (user) => {
  if (!user && appSocket.connected) {
    appSocket.disconnect()
    return
  }
  console.log('attempting to connect to app socket')
  appSocket.connect()

  appSocket.on('connect', () => {
    console.log('connected to app socket')
  })

  appSocket.on('social:block', (data: { blockerId: string }) => {
    friendList.value = friendList.value.filter(
      (friend: User) => data.blockerId === friend.id
    )
  })

  appSocket.on('social:accept', (user: User) => {
    friendList.value.push(user)
  })
})
</script>

<style>
.Vue-Toastification__toast {
  background-color: white !important;
  border: 2px solid black !important;
  color: black !important;
  border-radius: 0% !important;
}

.Vue-Toastification__progress-bar {
  background-color: black !important;
}
</style>
