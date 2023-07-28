<template>
  <site-header
    v-if="route.path !== '/auth' && route.path !== '/mfa'"></site-header>
  <auth-header v-else></auth-header>
  <div
    class="bg-white max-w-screen-xl mx-auto min-h-[calc(100vh-156px)] flex flex-col">
    <router-view></router-view>
  </div>
  <app-footer class="relative px-6 py-4 text-white bg-zinc-900"></app-footer>
</template>

<script setup lang="ts">
import AppFooter from './components/AppFooter.vue'
import { useRoute } from 'vue-router'
import AuthHeader from './components/AuthHeader.vue'
import SiteHeader from './components/SiteHeader.vue'

const route = useRoute()
</script>
