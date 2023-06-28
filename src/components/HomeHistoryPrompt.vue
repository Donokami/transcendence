<template>
  <h2 class="text-2xl font-bold mb-8 text-black">History</h2>
  <p>
    <span>{{ consoleText }}</span>
    <span class="align-middle bg-black inline-block w-2 h-4"></span>
  </p>
</template>

<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';

const consoleText = ref('');
const text = `Pong is a 2D table tennis–themed video game.
Manufactured by Atari, it was released in 1972, which makes it one of the very first arcade video games.
It was created by Allan Alcorn as a training exercise assigned to him by Atari co-founders.
They were so surprised by the quality of Alcorn's work that they decided to manufacture the game!`;

let index = ref(0);
const speed = 100;

const type = () => {
  if (index.value < text.length) {
    consoleText.value += text.charAt(index.value);
    index.value++;
    setTimeout(type, speed);
  } else {
    consoleText.value = '';
    index.value = 0;
    type();
  }
};

onBeforeMount(type);
</script>