<template>
  <div class="w-full mx-auto text-black text-justify sm:min-h-[calc(100vh-130px)]">
    <!-- HISTORY PROMPT -->
    <home-history-prompt></home-history-prompt>
    <!-- PLAY GAME -->
    <home-game-mode-selection></home-game-mode-selection>
    <!-- WATCH GAME -->
    <home-room-selection></home-room-selection>
  </div>
</template>

<script setup lang="ts">
import HomeHistoryPrompt from '../components/HomeHistoryPrompt.vue'
import HomeGameModeSelection from '../components/HomeGameModeSelection.vue'
import HomeRoomSelection from '../components/HomeRoomSelection.vue'
</script>