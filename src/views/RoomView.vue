<template>
  <div class="w-full mx-auto text-black">
    <div class="flex flex-col p-5 my-1 text-justify border-2 border-black">
      <template v-if="room">
        <room-summary :room="room" />
        <button
          @click="startGame"
          :disabled="loggedUser?.id !== room?.owner?.id">
          Start game
        </button>
        <game-canvas
          :room="room"
          :game="game"
          v-if="room.status === 'ingame'" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeRouteLeave, useRoute } from 'vue-router'
// import { useGameStore } from '../stores/GameStore';
import RoomSummary from '@/components/RoomSummary.vue'
import GameCanvas from '@/components/GameCanvas.vue'
import { socket, room, game } from '@/includes/gameSocket'
import { useUserStore } from '@/stores/UserStore'
// import { onMounted } from 'vue';

const roomId = useRoute().params.id

const { loggedUser } = useUserStore()

socket.connect()

socket.emit('room:join', roomId)

console.log('room', room)

// to do: to move into a component
function startGame(): void {
  socket.emit('game:start', roomId)
}

onBeforeRouteLeave(() => {
  socket.disconnect()
})
</script>
