<template>

<div class="drawer drawer-end">
  <input id="my-drawer-4" type="checkbox" class="drawer-toggle" />
  <div class="drawer-content">

    <div class="w-full mx-auto text-black">
        <template v-if="room">

          <div class="flex flex-col min-h-[calc(100vh-164px)] sm:min-h-[calc(100vh-130px)]" v-if="room.name"> 

              <!-- SETTING MOBILE BUTTON -->
              <div v-if="room.status !== 'ingame'" class="mx-2 mt-2 sm:hidden">
                <label for="my-drawer-4" class="py-2 w-full border-2 border-black hover:border-black hover:border-2 font-semibold flex justify-center gap-2 cursor-pointer btn lowercase">
                  <span class="capitalize">Room settings</span>
                  <iconify-icon
                    icon="gg:arrow-right"
                    class="h-6 w-6 mt-[1px]">
                  </iconify-icon>
                </label>
              </div>

            <div class="flex flex-grow border-2 m-2 sm:m-4 border-black">

              <!-- ROOM SUMMARY -->
              <div v-if="room.status !== 'ingame'" class="flex flex-col flex-auto p-8"> 
                <h1 class="text-xl sm:text-2xl font-semibold mx-auto">{{ room.name }}</h1>
                <div class="w-full flex h-full"> 

                  <div class="mx-auto my-auto flex flex-col w-40 sm:w-56">
                    <div class="mx-auto text-xl sm:text-2xl flex w-full justify-between items-center">

                      <!-- Player 1 -->
                      <div class="rounded-full">
                        <iconify-icon
                          icon="ri:question-line"
                          class="h-10 w-10 sm:h-12 sm:w-12">
                        </iconify-icon>
                      </div>

                      <span class="font-semibold">VS</span>

                      <!-- Player 2 -->
                        <div class="rounded-full relative font-semibold">
                          <div class="absolute -top-3/4 -translate-x-1/2 left-1/2 w-20 sm:w-28 text-center truncate">
                            <span class="text-base font-semibold">{{ userStore.loggedUser && userStore.loggedUser.username }}</span>
                          </div>
                          <img
                            v-if="
                              userStore.loggedUser &&
                              userStore.loggedUser.profilePicture &&
                              pictureSrc
                            "
                            :src="pictureSrc"
                            class="object-cover h-10 w-10 sm:h-12 sm:w-12 rounded-full" />
                          <iconify-icon
                            v-else
                            icon="ri:account-circle-line"
                            class="h-10 w-10 sm:h-12 sm:w-12 ">
                          </iconify-icon>
                        </div>

                    </div>
                  </div>

                </div>

                <div class="mt-auto">
                  <button class="bg-blue-500 text-xl mx-auto block neobrutalist-box py-2 px-4"
                    @click="startGame"
                    :disabled="userStore.loggedUser?.id !== room?.owner?.id">
                    Start game
                  </button>
                </div>

              </div>

              <!-- SIDEBAR -->
              <div v-if="room.status !== 'ingame'" class="p-8 border-l-2 border-black hidden sm:block">

                <div class="font-semibold text-xl">
                  <h1>Room settings</h1>
                </div>

                <div class="mt-8 font-semibold text-md">
                  <h2>Game Type</h2>
                  <div class="join mt-3">
                    <input class="join-item btn" type="radio" value="public" name="type" aria-label="Public" v-model="gameType" />
                    <input class="join-item btn" type="radio" value="private" name="type" aria-label="Private" v-model="gameType" />
                  </div>
                </div>

                <div class="mt-8 font-semibold text-md">
                  <h2>Game Duration <span class="text-xs">(optional)</span></h2>
                  <div class="join mt-3">
                    <input class="join-item btn" type="radio" name="time" value="1.5" aria-label="1.5" v-model="gameDuration" @click="toggleGameDuration('1.5')"/>
                    <input class="join-item btn" type="radio" name="time" value="3" aria-label="3" v-model="gameDuration" @click="toggleGameDuration('3')"/>
                    <input class="join-item btn" type="radio" name="time" value="6" aria-label="6" v-model="gameDuration" @click="toggleGameDuration('6')"/>
                  </div>
                </div>

                <div class="mt-8 font-semibold text-md">
                  <h2>Ball Speed</h2>
                  <div class="join mt-3">
                    <input class="join-item btn" type="radio" name="speed" value="1" aria-label="1" v-model="ballSpeed"/>
                    <input class="join-item btn" type="radio" name="speed" value="1.5" aria-label="1.5" v-model="ballSpeed"/>
                    <input class="join-item btn" type="radio" name="speed" value="2" aria-label="2" v-model="ballSpeed"/>
                    <input class="join-item btn" type="radio" name="speed" value="2.5" aria-label="2.5" v-model="ballSpeed"/>
                    <input class="join-item btn" type="radio" name="speed" value="3" aria-label="3" v-model="ballSpeed"/>
                  </div>
                </div>

                <div class="mt-8 font-semibold text-md">
                  <h2>Paddle Size</h2>
                  <div class="join mt-3">
                    <input class="join-item btn" type="radio" name="paddle" value="small" aria-label="Small"  v-model="paddleSize"/>
                    <input class="join-item btn" type="radio" name="paddle" value="medium" aria-label="Medium" v-model="paddleSize"/>
                    <input class="join-item btn" type="radio" name="paddle" value="large" aria-label="Large" v-model="paddleSize"/>
                  </div>
                </div>


              </div>

              <!-- GAME -->
              <game-canvas
                :room="room"
                :game="game"
                v-if="room.status === 'ingame'"
              />

            </div>

          </div>

        </template>
    </div>
  </div> 

    <!-- DRAWER -->
    <div class="drawer-side">
      <label for="my-drawer-4" class="drawer-overlay"></label>      
      <div class="menu p-8 w-80 h-full bg-base-200 text-base-content">

        <div class="font-semibold text-xl flex justify-between">
          <h1>Room settings</h1>
          <label for="my-drawer-4" class="btn btn-square border-2 border-black hover:border-2 hover:border-black btn-sm relative">
            <iconify-icon
              icon="material-symbols:close"
              class="h-6 w-6 absolute">
            </iconify-icon>
          </label>
        </div>

        <div class="mt-8 font-semibold text-md">
          <h2>Game Type</h2>
          <div class="join mt-3">
            <input class="join-item btn" type="radio" value="public" name="type-draw" aria-label="Public" v-model="gameType" />
            <input class="join-item btn" type="radio" value="private" name="type-draw" aria-label="Private" v-model="gameType" />
          </div>
        </div>

        <div class="mt-8 font-semibold text-md">
          <h2>Game Duration <span class="text-xs">(optional)</span></h2>
          <div class="join mt-3">
            <input class="join-item btn" type="radio" name="time-draw" value="1.5" aria-label="1.5" v-model="gameDuration" @click="toggleGameDuration('1.5')"/>
            <input class="join-item btn" type="radio" name="time-draw" value="3" aria-label="3"  v-model="gameDuration" @click="toggleGameDuration('3')"/>
            <input class="join-item btn" type="radio" name="time-draw" value="6" aria-label="6"  v-model="gameDuration" @click="toggleGameDuration('6')"/>
          </div>
        </div>

        <div class="mt-8 font-semibold text-md">
          <h2>Ball Speed</h2>
          <div class="join mt-3">
            <input class="join-item btn" type="radio" name="speed-draw" value="1" aria-label="1" v-model="ballSpeed" />
            <input class="join-item btn" type="radio" name="speed-draw" value="1.5" aria-label="1.5" v-model="ballSpeed" />
            <input class="join-item btn" type="radio" name="speed-draw" value="2" aria-label="2" v-model="ballSpeed"/>
            <input class="join-item btn" type="radio" name="speed-draw" value="2.5" aria-label="2.5" v-model="ballSpeed" />
            <input class="join-item btn" type="radio" name="speed-draw" value="3" aria-label="3" v-model="ballSpeed"/>
          </div>
        </div>

        <div class="mt-8 font-semibold text-md">
          <h2>Paddle Size</h2>
          <div class="join mt-3">
            <input class="join-item btn" type="radio" name="paddle-draw" value="small" aria-label="Small" v-model="paddleSize" />
            <input class="join-item btn" type="radio" name="paddle-draw" value="medium" aria-label="Medium" v-model="paddleSize" />
            <input class="join-item btn" type="radio" name="paddle-draw" value="large" aria-label="Large" v-model="paddleSize" />
          </div>
        </div>

      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onBeforeRouteLeave, useRoute } from 'vue-router'
import GameCanvas from '@/components/GameCanvas.vue'
import { socket, room, game } from '@/includes/gameSocket'
import { useUserStore } from '@/stores/UserStore'



const gameType = ref('public');
const gameDuration = ref('');
const ballSpeed = ref('1');
const paddleSize = ref('medium');


const toggleGameDuration = (value: string): void => {
  if (gameDuration.value === value) {
    gameDuration.value = '';
  } else {
    gameDuration.value = value;
  }
}

const roomId = useRoute().params.id

const userStore = useUserStore()

socket.connect()

socket.emit('room:join', roomId)

console.log('room', room)

const pictureSrc = computed(() => {
  const profilePicture = userStore.loggedUser?.profilePicture
  if (!profilePicture) return null

  if (profilePicture.includes('cdn.intra.42')) {
    return profilePicture
  } else {
    return 'http://localhost:3000/' + profilePicture
  }
})

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

function startGame(): void {
  socket.emit('game:start', roomId)
}

onBeforeRouteLeave(() => {
  socket.disconnect()
})
</script>
