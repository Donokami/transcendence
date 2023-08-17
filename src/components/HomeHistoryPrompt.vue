<template>
  <div
    class="px-4 mx-2 mt-2 bg-white border-2 border-black sm:mt-4 sm:mx-4 py-7 sm:p-11">
    <!-- TITLE -->
    <h2 class="mb-8 text-xl font-bold text-black sm:text-2xl">History</h2>
    <p>
      <!-- TEXT -->
      <span class="text-sm sm:text-base">{{ consoleText }}</span>
      <!-- PROMPT -->
      <span class="inline-block w-2 h-4 align-middle bg-black"></span>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount } from 'vue'

const consoleText = ref('')
const text = `Pong is a 2D table tennis–themed video game.
Manufactured by Atari, it was released in 1972, which makes it one of the very first arcade video games.
It was created by Allan Alcorn as a training exercise assigned to him by Atari co-founders.
They were so surprised by the quality of Alcorn's work that they decided to manufacture the game!`

const index = ref(0)
const speed = 80

const type = (): void => {
  if (index.value < text.length) {
    consoleText.value += text.charAt(index.value)
    index.value++
    setTimeout(type, speed)
  } else {
    consoleText.value = ''
    index.value = 0
    type()
  }
}

onBeforeMount(type)
</script>
