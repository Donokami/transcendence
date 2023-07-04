<template>
  <div class="bg-white min-h-[calc(100vh-92px)] flex flex-col">
    <router-view></router-view>
  </div>
  <app-footer class="relative px-6 py-4 text-white bg-zinc-900"></app-footer>
</template>

<script setup lang="ts">
import AppFooter from './components/AppFooter.vue'
</script>
