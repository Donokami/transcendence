<template>
  <div class="tabs">
    <a class="tab tab-active tab-bordered text-2xl font-bold mb-8">DMs</a>
    <a class="tab tab-bordered text-2xl font-bold mb-8" @click="toggleList">Channels</a>
  </div>
  <div>
    <chat-direct-messages-button></chat-direct-messages-button>
    <chat-direct-messages-modal></chat-direct-messages-modal>
    <chat-direct-messages-list></chat-direct-messages-list>
  </div>
</template>

<script lang="ts">
import type { User } from '../types/User.js'
import { useUserStore } from '@/stores/UserStore.js'
import ChatDirectMessagesButton from '../components/ChatDirectMessagesButton.vue'
import ChatDirectMessagesList from '../components/ChatDirectMessagesList.vue'
import ChatDirectMessagesModal from '../components/ChatDirectMessagesModal.vue'

export default {
  name: 'ChatDirectMessages',
  emits: ['list-state-changed'],
  components: {
    ChatDirectMessagesButton,
    ChatDirectMessagesList,
    ChatDirectMessagesModal
  },
  data() {
    return {
      userStore: useUserStore()
    }
  },
  methods: {
    toggleList(): void {
      this.$emit('list-state-changed', 'channels')
    }
  },
  computed: {
    filteredUsers(): User[] {
      return this.userStore.users.filter((user) => {
        return user.id !== this.userStore.loggedUser.id
      })
    }
  }
}
</script>
