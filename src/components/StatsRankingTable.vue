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
        <tr v-for="user in sortedUsers" :key="user.rank" v-else>
          <th class="text-center">{{ user.rank }}</th>
          <th>
            <router-link :to="{ name: 'profile', params: { id: user.id } }">
              {{ user.username }}
            </router-link>
          </th>
          <td class="text-center">
            {{ Math.round(user.winRate * 10000) / 100 }} %
          </td>
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
import type { User } from '@/types'
import { useUserStore } from '@/stores/UserStore'
import { ref, onBeforeMount, computed } from 'vue'

const userStore = useUserStore()

const users = ref<User[]>()

onBeforeMount(async () => {
  const fetchedUsers = await userStore.fetchAllUsers()
  const fetchRankPromises = fetchedUsers.data.map(async (user) => {
    const rank = await userStore.fetchUserRank(user.id)
    return { ...user, rank }
  })

  users.value = await Promise.all(fetchRankPromises)
})

const sortedUsers = computed(() => {
  if (!users.value) return []
  return users.value.slice().sort((a, b) => a.rank - b.rank)
})
</script>
