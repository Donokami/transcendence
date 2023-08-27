<template>
  <div class="w-full stat-figure aspect-square">
    <div class="w-full h-full avatar" :class="statusBadge()">
      <input
        v-if="props.uploadMode"
        type="file"
        ref="fileInput"
        @change="onFileChange"
        style="display: none" />
      <div class="w-full h-full rounded-full aspect-square">
        <div
          class="absolute object-cover w-full h-full rounded-full cursor-pointer"
          v-if="props.uploadMode"
          @click="triggerFileInput"></div>
        <div
          v-if="!userProps"
          class="w-full h-full bg-slate-200/20 animate-pulse"></div>
        <img v-else-if="pictureSrc" :src="pictureSrc" />
        <iconify-icon
          v-else
          icon="ri:account-circle-line"
          class="object-fill w-full h-full"></iconify-icon>
      </div>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.avatar.ingame:before {
  content: '';
  position: absolute;
  z-index: 10;
  display: block;
  border-radius: 9999px;
  --tw-bg-opacity: 1;
  outline-style: solid;
  outline-width: 2px;
  outline-color: hsl(var(--b1) / 1);
  width: 15%;
  height: 15%;
  top: 7%;
  right: 7%;
  @apply bg-purple-500;
}
</style>

<script setup lang="ts">
import type { User } from '@/types'
import { computed, ref, type PropType, type Ref, onBeforeUnmount } from 'vue'
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

  if (
    user?.value?.id === loggedUser.value.id &&
    user.value.status === 'offline'
  ) {
    return 'online'
  }

  switch (user?.value?.status) {
    case 'online':
      return 'online'
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

onBeforeUnmount(() => {
  socialSocket.off(`user:connect`)
  socialSocket.off(`user:disconnect`)
})
</script>
