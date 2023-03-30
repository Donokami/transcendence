<template>
  <div class="mx-auto">
    <div class="tabs">
      <a class="tab tab-bordered" @click="toggleTable">Ranking</a>
      <a class="tab tab-bordered tab-active">Match History </a>
    </div>
    <div class="overflow-x-auto">
      <table class="table w-full">
        <thead>
          <tr>
            <th class="text-center rounded-none">Game</th>
            <th class="text-center">Pseudo</th>
            <th class="text-center">Opponent</th>
            <th class="text-center">Score</th>
            <th class="text-center rounded-none">Win / Loss</th>
            <th class="text-center rounded-none">Game Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in getMatchHistoryData()" :key="entry.game_index">
            <th class="text-center">{{ entry.game_index }}</th>
            <td class="text-center">{{ entry.username }}</td>
            <td class="text-center">{{ entry.opponent }}</td>
            <td class="text-center">{{ entry.score }}</td>
            <td class="text-center">{{ entry.result }}</td>
            <td class="text-center">{{ entry.formatted_game_date }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import type { MatchHistoryData } from '../types/MatchHistoryData.js'

export default {
  name: 'StatsMatchHistoryTable',
  data() {
    return {}
  },
  methods: {
    toggleTable(): void {
      this.$emit('table-state-changed', 'ranking')
    },
    getMatchHistoryData(): MatchHistoryData[] {
      const matchHistory: MatchHistoryData[] = [
        {
          game_index: 1,
          username: 'Mitsun0bu',
          opponent: 'Hayce_',
          score: '10 - 9',
          result: 'W',
          game_date: new Date(2022, 2, 5, 14, 30),
          formatted_game_date: ''
        },
        {
          game_index: 2,
          username: 'Mitsun0bu',
          opponent: 'Conobi',
          score: '0 - 10',
          result: 'L',
          game_date: new Date(2021, 0, 1, 9, 15),
          formatted_game_date: ''
        },
        {
          game_index: 3,
          username: 'Mitsun0bu',
          opponent: 'Narcisserael',
          score: '9 - 10',
          result: 'L',
          game_date: new Date(2021, 0, 1, 18, 0),
          formatted_game_date: ''
        }
      ]

      // Format the _game_date property of each MatchHistoryData object
      matchHistory.forEach((match) => {
        match.formatted_game_date = match.game_date.toLocaleString('en-US')
      })

      // Sort match history entries by _game_date in descending order
      matchHistory.sort((a, b) => new Date(b.game_date).getTime() - new Date(a.game_date).getTime())

      // Assign new ranks based on the sorted order
      matchHistory.forEach((match, index) => {
        match.game_index = index + 1
      })

      return matchHistory
    }
  }
}
</script>
