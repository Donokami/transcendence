<template>
  <div class="max-w-screen-xl min-w-[95%] mx-auto h-[86vh] text-black">
    <div class="flex h-[75vh]">
      <div
        class="border-black border-2 flex flex-col mx-2 my-3 mt-1 p-5 text-justify min-w-min w-1/4 overflow-y-auto"
      >
        <chat-direct-messages
          v-if="listState === 'dm'"
          @list-state-changed="listState = $event"
        ></chat-direct-messages>
        <chat-channels
          v-if="listState === 'channels'"
          @list-state-changed="listState = $event"
        ></chat-channels>
      </div>
      <!-- <div class="flex flex-col justify-between text-justify w-3/4" v-if="userStore.selectedUser">
        <div class="border-black border-2 mx-2 my-3 mt-1 p-5 h-5/6">
          <chat-discussion></chat-discussion>
        </div>
        <div class="border-black border-2 mx-2 my-3 mt-1 p-5 h-1/6">
          <chat-input></chat-input>
        </div>
      </div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { onBeforeRouteLeave, useRoute } from 'vue-router'
  import { useUserStore } from '@/stores/UserStore.js'
  
  import io from 'socket.io-client'

  import ChatChannels from '../components/ChatChannels.vue'
  import ChatDirectMessages from '../components/ChatDirectMessages.vue'
  import ChatDiscussion from '../components/ChatDiscussion.vue'
  import ChatInput from '../components/ChatInput.vue'

  const listState = ref('dm')
  
  const route = useRoute();
  const userStore = useUserStore() 
  
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

  onBeforeRouteLeave(async () => {
    socket.disconnect()
  })

</script>
