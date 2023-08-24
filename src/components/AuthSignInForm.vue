<template>
  <div class="sm:w-[28rem]">
    <h2 class="mb-8 text-xl font-bold text-black sm:text-2xl">Sign In</h2>
    <Form ref="formRef" :validation-schema="signInSchema" @submit="submitForm">
      <div class="mb-6">
        <label class="block mb-1 text-lg font-medium sm:text-xl" for="username"
          >Username</label
        >
        <Field
          class="w-full text-black neobrutalist-input"
          name="username"
          type="username"
          placeholder="Enter your username" />
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
      <div
        class="p-4 mb-4 font-bold text-center text-white rounded"
        v-if="showAlert"
        :class="alertColor">
        {{ alertMsg }}
      </div>
      <div class="flex items-center justify-between gap-2 mt-8">
        <button
          class="text-white bg-black btn border-zinc-900"
          type="submit"
          :disabled="inSubmission">
          Sign in
        </button>
        <button
          class="bg-gray-400 border-gray-400 btn hover:bg-gray-300 hover:border-gray-300 text-zinc-900"
          type="button"
          @click="toggleForm">
          Register
        </button>
      </div>
    </Form>
  </div>
</template>

<script setup lang="ts">
// ******* //
// IMPORTS //
// ******* //

import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { Form, Field, ErrorMessage } from 'vee-validate'

import { useUserStore } from '@/stores/UserStore'

import { useToast } from 'vue-toastification'

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const toast = useToast()

const router = useRouter()

const userStore = useUserStore()

const emit = defineEmits(['form-state-changed'])

const alertMsg = ref('Your account is being created...')
const alertColor = ref('bg-blue-500')
const inSubmission = ref(false)
const showAlert = ref(false)

const signInSchema = {
  username: 'required|min:4|max:50',
  password: 'required|min:4|max:50'
}

// ******************** //
// FUNCTION DEFINITIONS //
// ******************** //

// ********** //
// submitForm //
// ********** //

const submitForm = async (values: Record<string, any>): Promise<void> => {
  showAlert.value = true
  inSubmission.value = true
  alertMsg.value = 'Searching for account in database...'
  alertColor.value = 'bg-blue-500'

  try {
    const user = await userStore.signIn(values)
    if (!user) throw new Error('User not found')
    if (user.isTwoFactorEnabled) {
      await router.push('/mfa')
    } else {
      alertColor.value = 'bg-green-500'
      alertMsg.value = 'Account found in database!'
      await router.push('/')
    }
  } catch (error: any) {
    if (error.message === 'User not found') {
      alertColor.value = 'bg-red-500'
      alertMsg.value = 'Account not found in database!'
      setTimeout(() => {
        showAlert.value = false
      }, 2000)
    } else if (error.code === 'InvalidPassword') {
      alertColor.value = 'bg-red-500'
      alertMsg.value = 'Incorrect password!'
      setTimeout(() => {
        showAlert.value = false
      }, 2000)
    } else {
      alertMsg.value = ''
      toast.error('An error occured while signing in.')
    }
  } finally {
    inSubmission.value = false
  }
}

// ********** //
// toggleForm //
// ********** //

const toggleForm = (): void => {
  emit('form-state-changed', 'register')
}
</script>
