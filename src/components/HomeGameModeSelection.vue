<template>
  <div
    class="px-4 mx-2 mt-2 bg-white border-2 border-black sm:mt-4 sm:mx-4 py-7 sm:p-11">
    <div class="flex items-center justify-between mb-2">
      <!-- TITLE -->
      <h2 class="text-xl font-bold text-black sm:text-2xl">
        Welcome, {{ loggedUser?.username ?? 'player' }}!
      </h2>
      <!-- GO TO LOBBY BUTTON -->
    </div>
    <!-- MODE TITLE -->
    <div class="flex items-center justify-center flex-grow mt-8">
      <p class="font-bold text-l">PLAY A GAME!</p>
      <iconify-icon
        icon="fa6-solid:table-tennis-paddle-ball"
        class="mx-2"></iconify-icon>
    </div>
    <!-- MODE BUTTONS -->
    <div class="flex justify-center flex-grow gap-5 mt-3">
      <!-- PLAY VS RANDOM BUTTON -->
      <div
        class="tooltip tooltip-bottom sm:tooltip-right"
        data-tip="Play vs random">
        <button
          class="flex px-4 py-2 neobrutalist-box"
          @click="selectRandomGame">
          <span class="icon">
            <iconify-icon icon="tabler:user"></iconify-icon>
          </span>
          <span class="m-2.5">vs</span>
          <span class="icon">
            <iconify-icon icon="tabler:user-question"></iconify-icon>
          </span>
        </button>
      </div>
      <button
        @click="createGameRoom"
        class="flex px-4 py-2 text-base neobrutalist-box sm:text-lg">
        <iconify-icon icon="tabler:plus" class="mr-2"></iconify-icon>
        <span class="text-base sm:text-lg">Create a room</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// ******* //
// IMPORTS //
// ******* //

import fetcher from '@/utils/fetcher'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/UserStore'
import { useToast } from 'vue-toastification'
import type { Room } from '@/types'

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const router = useRouter()
const { loggedUser } = useUserStore()
const toast = useToast()

// ******************** //
// FUNCTION DEFINITIONS //
// ******************** //

const createGameRoom = async (): Promise<void> => {
  try {
    const res = await fetcher.post('/games')

    const resId: string = res.id
    await router.push(`/room/${resId}`)
  } catch (err: any) {
    toast.error('Error creating game room')
  }
}

async function selectRandomGame(): Promise<void> {
  const room: Room[] = await fetcher.get('/games/matchmaking')

  if (room.length > 0) {
    await router.push(`/room/${room[0].id}`)
  } else {
    toast.info(
      'There is no room available at the moment.\n You can wait for someone to join your room.'
    )
    await createGameRoom()
  }
}
</script>
