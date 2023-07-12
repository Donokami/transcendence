<template>
  <div class="max-w-screen-xl min-w-[95%] lg:mx-auto text-black">
    <div class="flex flex-col p-5 mx-2 my-3 mt-1 text-justify border-2 border-black">
      <h2 class="mb-8 text-2xl font-bold text-black">Profile</h2>
      <profile-stats-card v-if="observedUser" :observedUser="observedUser"></profile-stats-card>

      <div class="p-4">
        <div>
          <label for="my-modal-4"
            class="mb-2 text-black bg-white border-2 border-black btn hover:bg-primary hover:border-primary hover:text-white"
            type="button" @click="usernameModalVisible = true">
            CHANGE USERNAME
          </label>
          <change-username-modal v-if="usernameModalVisible" @close-modal="handleCloseModal"></change-username-modal>
        </div>
      </div>

      <div class="p-4">
        <span class="text-xl stat-value">{{ authMessage }}</span>
        <span class="px-6 align-middle ">
          <input type="checkbox" class="rounded-none toggle" v-model="userStore.twoFactorEnabled"
            @click="switchAuthMessage" />
        </span>
        <div v-if="qrCodeUrl" class="-ml-4">
          <img :src="qrCodeUrl" alt="QR Code">
        </div>
      </div>
    </div>

    <profile-friend-request-list-modal @friend-request-accepted="fetchUser"></profile-friend-request-list-modal>

    <div class="relative items-center p-5 mx-2 my-3 mt-1 text-justify border-2 border-black">
      <h2 class="mb-8 text-2xl font-bold text-black">Stats</h2>
      <stats-ranking-table @table-state-changed="tableState = $event"
        v-show="tableState === 'ranking'"></stats-ranking-table>
      <stats-match-history-table @table-state-changed="tableState = $event"
        v-show="tableState === 'matchHistory'"></stats-match-history-table>
    </div>
  </div>
</template>

<script setup lang="ts">

// ******* //
// IMPORTS //
// ******* //

import { onBeforeMount, ref, type Ref } from 'vue';
import { onBeforeRouteUpdate, useRoute } from 'vue-router';

import type { User } from '@/types/User';

import { useUserStore } from '@/stores/UserStore';

import ProfileStatsCard from '@/components/ProfileStatsCard.vue'
import ProfileFriendRequestListModal from '@/components/ProfileFriendRequestListModal.vue'
import StatsRankingTable from '@/components/StatsRankingTable.vue'
import StatsMatchHistoryTable from '@/components/StatsMatchHistoryTable.vue'
import ChangeUsernameModal from '@/components/ChangeUsernameModal.vue';

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const route = useRoute();
const userStore = useUserStore();

const authMessage = ref('Activate 2FA')
const qrCodeUrl = ref('')

const tableState = ref('ranking')

const observedUser = ref(null) as Ref<User | null>;

const usernameModalVisible = ref(false)


// ******************** //
// FUNCTION DEFINITIONS //
// ******************** //

const handleCloseModal = () => {
  usernameModalVisible.value = false;
  location.reload();
};

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

onBeforeRouteUpdate(async (to, from) => {
  const id = to.path.split("/").pop();
  await fetchUser(id);
})

</script>
