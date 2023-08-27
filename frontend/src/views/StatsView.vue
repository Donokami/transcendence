<template>
  <div class="w-full mx-auto text-black">
    <div
      class="px-4 mx-2 my-2 bg-white border-2 border-black sm:my-4 sm:mx-4 py-7 sm:p-11">
      <StatsSwitcher :user-id="loggedUser.id" v-if="loggedUser" />
    </div>
  </div>
</template>

<script setup lang="ts">
import StatsSwitcher from '@/components/StatsSwitcher.vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/UserStore.js'

const userStore = useUserStore()

const { loggedUser } = storeToRefs(userStore)
</script>
