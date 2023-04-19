<template>
  <div class="max-w-screen-xl min-w-[95%] lg:mx-auto text-black">
    <site-header></site-header>
    <div class="border-black border-2 flex flex-col mx-2 my-3 mt-1 p-5 items-center">
      <h2 class="text-2xl font-bold mb-4 text-black">[Room X]</h2>
      <p class="text-2xl font-bold mb-4 text-black">Conobi vs Hayce_</p>
      <p class="text-2xl font-bold mb-4 text-black">5 - 4</p>
      <div class="w-3/4 h-96 flex items-center relative">
        <game-canvas></game-canvas>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import SiteHeader from '../components/SiteHeader.vue'
import GameCanvas from '../components/GameCanvas.vue'

export default {
  name: 'ProfileView',
  components: {
    SiteHeader,
    GameCanvas
  },
  data() {
    return {}
  },
  mounted() {},
  methods: {}
}
</script>
