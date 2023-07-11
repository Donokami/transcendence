<template>
  <div class="bg-white min-h-[calc(100vh-92px)] flex flex-col">
    <site-header v-if="route.path !== '/auth'"></site-header>
    <auth-header v-else></auth-header>

    <router-view></router-view>
  </div>
  <app-footer class="bg-zinc-900 py-4 px-6 relative text-white"></app-footer>
</template>

<script setup lang="ts">
import AppFooter from './components/AppFooter.vue'
import { useRoute } from "vue-router"
import AuthHeader from './components/AuthHeader.vue';
import SiteHeader from './components/SiteHeader.vue';

const route = useRoute()
</script>
