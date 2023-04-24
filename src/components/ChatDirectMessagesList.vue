<template>
  <div class="tabs">
    <a class="tab tab-active tab-bordered text-2xl font-bold mb-8">DMs</a>
    <a class="tab tab-bordered text-2xl font-bold mb-8" @click="toggleList">Channels</a>
  </div>
  <div>
    <chat-direct-messages-button></chat-direct-messages-button>
    <chat-direct-messages-modal></chat-direct-messages-modal>
    <ul class="menu bg-base-100 w-full">
      <li v-for="user in filteredUsers" :key="user.id">
        <a
          class="flex p-1"
          :class="{ active: selectedUser.id === user.id }"
          @click="$emit('select-user', user)"
        >
          <div class="mx-auto md:mx-0 w-16 flex justify-center items-center">
            <svg
              v-if="user.profile_picture"
              :src="user.profile_picture"
              class="h-[60px] w-12"
            ></svg>
            <iconify-icon icon="ri:account-circle-line" class="h-16 w-12"></iconify-icon>
          </div>
          <span class="hidden md:block">{{ user.username }}</span>
        </a>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import type { User } from '../types/User.js'
import ChatDirectMessagesButton from '../components/ChatDirectMessagesButton.vue'
import ChatDirectMessagesModal from '../components/ChatDirectMessagesModal.vue'

export default {
  name: 'ChatDirectMessagesList',
  components: {
    ChatDirectMessagesButton,
    ChatDirectMessagesModal
  },
  data() {
    return {
      loggedUser: {
        id: 3,
        username: 'Mitsun0bu',
        email: '',
        password: '',
        profile_picture: '',
        status: '',
        rank: 0,
        games_played: 0,
        win: 0,
        loss: 0,
        win_rate: 0,
        points_scored: 0,
        points_conceded: 0,
        points_difference: 0,
        friends: ['Conobi', 'Hayce_', 'Narcisserael'],
        n_friends: 3
      },
      selectedUser: {
        id: 0,
        username: '',
        email: '',
        password: '',
        profile_picture: '',
        status: '',
        rank: 0,
        games_played: 0,
        win: 0,
        loss: 0,
        win_rate: 0,
        points_scored: 0,
        points_conceded: 0,
        points_difference: 0,
        friends: [''],
        n_friends: 0
      },
      users: [
        {
          id: 1,
          username: 'Conobi',
          email: '',
          password: '',
          profile_picture: '',
          status: '',
          rank: 1,
          games_played: 10,
          win: 5,
          loss: 5,
          win_rate: 50,
          points_scored: 10,
          points_conceded: 10,
          points_difference: 0,
          friends: ['Mitsun0bu', 'Hayce_', 'Narcisserael'],
          n_friends: 0
        },
        {
          id: 2,
          username: 'Hayce_',
          email: '',
          password: '',
          profile_picture: '',
          status: '',
          rank: 2,
          games_played: 10,
          win: 4,
          loss: 6,
          win_rate: 40,
          points_scored: 8,
          points_conceded: 12,
          points_difference: -4,
          friends: ['Conobi', 'Mitsun0bu', 'Narcisserael'],
          n_friends: 0
        },
        {
          id: 3,
          username: 'Mitsun0bu',
          email: '',
          password: '',
          profile_picture: '',
          status: '',
          rank: 0,
          games_played: 0,
          win: 0,
          loss: 0,
          win_rate: 0,
          points_scored: 0,
          points_conceded: 0,
          points_difference: 0,
          friends: ['Conobi', 'Hayce_', 'Narcisserael'],
          n_friends: 0
        },
        {
          id: 4,
          username: 'Narcisserael',
          email: '',
          password: '',
          profile_picture: '',
          status: '',
          rank: 4,
          games_played: 10,
          win: 2,
          loss: 8,
          win_rate: 20,
          points_scored: 4,
          points_conceded: 25,
          points_difference: -21,
          friends: ['Conobi', 'Hayce_', 'Mitsun0bu'],
          n_friends: 0
        }
      ]
    }
  },
  methods: {
    toggleList(): void {
      this.$emit('list-state-changed', 'channels')
    },
    selectUser(selectedUser: User) {
      this.$emit('select-user', selectedUser)
    }
  },
  computed: {
    filteredUsers(): User[] {
      return this.users.filter((user) => {
        return user.id !== this.loggedUser.id
      })
    }
  }
}
</script>
