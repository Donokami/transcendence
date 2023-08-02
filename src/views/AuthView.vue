<template>
  <div
    class="flex border-2 border-black items-center my-2 sm:my-4 mx-2 sm:mx-4 px-4 py-7 sm:p-11 text-justify relative w-full min-h-[calc(100vh-135px)] sm:min-h-[calc(100vh-160px)]">
    <auth-ball-canvas></auth-ball-canvas>
    <div class="flex-grow flex items-center justify-center z-10">
      <auth-signIn-form
        @form-state-changed="formState = $event"
        v-show="formState === 'signIn'"></auth-signIn-form>
      <auth-register-form
        @form-state-changed="formState = $event"
        v-show="formState === 'register'"></auth-register-form>
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
