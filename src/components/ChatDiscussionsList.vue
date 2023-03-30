<template>
  <h2 class="text-2xl font-bold mb-8 text-black">Discussions</h2>
  <ul class="menu bg-base-100 w-full">
    <li v-for="user in filteredUsers" :key="user.id">
      <a
        class="flex p-1"
        :class="{ active: selectedUser.id === user.id }"
        @click="$emit('select-user', user)"
      >
        <div class="mx-auto md:mx-0 w-16 flex justify-center items-center">
          <svg v-if="user.profile_picture" :src="user.profile_picture" class="h-[60px] w-12"></svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="h-[60px] w-12"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
        <span class="hidden md:block">{{ user.username }}</span>
      </a>
    </li>
  </ul>
</template>

<script lang="ts">
import type { User } from '../types/User.js'

export default {
  name: 'ChatDiscussionsList',
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
