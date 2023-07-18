<template>
  <input type="checkbox" id="my-modal-4" class="modal-toggle" />

  <div class="modal">
    <div class="modal-box rounded-none">
      <!-- CLOSING CROSS -->
      <div class="flex items-center justify-end">
        <label
          for="my-modal-4"
          class="btn bg-white border-black border-2 text-black hover:bg-black hover:border-black hover:text-white"
          >X
        </label>
      </div>
      <!-- TITLE-->
      <div class="py-4 justify-start">
        <h3 class="font-bold text-lg">Pick a New Username:</h3>
      </div>

      <Form :validation-schema="usernameSchema" @submit="submitForm">
        <span class="text-base text-black flex mt-4">New username</span>
        <Field
          class="neobrutalist-input w-full text-black mt-2"
          name="username"
          type="text"
          placeholder="Enter your new username"
        />
        <ErrorMessage class="font-normal text-base text-red-600 flex mt-2 " name="username" />
        <button
          class="btn bg-white border-2 border-black mt-6 text-black hover:bg-primary hover:border-primary hover:text-white"
          type="submit"
        >
          CHANGE USERNAME
        </button>
      </Form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/UserStore.js'
import { Form, Field, ErrorMessage } from 'vee-validate'



const userStore = useUserStore()

const emit = defineEmits(['close-modal'])

const usernameSchema = {
    username: 'required|min:3|max:15|',
}

const submitForm = async (values: Record<string, string>) => {
  console.log(values)
  try {
    if (!userStore.loggedUser) return;
    await userStore.updateUser(userStore.loggedUser.id, {username: values.username});
    emit('close-modal');

  } catch (error) {
    console.log(error)
  }
};

</script>