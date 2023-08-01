<template>
  <div class="p-4 bg-red-300" v-if="room.name">
    <h1 class="text-xl font-bold">{{ room.name }}</h1>

    <ul>
      <li>{{ room.players.length }} / 2</li>
      <li>
        <span>Status: </span>
        {{ room.status }}
      </li>
      <li>
        <div class="flex flex-row items-center">
          <label class="block mb-1 font-medium" for="private">
            Private game
          </label>
          <input
            type="checkbox"
            name="private"
            @click="togglePrivacy"
            class="ml-4 rounded-none toggle"
            :disabled="loggedUser?.id !== room.owner.id" />
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
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/UserStore'
import { ref } from 'vue'
import type { Room } from '@/types'

const props = defineProps<{
  room: Room
}>()

const room = ref(props.room)

const { loggedUser } = useUserStore()

const togglePrivacy = async (): Promise<void> => {
  await fetch(`http://localhost:3000/api/games/${room.value.id}`, {
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
// const kick = async() => {}
</script>
