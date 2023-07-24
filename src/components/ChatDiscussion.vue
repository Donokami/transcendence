<template>
  <div v-if="loggedUser && selectedChannel" class="chat-messages">
    <div
      :class="messageClass(message)"
      v-for="message in selectedChannel.messages"
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

import { computed, onBeforeMount, ref } from 'vue'
import { onBeforeRouteUpdate } from 'vue-router'

import { storeToRefs } from 'pinia'

import { useChannelStore } from '@/stores/ChannelStore.js'
import { useUserStore } from '@/stores/UserStore.js'

import type { Message } from '@/types/Message'
import { Channel } from '../../../backend/src/modules/chat/channels/entities/channel.entity'

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const channelStore = useChannelStore()
const emit = defineEmits(['scroll-to-bottom'])
const userStore = useUserStore()

const { channelsList } = storeToRefs(channelStore)
const { loggedUser } = storeToRefs(userStore)
const { selectedChannel } = storeToRefs(channelStore)

// todo Lucas : replace channelsList.messages by a ref
// if no message, fetch
// if messages, call thh getter from the channels store

console.log('channelsList :', channelsList.value)

const messageClass = computed(() => (message: Message) => {
  console.log('[ChatDiscussion] - message : ', message)
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

onBeforeMount(async () => {
  console.log('[ChatDiscussion] - onBeforeMount')
  console.log('selectedChannel :', selectedChannel.value)

  emit('scroll-to-bottom')
})

onBeforeRouteUpdate(async () => {
  emit('scroll-to-bottom')
})
</script>
