<template>
  <div class="sm:w-[28rem]">
    <h2 class="text-xl sm:text-2xl font-bold mb-8 text-black">Register</h2>
    <Form
      ref="formRef"
      :validation-schema="registerSchema"
      @submit="submitForm">
      <div class="mb-6">
        <label class="block font-medium mb-1 text-lg sm:text-xl" for="username">
          Username
        </label>
        <Field
          class="neobrutalist-input w-full text-black"
          id="username"
          name="username"
          type="username"
          placeholder="Choose a username" />
        <ErrorMessage
          class="font-normal text-base text-red-600"
          name="username" />
      </div>
      <div class="mb-6">
        <label class="block font-medium mb-1 text-lg sm:text-xl" for="password"
          >Password</label
        >
        <Field
          class="neobrutalist-input w-full text-black"
          name="password"
          type="password"
          placeholder="Enter your password"
          autocomplete />
        <ErrorMessage
          class="font-normal text-base text-red-600"
          name="password" />
      </div>
      <div class="mb-6">
        <label
          class="block font-medium mb-1 text-lg sm:text-xl"
          for="confirmPassword"
          >Confirm Password</label
        >
        <Field
          class="neobrutalist-input w-full text-black"
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          autocomplete />
        <ErrorMessage
          class="font-normal text-base text-red-600"
          name="confirmPassword" />
      </div>
      <div
        class="text-white text-center font-bold p-4 rounded mb-4"
        v-if="showAlert"
        :class="alertColor">
        {{ alertMsg }}
      </div>
      <div class="flex items-center gap-2 justify-between mt-8">
        <button
          class="btn bg-zinc-900 text-white"
          type="submit"
          :disabled="inSubmission">
          Create account
        </button>
        <button
          class="btn bg-gray-400 border-gray-400 hover:bg-gray-300 hover:border-gray-300 text-zinc-900"
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

const alertMsg = ref('Your account is being created...')
const alertColor = ref('bg-blue-500')
const inSubmission = ref(false)
const showAlert = ref(false)

const toast = useToast()

const userStore = useUserStore()

const emit = defineEmits(['form-state-changed'])

const registerSchema = {
  username: 'required|min:3|max:100',
  password: 'required|min:4|max:100',
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
    setTimeout(() => toggleForm(), 2000)
  } catch (error: any) {
    if (error.message === 'User already exists') {
      alertColor.value = 'bg-red-500'
      alertMsg.value = 'User already exist!'
    } else {
      toast.error('Something went wrong')
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
