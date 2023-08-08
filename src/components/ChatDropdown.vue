<template>
  <div
    ref="dropdownRef"
    :class="[
      isSender
        ? 'dropdown dropdown-left h-fit ml-2'
        : 'dropdown dropdown-right h-fit mr-2'
    ]">
    <label
      tabindex="0"
      class="rounded-full cursor-pointer"
      @click="toggleDropdown">
      <img
        v-if="user.profilePicture"
        :src="`http://localhost:3000/${user.profilePicture}`"
        class="object-cover rounded-full h-11 w-11 mt-1" />
      <iconify-icon v-else icon="ri:account-circle-line" class="h-11 w-11">
      </iconify-icon>
    </label>
    <ul
      tabindex="0"
      class="dropdown-content menu shadow bg-base-100 p-0 border-2 border-black rounded-none mx-2 w-40 top-100"
      v-if="isOpen">
      <li class="rounded-none">
        <router-link
          :to="`/profile/${user.id}`"
          class="flex gap-3 rounded-none">
          <iconify-icon icon="lucide:user" class="h-4 w-4 shrink-0">
          </iconify-icon>
          <span>Profile</span>
        </router-link>
      </li>
      <div v-if="!isSender">
        <li
          class="rounded-none"
          v-if="isUsernameInMembers"
          @click="giveAdminRights">
          <div class="flex gap-3 rounded-none">
            <iconify-icon
              icon="lucide:crown"
              class="h-4 w-4 shrink-0 self-start mt-0.5">
            </iconify-icon>
            <span class="w-full">Make Admin</span>
          </div>
        </li>

        <li class="rounded-none" v-if="isUsernameInMembers">
          <div class="flex gap-3 rounded-none">
            <iconify-icon icon="lucide:volume-x" class="h-4 w-4 shrink-0">
            </iconify-icon>
            <span>Mute</span>
          </div>
        </li>
        <li class="rounded-none">
          <div class="flex gap-3 rounded-none">
            <iconify-icon icon="lucide:ban" class="h-4 w-4 shrink-0">
            </iconify-icon>
            <span>Block</span>
          </div>
        </li>
        <div v-if="isUsernameInMembers">
          <div class="divider p-0 m-0 h-[6px]"></div>
          <li class="rounded-none" @click="kickMember">
            <div
              class="flex gap-3 rounded-none text-red-500 hover:text-red-500">
              <iconify-icon icon="lucide:door-open" class="h-4 w-4 shrink-0">
              </iconify-icon>
              <span>Kick</span>
            </div>
          </li>
          <li class="rounded-none" @click="banMember">
            <div
              class="flex gap-3 rounded-none text-red-500 hover:text-red-500">
              <iconify-icon icon="lucide:gavel" class="h-4 w-4 shrink-0">
              </iconify-icon>
              <span>Ban</span>
            </div>
          </li>
        </div>
      </div>
    </ul>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  watch,
  defineProps,
  PropType,
  computed,
  onMounted,
  onUnmounted
} from 'vue'
import { useChannelStore } from '@/stores/ChannelStore.js'
import type { User, Channel } from '@/types'
import { useUserStore } from '@/stores/UserStore.js'
import { storeToRefs } from 'pinia'

const props = defineProps({
  user: {
    type: Object as PropType<User>,
    required: true
  },
  channel: {
    type: Object as PropType<Channel>,
    required: true
  },
  openDropdown: {
    type: [Number, null] as PropType<number | null>,
    required: true,
    validator: (value: any) => value === null || typeof value === 'number'
  },
  isSender: {
    type: Boolean,
    required: true
  }
})

const userStore = useUserStore()
const channelStore = useChannelStore()

const { loggedUser } = storeToRefs(userStore)

// const isAdmin = computed((): boolean => {
//   return props.channel.members.some(
//     (member) => member.isAdmin === props.user.username
//   )
// })

const isUsernameInMembers = computed((): boolean => {
  return props.channel.members.some(
    (member) => member.username === props.user.username
  )
})

const giveAdminRights = async (): Promise<void> => {
  await channelStore.giveAdminRights(props.user.id, props.channel.id)
}

const kickMember = async (): Promise<void> => {
  await channelStore.kickMember(props.user.id, props.channel.id)
}

const banMember = async (): Promise<void> => {
  await channelStore.banMember(props.user.id, props.channel.id)
}

const dropdownRef = ref<HTMLElement | null>(null)

const handleClickOutside = (event: MouseEvent): void => {
  const { target } = event
  if (
    dropdownRef.value &&
    !dropdownRef.value.contains(target as Node) &&
    isOpen.value
  ) {
    toggleDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const isOpen = ref(props.openDropdown === parseInt(props.user.id))

watch(
  () => props.openDropdown,
  (newValue) => {
    isOpen.value = newValue === parseInt(props.user.id)
  }
)

const toggleDropdown = (): void => {
  isOpen.value = !isOpen.value
}
</script>
