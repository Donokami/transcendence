<template>
  <div class="border-black border-2 my-1 p-5">
    <div class="flex items-center justify-between mb-2">
      <!-- TITLE -->
      <h2 class="text-2xl font-bold text-black">Watch a game</h2>
      <!-- RELOAD ROOMS BUTTON -->
      <button @click="refetch()" class="neobrutalist-box p-2">Reload</button>
    </div>
    <div class="flex flex-wrap gap-2">
      <div v-if="isError" class="text-red-500">{{ error }}</div>
      <div v-if="isLoading">Loading...</div>
      <div v-else-if="rooms.length > 0" v-for="room in rooms.data" :key="room">
        <router-link
          :to="`/room/${room.id}`"
          class="flex flex-col neobrutalist-box m-2.5 px-2 py-2">
          <span>{{ room.name }}</span>

          <span class="text-xs text-gray-400">
            {{ room.players.length }} / {{ room.maxPlayers }}
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
// ******* //
// IMPORTS //
// ******* //

import { useQuery } from '@tanstack/vue-query'

// ******************** //
// FUNCTION DEFINITIONS //
// ******************** //

async function getRooms() {
  const res = await fetch('http://localhost:3000/api/games', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })
  if (!res.ok) {
    throw new Error(res.statusText)
  }
  return await res.json()
}
const {
  isLoading,
  isError,
  data: rooms,
  error,
  refetch
} = useQuery({
  queryKey: ['rooms'],
  queryFn: getRooms
})

console.log(rooms, isLoading, isError, error)
</script>
