<template>
  <h2 class="text-2xl font-bold mb-8 text-black">Play a game</h2>
  <div class="flex flex-grow items-center justify-center">
    <p class="font-bold text-l">PLEASE SELECT A MODE</p>
    <iconify-icon icon="fa6-solid:table-tennis-paddle-ball" class="mx-2"></iconify-icon>
  </div>
  <div class="flex flex-grow items-center justify-center">
    <div class="flex flex-row justify-center w-full">
      <div class="tooltip tooltip-left" data-tip="Play vs a friend">
        <button class="neobrutalist-box flex m-2.5 px-2 py-2" @click="selectFriendlyGame">
          <span class="icon">
            <iconify-icon icon="tabler:user"></iconify-icon>
          </span>
          <span class="m-2.5">vs</span>
          <span class="icon">
            <iconify-icon icon="tabler:user-heart"></iconify-icon>
          </span>
        </button>
      </div>
      <div class="tooltip tooltip-right" data-tip="Play vs random">
        <button class="neobrutalist-box flex m-2.5 px-2 py-2" @click="selectRandomGame">
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
// import { ref } from 'vue';

const selectFriendlyGame = () => {
  // handle the click event for PVE button
};

const selectRandomGame = () => {
  // handle the click event for PVP button
};

const selectRoom = () => {
  // handle the click event for Room buttons
};
</script>
