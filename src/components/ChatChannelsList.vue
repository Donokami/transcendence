<template>
  <ul class="menu bg-base-100 w-full">
    <li v-for="channel in channelStore.channels" :key="channel.name">
      <a
        class="flex p-1"
        :class="
          channelStore.selectedChannel && {
            active: channelStore.selectedChannel.name === channel.name
          }
        "
        @click="channelStore.selectedChannel = channel"
      >
        <span class="flex justify-center items-center h-[60px]">{{ channel.name }}</span>
      </a>
    </li>
  </ul>
</template>

<script setup lang="ts">
  import { useChannelStore } from '@/stores/ChannelStore'

  const channelStore = useChannelStore()
</script>