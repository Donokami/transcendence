<template>
  <div class="drawer drawer-end">
    <input id="my-drawer-4" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content">
      <div class="w-full mx-auto text-black">
        <template v-if="room">
          <div
            class="flex flex-col min-h-[calc(100vh-164px)] sm:min-h-[calc(100vh-130px)]"
            v-if="room.name">
            <!-- SETTING MOBILE BUTTON -->
            <div v-if="!game.started" class="mx-2 mt-2 sm:hidden">
              <label
                for="my-drawer-4"
                class="flex justify-center w-full gap-2 py-2 font-semibold lowercase border-2 border-black cursor-pointer hover:border-black hover:border-2 btn">
                <span class="capitalize">Room settings</span>
                <iconify-icon icon="gg:arrow-right" class="h-6 w-6 mt-[1px]">
                </iconify-icon>
              </label>
            </div>

            <div class="flex flex-grow m-2 border-2 border-black sm:m-4">
              <!-- ROOM SUMMARY -->
              <div v-if="!game.started" class="flex flex-col flex-auto p-8">
                <h1 class="mx-auto text-xl font-semibold sm:text-2xl">
                  {{ room.name }}
                </h1>
                <div class="flex w-full h-full">
                  <div class="flex flex-col w-40 mx-auto my-auto sm:w-56">
                    <div
                      class="flex items-center justify-between w-full mx-auto text-xl sm:text-2xl">
                      <!-- Player 1 -->
                      <div class="rounded-full">
                        <iconify-icon
                          icon="ri:question-line"
                          class="w-10 h-10 sm:h-12 sm:w-12">
                        </iconify-icon>
                      </div>

                      <span class="font-semibold">VS</span>

                      <!-- Player 2 -->
                      <div class="relative font-semibold rounded-full">
                        <div
                          class="absolute w-20 text-center truncate -translate-x-1/2 -top-3/4 left-1/2 sm:w-28">
                          <span class="text-base font-semibold">{{
                            userStore.loggedUser &&
                            userStore.loggedUser.username
                          }}</span>
                        </div>
                        <img
                          v-if="
                            userStore.loggedUser &&
                            userStore.loggedUser.profilePicture &&
                            pictureSrc
                          "
                          :src="pictureSrc"
                          class="object-cover w-10 h-10 rounded-full sm:h-12 sm:w-12" />
                        <iconify-icon
                          v-else
                          icon="ri:account-circle-line"
                          class="w-10 h-10 sm:h-12 sm:w-12">
                        </iconify-icon>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="mt-auto">
                  <button
                    class="block px-4 py-2 mx-auto text-xl bg-blue-500 neobrutalist-box"
                    @click="startGame"
                    :disabled="userStore.loggedUser?.id !== room?.owner?.id">
                    Start game
                  </button>
                </div>
              </div>

              <!-- SIDEBAR -->
              <div class="hidden p-8 border-l-2 border-black sm:block">
                <room-settings v-if="!game.started" />
              </div>
              <!-- GAME -->
              <game-canvas :room="room" :game="game" v-if="game.started" />
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- DRAWER -->
    <div class="drawer-side">
      <label for="my-drawer-4" class="drawer-overlay"></label>
      <div class="h-full p-8 menu w-80 bg-base-200 text-base-content">
        <room-settings v-if="!game.started" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { onBeforeRouteLeave, useRoute } from 'vue-router'
import GameCanvas from '@/components/GameCanvas.vue'
import RoomSettings from '@/components/RoomSettings.vue'
import { socket, room, game } from '@/includes/gameSocket'
import { useUserStore } from '@/stores/UserStore'

const roomId = useRoute().params.id

const userStore = useUserStore()

socket.connect()

socket.emit('room:join', roomId)

const pictureSrc = computed(() => {
  const profilePicture = userStore.loggedUser?.profilePicture
  if (!profilePicture) return null

  return profilePicture
  // if (profilePicture.includes('cdn.intra.42')) {
  //   return profilePicture
  // } else {
  //   return `http://localhost:3000/${profilePicture}`
  // }
})

function startGame(): void {
  socket.emit('game:start', roomId)
}

onBeforeRouteLeave(() => {
  socket.disconnect()
})
</script>
