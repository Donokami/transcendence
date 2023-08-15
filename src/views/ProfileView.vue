<template>
  <div class="w-full mx-auto text-black">
    <div
      class="flex flex-col mt-2 sm:mt-4 mx-2 sm:mx-4 px-4 py-7 sm:p-11 border-2 border-black text-justify">
      <!-- TITLE -->
      <h2 class="mb-8 font-bold text-2xl text-black">Profile</h2>
      <!-- STATS CARD -->
      <profile-stats-card
        :user="user"
        v-if="user"
        @update-user="fetchProfile(user.id)" />
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
      <StatsSwitcher :user-id="user.id" v-if="user" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type Ref, onMounted } from 'vue'

import ProfileStatsCard from '@/components/ProfileStatsCard.vue'
import { useUserStore } from '@/stores/UserStore'
import { useToast } from 'vue-toastification'
import StatsSwitcher from '@/components/StatsSwitcher.vue'
import type { User } from '@/types'
import fetcher from '@/utils/fetcher'
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router'

const user: Ref<User | null> = ref(null)
const authMessage = ref('Activate 2FA')
const qrCodeUrl = ref('')
const userStore = useUserStore()
const toast = useToast()
const router = useRouter()

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

async function fetchProfile(userId: string): Promise<void> {
  try {
    user.value = await fetcher.get(`/user/${userId}/stats`)
  } catch (error) {
    toast.error("This profile wasn't found")
    await router.push('/')
  }
}

onMounted(async () => {
  await fetchProfile(useRoute().params.id as string)
})

onBeforeRouteUpdate(async (to, from) => {
  await fetchProfile(to.params.id as string)
})
</script>
