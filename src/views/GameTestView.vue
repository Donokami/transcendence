<template>
  <div class="max-w-screen-xl min-w-[95%] lg:mx-auto text-black">
    <site-header></site-header>
    <div class="flex flex-col items-center p-5 mx-2 my-3 mt-1 border-2 border-black">
      <h2 class="mb-4 text-2xl font-bold text-black">[Room X]</h2>
      <p class="mb-4 text-2xl font-bold text-black">Conobi vs Hayce_</p>
      <p class="mb-4 text-2xl font-bold text-black">5 - 4</p>
      <div class="relative flex items-center h-[800px] w-3/4">
        <game-canvas></game-canvas>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import SiteHeader from "../components/SiteHeader.vue";
import GameCanvas from "../components/GameCanvas.vue";

export default {
  name: "ProfileView",
  components: {
    SiteHeader,
    GameCanvas,
  },
  data() {
    return {};
  },
  mounted() {},
  methods: {},
};
</script>
