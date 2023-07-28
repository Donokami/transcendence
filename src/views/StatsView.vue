<template>
  <div class="w-full mx-auto text-black">
    <!-- TABLE -->
    <div class="border-2 border-black my-1 p-5">
      <!-- STATS -->
      <stats-ranking-table
        @table-state-changed="tableState = $event"
        v-show="tableState === 'ranking'"></stats-ranking-table>
      <!-- MATCH HISTORY -->
      <stats-match-history-table
        @table-state-changed="tableState = $event"
        v-show="tableState === 'matchHistory'"></stats-match-history-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import StatsRankingTable from '../components/StatsRankingTable.vue'
import StatsMatchHistoryTable from '../components/StatsMatchHistoryTable.vue'

const tableState = ref('ranking')
</script>
