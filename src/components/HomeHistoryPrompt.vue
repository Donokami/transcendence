<template>
  <div class="border-black border-2 mt-1 p-5">
    <!-- TITLE -->
    <h2 class="mb-8 font-bold text-2xl text-black">History</h2>
    <p>
      <!-- TEXT -->
      <span>{{ consoleText }}</span>
      <!-- PROMPT -->
      <span class="align-middle inline-block w-2 h-4 bg-black"></span>
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
