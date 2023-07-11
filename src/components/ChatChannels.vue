<template>
  <div class="tabs">
    <a class="tab tab-bordered text-2xl font-bold mb-8" @click="toggleList">DMs</a>
    <a class="tab tab-bordered tab-active text-2xl font-bold mb-8">Channels</a>
  </div>
  <div>
    <label
    for="my-modal-3"
    class="btn bg-white border-2 border-black mb-2 text-black hover:bg-primary hover:border-primary hover:text-white"
    type="button"
  >
    CREATE A NEW CHANNEL
  </label>
    <chat-channels-modal></chat-channels-modal>
    <chat-channels-list v-if="hasChannels"></chat-channels-list>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useUserStore } from '@/stores/UserStore.js'
  import ChatChannelsList from '../components/ChatChannelsList.vue'
  import ChatChannelsModal from '../components/ChatChannelsModal.vue'

  const emit = defineEmits(['list-state-changed'])

  const userStore = useUserStore()
  
  const hasChannels = computed(() => userStore.loggedUser?.channels?.length > 0)
  
  const toggleList = () => {
      emit('list-state-changed', 'dm')
    }
</script>