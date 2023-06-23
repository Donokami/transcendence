<template>
  <div class="max-w-screen-xl min-w-[95%] lg:mx-auto text-black">
    <site-header></site-header>
    <div class="border-black border-2 flex flex-col mx-2 my-3 mt-1 p-5 text-justify">
      <h2 class="text-2xl font-bold mb-8 text-black">Profile</h2>
      <profile-stats-card v-if="observedUser" :observedUser="observedUser"></profile-stats-card>
      <div class="form-control">
        <label class="cursor-pointer p-6">
          <span class="stat-value text-xl">{{ authentication_msg }}</span>
          <span class="px-6 align-middle" @click="switchAuthenticationMsg">
            <input type="checkbox" class="toggle rounded-none" />
          </span>
        </label>
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

<script setup lang="ts">
import type { User } from '@/types/User';

import { onMounted, ref, type Ref } from 'vue';
import { useRoute } from 'vue-router';

import { useUserStore } from '@/stores/UserStore';

import SiteHeader from '@/components/SiteHeader.vue'
import ProfileStatsCard from '@/components/ProfileStatsCard.vue'
import StatsRankingTable from '@/components/StatsRankingTable.vue'
import StatsMatchHistoryTable from '@/components/StatsMatchHistoryTable.vue'

const route = useRoute();
const userStore = useUserStore();

const authentication_msg = ref('Activate 2FA')
const table_state = ref('ranking')

const observedUser = ref(null) as Ref<User | null>;

onMounted(async () => {
  if (route.params.id) {
    if (typeof route.params.id === 'string') {
      observedUser.value = await userStore.fetchUserById(route.params.id);
      console.log('ProfileView - observedUser:', observedUser);
    } else {
      console.error('id is not a string:', route.params.id);
    }
  } else {
    observedUser.value = userStore.loggedUser;
  }
});

const switchAuthenticationMsg = () => {
  if (authentication_msg.value === 'Activate 2FA') {
    authentication_msg.value = 'Deactivate 2FA'
  } else {
    authentication_msg.value = 'Activate 2FA'
  }
}

</script>