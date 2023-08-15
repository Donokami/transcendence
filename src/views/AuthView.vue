<template>
  <div
    class="flex border-2 border-black items-center my-2 sm:my-4 mx-2 sm:mx-4 px-4 py-7 sm:p-11 text-justify relative w-full min-h-[calc(100vh-135px)] sm:min-h-[calc(100vh-160px)]">
    <auth-ball-canvas></auth-ball-canvas>
    <div class="flex-grow flex items-center justify-center z-10">
      <div class="neobrutalist-box p-7 sm:p-11 flex flex-col">
        <auth-signIn-form
          @form-state-changed="formState = $event"
          v-show="formState === 'signIn'"></auth-signIn-form>
        <auth-register-form
          @form-state-changed="formState = $event"
          v-show="formState === 'register'"></auth-register-form>
        <div class="divider before:bg-gray-400 after:bg-gray-400 m-8">or</div>
        <div class="flex justify-center">
          <button
            @click="handleOauth"
            class="btn bg-zinc-900 text-white"
            type="submit"
            :disabled="inSubmission">
            Continue with
            <img
              class="icon mx-3 h-2/4"
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
        await userStore.refreshUser()
        await router.push('/')
      }

      if (authStatus.status === 'requires_2fa') {
        clearInterval(intervalId)
        if (popup != null) popup.close()
        inSubmission.value = false
        await router.push('/mfa')
      }
    } catch (error: any) {
      toast.error('Something went wrong !')
      clearInterval(intervalId)
      if (popup != null) popup.close()
      inSubmission.value = false
    }
  }, 1000)
}
</script>
