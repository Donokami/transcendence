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
            <th class="text-center">Games Played</th>
            <th class="text-center">Win</th>
            <th class="text-center">Loss</th>
            <th class="text-center">Win Rate</th>
            <th class="text-center">Points Scored</th>
            <th class="text-center">Points Conceded</th>
            <th class="text-center rounded-none">Points Difference</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="player in getPlayerRankingData()" :key="player.rank">
            <th class="text-center">{{ player.rank }}</th>
            <td class="text-center">{{ player.pseudo }}</td>
            <td class="text-center">{{ player.gamesPlayed }}</td>
            <td class="text-center">{{ player.win }}</td>
            <td class="text-center">{{ player.loss }}</td>
            <td class="text-center">{{ player.winRate }}</td>
            <td class="text-center">{{ player.pointsScored }}</td>
            <td class="text-center">{{ player.pointsConceded }}</td>
            <td class="text-center">{{ player.pointsDifference }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
interface PlayerRankingData {
  rank: number
  pseudo: string
  gamesPlayed: number
  win: number
  loss: number
  winRate: number
  pointsScored: number
  pointsConceded: number
  pointsDifference: number
}

export default {
  name: 'StatsRankingTable',
  data() {
    return {}
  },
  methods: {
    toggleTable(): void {
      this.$emit('table-state-changed', 'matchHistory')
    },
    getPlayerRankingData(): PlayerRankingData[] {
      const players: PlayerRankingData[] = [
        {
          rank: 1,
          pseudo: 'Player 1',
          gamesPlayed: 10,
          win: 5,
          loss: 5,
          winRate: 50,
          pointsScored: 10,
          pointsConceded: 10,
          pointsDifference: 0
        },
        {
          rank: 2,
          pseudo: 'Player 2',
          gamesPlayed: 10,
          win: 4,
          loss: 6,
          winRate: 40,
          pointsScored: 8,
          pointsConceded: 12,
          pointsDifference: -4
        },
        {
          rank: 3,
          pseudo: 'Player 3',
          gamesPlayed: 10,
          win: 6,
          loss: 4,
          winRate: 60,
          pointsScored: 12,
          pointsConceded: 8,
          pointsDifference: 4
        }
      ]

      // Sort players by winRate in descending order
      players.sort((a, b) => b.winRate - a.winRate)

      // Assign new rank to each player based on the sorted order
      players.forEach((player, index) => (player.rank = index + 1))

      return players
    }
  }
}
</script>
