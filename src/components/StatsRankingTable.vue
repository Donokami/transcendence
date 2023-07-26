<template>
  <div class="mx-auto">
    <div class="tabs">
      <a class="tab tab-bordered tab-active">Ranking</a>
      <a class="tab tab-bordered" @click="toggleTable">Match History</a>
    </div>
    <div class="overflow-x-auto">
      <table class="table w-full">
        <thead>
          <tr>
            <th class="text-center rounded-none">Rank</th>
            <th class="text-center">Pseudo</th>
            <th class="text-center">Win Rate</th>
            <th class="text-center">Win</th>
            <th class="text-center">Loss</th>
            <th class="text-center">Games Played</th>
            <th class="text-center">Points Scored</th>
            <th class="text-center">Points Conceded</th>
            <th class="text-center rounded-none">Points Difference</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users.data" :key="user.rank">
            <th class="text-center">{{ user.rank }}</th>
            <th>
              <router-link :to="{ name: 'profile', params: { id: user.id } }">
                {{ user.username }}
              </router-link>
            </th>
            <td class="text-center">{{ user.winRate }} %</td>
            <td class="text-center">{{ user.win }}</td>
            <td class="text-center">{{ user.loss }}</td>
            <td class="text-center">{{ user.gamesPlayed }}</td>
            <td class="text-center">{{ user.pointsScored }}</td>
            <td class="text-center">{{ user.pointsConceded }}</td>
            <td class="text-center">{{ user.pointsDifference }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User } from '@/types'
import { useUserStore } from '@/stores/UserStore'
import { ref, onBeforeMount } from 'vue'

const emit = defineEmits(['table-state-changed', 'go-to-profile-triggered'])
const userStore = useUserStore()

const toggleTable = (): void => {
  emit('table-state-changed', 'matchHistory')
}

const users = ref<User[]>([])

onBeforeMount(async () => {
  // todo: create a function in the user store to fetch all users with stats and use api sort instead of js sort
  users.value = await userStore.fetchAllUsers()
  users.value.data.sort((a, b) => b.winRate - a.winRate)
  users.value.data.forEach((user, index) => (user.rank = index + 1))
})
</script>
@/types/User