<template>
  <div class="max-w-screen-xl min-w-[95%] lg:mx-auto text-black">
    <site-header></site-header>
    <div class="border-black border-2 flex flex-col mx-2 my-3 mt-1 p-5 text-justify">
      <h2 class="text-2xl font-bold mb-8 text-black">Profile</h2>

      <div class="stats">
        <div class="stat border-black border-r-2">
          <div class="stat-figure text-secondary">
            <div class="avatar online">
              <div class="w-16 rounded-full">
                <img src="../assets/profile-picture.jpg" />
              </div>
            </div>
          </div>
          <div class="stat-value text-xl">{{ observedUser.username }}</div>
          <div class="stat-title text-md">Status: {{ observedUser.status }}</div>
          <div class="stat-desc text-secondary">-</div>
        </div>

        <div class="stat border-none">
          <div class="stat-figure text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              class="inline-block w-8 h-8 stroke-current"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              ></path>
            </svg>
          </div>
          <div class="stat-value text-xl">Rank</div>
          <div class="stat-value text-primary">{{ observedUser.rank }}</div>
          <div class="stat-desc">-</div>
        </div>

        <div class="stat border-black !border-l-2">
          <div class="stat-figure text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              class="inline-block w-8 h-8 stroke-current"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              ></path>
            </svg>
          </div>
          <div class="stat-value text-xl">Win Rate</div>
          <div class="stat-value text-primary">{{ observedUser.win_rate }} %</div>
          <div class="stat-desc">-</div>
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
import StatsRankingTable from '../components/StatsRankingTable.vue'
import StatsMatchHistoryTable from '../components/StatsMatchHistoryTable.vue'

export default {
  name: 'ProfileView',
  components: {
    SiteHeader,
    StatsRankingTable,
    StatsMatchHistoryTable
  },
  data() {
    return {
      observedUser: {
        id: 3,
        username: 'Mitsun0bu',
        email: '',
        password: '',
        profile_picture: '',
        status: '',
        rank: 4,
        games_played: 10,
        win: 2,
        loss: 8,
        win_rate: 20,
        points_scored: 4,
        points_conceded: 25,
        points_difference: -21
      },
      table_state: 'ranking'
    }
  },
  methods: {}
}
</script>
