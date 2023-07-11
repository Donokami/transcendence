<template>
  <div class="max-w-screen-xl min-w-[95%] lg:mx-auto text-black">
    <div class="border-black border-2 flex flex-col mx-2 my-3 mt-1 p-5 text-justify">
      <h2 class="text-2xl font-bold mb-8 text-black">Profile</h2>
      <profile-stats-card v-if="observedUser" :observedUser="observedUser"></profile-stats-card>
      <div class="form-control">
        <label class="cursor-pointer p-6">
          <span class="stat-value text-xl">{{ authMessage }}</span>
          <span class="px-6 align-middle">
            <input
              type="checkbox"
              class="toggle rounded-none"
              v-model="userStore.twoFactorEnabled"
              @click="switchAuthMessage"
            />
          </span>
        </label>
        <div v-if="qrCodeUrl" class="px-2">
          <img :src="qrCodeUrl" alt="QR Code">
        </div>
      </div>
    </div>

    <profile-friend-request-list-modal @friend-request-accepted="fetchUser"></profile-friend-request-list-modal>

    <div class="border-2 border-black items-center mx-2 my-3 mt-1 p-5 text-justify relative">
      <h2 class="text-2xl font-bold mb-8 text-black">Stats</h2>
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

// ******* //
// IMPORTS //
// ******* //

import { onBeforeMount, ref, type Ref} from 'vue';
import { onBeforeRouteUpdate, useRoute } from 'vue-router';

import type { User } from '@/types/User';

import { useUserStore } from '@/stores/UserStore';

import ProfileStatsCard from '@/components/ProfileStatsCard.vue'
import ProfileFriendRequestListModal from '@/components/ProfileFriendRequestListModal.vue'
import StatsRankingTable from '@/components/StatsRankingTable.vue'
import StatsMatchHistoryTable from '@/components/StatsMatchHistoryTable.vue'

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const route = useRoute();
const userStore = useUserStore();

const authMessage = ref('Activate 2FA')
const qrCodeUrl= ref('')

const tableState = ref('ranking')

const observedUser = ref(null) as Ref<User | null>;

// ******************** //
// FUNCTION DEFINITIONS //
// ******************** //

// ***************** //
// switchAuthMessage //
// ***************** //

const switchAuthMessage = async () => {
  try {
    const data = await userStore.enableTwoFactor();
    if (data.isTwoFactorEnabled) {
      qrCodeUrl.value = data.dataUrl
      authMessage.value = 'Deactivate 2FA'
    }
    else {
      qrCodeUrl.value = '';
      authMessage.value = 'Activate 2FA'
    }
  }
  catch (error) {
    console.error(error);
  }
};

// ********* //
// fetchUser //
// ********* //

const fetchUser = async (id: string | undefined) => {
  if (id) {
    observedUser.value = await userStore.fetchUserById(id);
  }
  else {
    observedUser.value = userStore.loggedUser;
  }
  console.log(`[ProfileView] - The current observed user is ${observedUser.value.username}`);
};

// ********************* //
// VueJs LIFECYCLE HOOKS //
// ********************* //

onBeforeMount(async () => {
  let id = route.params.id;
  if (Array.isArray(id)) {
    id = id[0];
  }
  await fetchUser(id);
});

onBeforeRouteUpdate(async (to, from)=> {
  const id = to.path.split("/").pop();
  await fetchUser(id);
})

</script>
