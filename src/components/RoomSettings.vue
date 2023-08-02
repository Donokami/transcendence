<template>
  <div class="text-xl font-semibold">
    <h1>Room settings</h1>
  </div>

  <div class="mt-8 font-semibold text-md">
    <h2>Game Type</h2>
    <div class="mt-3 join">
      <input
        class="join-item btn"
        type="radio"
        :value="false"
        name="privacy"
        aria-label="Public"
        v-model="room.isPrivate" />
      <input
        class="join-item btn"
        type="radio"
        :value="true"
        name="privacy"
        aria-label="Private"
        v-model="room.isPrivate" />
    </div>
  </div>

  <div class="mt-8 font-semibold text-md">
    <h2>Game Duration</h2>
    <div class="mt-3 join">
      <input
        class="join-item btn"
        type="radio"
        name="time"
        :value="1.5"
        aria-label="01:30"
        v-model="room.gameDuration" />
      <input
        class="join-item btn"
        type="radio"
        name="time"
        :value="3"
        aria-label="03:00"
        v-model="room.gameDuration" />
      <input
        class="join-item btn"
        type="radio"
        name="time"
        :value="6"
        aria-label="06:00"
        v-model="room.gameDuration" />
    </div>
  </div>

  <div class="mt-8 font-semibold text-md">
    <h2>Ball Speed</h2>
    <div class="mt-3 join">
      <input
        class="join-item btn"
        type="radio"
        name="speed"
        :value="0.8"
        aria-label="0.8x"
        v-model="room.ballSpeed" />
      <input
        class="join-item btn"
        type="radio"
        name="speed"
        :value="1"
        aria-label="1x"
        v-model="room.ballSpeed" />
      <input
        class="join-item btn"
        type="radio"
        name="speed"
        :value="1.2"
        aria-label="1.2x"
        v-model="room.ballSpeed" />
    </div>
  </div>

  <div class="mt-8 font-semibold text-md">
    <h2>Paddle Size</h2>
    <div class="mt-3 join">
      <input
        class="join-item btn"
        type="radio"
        name="paddle"
        :value="0.1"
        aria-label="Small"
        v-model="room.paddleRatio" />
      <input
        class="join-item btn"
        type="radio"
        name="paddle"
        :value="0.2"
        aria-label="Medium"
        v-model="room.paddleRatio" />
      <input
        class="join-item btn"
        type="radio"
        name="paddle"
        :value="0.3"
        aria-label="Large"
        v-model="room.paddleRatio" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { room } from '@/includes/gameSocket'
import fetcher from '@/utils/fetcher'
import { watch, computed } from 'vue'

// We need to use computed here because of a bug in Vue 3
// See https://github.com/vuejs/vue/issues/2164#issuecomment-432872718
const roomUpdate = computed(() => {
  return {
    isPrivate: room.isPrivate,
    paddleRatio: room.paddleRatio,
    gameDuration: room.gameDuration,
    ballSpeed: room.ballSpeed
  }
})

watch(roomUpdate, async () => {
  await fetcher.patch(`/games/${room.id}`, {
    isPrivate: roomUpdate.value.isPrivate,
    paddleRatio: roomUpdate.value.paddleRatio,
    gameDuration: roomUpdate.value.gameDuration,
    ballSpeed: roomUpdate.value.ballSpeed
  })
})
</script>
