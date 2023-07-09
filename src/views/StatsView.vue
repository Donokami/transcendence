<template>
  <div class="max-w-screen-xl min-w-[95%] lg:mx-auto text-black">
    <div class="border-2 border-black items-center mx-2 my-3 mt-1 p-5 text-justify relative">
      <stats-ranking-table
        @table-state-changed="tableState = $event"
        v-show="tableState === 'ranking'"
      ></stats-ranking-table>
      <stats-match-history-table
        @table-state-changed="tableState = $event"
        v-show="tableState === 'matchHistory'"
      ></stats-match-history-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import StatsRankingTable from '../components/StatsRankingTable.vue'
import StatsMatchHistoryTable from '../components/StatsMatchHistoryTable.vue'

const tableState = ref('ranking');
</script>

