<template>
  <div v-if="loggedUser && selectedChannel" class="chat-messages">
    <h2 class="text-2xl font-bold mb-8 text-black">{{ selectedChannel.receiver.username }}</h2>
    <div v-for="message in selectedChannel.messages" :key="message.id" :class="{
      'border-black border-2 bg-zinc-900 flex flex-col mx-2 my-3 mt-1 p-2.5 text-justify w-2/6 ml-auto':
        message.sender.id === loggedUser.id &&
        message.receiver.id === selectedChannel.receiver.id,
      'border-black border-2 flex flex-col mx-2 my-3 mt-1 p-2.5 text-justify w-2/6 min-w-min':
        message.sender.id === selectedChannel.receiver.id &&
        message.receiver.id === loggedUser.id
    }">
      <p class="text-sm" :class="{
        'text-white':
          message.sender.id === loggedUser.id &&
          message.receiver.id === selectedChannel.receiver.id,
        'text-black':
          message.sender.id === selectedChannel.receiver.id &&
          message.receiver.id === loggedUser.id
      }">
        {{ message.text }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">

// ******* //
// IMPORTS //
// ******* //

import { ref } from 'vue'
import { useRoute } from 'vue-router'

import { storeToRefs } from 'pinia'

import { useChannelStore } from '@/stores/ChannelStore.js'
import { useUserStore } from '@/stores/UserStore.js'


// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const listState = ref('dm')

const route = useRoute();
const userStore = useUserStore()
const channelStore = useChannelStore()

const { loggedUser } = storeToRefs(userStore);
const { selectedChannel } = storeToRefs(channelStore);
</script>