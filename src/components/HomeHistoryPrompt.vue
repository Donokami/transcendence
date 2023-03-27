<template>
  <h2 class="text-2xl font-bold mb-8 text-black">History</h2>
  <p>
    <span>{{ consoleText }}</span>
    <span class="align-middle bg-black inline-block w-2 h-4"></span>
  </p>
</template>

<script lang="ts">
export default {
  name: 'HomeHistoryPrompt',
  data() {
    return {
      consoleText: '',
      text: `Pong is a 2D table tennis–themed video game.
      Manufactured by Atari, it was released in 1972, which makes it one of the very first arcade video games.
      It was created by Allan Alcorn as a training exercise assigned to him by Atari co-founders.
      They were so surprised by the quality of Alcorn's work that they decided to manufacture the game!`,
      index: 0,
      speed: 100
    }
  },
  mounted() {
    this.type()
  },
  methods: {
    type() {
      if (this.index < this.text.length) {
        this.consoleText += this.text.charAt(this.index)
        this.index++
        setTimeout(this.type, this.speed)
      } else {
        this.consoleText = ''
        this.index = 0
        this.type()
      }
    }
  }
}
</script>
