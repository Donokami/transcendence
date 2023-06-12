<template>
  <div class="neobrutalist-box w-[30rem] px-6 py-6">
    <h2 class="text-2xl font-bold mb-8 text-black">Register</h2>
    <Form ref="formRef" :validation-schema="registerSchema" @submit="submitForm">
      <div class="mb-6">
        <label class="block font-medium mb-1" for="username"> Username </label>
        <Field
          class="neobrutalist-input w-full text-black"
          id="username"
          name="username"
          type="username"
          placeholder="Choose a username"
        />
        <ErrorMessage class="font-normal text-base text-red-600" name="username" />
      </div>
      <div class="mb-6">
        <label class="block font-medium mb-1" for="email">Email</label>
        <Field
          class="neobrutalist-input w-full text-black"
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email address"
        />
        <ErrorMessage class="font-normal text-base text-red-600" name="email" />
      </div>
      <div class="mb-6">
        <label class="block font-medium mb-1" for="password">Password</label>
        <Field
          class="neobrutalist-input w-full text-black"
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
        />
        <ErrorMessage class="font-normal text-base text-red-600" name="password" />
      </div>
      <div class="mb-6">
        <label class="block font-medium mb-1" for="confirmPassword">Confirm Password</label>
        <Field
          class="neobrutalist-input w-full text-black"
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Confirm your password"
        />
        <ErrorMessage class="font-normal text-base text-red-600" name="confirmPassword" />
      </div>
      <div
        class="text-white text-center font-bold p-4 rounded mb-4"
        v-if="showAlert"
        :class="alertColor"
      >
        {{ alertMsg }}
      </div>
      <div class="flex items-center justify-between mt-8">
        <button class="btn bg-zinc-900 text-white" type="submit" :disabled="inSubmission">
          Create account
        </button>
        <button
          class="btn bg-gray-400 border-gray-400 hover:bg-gray-300 hover:border-gray-300 text-zinc-900"
          type="button"
          @click="toggleForm"
        >
          Log in
        </button>
      </div>
    </Form>
    <div class="divider before:bg-gray-400 after:bg-gray-400 m-8">or</div>
    <div class="flex justify-center">
      <button
        class="btn bg-zinc-900 border-zinc-900 text-white"
        type="submit"
        :disabled="inSubmission"
      >
        Register with
        <img class="icon mx-3 h-2/4" src="../assets/42-logo.svg" alt="42 Logo" />
      </button>
    </div>
  </div>
</template>

// COMPOSITION API

<script setup lang="ts">
  import { ref } from 'vue'
  import { Form, Field, ErrorMessage } from 'vee-validate'
  import { useRouter } from 'vue-router'
import { createSimpleExpression } from '@vue/compiler-core';

  const alertMsg = ref('Your account is being created...')
  const alertColor = ref('bg-blue-500')
  const inSubmission = ref(false)
  const showAlert = ref(false)
  
  const router = useRouter()
  const emit = defineEmits(['form-state-changed', 'login'])

  const registerSchema = {
    username: 'required|min:3|max:100',
    email: 'required|email',
    password: 'required|min:8|max:100',
    confirmPassword: 'required|password_mismatch:@password',
  };

  const submitForm = async (values: Record<string, any>) => {
    showAlert.value = true
    inSubmission.value = true
    // alertMsg.value = 'Your account is being created...'
    alertColor.value = 'bg-blue-500'

    console.log('[DEBUG] - FRONT - Request in submitForm register')
    
    try {
      const response = await fetch('http://localhost:3000/auth/signup', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(values),
        credentials: 'include',
      })
      if(response.ok) {
        console.log('[DEBUG] - FRONT - response ok')
        alertColor.value = 'bg-green-500'
        alertMsg.value = 'Your account has been created!'
        setTimeout( () => router.push('/home'), 5000);
      } else {
        alertColor.value = 'bg-red-500'
        alertMsg.value = 'Email already in use!'
        throw new Error('Something went wrong');
      }
    } catch (error) {
      console.log('[DEBUG] - FRONT - error')
      console.log(error)
      alertColor.value = 'bg-red-500'
      alertMsg.value = 'Something went wrong!'
      throw error
    }
    finally {
      console.log('[DEBUG] - FRONT - finally')
      inSubmission.value = false
    }
  }

  const toggleForm = () => {
    emit('form-state-changed', 'login')
  }
</script>