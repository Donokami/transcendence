<template>
  <div class="flex w-full max-h-[calc(100vh-135px)] my-1 mx-auto text-black">
    <!-- SIDEBAR -->
    <div
      class="flex flex-col min-w-min min-h-[calc(100vh-135px)] p-5 border-2 border-black text-justify w-1/4 overflow-y-auto">
      <chat-sidebar
        :list-state="listState"
        @list-state-changed="listState = $event"></chat-sidebar>
    </div>
    <!-- DISCUSSION -->
    <div
      class="flex flex-col justify-between text-justify w-3/4"
      v-if="selectedChannel && channelsList?.loading === false">
      <!-- TITLE -->
      <div
        class="flex border-2 border-black items-center justify-between ml-1 p-5">
        <h2 class="text-2xl font-bold text-black">
          {{ channelStore.getChannel(selectedChannel)?.name }}
        </h2>
        <router-link
          v-if="channelStore.getChannel(selectedChannel)?.isDm === true"
          to="/room/create"
          class="neobrutalist-box max-w-sm flex px-2">
          <iconify-icon icon="tabler:plus" class="mr-2"></iconify-icon>
          <span>Invite to a game</span>
        </router-link>
        <chat-drawer v-else></chat-drawer>
      </div>
      <!-- CHAT BOX -->
      <div
        ref="chatbox"
        class="border-black border-2 ml-1 mt-1 p-5 h-full overflow-auto">
        <chat-box @scroll-to-bottom="scrollToBottom"></chat-box>
      </div>
      <!-- MESSAGE INPUT -->
      <chat-input></chat-input>
    </div>
  </div>
</template>

<script setup lang="ts">
// ******* //
// IMPORTS //
// ******* //

import { ref, onBeforeMount, onBeforeUnmount } from 'vue'

import {
  onBeforeRouteLeave,
  onBeforeRouteUpdate,
  useRoute,
  useRouter
} from 'vue-router'

import { storeToRefs } from 'pinia'
import InfiniteLoading from 'v3-infinite-loading'

import { chatSocket } from '@/includes/chatSocket'

import { useChannelStore } from '@/stores/ChannelStore.js'

import ChatSidebar from '@/components/ChatSidebar.vue'
import ChatBox from '@/components/ChatBox.vue'
import ChatDrawer from '@/components/ChatDrawer.vue'
import ChatInput from '@/components/ChatInput.vue'

import type { Message } from '@/types'

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const channelStore = useChannelStore()
const chatbox = ref<HTMLElement | null>(null)
const listState = ref('dms')
const router = useRouter()
const route = useRoute()
const fetchingMessages = ref(false)

const { selectedChannel, channelsList } = storeToRefs(channelStore)

// ********************* //
// FUNCTIONS DEFINITIONS //
// ********************* //

function scrollToBottom(): void {
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

chatSocket.on('message', async (message: Message) => {
  channelStore.addMessage(message, message.channel.id)
  if (chatbox.value != null) {
    scrollToBottom()
  }
})

const getChannelId = (observedRoute: any): string | null => {
  console.log('route.params : ', observedRoute)

  if (observedRoute.params.catchAll !== '') {
    return observedRoute.params.catchAll.slice(1)
  }
  return null
}

// ********************* //
// VueJs LIFECYCLE HOOKS //
// ********************* //

onBeforeMount(async () => {
  if (
    channelsList.value === undefined ||
    channelsList.value?.data?.length === 0
  ) {
    try {
      channelStore.fetchChannels()
      console.log('[ChatView] - Channels : ', channelsList.value)
    } catch {
      console.error('[ChatView] - Error while fetching channels.')
    }
  }
  chatSocket.on('connect', () => {
    console.log('[ChatView] - Connected to the chat.')
  })
  if (selectedChannel.value !== null) {
    await router.push(`/chat/${selectedChannel.value}`)
  }
  channelStore.selectedChannel = getChannelId(route)
  scrollToBottom()
})

onBeforeRouteUpdate((to, from) => {
  channelStore.selectedChannel = getChannelId(to)
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
