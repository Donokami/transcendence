<template>
  <div
    class="flex items-center my-2 sm:my-4 mx-2 sm:mx-4 px-4 py-7 sm:p-11 text-justify relative w-full min-h-[calc(100vh-135px)] sm:min-h-[calc(100vh-160px)]">
    <auth-ball-canvas></auth-ball-canvas>
    <div class="z-10 flex items-center justify-center flex-grow">
      <div class="flex flex-col neobrutalist-box p-7 sm:p-11">
        <auth-signIn-form
          @form-state-changed="formState = $event"
          v-show="formState === 'signIn'"></auth-signIn-form>
        <auth-register-form
          @form-state-changed="formState = $event"
          v-show="formState === 'register'"></auth-register-form>
        <div class="m-8 divider before:bg-gray-400 after:bg-gray-400">or</div>
        <div class="flex justify-center">
          <button
            @click="handleOauth"
            class="text-white bg-black btn"
            type="submit"
            :disabled="inSubmission">
            Continue with
            <img
              class="mx-3 icon h-2/4"
              src="../assets/42-logo.svg"
              alt="42 Logo" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

import { useUserStore } from '@/stores/UserStore'

import AuthSignInForm from '../components/AuthSignInForm.vue'
import AuthRegisterForm from '../components/AuthRegisterForm.vue'
import AuthBallCanvas from '../components/AuthBallCanvas.vue'

const userStore = useUserStore()
const router = useRouter()
const toast = useToast()

const inSubmission = ref(false)
const formState = ref('signIn')

// *********** //
// handleOauth //
// *********** //

const handleOauth = async (): Promise<void> => {
  const authUrl = `${import.meta.env.VITE_API_URL}/auth/42/signIn`
  const popup = window.open(authUrl, '_blank', 'width=500,height=600')

  inSubmission.value = true

  const intervalId = setInterval(async () => {
    try {
      if (popup?.closed) return clearInterval(intervalId)
      const authStatus = await userStore.getAuthStatus()

      if (authStatus.status === 'authenticated') {
        clearInterval(intervalId)
        if (popup != null) popup.close()
        inSubmission.value = false
        setTimeout(async () => {
          await userStore.refreshUser()
          await router.push('/')
        }, 3000)
      }

      if (authStatus.status === 'requires_2fa') {
        clearInterval(intervalId)
        if (popup != null) popup.close()
        inSubmission.value = false
        await router.push('/mfa')
      }
    } catch (error: any) {
      toast.error('An error occured while authenticating!')
      clearInterval(intervalId)
      if (popup != null) popup.close()
      inSubmission.value = false
    }
  }, 1000)
}
</script>
