<template>
  <div v-if="!game.started" class="flex flex-col flex-auto p-8">
    <div class="flex flex-col w-40 mx-auto my-auto sm:w-56">
      <div
        class="flex items-center justify-between w-full mx-auto text-xl sm:text-2xl">
        <!-- Player 1 -->
        <div class="relative font-semibold rounded-full">
          <template v-if="room.players[0]">
            <div
              class="absolute text-center truncate -translate-x-1/2 w-28 -top-3/4 left-1/2 sm:w-40">
              <span class="w-40 text-base font-semibold">
                {{ room.players[0].username }}
              </span>
            </div>
            <div class="w-10 h-10 sm:h-12 sm:w-12">
              <user-avatar
                :userProps="(room.players[0] as User)"
                :uploadMode="false"
                :status-mode="false"></user-avatar>
            </div>
          </template>
          <iconify-icon
            v-else
            icon="ri:question-line"
            class="w-10 h-10 sm:h-12 sm:w-12 opacity-60">
          </iconify-icon>
        </div>

        <span class="font-semibold">VS</span>

        <!-- Player 2 -->
        <div class="relative font-semibold">
          <template v-if="room.players[1]">
            <div
              class="absolute text-center truncate -translate-x-1/2 w-28 -top-3/4 left-1/2 sm:w-40">
              <span class="w-40 text-base font-semibold">
                {{ room.players[1].username }}
              </span>
            </div>
            <div class="w-10 h-10 sm:h-12 sm:w-12">
              <user-avatar
                :userProps="(room.players[1] as User)"
                :uploadMode="false"
                :status-mode="false"></user-avatar>
            </div>
          </template>
          <iconify-icon
            v-else
            icon="ri:question-line"
            class="w-10 h-10 sm:h-12 sm:w-12 opacity-60">
          </iconify-icon>
        </div>
      </div>
    </div>

    <div class="mt-auto">
      <button
        class="block px-4 py-2 mx-auto text-xl neobrutalist-box"
        @click="startGame"
        v-if="loggedUser?.id === room?.owner?.id">
        Start game
      </button>
      <button
        class="block px-4 py-2 mx-auto text-xl neobrutalist-box"
        disabled
        v-else>
        Waiting for game to start...
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Game, Room, User } from '@/types'
import { socket } from '@/includes/gameSocket'
import { useUserStore } from '@/stores/UserStore'
import UserAvatar from '@/components/UserAvatar.vue'

const props = defineProps<{
  room: Room
  game: Game
}>()

const room = ref(props.room)
const game = ref(props.game)

const { loggedUser } = useUserStore()

function startGame(): void {
  socket.emit('game:start', room.value.id)
}
</script>
