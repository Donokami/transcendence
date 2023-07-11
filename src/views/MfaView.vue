<template>
  <div class="max-w-screen-xl min-w-[95%] mx-auto text-black">
    <div class="border-2 border-black flex items-center mx-2 my-3 mt-1 p-5 text-justify relative">
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

  const props = defineProps({
    formState: { type: String, default: 'signIn'},
  })

  props.formState

</script>
