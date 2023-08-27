<template>
  <site-header
    v-if="route.path !== '/auth' && route.path !== '/mfa'"></site-header>
  <auth-header v-else></auth-header>
  <div
    class="max-w-screen-xl mx-auto min-h-[calc(100vh-164px)] sm:min-h-[calc(100vh-135px)] flex flex-col">
    <router-view v-slot="{ Component }">
      <transition>
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
  <app-footer></app-footer>
</template>

<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'

import { storeToRefs } from 'pinia'

import AppFooter from '@/components/AppFooter.vue'
import AuthHeader from '@/components/AuthHeader.vue'
import SiteHeader from '@/components/SiteHeader.vue'
import { socialSocket } from '@/includes/socialSocket'
import { useUserStore } from '@/stores/UserStore'

const route = useRoute()
const userStore = useUserStore()

const { loggedUser } = storeToRefs(userStore)

watch(loggedUser, (user) => {
  if (!user) {
    if (socialSocket.connected) socialSocket.disconnect()
    return
  }

  socialSocket.connect()

  socialSocket.on('connect', () => {
    console.log('[SocialSocket] - Connected to the /social socket')
  })
})

onBeforeUnmount(() => {
  socialSocket.off(`connect`)
})
</script>
