<template>
  <div class="w-full mx-auto my-4">
    <template v-if="room">
      <div class="border-2 border-black bg-white min-h-[800px]">
        <h1 class="p-8 mx-auto text-xl font-semibold text-center sm:text-2xl">
          {{ room.name }}
        </h1>
        <div class="flex flex-wrap flex-grow">
          <room-summary
            class="h-[400px]"
            v-if="!game.started"
            :room="room"
            :game="game" />
          <div class="block px-16 m-4 mx-auto">
            <room-settings v-if="!game.started" />
          </div>
        </div>
        <div class="mx-auto">
          <game-canvas :room="room" :game="game" v-if="game.started" />
        </div>
      </div>
    </template>
    <span v-else class="m-auto">Loading...</span>
  </div>
</template>

<script setup lang="ts">
import { onBeforeRouteLeave, useRoute } from 'vue-router'
import GameCanvas from '@/components/GameCanvas.vue'
import RoomSettings from '@/components/RoomSettings.vue'
import RoomSummary from '@/components/RoomSummary.vue'
import { socket, room, game } from '@/includes/gameSocket'

const roomId = useRoute().params.id

socket.connect()
socket.emit('room:join', roomId)

onBeforeRouteLeave(() => {
  socket.disconnect()
})
</script>
