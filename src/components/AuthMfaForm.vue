<template>
  <div class="neobrutalist-box w-[30rem] px-6 py-6">
    <h2 class="text-2xl font-bold mb-8 text-black">Welcome back</h2>
    <Form ref="formRef" :validation-schema="mfaSchema" @submit="submitForm">
      <div class="mb-6">
        <label class="block font-medium mb-1 text-md" for="token">6 digits code</label>
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
          class="btn border-zinc-900 bg-zinc-900 text-white"
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

  const alertMsg = ref('Your account is being created...')
  const alertColor = ref('bg-blue-500')
  const inSubmission = ref(false)
  const showAlert = ref(false)

  const userStore = useUserStore();

  const router = useRouter()

  const mfaSchema = {
    token: 'required|numeric|min:6|max:6'
  }
    
  const submitForm = async (values: Record<string, any>) => {
    showAlert.value = true
    inSubmission.value = true
    alertMsg.value = 'Verifying your 2FA code...'
    alertColor.value = 'bg-blue-500'

    values.tempUserId = userStore.tempUserId
          
    try {
      const response = await userStore.verifyTwoFactor(values)
      if (response.ok) {      
        alertColor.value = 'bg-green-500'
        alertMsg.value = 'Your 2FA code has been verified!'
        router.push('/')
      } else {
        alertColor.value = 'bg-red-500'
        alertMsg.value = 'Your 2FA code could not be verified!'
        throw new Error('Something went wrong');
      } 
    } catch (error) {
      console.log(error)
      throw error
    }
    finally {
      inSubmission.value = false
    }
  }

</script>