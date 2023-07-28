<template>
  <div class="border-black border-2 mt-1 p-5">
    <div class="flex items-center justify-between mb-2">
      <!-- TITLE -->
      <h2 class="text-2xl font-bold text-black">Play Game</h2>
      <!-- GO TO LOBBY BUTTON -->
      <router-link to="/room/create" class="neobrutalist-box flex p-2">
        <iconify-icon icon="tabler:plus" class="mr-2"></iconify-icon>
        <span>Create a game</span>
      </router-link>
    </div>
    <!-- MODE TITLE -->
    <div class="flex flex-grow items-center justify-center">
      <p class="font-bold text-l">PLEASE SELECT A MODE</p>
      <iconify-icon
        icon="fa6-solid:table-tennis-paddle-ball"
        class="mx-2"></iconify-icon>
    </div>
    <!-- MODE BUTTONS -->
    <div class="flex flex-grow justify-center">
      <!-- PLAY VS FRIEND BUTTON -->
      <div class="tooltip tooltip-left" data-tip="Play vs a friend">
        <button
          class="neobrutalist-box flex m-2.5 px-2 py-2"
          @click="selectFriendlyGame">
          <span class="icon">
            <iconify-icon icon="tabler:user"></iconify-icon>
          </span>
          <span class="m-2.5">vs</span>
          <span class="icon">
            <iconify-icon icon="tabler:user-heart"></iconify-icon>
          </span>
        </button>
      </div>
      <!-- PLAY VS RANDOM BUTTON -->
      <div class="tooltip tooltip-right" data-tip="Play vs random">
        <button
          class="neobrutalist-box flex m-2.5 px-2 py-2"
          @click="selectRandomGame">
          <span class="icon">
            <iconify-icon icon="tabler:user"></iconify-icon>
          </span>
          <span class="m-2.5">vs</span>
          <span class="icon">
            <iconify-icon icon="tabler:user-question"></iconify-icon>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// ******* //
// IMPORTS //
// ******* //

import { useRouter } from 'vue-router'

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const router = useRouter()

// ******************** //
// FUNCTION DEFINITIONS //
// ******************** //

const selectFriendlyGame = () => {
  // handle the click event for PVE button
}

const selectRandomGame = () => {
  // handle the click event for PVP button
}

const selectRoom = () => {
  // handle the click event for Room buttons
}
</script>
