<template>
  <div class="w-full mx-auto text-black">
    <!-- TABLE -->
    <div class="border-2 border-black my-2 sm:my-4 mx-2 sm:mx-4 px-4 py-7 sm:p-11">
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
