<template>
  <div class="max-w-screen-xl min-w-[95%] lg:mx-auto text-black">
    <div class="flex flex-col p-5 mx-2 my-3 mt-1 text-justify border-2 border-black">
      <!-- TITLE -->
      <h2 class="mb-8 text-2xl font-bold text-black">Profile</h2>
      <!-- STATS CARD -->
      <profile-stats-card></profile-stats-card>
      <!-- CHANGE USERNAME BUTTON & MODAL -->
      <div class="p-4">
        <div>
          <label for="my-modal-4"
            class="mb-2 text-black bg-white border-2 border-black btn hover:bg-primary hover:border-primary hover:text-white"
            type="button" @click="showUsernameModal = true">
            CHANGE USERNAME
          </label>
          <change-username-modal v-if="showUsernameModal" @close-modal="handleCloseUsernameModal"></change-username-modal>
        </div>
      </div>
      <!-- 2FA TOGGLER & QR CODE -->
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
    <!-- STATS -->
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

import { ref } from 'vue';

import ChangeUsernameModal from '@/components/ChangeUsernameModal.vue';
import ProfileStatsCard from '@/components/ProfileStatsCard.vue'
import StatsRankingTable from '@/components/StatsRankingTable.vue'
import StatsMatchHistoryTable from '@/components/StatsMatchHistoryTable.vue'
import { useUserStore } from '@/stores/UserStore';

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const authMessage = ref('Activate 2FA')
const qrCodeUrl = ref('')
const showUsernameModal = ref(false)
const tableState = ref('ranking')
const userStore = useUserStore();

// ******************** //
// FUNCTION DEFINITIONS //
// ******************** //

// ************************ //
// handleCloseUsernameModal //
// ************************ //

const handleCloseUsernameModal = () => {
  showUsernameModal.value = false;
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

</script>
