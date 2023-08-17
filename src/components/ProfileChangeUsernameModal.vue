<template>
  <input type="checkbox" id="my-modal-4" class="modal-toggle" />
  <div class="modal">
    <div class="border-2 border-black rounded-none modal-box">
      <!-- TITLE -->
      <div class="flex justify-between text-xl">
        <h1>Change Your Username</h1>
        <label
          for="my-modal-4"
          class="relative border-2 border-black btn btn-square hover:border-2 hover:border-black btn-sm">
          <iconify-icon icon="material-symbols:close" class="absolute w-6 h-6">
          </iconify-icon>
        </label>
      </div>

      <!-- FORM INPUT -->
      <Form :validation-schema="usernameSchema" @submit="submitForm">
        <span class="flex mt-4 text-base text-black">New username</span>
        <Field
          class="w-full mt-2 text-black neobrutalist-input"
          name="username"
          type="text"
          placeholder="Enter new username" />
        <ErrorMessage
          class="flex mt-2 text-base font-normal text-red-600"
          name="username" />
        <!-- BUTTON -->
        <button
          class="mt-6 text-black bg-white border-2 border-black btn hover:bg-black hover:border-black hover:text-white"
          type="submit">
          CHANGE USERNAME
        </button>
      </Form>
    </div>
  </div>
</template>

<script setup lang="ts">
// ******* //
// IMPORTS //
// ******* //

import { useUserStore } from '@/stores/UserStore.js'
import { Form, Field, ErrorMessage } from 'vee-validate'
import { useToast } from 'vue-toastification'

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const toast = useToast()

const emit = defineEmits(['close-modal'])
const userStore = useUserStore()
const usernameSchema = {
  username: 'required|min:4|max:50'
}

// ******************** //
// FUNCTION DEFINITIONS //
// ******************** //

// ********** //
// submitForm //
// ********** //

const submitForm = async (values: Record<string, string>): Promise<void> => {
  try {
    if (!userStore.loggedUser) return

    await userStore.updateUser(userStore.loggedUser.id, {
      username: values.username
    })
    emit('close-modal')
  } catch (error) {
    toast.error('Error changing username')
  }
}
</script>
