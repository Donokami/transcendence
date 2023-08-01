<template>
  <div class="p-5 my-1 border-2 border-black">
    <div class="flex items-center justify-between mb-2">
      <!-- TITLE -->
      <h2 class="text-2xl font-bold text-black">Watch a game</h2>
      <!-- RELOAD ROOMS BUTTON -->
      <button @click="fetchRooms()" class="p-2 neobrutalist-box">Reload</button>
    </div>
    <div class="flex flex-wrap gap-2">
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
