<template>
  <div class="neobrutalist-box sm:w-[30rem] px-4 py-7 sm:p-11">
    <h2 class="text-xl sm:text-2xl font-bold mb-8 text-black">
      Personalize Your Account
    </h2>
    <div class="w-24 mx-auto">
      <user-avatar
        :userProps="(userStore.loggedUser as User)"
        :uploadMode="true"
        :statusMode="false">
      </user-avatar>
    </div>
    <Form :validation-schema="usernameSchema" @submit="submitForm">
      <div class="my-6">
        <label
          class="block font-medium mb-1 text-md text-lg sm:text-xl"
          for="username"
          >Username</label
        >
        <Field
          class="neobrutalist-input w-full text-black"
          name="username"
          type="text"
          placeholder="Choose a username"
          autocomplete="off" />
        <ErrorMessage
          class="font-normal text-base text-red-600"
          name="username" />
      </div>
      <div
        class="text-white text-center font-bold p-4 rounded mb-4"
        v-if="showAlert"
        :class="alertColor">
        {{ alertMsg }}
      </div>
      <div class="mt-8">
        <button
          class="btn border-zinc-900 bg-black text-white sm:w-fit w-full"
          type="submit"
          :disabled="inSubmission">
          Update profile
        </button>
      </div>
    </Form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Form, Field, ErrorMessage } from 'vee-validate'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useUserStore } from '../stores/UserStore'

import type { User } from '@/types'

import UserAvatar from '@/components/UserAvatar.vue'

const alertMsg = ref('Your account is being created...')
const alertColor = ref('bg-blue-500')
const inSubmission = ref(false)
const showAlert = ref(false)
const toast = useToast()

const userStore = useUserStore()

const router = useRouter()

const usernameSchema = {
  username: 'required|min:4|max:50'
}

const submitForm = async (values: Record<string, any>): Promise<void> => {
  showAlert.value = true
  inSubmission.value = true
  alertMsg.value = 'Verifying username availability...'
  alertColor.value = 'bg-blue-500'

  try {
    await userStore.setUsername(values.username)
    await userStore.refreshUser()
    alertColor.value = 'bg-green-500'
    alertMsg.value = 'Profile updated successfully!'
    await router.push('/')
  } catch (error: any) {
    console.log(JSON.stringify(error, Object.getOwnPropertyNames(error)))
    if (error.message === 'Username already exists') {
      alertColor.value = 'bg-red-500'
      alertMsg.value = 'Username is already taken!'
    } else {
      alertMsg.value = ''
      showAlert.value = false
      toast.error('Something went wrong!')
    }
  } finally {
    inSubmission.value = false
  }
}
</script>
