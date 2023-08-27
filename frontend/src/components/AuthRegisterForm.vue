<template>
  <div class="sm:w-[28rem]">
    <h2 class="mb-8 text-xl font-bold text-black sm:text-2xl">Register</h2>
    <Form
      ref="formRef"
      :validation-schema="registerSchema"
      @submit="submitForm">
      <div class="mb-6">
        <label class="block mb-1 text-lg font-medium sm:text-xl" for="username">
          Username
        </label>
        <Field
          class="w-full text-black neobrutalist-input"
          id="username"
          name="username"
          type="username"
          placeholder="Choose a username" />
        <ErrorMessage
          class="text-base font-normal text-red-600"
          name="username" />
      </div>
      <div class="mb-6">
        <label class="block mb-1 text-lg font-medium sm:text-xl" for="password"
          >Password</label
        >
        <Field
          class="w-full text-black neobrutalist-input"
          name="password"
          type="password"
          placeholder="Enter your password"
          autocomplete />
        <ErrorMessage
          class="text-base font-normal text-red-600"
          name="password" />
      </div>
      <div class="mb-6">
        <label
          class="block mb-1 text-lg font-medium sm:text-xl"
          for="confirmPassword"
          >Confirm Password</label
        >
        <Field
          class="w-full text-black neobrutalist-input"
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          autocomplete />
        <ErrorMessage
          class="text-base font-normal text-red-600"
          name="confirmPassword" />
      </div>
      <div
        class="p-4 mb-4 font-bold text-center text-white rounded"
        v-if="showAlert"
        :class="alertColor">
        {{ alertMsg }}
      </div>
      <div class="flex items-center justify-between gap-2 mt-8">
        <button
          class="text-white bg-black btn"
          type="submit"
          :disabled="inSubmission">
          Create account
        </button>
        <button
          class="bg-gray-400 border-gray-400 btn hover:bg-gray-300 hover:border-gray-300 text-zinc-900"
          type="button"
          @click="toggleForm">
          Sign In
        </button>
      </div>
    </Form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Form, Field, ErrorMessage } from 'vee-validate'
import { useUserStore } from '../stores/UserStore'
import { useToast } from 'vue-toastification'
import { ApiError } from '@/utils/fetcher'

const alertMsg = ref('Your account is being created...')
const alertColor = ref('bg-blue-500')
const inSubmission = ref(false)
const showAlert = ref(false)

const toast = useToast()

const userStore = useUserStore()

const emit = defineEmits(['form-state-changed'])

const registerSchema = {
  username: 'required|min:4|max:50',
  password: 'required|min:4|max:50',
  confirmPassword: 'required|password_mismatch:@password'
}

const submitForm = async (values: Record<string, any>): Promise<void> => {
  showAlert.value = true
  inSubmission.value = true
  alertMsg.value = 'Account is being created...'
  alertColor.value = 'bg-blue-500'

  try {
    await userStore.register(values)
    alertColor.value = 'bg-green-500'
    alertMsg.value = 'Account created!'
    setTimeout(() => toggleForm(), 1000)
  } catch (error: any) {
    if (error instanceof ApiError && error.statusCode === 400) {
      alertColor.value = 'bg-red-500'
      alertMsg.value = error.message
    } else {
      toast.error('An error occured while creating your account.')
    }
  } finally {
    inSubmission.value = false
    setTimeout(() => {
      showAlert.value = false
    }, 2000)
  }
}

const toggleForm = (): void => {
  emit('form-state-changed', 'signIn')
}
</script>
