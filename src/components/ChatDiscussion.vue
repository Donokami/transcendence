<template>
  <div v-if="loggedUser && channel" class="chat-messages">
    <div
      :class="messageClass(message)"
      v-for="message in channel.messages"
      :key="message.id">
      <p class="text-sm" :class="textClass(message)">
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

import type { Message, Channel } from '@/types'

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

const messageClass = computed(() => (message: Message) => {
  if (message.user.id === loggedUser.value?.id) {
    return 'border-black border-2 bg-zinc-900 flex flex-col mx-2 my-3 mt-1 p-2.5 text-justify w-2/6 ml-auto'
  } else {
    return 'border-black border-2 flex flex-col mx-2 my-3 mt-1 p-2.5 text-justify w-2/6 min-w-min'
  }
})

const textClass = computed(() => (message: Message) => {
  if (message.user.id === loggedUser.value?.id) {
    return 'text-white'
  } else {
    return 'text-black'
  }
})

// ********************* //
// VueJs LIFECYCLE HOOKS //
// ********************* //

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
