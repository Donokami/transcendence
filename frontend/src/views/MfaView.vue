<template>
  <div class="w-full mx-auto text-black">
    <div
      class="relative flex items-center px-4 mx-2 my-2 text-justify border-2 border-black sm:m-4 py-7 sm:p-11">
      <auth-ball-canvas></auth-ball-canvas>
      <div class="z-10 flex items-center justify-center flex-grow">
        <AuthMfaForm></AuthMfaForm>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AuthMfaForm from '../components/AuthMfaForm.vue'
import AuthBallCanvas from '../components/AuthBallCanvas.vue'
import { onMounted, onBeforeMount } from 'vue'
import { useUserStore } from '@/stores/UserStore'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

onMounted(async () => {
  try {
    await userStore.fetchUser()
    router.push({ name: 'home' })
  } catch (e) {
    void e
  }
})
</script>
