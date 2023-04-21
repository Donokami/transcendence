<template>
  <div class="max-w-screen-xl min-w-[95%] lg:mx-auto text-black">
    <site-header></site-header>
    <div class="border-2 border-black items-center mx-2 my-3 mt-1 p-5 text-justify relative">
      <stats-ranking-table
        @table-state-changed="table_state = $event"
        v-show="table_state === 'ranking'"
      ></stats-ranking-table>
      <stats-match-history-table
        @table-state-changed="table_state = $event"
        v-show="table_state === 'matchHistory'"
      ></stats-match-history-table>
    </div>
  </div>
</template>

<script lang="ts">
import SiteHeader from '../components/SiteHeader.vue'
import StatsRankingTable from '../components/StatsRankingTable.vue'
import StatsMatchHistoryTable from '../components/StatsMatchHistoryTable.vue'

export default {
  name: 'StatsView',
  components: {
    SiteHeader,
    StatsRankingTable,
    StatsMatchHistoryTable
  },
  data() {
    return {
      table_state: 'ranking'
    }
  },
  methods: {}
}
</script>
