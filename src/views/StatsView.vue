<template>
  <div class="w-full mx-auto text-black">
    <div
      class="border-2 border-black my-2 sm:my-4 mx-2 sm:mx-4 px-4 py-7 sm:p-11">
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
