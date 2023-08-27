<template>
  <div class="mt-4" v-if="loggedUser?.id">
    <!-- TOGGLER-->
    <span class="text-xl stat-value">{{ authMessage }}</span>
    <span class="px-6 align-middle">
      <input
        type="checkbox"
        class="rounded-none toggle"
        v-model="loggedUser.isTwoFactorEnabled"
        @click="switchAuthMessage" />
    </span>
    <!-- QR CODE -->
    <Transition>
      <div v-if="qrCodeUrl" class="-ml-4">
        <img :src="qrCodeUrl" alt="QR Code" />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/UserStore'
import fetcher from '@/utils/fetcher'
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'

const { loggedUser } = useUserStore()
const userStore = useUserStore()
const qrCodeUrl = ref('')
const authMessage = ref('Activate 2FA')
const toast = useToast()

onMounted(async () => {
  if (loggedUser?.isTwoFactorEnabled) {
    await fetchQrCodeUrl()
  }
})

async function fetchQrCodeUrl(): Promise<void> {
  const data = await fetcher.get('/auth/2fa')
  qrCodeUrl.value = data.dataUrl
}

const switchAuthMessage = async (): Promise<void> => {
  try {
    const data = await userStore.enableTwoFactor()
    if (data.isTwoFactorEnabled) {
      await fetchQrCodeUrl()
      authMessage.value = 'Deactivate 2FA'
    } else {
      qrCodeUrl.value = ''
      authMessage.value = 'Activate 2FA'
    }
  } catch (error: any) {
    toast.error('An error occured while enabling 2FA')
  }
}
</script>
