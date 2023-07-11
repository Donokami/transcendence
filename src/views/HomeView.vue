<template>
  <div class="max-w-screen-xl min-w-[95%] mx-auto text-black">
    <div class="border-black border-2 flex flex-col mx-2 my-3 mt-1 p-5 text-justify">
      <home-history-prompt></home-history-prompt>
    </div>
    <div class="border-black border-2 flex-col items-center mx-2 my-3 p-5 text-justify">
      <home-game-mode-selection></home-game-mode-selection>
    </div>
    <div class="border-black border-2 flex flex-col mx-2 my-3 mt-1 p-5 text-justify">
      <home-room-selection></home-room-selection>
    </div>
  </div>
</template>

<script setup lang="ts">
import HomeHistoryPrompt from '../components/HomeHistoryPrompt.vue'
import HomeGameModeSelection from '../components/HomeGameModeSelection.vue'
import HomeRoomSelection from '../components/HomeRoomSelection.vue'
</script>
