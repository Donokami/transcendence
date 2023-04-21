<template>
  <div class="tabs">
    <a class="tab tab-bordered text-2xl font-bold mb-8" @click="toggleList">DMs</a>
    <a class="tab tab-bordered tab-active text-2xl font-bold mb-8">Channels</a>
  </div>
  <div>
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

export default {
  name: 'ChatChannelsList',
  props: {
    loggedUser: {
      required: true,
      default: () => ({
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
        points_difference: 0
      })
    },
    users: {
      type: Array as () => User[],
      required: true
    },
    selectedUser: {
      required: true,
      default: () => ({
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
        points_difference: 0
      })
    }
  },
  methods: {
    toggleList(): void {
      this.$emit('list-state-changed', 'dm')
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
