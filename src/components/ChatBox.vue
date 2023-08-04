<template>
  <div v-if="loggedUser && channel" class="overflow-auto">

    <div
      class="flex flex-col max-w-sm w-fit mb-3 p-2 text-justify border-black border-2"
      :class="messageClass(message)"
      v-for="message in channel.messages"
      :key="message.id">
      <div v-if="message.room && message.room.loading === false">


        <div class="text-sm" :class="textClass(message)">
          <h1 v-if="!message.room.data">
            Invite link expired
          </h1>
          <div v-if="!message.room.error" class="">
            <p><span class="capitalize">{{ message.user.username }}</span> invited you to play!</p>
            <button
              class="btn border-2 bg-white border-black text-black hover:bg-black hover:border-white hover:text-white mt-2 block w-full"
              :class="{ invert: message.user.id === loggedUser.value?.id }">
              <router-link :to="`/room/${message.room.data.id}`" class="flex gap-2 w-fit mx-auto">
                <iconify-icon icon="ri:ping-pong-line" class="hidden sm:block w-7 h-7 "></iconify-icon>
                <div class=" my-auto">Join the game</div>
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
    return 'max-w-sm'
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
