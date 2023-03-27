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
            <th class="text-center rounded-none">Game Date</th>
            <th class="text-center">Pseudo</th>
            <th class="text-center">Opponent</th>
            <th class="text-center">Score</th>
            <th class="text-center rounded-none">Win / Loss</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in getMatchHistoryData()" :key="entry.gameIndex">
            <th class="text-center">{{ entry.gameIndex }}</th>
            <td class="text-center">{{ entry.formattedGameDate }}</td>
            <td class="text-center">{{ entry.player }}</td>
            <td class="text-center">{{ entry.opponent }}</td>
            <td class="text-center">{{ entry.score }}</td>
            <td class="text-center">{{ entry.result }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
interface MatchHistoryData {
  gameIndex: number
  gameDate: Date
  formattedGameDate: string
  player: string
  opponent: string
  score: string
  result: string
}
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
          gameIndex: 1,
          gameDate: new Date(2022, 2, 5, 14, 30),
          formattedGameDate: '',
          player: 'Mitsun0bu',
          opponent: 'Hayce_',
          score: '10 - 9',
          result: 'W'
        },
        {
          gameIndex: 2,
          gameDate: new Date(2021, 0, 1, 9, 15),
          formattedGameDate: '',
          player: 'Mitsun0bu',
          opponent: 'Conobi',
          score: '0 - 10',
          result: 'L'
        },
        {
          gameIndex: 3,
          gameDate: new Date(2021, 0, 1, 18, 0),
          formattedGameDate: '',
          player: 'Mitsun0bu',
          opponent: 'Narcisserael',
          score: '9 - 10',
          result: 'L'
        }
      ]

      // Format the gameDate property of each MatchHistoryData object
      matchHistory.forEach((match) => {
        match.formattedGameDate = match.gameDate.toLocaleString('en-US')
      })

      // Sort match history entries by gameDate in descending order
      matchHistory.sort((a, b) => new Date(b.gameDate).getTime() - new Date(a.gameDate).getTime())

      // Assign new ranks based on the sorted order
      matchHistory.forEach((match, index) => {
        match.gameIndex = index + 1
      })

      return matchHistory
    }
  }
}
</script>
