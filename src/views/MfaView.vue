<template>
  <div class="w-full mx-auto text-black">
    <div
      class="border-2 border-black flex items-center my-1 p-5 text-justify relative">
      <auth-ball-canvas></auth-ball-canvas>
      <div class="flex-grow flex items-center justify-center z-10">
        <AuthMfaForm></AuthMfaForm>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AuthMfaForm from '../components/AuthMfaForm.vue'
import AuthBallCanvas from '../components/AuthBallCanvas.vue'
</script>
