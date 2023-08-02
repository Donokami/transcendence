<template>
  <div v-if="loggedUser && channel" class="overflow-auto">
    <div
      class="flex flex-col max-w-sm w-fit mb-2 p-2 text-justify border-black border-2"
      :class="messageClass(message)"
      v-for="message in channel.messages"
      :key="message.id">
      <div v-if="message.room && message.room.loading === false">
        <div class="text-sm" :class="textClass(message)">
          <h1 class="text-lg mb-2">
            {{
              message.room.data ? message.room.data.name : 'Invite link expired'
            }}
          </h1>
          <div v-if="!message.room.error">
            <p>{{ message.user.username }} invited you to play a game</p>
            <div class="avatar-group -space-x-6">
              <div v-for="i in 2" :key="i">
                <div
                  v-if="message.room.data.players[i - 1] !== undefined"
                  class="avatar border-0">
                  <div class="w-12">
                    <img
                      v-if="message.room.data.players[i - 1].profilePicture"
                      :src="
                        apiUrl + message.room.data.players[i - 1].profilePicture
                      " />
                    <iconify-icon
                      v-else
                      icon="ri:account-circle-line"
                      class="h-12 w-12"></iconify-icon>
                  </div>
                </div>
                <div v-else class="avatar placeholder border-0">
                  <div class="w-12 bg-neutral-focus text-neutral-content">
                    <div
                      class="bg-white/10 w-full h-full rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
            <button
              class="neobrutalist-box p-2 float-right"
              :class="{ invert: message.user.id === loggedUser.value?.id }">
              <router-link :to="`/room/${message.room.data.id}`">
                Join
              </router-link>
            </button>
          </div>
        </div>
      </div>
      <p v-else class="text-sm break-words" :class="textClass(message)">
        {{ message.messageBody }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
// ******* //
// IMPORTS //
// ******* //

import { computed, onBeforeMount, ref, watch } from 'vue'
import { onBeforeRouteUpdate } from 'vue-router'

import { storeToRefs } from 'pinia'

import { useChannelStore } from '@/stores/ChannelStore.js'
import { useUserStore } from '@/stores/UserStore.js'

import type { Message, Channel, RoomStatus } from '@/types'

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const channelStore = useChannelStore()
const emit = defineEmits(['scroll-to-bottom'])
const userStore = useUserStore()

const { channelsList } = storeToRefs(channelStore)
const { loggedUser } = storeToRefs(userStore)
const { selectedChannel } = storeToRefs(channelStore)
const channel = ref<Channel>()

console.log('channelsList :', channelsList.value)

const apiUrl = import.meta.env.VUE_APP_API_URL

const messageClass = computed(() => (message: Message) => {
  if (message.user.id === loggedUser.value?.id) {
    return 'bg-zinc-900 ml-auto'
  } else {
    return 'min-w-min'
  }
})

const textClass = computed(() => (message: Message) => {
  if (message.user.id === loggedUser.value?.id) {
    return 'text-white'
  } else {
    return 'text-black'
  }
})

// ******************** //
// FUNCTION DEFINITIONS //
// ******************** //

// ****************** //
// getChannelMessages //
// ****************** //

async function getChannelMessages(): Promise<void> {
  console.log('selectedChannel :', selectedChannel.value)

  if (selectedChannel.value !== null) {
    channel.value = channelStore.getChannel(selectedChannel.value)
  }

  if (selectedChannel.value !== null && channel.value?.messages.length === 0) {
    await channelStore.fetchChannelMessages(selectedChannel.value)
  }

  emit('scroll-to-bottom')
}

// ********************* //
// VueJs LIFECYCLE HOOKS //
// ********************* //

onBeforeMount(async () => {
  await getChannelMessages()
})

onBeforeRouteUpdate(async () => {
  emit('scroll-to-bottom')
})

watch(
  () => selectedChannel.value,
  async () => {
    await getChannelMessages()
  }
)
</script>
