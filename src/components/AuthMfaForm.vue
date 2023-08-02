<template>
  <div class="neobrutalist-box sm:w-[30rem] px-4 py-7 sm:p-11">
    <h2 class="text-xl sm:text-2xl font-bold mb-8 text-black">Welcome back</h2>
    <Form ref="formRef" :validation-schema="mfaSchema" @submit="submitForm">
      <div class="mb-6">
        <label class="block font-medium mb-1 text-md text-lg sm:text-xl" for="token">6 digits code</label>
        <Field
          class="neobrutalist-input w-full text-black"
          name="token"
          type="text"
          placeholder="Enter the code"
          autocomplete="off"
        />
        <ErrorMessage class="font-normal text-base text-red-600" name="token" />
      </div>
      <div
        class="text-white text-center font-bold p-4 rounded mb-4"
        v-if="showAlert"
        :class="alertColor"
      >
        {{ alertMsg }}
      </div>
      <div class="mt-8">
        <button
          class="btn border-zinc-900 bg-zinc-900 text-white sm:w-fit w-full"
          type="submit"
          :disabled="inSubmission"
        >
          Sign in
        </button>
      </div>
    </Form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Form, Field, ErrorMessage } from 'vee-validate'
import { useUserStore } from '../stores/UserStore' 
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

const alertMsg = ref('Your account is being created...')
const alertColor = ref('bg-blue-500')
const inSubmission = ref(false)
const showAlert = ref(false)
const toast = useToast()

const userStore = useUserStore();

const router = useRouter()

const mfaSchema = {
  token: 'required|numeric|min:6|max:6'
}
  
const submitForm = async (values: Record<string, any>): Promise<any> => {
  showAlert.value = true
  inSubmission.value = true
  alertMsg.value = 'Verifying your 2FA code...'
  alertColor.value = 'bg-blue-500'

  try {
    await userStore.verifyTwoFactor(values)
    alertColor.value = 'bg-green-500'
    alertMsg.value = 'Your 2FA code has been verified!'
    await router.push('/')
  } catch (error: any) {
    console.log(JSON.stringify(error, Object.getOwnPropertyNames(error)));
    if (error.message === 'Invalid 2FA token') {
      alertColor.value = 'bg-red-500'
      alertMsg.value = 'Your 2FA code could not be verified!'
    } else {
      toast.error('Something went wrong!')
    }
  }
  finally {
    inSubmission.value = false
  }
}
</script>