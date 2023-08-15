<template>
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
        <tr v-if="!users" class="animate-pulse">
          <td class="text-center">-</td>
          <td class="text-center">-</td>
          <td class="text-center">-</td>
          <td class="text-center">-</td>
          <td class="text-center">-</td>
          <td class="text-center">-</td>
          <td class="text-center">-</td>
          <td class="text-center">-</td>
          <td class="text-center">-</td>
        </tr>
        <tr v-for="user in users.data" :key="user.rank" v-else>
          <th class="text-center">{{ user.rank }}</th>
          <th>
            <router-link :to="{ name: 'profile', params: { id: user.id } }">
              {{ user.username }}
            </router-link>
          </th>
          <td class="text-center">{{ user.winRate * 100 }} %</td>
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
</template>

<script setup lang="ts">
import type { User, Paginated } from '@/types'
import { useUserStore } from '@/stores/UserStore'
import { ref, onBeforeMount } from 'vue'

const userStore = useUserStore()

const users = ref<Paginated<User>>()

onBeforeMount(async () => {
  users.value = await userStore.fetchAllUsers()
  users.value.data.sort((a, b) => b.winRate - a.winRate)
  users.value.data.forEach((user, index) => (user.rank = index + 1))
})
</script>
