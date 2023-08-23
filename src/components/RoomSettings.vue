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
        :disabled="!isOwner"
        name="privacy"
        aria-label="Public"
        v-model="room.isPrivate" />
      <input
        class="join-item btn"
        type="radio"
        :value="true"
        :disabled="!isOwner"
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
        :disabled="!isOwner"
        aria-label="01:30"
        v-model="room.gameDuration" />
      <input
        class="join-item btn"
        type="radio"
        name="time"
        :value="3"
        :disabled="!isOwner"
        aria-label="03:00"
        v-model="room.gameDuration" />
      <input
        class="join-item btn"
        type="radio"
        name="time"
        :value="6"
        :disabled="!isOwner"
        aria-label="06:00"
        v-model="room.gameDuration" />
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
        :disabled="!isOwner"
        aria-label="Small"
        v-model="room.paddleRatio" />
      <input
        class="join-item btn"
        type="radio"
        name="paddle"
        :value="0.2"
        :disabled="!isOwner"
        aria-label="Medium"
        v-model="room.paddleRatio" />
      <input
        class="join-item btn"
        type="radio"
        name="paddle"
        :value="0.3"
        :disabled="!isOwner"
        aria-label="Large"
        v-model="room.paddleRatio" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { room } from '@/includes/gameSocket'
import { useUserStore } from '@/stores/UserStore'
import fetcher from '@/utils/fetcher'
import { watch, computed, type ComputedRef } from 'vue'

const { loggedUser } = useUserStore()

// We need to use computed here because of a bug in Vue 3
// See https://github.com/vuejs/vue/issues/2164#issuecomment-432872718
const roomUpdate = computed(() => {
  return {
    isPrivate: room.isPrivate,
    paddleRatio: room.paddleRatio,
    gameDuration: room.gameDuration
  }
})

const isOwner: ComputedRef<boolean> = computed(() => {
  return loggedUser?.id === room.owner?.id
})

watch(roomUpdate, async () => {
  if (!isOwner.value) return
  await fetcher.patch(`/games/${room.id}`, {
    isPrivate: roomUpdate.value.isPrivate,
    paddleRatio: roomUpdate.value.paddleRatio,
    gameDuration: roomUpdate.value.gameDuration
  })
})
</script>
