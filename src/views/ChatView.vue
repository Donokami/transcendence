<template>
  <div class="max-w-screen-xl min-w-[95%] mx-auto h-[86vh] text-black">
    <div class="flex h-[75vh]">
      <div class="border-black border-2 flex flex-col mx-2 my-3 mt-1 p-5 text-justify min-w-min w-1/4 overflow-y-auto">
        <chat-direct-messages v-if="listState === 'dm'" @list-state-changed="listState = $event"></chat-direct-messages>
        <chat-group-channels v-if="listState === 'groupChannels'"
          @list-state-changed="listState = $event"></chat-group-channels>
      </div>

      <div class="flex flex-col justify-between text-justify w-3/4" v-if="selectedChannel">
        <div class="border-black border-2 mx-2 my-3 mt-1 p-5 h-5/6">
          <chat-discussion></chat-discussion>
        </div>
        <div class="border-black border-2 mx-2 my-3 mt-1 p-5 h-1/6">
          <chat-input></chat-input>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

// ******* //
// IMPORTS //
// ******* //

import { ref } from 'vue'
import { onBeforeRouteLeave, useRoute } from 'vue-router'

import { storeToRefs } from 'pinia'

import { useChannelStore } from '@/stores/ChannelStore.js'

import io from 'socket.io-client'

import ChatGroupChannels from '@/components/ChatGroupChannels.vue'
import ChatDirectMessages from '@/components/ChatDirectMessages.vue'
import ChatDiscussion from '@/components/ChatDiscussion.vue'
import ChatInput from '@/components/ChatInput.vue'

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const listState = ref('dm')

const route = useRoute();
const channelStore = useChannelStore()

const { selectedChannel } = storeToRefs(channelStore);

// ****** //
// socket //
// ****** //

const socket = io('http://localhost:3002/chat', {
  withCredentials: true,
  transports: ['websocket']
})

socket.on('connect', () => {
  console.log('[ChatView] - Connected to the chat.')
})

socket.on('disconnect', async () => {
  console.log('[ChatView] - Disconnected from the chat.')
})

socket.on('error', (error) => {
  console.error('[ChatView] - Error : ', error)
})

// ********************* //
// VueJs LIFECYCLE HOOKS //
// ********************* //

onBeforeRouteLeave(async () => {
  socket.disconnect()
})

</script>
