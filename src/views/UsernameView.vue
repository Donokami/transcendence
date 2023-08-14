<template>
  <div class="w-full mx-auto text-black">
    <div
      class="border-2 border-black flex items-center my-2 mx-2 sm:m-4 px-4 py-7 sm:p-11 text-justify relative">
      <auth-ball-canvas></auth-ball-canvas>
      <div class="flex-grow flex items-center justify-center z-10">
        <AuthUsernameForm></AuthUsernameForm>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AuthUsernameForm from '../components/AuthUsernameForm.vue'
import AuthBallCanvas from '../components/AuthBallCanvas.vue'
</script>
