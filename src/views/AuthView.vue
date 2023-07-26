<template>
  <div class="max-w-screen-xl min-w-[95%] mx-auto text-black">
    <div class="border-2 border-black flex items-center mx-2 my-3 mt-1 p-5 text-justify relative">
      <auth-ball-canvas></auth-ball-canvas>
      <div class="flex-grow flex items-center justify-center z-10">
        <auth-signIn-form
          @form-state-changed="formState = $event"
          v-show="formState === 'signIn'"
        ></auth-signIn-form>
        <auth-register-form
          @form-state-changed="formState = $event"
          v-show="formState === 'register'"
        ></auth-register-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AuthSignInForm from '../components/AuthSignInForm.vue'
import AuthRegisterForm from '../components/AuthRegisterForm.vue'
import AuthBallCanvas from '../components/AuthBallCanvas.vue'


const formState = ref('signIn')
</script>

