<template>
  <div class="max-w-screen-xl min-w-[95%] mx-auto h-[86vh] text-black">
    <site-header></site-header>
    <div class="flex h-[75vh]">
      <div
        class="border-black border-2 flex flex-col mx-2 my-3 mt-1 p-5 text-justify min-w-min w-1/4"
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
      <div class="flex flex-col justify-between text-justify w-3/4" v-if="userStore.selectedUser">
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
  import { ref } from 'vue'
  import { useUserStore } from '@/stores/UserStore.js'

  import SiteHeader from '../components/SiteHeader.vue'
  import ChatChannels from '../components/ChatChannels.vue'
  import ChatDirectMessages from '../components/ChatDirectMessages.vue'
  import ChatDiscussion from '../components/ChatDiscussion.vue'
  import ChatInput from '../components/ChatInput.vue'

  const listState = ref('dm')
  const userStore = useUserStore() 
</script>