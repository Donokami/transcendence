<template>
  <div
    class="px-4 mx-2 my-2 bg-white border-2 border-black py-7 sm:p-11 sm:m-4">
    <div class="flex items-center justify-between">
      <!-- TITLE -->
      <h2 class="text-xl font-bold text-black sm:text-2xl">Available rooms</h2>
      <!-- RELOAD ROOMS BUTTON -->
      <button @click="fetchRooms()" class="flex p-2 neobrutalist-box">
        <iconify-icon icon="tabler:refresh"></iconify-icon>

        <span class="ml-2 text-base sm:text-lg"> Reload</span>
      </button>
    </div>
    <div class="flex flex-wrap gap-2 mt-8">
      <div v-if="rooms === null">Loading...</div>
      <div v-else-if="rooms.length > 0" v-for="room in rooms" :key="room.id">
        <router-link
          :to="`/room/${room.id}`"
          class="flex flex-col neobrutalist-box m-2.5 px-2 py-2">
          <span>{{ room.name }}</span>

          <span class="text-xs text-gray-400">
            {{ room.players.length }} / 2
          </span>
        </router-link>
      </div>
      <div v-else>
        <p>There are no rooms available. Create one!</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Room } from '@/types'
import fetcher from '@/utils/fetcher'
import { onMounted, ref, type Ref } from 'vue'

// ******************** //
// FUNCTION DEFINITIONS //
// ******************** //

const rooms: Ref<null | Room[]> = ref(null)

function fetchRooms(): void {
  rooms.value = null
  void fetcher.get('/games').then((res) => {
    rooms.value = res
  })
}

onMounted(() => {
  fetchRooms()
})
</script>
