<template>
  <div class="tabs">
    <a class="tab tab-active tab-bordered text-2xl font-bold mb-8">DMs</a>
    <a class="tab tab-bordered text-2xl font-bold mb-8" @click="toggleList">Channels</a>
  </div>
  <div>
    <label
    for="my-modal-3"
    class="btn bg-white border-2 border-black mb-2 text-black hover:bg-primary hover:border-primary hover:text-white"
    type="button"
  >
    SEND A NEW DM
  </label>
    <chat-direct-messages-modal></chat-direct-messages-modal>
    <chat-direct-messages-list v-if="hasChannels"></chat-direct-messages-list>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useUserStore } from '@/stores/UserStore.js'
  import ChatDirectMessagesList from '../components/ChatDirectMessagesList.vue'
  import ChatDirectMessagesModal from '../components/ChatDirectMessagesModal.vue'

  const emit = defineEmits(['list-state-changed'])
  
  const userStore = useUserStore()
  
  const hasChannels = computed(() => userStore.loggedUser?.channels?.length > 0)

  const toggleList = () => {
    emit('list-state-changed', 'channels')
  }
</script>