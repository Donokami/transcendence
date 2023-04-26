<template>
  <div class="max-w-screen-xl min-w-[95%] mx-auto text-black">
    <site-header></site-header>
    <div class="flex ...">
      <div
        class="border-black border-2 flex flex-col mx-2 my-3 mt-1 p-5 text-justify min-w-min w-1/4"
      >
        <chat-direct-messages
          v-if="list_state === 'dm'"
          @list-state-changed="list_state = $event"
        ></chat-direct-messages>
        <chat-channels
          v-if="list_state === 'channels'"
          @list-state-changed="list_state = $event"
          @select-channel="selectedChannel = $event"
        ></chat-channels>
      </div>
      <div
        class="border-black border-2 flex flex-col mx-2 my-3 mt-1 p-5 text-justify w-3/4 justify-between"
        v-if="userStore.selectedUser"
      >
        <chat-discussion></chat-discussion>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { Channel } from '../types/Channel.js'
import { useUserStore } from '@/stores/UserStore.js'
import SiteHeader from '../components/SiteHeader.vue'
import ChatChannels from '../components/ChatChannels.vue'
import ChatDirectMessages from '../components/ChatDirectMessages.vue'
import ChatDiscussion from '../components/ChatDiscussion.vue'

export default {
  name: 'ChatView',
  components: {
    SiteHeader,
    ChatChannels,
    ChatDirectMessages,
    ChatDiscussion
  },
  data() {
    return {
      list_state: 'dm',
      userStore: useUserStore(),
      selectedChannel: null as Channel | null
    }
  },
  methods: {}
}
</script>
