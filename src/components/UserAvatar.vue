<template>
  <div class="stat-figure w-full aspect-square">
    <div class="avatar w-full h-full" :class="statusBadge()">
      <input
        v-if="props.uploadMode"
        type="file"
        ref="fileInput"
        @change="onFileChange"
        style="display: none" />
      <div class="w-full h-full aspect-square rounded-full">
        <div
          class="absolute w-full h-full object-cover rounded-full cursor-pointer"
          v-if="props.uploadMode"
          @click="triggerFileInput"></div>
        <div
          v-if="!userProps"
          class="w-full h-full bg-slate-200/20 animate-pulse"></div>
        <img v-else-if="pictureSrc" :src="pictureSrc" />
        <iconify-icon
          v-else
          icon="ri:account-circle-line"
          class="w-full h-full object-fill"></iconify-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User } from '@/types'
import { computed, ref, type PropType, type Ref } from 'vue'
import { useUserStore } from '@/stores/UserStore'
import { storeToRefs } from 'pinia'
import { socialSocket } from '@/includes/socialSocket'

const userStore = useUserStore()
const { loggedUser } = storeToRefs(userStore)
const fileInput = ref(null) as Ref<HTMLElement | null>

const props = defineProps({
  userProps: {
    type: Object as PropType<User>
  },
  uploadMode: {
    type: Boolean as PropType<boolean>,
    required: true
  },
  statusMode: {
    type: Boolean as PropType<boolean>,
    default: true
  }
})

const user = computed(() => {
  return props.userProps
})

const triggerFileInput = (): void => {
  fileInput.value?.click()
}

const onFileChange = async (event: Event): Promise<void> => {
  if (loggedUser.value == null) return
  const target = event.target as HTMLInputElement
  if (target.files != null) {
    const file = target.files[0]
    if (loggedUser === null) return
    await userStore.uploadProfilePicture(loggedUser.value.id, file)
    location.reload()
  }
}

const pictureSrc = computed(() => {
  if (!loggedUser.value || !user.value) {
    return null
  }
  const { profilePicture } = user.value

  if (!profilePicture) {
    return null
  }

  if (profilePicture.includes('cdn.intra.42')) {
    return profilePicture
  } else {
    return import.meta.env.VITE_APP_BASE_URL + '/' + profilePicture
  }
})

const statusBadge = (): string => {
  if (!props.statusMode) return ''

  if (user.value === null || loggedUser.value === null) return 'offline'
  if (user.value && user.value.id === loggedUser.value.id) return 'online'
  switch (user.value && user.value.status) {
    case 'online':
      return 'online'
    case 'away':
      return 'away'
    case 'ingame':
      return 'ingame'
    default:
      return 'offline'
  }
}

socialSocket.on('user:connect', (userId) => {
  if (user.value === null) return

  if (user.value && userId === user.value.id) {
    user.value.status = 'online'
  }
})

socialSocket.on('user:disconnect', (userId) => {
  if (user.value === null) return

  if (user.value && userId === user.value.id) {
    user.value.status = 'offline'
  }
})
</script>
