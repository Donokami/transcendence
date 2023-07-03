<template>
  <div class="max-w-screen-xl min-w-[95%] lg:mx-auto text-black">
    <site-header></site-header>
    <div class="border-black border-2 flex flex-col mx-2 my-3 mt-1 p-5 text-justify">
      <h2 class="text-2xl font-bold mb-8 text-black">Profile</h2>
      <profile-stats-card></profile-stats-card>
      <div class="form-control">
        <label class="cursor-pointer p-6">
          <span class="stat-value text-xl">2FA</span>
          <span class="px-6 align-middle">
            <input 
              type="checkbox" 
              class="toggle rounded-none" 
              v-model="userStore.twoFactorEnabled" 
              @click="switchAuthenticationMsg" 
            />
          </span>
        </label>
        <div v-if="qrCodeUrl" class="px-2">
          <img :src="qrCodeUrl" alt="QR Code">
        </div>
      </div>
    </div>

    <div class="border-2 border-black items-center mx-2 my-3 mt-1 p-5 text-justify relative">
      <h2 class="text-2xl font-bold mb-8 text-black">Stats</h2>
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
import ProfileStatsCard from '../components/ProfileStatsCard.vue'
import StatsRankingTable from '../components/StatsRankingTable.vue'
import StatsMatchHistoryTable from '../components/StatsMatchHistoryTable.vue'
import { useUserStore } from '../stores/UserStore' 

export default {
  name: 'ProfileView',
  components: {
    SiteHeader,
    ProfileStatsCard,
    StatsRankingTable,
    StatsMatchHistoryTable
  },
  data() {
    return {
      table_state: 'ranking',
      qrCodeUrl: '',
      userStore: useUserStore()
    }
  },
  methods: {
    async switchAuthenticationMsg(): Promise<void> {
      try {
        const data = await this.userStore.enableTwoFactor();
        if (data.isTwoFactorEnabled) {
          this.qrCodeUrl = data.dataUrl
        } else {
          this.qrCodeUrl = '';
        }
      } catch (error) {
        console.error(error);
      }
    }

  }
}
</script>
