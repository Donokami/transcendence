<template>
  <form @submit.prevent="sendMessage" class="flex">
    <input class="w-full text-black outline-none" name="message" type="message" v-model="input"
      placeholder="Type your message" />
    <button type="submit"
      class="btn bg-white border-2 border-black mb-2 text-black hover:bg-black hover:border-black hover:text-white">
      Send
    </button>
  </form>
</template>

<script setup lang="ts">
// ******* //
// IMPORTS //
// ******* //

import { ref } from 'vue';

import { useChannelStore } from '@/stores/ChannelStore.js'

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const channelStore = useChannelStore()
const input = ref('')

// ********************* //
// FUNCTIONS DEFINITIONS //
// ********************* //

function sendMessage() {
  if (input.value.trim() !== '') {
    channelStore.sendMessage(input.value);
    input.value = '';
  }
}

</script>
