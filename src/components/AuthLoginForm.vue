<template>
  <div class="neobrutalist-box w-[30rem] px-6 py-6">
    <h2 class="text-2xl font-bold mb-8 text-black">Log in</h2>
    <vee-form ref="formRef" :validation-schema="loginSchema" @submit="submitForm">
      <div class="mb-6">
        <label class="block font-medium mb-1" for="email"> Email </label>
        <vee-field
          class="neobrutalist-input w-full text-black"
          name="email"
          type="email"
          placeholder="Enter your email address"
        />
        <ErrorMessage class="font-normal text-base text-red-600" name="email" />
      </div>
      <div class="mb-6">
        <label class="block font-medium mb-1" for="password">Password</label>
        <vee-field
          class="neobrutalist-input w-full text-black"
          name="password"
          type="password"
          placeholder="Enter your password"
        />
        <ErrorMessage class="font-normal text-base text-red-600" name="password" />
      </div>
      <div class="flex items-center justify-between mt-8">
        <button
          class="btn border-zinc-900 bg-zinc-900 text-white"
          type="submit"
          :disabled="inSubmission"
        >
          Log in
        </button>
        <button
          class="btn border-gray-400 bg-gray-400 hover:bg-gray-300 hover:border-gray-300 text-zinc-900"
          type="button"
          @click="toggleForm"
        >
          Register
        </button>
      </div>
    </vee-form>
    <div class="divider before:bg-gray-400 after:bg-gray-400 m-8">or</div>
    <div class="flex justify-center">
      <button class="btn bg-zinc-900 text-white" type="submit" :disabled="inSubmission">
        Log in with
        <img class="icon mx-3 h-2/4" src="../assets/42-logo.svg" alt="42 Logo" />
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { Form as VeeForm } from 'vee-validate'

interface FormModel {
  email: string
  password: string
  loginSchema: Record<string, string>
  inSubmission: boolean
  showAlert: boolean
  alertVariant: string
  alertMsg: string
}

export default {
  name: 'AppNeobrutalistForm',
  data(): FormModel {
    return {
      email: '',
      password: '',
      loginSchema: {
        email: 'required|min:3|max:100|email',
        password: 'required|min:8|max:100'
      },
      inSubmission: false,
      showAlert: false,
      alertVariant: 'bg-blue-500',
      alertMsg: 'Your account is being created...'
    }
  },
  methods: {
    submitForm(values: Record<string, string>) {
      this.showAlert = true
      this.inSubmission = true
      ;('')
      this.alertVariant = 'bg-blue-500'
      this.alertMsg = 'Your account is being created...'

      this.alertVariant = 'bg-green-500'
      this.alertMsg = 'Your account has been created!'

      console.log(values)
    },
    toggleForm(): void {
      this.$emit('form-state-changed', 'register')
      ;(this.$refs.formRef as typeof VeeForm).resetForm()
    }
  }
}
</script>
