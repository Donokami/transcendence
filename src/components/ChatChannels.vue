<template>
  <div class="tabs">
    <a class="tab tab-bordered text-2xl font-bold mb-8" @click="toggleList">DMs</a>
    <a class="tab tab-bordered tab-active text-2xl font-bold mb-8">Channels</a>
  </div>
  <div>
    <chat-channels-button></chat-channels-button>
    <chat-channels-modal></chat-channels-modal>
    <chat-channels-list></chat-channels-list>
  </div>
</template>

<script lang="ts">
import ChatChannelsButton from '../components/ChatChannelsButton.vue'
import ChatChannelsList from '../components/ChatChannelsList.vue'
import ChatChannelsModal from '../components/ChatChannelsModal.vue'

export default {
  name: 'ChatChannels',
  emits: ['list-state-changed'],
  components: {
    ChatChannelsButton,
    ChatChannelsList,
    ChatChannelsModal
  },
  methods: {
    toggleList(): void {
      this.$emit('list-state-changed', 'dm')
    }
  }
}
</script>
