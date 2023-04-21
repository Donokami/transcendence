<template>
  <div class="tabs">
    <a class="tab tab-bordered tab-active text-2xl font-bold mb-8">DMs</a>
    <a class="tab tab-bordered text-2xl font-bold mb-8" @click="toggleList">Channels</a>
  </div>
  <div>
    <button
      class="btn bg-white border-2 border-black mb-2 text-black hover:bg-primary hover:border-primary hover:text-white"
      type="button"
    >
      SEND A NEW DM
    </button>
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
  name: 'ChatDirectMessagesList',
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
        points_difference: 0,
        friends: [''],
        n_friends: 0
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
        points_difference: 0,
        friends: [''],
        n_friends: 0
      })
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
