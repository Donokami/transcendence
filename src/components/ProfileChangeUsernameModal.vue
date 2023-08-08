<template>
  <input type="checkbox" id="my-modal-4" class="modal-toggle" />
  <div class="modal">
    <div class="modal-box rounded-none border-2 border-black">
      <!-- TITLE -->
      <div class="text-xl flex justify-between">
        <h1>Change Your Username</h1>
        <label
          for="my-modal-4"
          class="btn btn-square border-2 border-black hover:border-2 hover:border-black btn-sm relative">
          <iconify-icon icon="material-symbols:close" class="h-6 w-6 absolute">
          </iconify-icon>
        </label>
      </div>

      <!-- FORM INPUT -->
      <Form :validation-schema="usernameSchema" @submit="submitForm">
        <span class="text-base text-black flex mt-4">New username</span>
        <Field
          class="neobrutalist-input w-full text-black mt-2"
          name="username"
          type="text"
          placeholder="Enter new username" />
        <ErrorMessage
          class="font-normal text-base text-red-600 flex mt-2"
          name="username" />
        <!-- BUTTON -->
        <button
          class="btn bg-white border-2 border-black mt-6 text-black hover:bg-primary hover:border-primary hover:text-white"
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
  username: 'required|min:3|max:15|'
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
