<template>
  <ul class="menu bg-base-100 w-full">
    <li v-for="channel in filteredChannels" :key="channel.name">
      <a
        class="flex p-1"
        :class="userStore.selectedUser && { active: userStore.selectedUser.id === user.id }"
        @click="userStore.selectedUser = user"
      >
        <div class="mx-auto md:mx-0 w-16 flex justify-center items-center">
          <svg v-if="user.profile_picture" :src="user.profile_picture" class="h-[60px] w-12"></svg>
          <iconify-icon icon="ri:account-circle-line" class="h-16 w-12"></iconify-icon>
        </div>
        <span class="hidden md:block">{{ user.username }}</span>
      </a>
    </li>
  </ul>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { User } from '../types/User'
  import type { Channel } from '../types/Channel.js'
  import { useUserStore } from '@/stores/UserStore.js'

  const userStore = useUserStore() 
  // const selectedChannel

  const filteredChannels = computed(() => {
    return userStore.loggedUser.channels.filter((channel: Channel) => {
      if (channel.type === 'direct') {
        return true
      }
      return userStore.loggedUser.channels
    })
  })
</script>