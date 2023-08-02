<template>
  <div class="px-4 py-7 sm:p-11 my-2 mx-2 sm:m-4 border-2 border-black">
    <div class="flex items-center justify-between">
      <!-- TITLE -->
      <h2 class="text-xl sm:text-2xl font-bold text-black">Watch a game</h2>
      <!-- RELOAD ROOMS BUTTON -->
      <button @click="fetchRooms()" class="p-2 neobrutalist-box">
        <span class="text-base sm:text-lg">Reload</span>
      </button>
    </div>
    <div class="flex flex-wrap gap-2 mt-8">
      <div v-if="rooms === null">Loading...</div>
      <div v-else-if="rooms.length > 0" v-for="room in rooms" :key="room">
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
        <p>There are no games available</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import fetcher from '@/utils/fetcher'
import { onMounted, ref, type Ref } from 'vue'

// ******************** //
// FUNCTION DEFINITIONS //
// ******************** //

const rooms: Ref<null | any> = ref(null)

function fetchRooms(): void {
  void fetcher.get('/games').then((res) => {
    rooms.value = res
  })
}

onMounted(() => {
  fetchRooms()
})

console.log(rooms)
</script>
