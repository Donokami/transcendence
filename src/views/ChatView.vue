<template>
  <div class="max-w-screen-xl min-w-[95%] mx-auto h-[86vh] text-black">
    <div class="flex h-[75vh]">
      <div
        class="border-black border-2 flex flex-col mx-2 my-3 mt-1 p-5 text-justify min-w-min w-1/4 overflow-y-auto">
        <chat-direct-messages
          v-if="listState === 'dm'"
          @list-state-changed="listState = $event"></chat-direct-messages>
        <chat-group-channels
          v-if="listState === 'groupChannels'"
          @list-state-changed="listState = $event"></chat-group-channels>
      </div>

      <div
        class="flex flex-col justify-between text-justify w-3/4"
        v-if="selectedChannel">
        <div class="border-black border-2 mx-2 my-3 mt-1 p-5 h-1/6">
          <h2 class="text-2xl font-bold text-black">
            {{ selectedChannel.name }}
          </h2>
        </div>
        <div
          ref="chatbox"
          class="border-black border-2 mx-2 my-3 p-5 h-4/6 overflow-auto">
          <chat-discussion @scroll-to-bottom="scrollToBottom"></chat-discussion>
        </div>
        <div class="border-black border-2 mx-2 my-3 p-5 h-1/6">
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

import { ref, onBeforeMount, onBeforeUnmount, onMounted } from 'vue'

import { onBeforeRouteLeave, useRouter } from 'vue-router'

import { storeToRefs } from 'pinia'

import { chatSocket } from '@/includes/chatSocket'

import { useChannelStore } from '@/stores/ChannelStore.js'

import ChatGroupChannels from '@/components/ChatGroupChannels.vue'
import ChatDirectMessages from '@/components/ChatDirectMessages.vue'
import ChatDiscussion from '@/components/ChatDiscussion.vue'
import ChatInput from '@/components/ChatInput.vue'

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const channelStore = useChannelStore()
const chatbox = ref<HTMLElement | null>(null)
const listState = ref('dm')
const router = useRouter()

const { selectedChannel, channelsList } = storeToRefs(channelStore)

// ********************* //
// FUNCTIONS DEFINITIONS //
// ********************* //

const scrollToBottom = () => {
  if (chatbox.value != null)
    chatbox.value.scrollTop = chatbox.value.scrollHeight
}

// ****** //
// SOCKET //
// ****** //

chatSocket.connect()

chatSocket.on('disconnect', async () => {
  console.log('[ChatView] - Disconnected from the chat.')
})

chatSocket.on('error', (error) => {
  console.error('[ChatView] - Error : ', error)
})

chatSocket.on('message', async (message) => {
  // selectedChannel.value?.messages.push(message)
  await channelStore.addMessage(message)
  if (chatbox.value != null) {
    // && (chatbox.value.scrollHeight - 200 < chatbox.value.scrollTop)
    console.log('height : ', chatbox.value.scrollHeight)
    console.log('top : ', chatbox.value.scrollTop)
    scrollToBottom()
  }
})

// ********************* //
// VueJs LIFECYCLE HOOKS //
// ********************* //

onBeforeMount(async () => {
  if (channelsList.value.length === 0) {
    try {
      await channelStore.fetchChannels()
      console.log('[ChatView] - Channels fetched.');
      console.log('[ChatView] - Channels : ', channelsList.value);

    } catch {
      console.error('[ChatView] - Error while fetching channels.')
    }
  }
  chatSocket.on('connect', () => {
    console.log('[ChatView] - Connected to the chat.')
  })
  if (selectedChannel.value) {
    router.push(`/chat/${selectedChannel.value.id}`)
  }
  scrollToBottom()
})

onBeforeRouteLeave(async () => {
  chatSocket.disconnect()
})

onBeforeUnmount(() => {
  chatSocket.off('connect')
  chatSocket.off('disconnect')
  chatSocket.off('error')
  chatSocket.off('message')
})
</script>
