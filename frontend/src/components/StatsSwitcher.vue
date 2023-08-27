<template>
  <div class="mx-auto">
    <div class="tabs">
      <a
        class="tab tab-bordered"
        :class="{ 'tab-active': toggleRankingTable }"
        @click="toggleRankingTable = true"
        >Ranking</a
      >
      <a
        class="tab tab-bordered"
        :class="{ 'tab-active': !toggleRankingTable }"
        @click="toggleRankingTable = false"
        >Last matchs</a
      >
    </div>
    <stats-ranking-table v-if="toggleRankingTable" />
    <stats-match-history-table :user-id="props.userId" v-else />
  </div>
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue'
import StatsRankingTable from '@/components/StatsRankingTable.vue'
import StatsMatchHistoryTable from '@/components/StatsMatchHistoryTable.vue'

const props = defineProps({
  userId: {
    type: String,
    required: true
  }
})

const toggleRankingTable: Ref<boolean> = ref(true)
</script>
