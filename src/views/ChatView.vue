<template>
  <div class="mx-auto w-full max-w-5xl">
    <div class="flex max-h-[calc(100vh-164px)] text-black m-4">
      <!-- SIDEBAR -->
      <div class="border-2 border-black min-h-[calc(100vh-164px)] w-60 sm:w-96 flex flex-col">
        <chat-sidebar
          :list-state="listState"
          @list-state-changed="listState = $event">
        </chat-sidebar>
      </div>

      <!-- DISCUSSION -->
      <div
        class="flex flex-col justify-between text-justify ml-4 w-full"
        v-if="selectedChannel && channelsList?.loading === false">
        <!-- TITLE -->
        <div
          class="flex gap-2 border-x-2 border-t-2 border-black items-center justify-between p-5">

          <div class="flex gap-2 items-center">
            <div v-if="channelStore.getChannel(selectedChannel)?.isDm === true">
              <img
                v-if="channelStore.getChannel(selectedChannel)?.image"
                :src="`http://localhost:3000/${channelStore.getChannel(selectedChannel).image}`"
                class="object-cover rounded-full h-11 w-11" />
              <iconify-icon
                v-else
                icon="ri:account-circle-line"
                class="h-11 w-11">
              </iconify-icon>
            </div>
          
            <h2 class="text-xl font-bold text-black capitalize">
              {{ channelStore.getChannel(selectedChannel)?.name }}
            </h2>
          </div>

          <button
            v-if="channelStore.getChannel(selectedChannel)?.isDm === true"
            @click="createGame"
            class="btn  bg-white border-2 shrink border-black text-black hover:bg-black hover:border-black hover:text-white">
            <iconify-icon icon="material-symbols:mail-outline" class="hidden sm:block w-7 h-7 "></iconify-icon>
            <span>Send game invite</span>
          </button>
          <chat-drawer v-else></chat-drawer>
        </div>
        <!-- CHAT BOX -->
        <div
          ref="chatbox"
          class="border-black border-2 p-5 h-full overflow-auto">
          <chat-box @scroll-to-bottom="scrollToBottom"></chat-box>
        </div>
        <!-- MESSAGE INPUT -->
        <chat-input></chat-input>
      </div>

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
// import InfiniteLoading from 'v3-infinite-loading'

import { chatSocket } from '@/includes/chatSocket'

import { useChannelStore } from '@/stores/ChannelStore.js'

import ChatSidebar from '@/components/ChatSidebar.vue'
import ChatBox from '@/components/ChatBox.vue'
import ChatDrawer from '@/components/ChatDrawer.vue'
import ChatInput from '@/components/ChatInput.vue'

import type { Channel, Message, Room } from '@/types'
import { useFetcher, fetcher } from '@/utils/fetcher'
import { useUserStore } from '@/stores/UserStore'

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const channelStore = useChannelStore()
const { loggedUser } = useUserStore()
const chatbox = ref<HTMLElement | null>(null)
const listState = ref('dms')
const router = useRouter()
const route = useRoute()

const { selectedChannel, channelsList } = storeToRefs(channelStore)

// ********************* //
// FUNCTIONS DEFINITIONS //
// ********************* //

function scrollToBottom(): void {
  if (chatbox.value != null)
    chatbox.value.scrollTop = chatbox.value.scrollHeight
}

function createGame(): void {
  useFetcher({
    queryFn: fetcher.post('/games'),
    onSuccess: async (data: Room) => {
      await router.push(`/room/${data.id}`)
      await channelStore.sendMessage(
        `${import.meta.env.VITE_APP_URL + '/room/' + data.id}`
      )
    }
  })
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

chatSocket.on('chat:channel-created', async (channel: Channel) => {
  if (loggedUser === null) return
  channelStore.setChannelInfos(loggedUser, channel)
  channelStore.channelsList?.data?.push(channel)
})

chatSocket.on('chat:message', async (message: Message) => {
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
    channelStore.fetchChannels()
    console.log('[ChatView] - Channels : ', channelsList.value)
  }

  chatSocket.on('chat:connect', () => {
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
