<template>
  <div class="neobrutalist-box w-[30rem] px-6 py-6">
    <h2 class="text-2xl font-bold mb-8 text-black">Sign In</h2>
    <Form ref="formRef" :validation-schema="signInSchema" @submit="submitForm">
      <div class="mb-6">
        <label class="block font-medium mb-1" for="username">Username</label>
        <Field class="neobrutalist-input w-full text-black" name="username" type="username"
          placeholder="Enter your username" />
        <ErrorMessage class="font-normal text-base text-red-600" name="username" />
      </div>
      <div class="mb-6">
        <label class="block font-medium mb-1" for="password">Password</label>
        <Field class="neobrutalist-input w-full text-black" name="password" type="password"
          placeholder="Enter your password" autocomplete />
        <ErrorMessage class="font-normal text-base text-red-600" name="password" />
      </div>
      <div class="text-white text-center font-bold p-4 rounded mb-4" v-if="showAlert" :class="alertColor">
        {{ alertMsg }}
      </div>
      <div class="flex items-center justify-between mt-8">
        <button class="btn border-zinc-900 bg-zinc-900 text-white" type="submit" :disabled="inSubmission">
          Sign in
        </button>
        <button class="btn border-gray-400 bg-gray-400 hover:bg-gray-300 hover:border-gray-300 text-zinc-900"
          type="button" @click="toggleForm">
          Register
        </button>
      </div>
    </Form>
    <div class="divider before:bg-gray-400 after:bg-gray-400 m-8">or</div>
    <div class="flex justify-center">
      <button @click="handleOauth" class="btn bg-zinc-900 text-white" type="submit" :disabled="inSubmission">
        Sign in with
        <img class="icon mx-3 h-2/4" src="../assets/42-logo.svg" alt="42 Logo" />
      </button>
    </div>
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

const userStore = useUserStore();

const emit = defineEmits(['form-state-changed'])

const alertMsg = ref('Your account is being created...')
const alertColor = ref('bg-blue-500')
const inSubmission = ref(false)
const showAlert = ref(false)

const signInSchema = {
  username: 'required|min:3|max:100',
  password: 'required|min:8|max:100'
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
    await userStore.signIn(values)
    if (userStore.twoFactorEnabled) {
      await router.push('/mfa')
    } else {
      alertColor.value = 'bg-green-500'
      alertMsg.value = 'Account found in database!'
      await router.push('/')
    }
  }
  catch (error: any) {
    if (error.message === 'User not found') {
      alertColor.value = 'bg-red-500'
      alertMsg.value = 'Account not found in database!'
      setTimeout(() => { showAlert.value = false; }, 2000);
    } else {
      toast.error('Something went wrong !')
    }
  }
  finally {
    inSubmission.value = false
  }
}

// ********** //
// toggleForm //
// ********** //

const toggleForm = (): void => {
  emit('form-state-changed', 'register')
}

// *********** //
// handleOauth //
// *********** //

const handleOauth = async (): Promise<void> => {
  inSubmission.value = true;

  const authUrl = 'http://localhost:3000/api/auth/42/signIn';
  const popup = window.open(authUrl, '_blank', 'width=500,height=600');

    const intervalId = setInterval(async () => {
      try {
        if (popup?.closed) return clearInterval(intervalId);
        const authStatus = await userStore.getAuthStatus();

        console.log('authStatus', authStatus);

        if (authStatus.status === 'authenticated') {
          clearInterval(intervalId);
          if (popup != null) popup.close();
          await userStore.refreshUser();
          await router.push('/');
        }

        if (authStatus.status === 'requires_2fa') {
          clearInterval(intervalId);
          if (popup != null) popup.close();
          await router.push('/mfa');
        }
      } catch (error: any) {
        toast.error('Something went wrong !');
      }
    }, 1000);

  inSubmission.value = false;
};

</script>
