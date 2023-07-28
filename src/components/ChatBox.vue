<template>
  <div v-if="loggedUser && channel" class="overflow-auto">
    <div
      class="flex flex-col max-w-sm w-fit mb-2 p-2 text-justify border-black border-2"
      :class="messageClass(message)"
      v-for="message in channel.messages"
      :key="message.id">
      <p class="text-sm break-words" :class="textClass(message)">
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
