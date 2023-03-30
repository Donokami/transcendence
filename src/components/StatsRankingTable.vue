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
          <tr v-for="user in getUserRanking()" :key="user.rank">
            <th class="text-center">{{ user.rank }}</th>
            <td class="text-center">{{ user.username }}</td>
            <td class="text-center">{{ user.win_rate }} %</td>
            <td class="text-center">{{ user.win }}</td>
            <td class="text-center">{{ user.loss }}</td>
            <td class="text-center">{{ user.games_played }}</td>
            <td class="text-center">{{ user.points_scored }}</td>
            <td class="text-center">{{ user.points_conceded }}</td>
            <td class="text-center">{{ user.points_difference }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import type { User } from '../types/User.js'

export default {
  name: 'StatsRankingTable',
  data() {
    return {}
  },
  methods: {
    toggleTable(): void {
      this.$emit('table-state-changed', 'matchHistory')
    },
    getUserRanking(): User[] {
      const users: User[] = [
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
          points_difference: 0
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
          points_difference: -4
        },
        {
          id: 3,
          username: 'Mitsun0bu',
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
          points_difference: -21
        },
        {
          id: 4,
          username: 'Narcisserael',
          email: '',
          password: '',
          profile_picture: '',
          status: '',
          rank: 3,
          games_played: 10,
          win: 6,
          loss: 4,
          win_rate: 60,
          points_scored: 12,
          points_conceded: 8,
          points_difference: 4
        }
      ]

      // Sort users by win_rate in descending order
      users.sort((a, b) => b.win_rate - a.win_rate)

      // Assign new rank to each user based on the sorted order
      users.forEach((user, index) => (user.rank = index + 1))

      return users
    }
  }
}
</script>
