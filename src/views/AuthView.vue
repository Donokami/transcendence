<template>
  <div class="max-w-screen-xl min-w-[95%] mx-auto text-black">
    <auth-header></auth-header>
    <div class="border-2 border-black flex items-center mx-2 my-3 mt-1 p-5 text-justify relative">
      <auth-ball-canvas></auth-ball-canvas>
      <div class="flex-grow flex items-center justify-center z-10">
        <auth-login-form
          @form-state-changed="formState = $event"
          v-show="formState === 'login'"
        ></auth-login-form>
        <auth-register-form
          @form-state-changed="formState = $event"
          v-show="formState === 'register'"
        ></auth-register-form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import AuthHeader from '../components/AuthHeader.vue'
import AuthLoginForm from '../components/AuthLoginForm.vue'
import AuthRegisterForm from '../components/AuthRegisterForm.vue'
import AuthBallCanvas from '../components/AuthBallCanvas.vue'

export default {
  name: 'AuthView',
  components: {
    AuthHeader,
    AuthLoginForm,
    AuthRegisterForm,
    AuthBallCanvas
  },
  data() {
    return {
      formState: 'login'
    }
  }
}
</script>
