<template>
  <div class="w-full mx-auto text-black">
    <div class="flex flex-col mt-2 sm:mt-4 mx-2 sm:mx-4 px-4 py-7 sm:p-11 border-2 border-black text-justify">
      <!-- TITLE -->
      <h2 class="mb-8 font-bold text-2xl text-black">Profile</h2>
      <!-- STATS CARD -->
      <profile-stats-card></profile-stats-card>

      <!-- CHANGE USERNAME -->
      <div class="my-4">
        <!-- BUTTON -->
        <label
          for="my-modal-4"
          class="mb-2 text-black bg-white border-2 border-black btn hover:bg-black hover:border-black hover:text-white"
          type="button"
          @click="showUsernameModal = true">
          CHANGE USERNAME
        </label>
        <!-- MODAL -->
        <profile-change-username-modal
          v-if="showUsernameModal"
          @close-modal="
            handleCloseUsernameModal
          "></profile-change-username-modal>
      </div>

      <!-- 2FA  -->
      <div class="mt-4">
        <!-- TOGGLER-->
        <span class="text-xl stat-value">{{ authMessage }}</span>
        <span class="px-6 align-middle">
          <input
            type="checkbox"
            class="rounded-none toggle"
            v-model="userStore.twoFactorEnabled"
            @click="switchAuthMessage" />
        </span>
        <!-- QR CODE -->
        <div v-if="qrCodeUrl" class="-ml-4">
          <img :src="qrCodeUrl" alt="QR Code" />
        </div>
      </div>
    </div>
    <!-- STATS -->
    <div
      class="relative items-center px-4 py-7 sm:p-11 my-2 sm:my-4 mx-2 sm:mx-4 text-justify border-2 border-black">
      <h2 class="mb-8 text-2xl font-bold text-black">Stats</h2>
      <stats-ranking-table
        @table-state-changed="tableState = $event"
        v-show="tableState === 'ranking'"></stats-ranking-table>
      <stats-match-history-table
        @table-state-changed="tableState = $event"
        v-show="tableState === 'matchHistory'"></stats-match-history-table>
    </div>
  </div>
</template>

<script setup lang="ts">
// ******* //
// IMPORTS //
// ******* //

import { ref } from 'vue'

import ProfileChangeUsernameModal from '@/components/ProfileChangeUsernameModal.vue'
import ProfileStatsCard from '@/components/ProfileStatsCard.vue'
import StatsRankingTable from '@/components/StatsRankingTable.vue'
import StatsMatchHistoryTable from '@/components/StatsMatchHistoryTable.vue'
import { useUserStore } from '@/stores/UserStore'
import { useToast } from 'vue-toastification'

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const authMessage = ref('Activate 2FA')
const qrCodeUrl = ref('')
const showUsernameModal = ref(false)
const tableState = ref('ranking')
const userStore = useUserStore()
const toast = useToast()

// ******************** //
// FUNCTION DEFINITIONS //
// ******************** //

// ************************ //
// handleCloseUsernameModal //
// ************************ //

const handleCloseUsernameModal = (): void => {
  showUsernameModal.value = false
  location.reload()
}

// ***************** //
// switchAuthMessage //
// ***************** //

const switchAuthMessage = async (): Promise<void> => {
  try {
    const data = await userStore.enableTwoFactor()
    if (data.isTwoFactorEnabled) {
      qrCodeUrl.value = data.dataUrl
      authMessage.value = 'Deactivate 2FA'
    } else {
      qrCodeUrl.value = ''
      authMessage.value = 'Activate 2FA'
    }
  } catch (error: any) {
    toast.error('An error occured while enabling 2FA')
  }
}
</script>
