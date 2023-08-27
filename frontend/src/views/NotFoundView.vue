<template>
  <div class="mx-auto text-black">
    <div
      class="relative flex flex-col items-center gap-5 px-4 mx-2 my-2 text-justify bg-white border-2 border-black sm:m-4 py-7 sm:p-11">
      <p class="text-6xl font-bold text-center m-30">404 :/</p>
      <br />
      <p class="text-2xl m-30">
        The page you are looking for <br />
        does not exist on this server !
      </p>
      <button
        class="px-4 py-2 m-auto text-center neobrutalist-box"
        @click="router.back()">
        Go back to last page
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import router from '@/router'
</script>
