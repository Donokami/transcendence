<template>
  <div class="neobrutalist-box w-[30rem] px-6 py-6">
    <h2 class="text-2xl font-bold mb-8 text-black">Register</h2>
    <vee-form ref="formRef" :validation-schema="registerSchema" @submit="submitForm">
      <div class="mb-6">
        <label class="block font-medium mb-1" for="username"> Username </label>
        <vee-field
          class="neobrutalist-input w-full text-black"
          name="username"
          type="username"
          placeholder="Choose a username"
        />
        <ErrorMessage class="font-normal text-base text-red-600" name="email" />
      </div>
      <div class="mb-6">
        <label class="block font-medium mb-1" for="email">Email</label>
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
      <div class="mb-6">
        <label class="block font-medium mb-1" for="confirmPassword">Confirm Password</label>
        <vee-field
          class="neobrutalist-input w-full text-black"
          name="confirmPassword"
          type="password"
          placeholder="Confirm your password"
        />
        <ErrorMessage class="font-normal text-base text-red-600" name="confirmPassword" />
      </div>
      <div
        class="text-white text-center font-bold p-4 rounded mb-4"
        v-if="showAlert"
        :class="alertVariant"
      >
        {{ alertMsg }}
      </div>
      <div class="flex items-center justify-between mt-8">
        <button class="btn bg-zinc-900 text-white" type="submit" :disabled="inSubmission">
          Create account
        </button>
        <button
          class="btn bg-gray-400 hover:bg-gray-300 text-zinc-900"
          type="button"
          @click="toggleForm"
        >
          Log in
        </button>
      </div>
    </vee-form>
    <div class="divider before:bg-gray-400 after:bg-gray-400 m-8">or</div>
    <div class="flex justify-center">
      <button class="btn bg-zinc-900 text-white" type="submit" :disabled="inSubmission">
        Register with
        <img class="icon mx-3 h-2/4" src="../assets/42-logo.svg" alt="42 Logo" />
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Form as VeeForm } from 'vee-validate'

interface FormModel {
  username: string
  email: string
  password: string
  registerSchema: Record<string, string>
  inSubmission: boolean
  showAlert: boolean
  alertVariant: string
  alertMsg: string
}

export default defineComponent({
  name: 'AppNeobrutalistForm',
  data(): FormModel {
    return {
      username: '',
      email: '',
      password: '',
      registerSchema: {
        username: 'required|min:3|max:100',
        email: 'required|min:3|max:100|email',
        password: 'required|min:8|max:100',
        confirmPassword: 'required|password_mismatch:@password'
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
      this.$emit('form-state-changed', 'login')
      ;(this.$refs.formRef as typeof VeeForm).resetForm()
    }
  }
})
</script>
