<template>
  <div class="overflow-x-auto">
    <table class="table w-full">
      <thead>
        <tr>
          <th class="text-center">Pseudo</th>
          <th class="text-center">Score</th>
          <th class="text-center">Opponent</th>
          <th class="text-center rounded-none">Game Date</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="matchHistoryData.length === 0">
          <td class="text-center" colspan="4">No match history</td>
        </tr>
        <tr v-for="match in matchHistoryData" :key="match.id" v-else>
          <td class="text-center">{{ match.players[0].username }}</td>
          <td class="text-center">{{ `${match.scoreA} - ${match.scoreB}` }}</td>
          <td class="text-center">{{ match.players[1].username }}</td>
          <td class="text-center">{{ timestampToDate(match.playedAt) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { Match } from '@/types'
import fetcher from '@/utils/fetcher'
import { onBeforeMount, ref } from 'vue'

const props = defineProps({
  userId: {
    type: String,
    required: true
  }
})

const matchHistoryData = ref<Match[]>([])

const getMatchHistoryData = async (): Promise<void> => {
  const data = await fetcher.get(`/games/matchs/${props.userId}`)
  matchHistoryData.value = data
}

onBeforeMount(async () => {
  await getMatchHistoryData()
})

const timestampToDate = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleString()
}
</script>
