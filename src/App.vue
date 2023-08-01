<template>
    <site-header
      v-if="route.path !== '/auth' && route.path !== '/mfa'"></site-header>
    <auth-header v-else></auth-header>
    <div
      class="max-w-screen-xl mx-auto min-h-[calc(100vh-156px)] flex flex-col px-1">
      <router-view></router-view>
    </div>
    <app-footer></app-footer>
</template>

<script setup lang="ts">
import AppFooter from './components/AppFooter.vue'
import { useRoute } from 'vue-router'
import AuthHeader from './components/AuthHeader.vue'
import SiteHeader from './components/SiteHeader.vue'
const route = useRoute()
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