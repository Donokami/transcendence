<template>
  <div class="w-full mx-auto text-black">
    <div
      class="flex flex-col px-4 mx-2 mt-2 text-justify border-2 border-black sm:mt-4 sm:mx-4 py-7 sm:p-11">
      <!-- TITLE -->
      <h2 class="mb-8 text-2xl font-bold text-black">Profile</h2>
      <!-- STATS CARD -->
      <profile-stats-card
        :user="user"
        v-if="user"
        @update-user="fetchProfile(user.id)" />
      <!-- 2FA  -->
      <ProfileTwoFactor v-if="user?.id === loggedUser?.id" />
    </div>
    <!-- STATS -->
    <div
      class="relative items-center px-4 mx-2 my-2 text-justify border-2 border-black py-7 sm:p-11 sm:my-4 sm:mx-4">
      <h2 class="mb-8 text-2xl font-bold text-black">Stats</h2>
      <StatsSwitcher :user-id="user.id" v-if="user" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type Ref, onMounted } from 'vue'

import ProfileStatsCard from '@/components/ProfileStatsCard.vue'
import StatsSwitcher from '@/components/StatsSwitcher.vue'
import ProfileTwoFactor from '@/components/ProfileTwoFactor.vue'
import { useUserStore } from '@/stores/UserStore'
import { useToast } from 'vue-toastification'
import type { User } from '@/types'
import fetcher from '@/utils/fetcher'
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router'

const user: Ref<User | null> = ref(null)
const toast = useToast()
const router = useRouter()

const { loggedUser } = useUserStore()

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
