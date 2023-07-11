<template>
  <div class="max-w-screen-xl min-w-[95%] mx-auto text-black">
    <div class="border-black border-2 flex flex-col mx-2 my-3 mt-1 p-5 text-justify">
      <div class="p-4" v-if="room.name">
        <h1 class="text-xl font-bold">{{ room.name }}</h1>

        <ul>
          <li>{{ room.players.length }} / {{ room.maxPlayers }}</li>
          <li>
            <span>Status: </span>
            {{ room.status }}
          </li>
          <li>
            <div class="flex flex-row items-center">
              <label class="block font-medium mb-1" for="private">Private game</label>
              <input type="checkbox" name="private" @click="togglePrivacy" class="ml-4 toggle rounded-none" :disabled="loggedUser.id !== room.owner.id" />
            </div>
          </li>
          <li>
            <span>Owner: </span>
            {{ room.owner.username }}
          </li>
          <span>Players</span>
          <li v-for="player in room.players" :key="player.id">
            {{ player.username }}
          </li>
        </ul>
      </div>
      <!-- <div v-if="isError">
        <div>Error: {{ error }}</div>
        <button>Retry</button>
      </div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeRouteLeave, useRoute } from 'vue-router'
import io from 'socket.io-client'
import { ref } from 'vue'
import { useUserStore } from '@/stores/UserStore'

const route = useRoute()
let room = ref({})

const socket = io('http://localhost:3002/game', {
  withCredentials: true,
  query: {
    gameId: route.params.id
  },
  transports: ['websocket']
})

socket.on('connect', () => {
  socket.emit('join', route.params.id)

  console.log('connected')
})

socket.on('disconnect', async () => {
  console.log('disconnected')
})

socket.on('error', (error) => {
  console.error(error)
})

socket.on('game:update', (data) => {
  console.log(data)

  room.value = { ...room.value, ...data }
})

const togglePrivacy = async () => {
  await fetch(`http://localhost:3000/api/games/${route.params.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      isPrivate: !room.value.isPrivate
    }),
    credentials: 'include'
  })
}

const kick = async () => {}

onBeforeRouteLeave(async () => {
  socket.disconnect()
})

const { loggedUser } = useUserStore()
</script>
