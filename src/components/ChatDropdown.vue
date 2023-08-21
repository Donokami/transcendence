<template>
  <div
    ref="dropdownRef"
    :class="[
      isSender
        ? 'dropdown dropdown-left h-fit ml-2'
        : 'dropdown dropdown-right h-fit mr-2'
    ]">
    <!-- AVATAR DROPDOWN BUTTON -->
    <label
      tabindex="0"
      class="rounded-full cursor-pointer"
      @click="toggleDropdown">
      <div class="h-11 w-11 mt-1">
        <user-avatar
          :userProps="user as User"
          :uploadMode="false"
          :status-mode="false"></user-avatar>
      </div>
    </label>
    <!-- DROPDOWN CONTENT -->
    <ul
      tabindex="0"
      class="dropdown-content menu shadow bg-base-100 p-0 border-2 border-black rounded-none mx-2 w-max"
      v-if="isOpen">
      <!-- GO TO PROFILE -->
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
        <!-- MAKE ADMIN -->
        <li
          class="rounded-none"
          v-if="isMember && showMakeAdmin()"
          @click="makeAdmin">
          <div class="flex gap-3 rounded-none">
            <iconify-icon
              icon="lucide:user-cog"
              class="h-4 w-4 shrink-0 self-start mt-0.5">
            </iconify-icon>
            <span class="w-full">Make Admin</span>
          </div>
        </li>
        <!-- BLOCK -->
        <li class="rounded-none" @click="blockUser">
          <div class="flex gap-3 rounded-none">
            <iconify-icon icon="lucide:ban" class="h-4 w-4 shrink-0">
            </iconify-icon>
            <span>Block</span>
          </div>
        </li>
        <!-- ADMIN ACTIONS -->
        <div v-if="showAdminActions()">
          <div class="divider p-0 m-0 h-[6px]"></div>
          <!-- REVOKE ADMIN -->
          <li
            class="rounded-none"
            v-if="isMember && showRevokeAdmin()"
            @click="revokeAdmin()">
            <div
              class="flex gap-3 rounded-none text-red-500 hover:text-red-500">
              <iconify-icon
                icon="lucide:x"
                class="h-4 w-4 shrink-0 self-start mt-0.5">
              </iconify-icon>
              <span class="w-full">Revoke Admin</span>
            </div>
          </li>
          <!-- MUTE -->
          <li class="rounded-none" v-if="isMember" @click="muteMember">
            <div
              class="flex gap-3 rounded-none text-red-500 hover:text-red-500">
              <iconify-icon icon="lucide:volume-x" class="h-4 w-4 shrink-0">
              </iconify-icon>
              <span>Mute</span>
            </div>
          </li>
          <!-- KICK -->
          <li class="rounded-none" v-if="isMember" @click="kickMember">
            <div
              class="flex gap-3 rounded-none text-red-500 hover:text-red-500">
              <iconify-icon icon="lucide:door-open" class="h-4 w-4 shrink-0">
              </iconify-icon>
              <span>Kick</span>
            </div>
          </li>
          <!-- BAN -->
          <li class="rounded-none" v-if="isMember" @click="banMember">
            <div
              class="flex gap-3 rounded-none text-red-500 hover:text-red-500">
              <iconify-icon icon="lucide:gavel" class="h-4 w-4 shrink-0">
              </iconify-icon>
              <span>Ban</span>
            </div>
          </li>
          <!-- UNBAN -->
          <li class="rounded-none" v-if="isBanned" @click="unbanMember">
            <div
              class="flex gap-3 rounded-none text-green-500 hover:text-green-500">
              <iconify-icon icon="lucide:gavel" class="h-4 w-4 shrink-0">
              </iconify-icon>
              <span>Unban</span>
            </div>
          </li>
        </div>
      </div>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'

import {
  computed,
  onMounted,
  onUnmounted,
  ref,
  watch,
  type PropType
} from 'vue'
import { useToast } from 'vue-toastification'

import UserAvatar from '@/components/UserAvatar.vue'
import { useUserStore } from '@/stores/UserStore.js'
import { useChannelStore } from '@/stores/ChannelStore.js'
import type { User, Channel } from '@/types'
import { ApiError } from '@/utils/fetcher'

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

const channelStore = useChannelStore()

const userStore = useUserStore()
const { loggedUser } = storeToRefs(userStore)

const dropdownRef = ref<HTMLElement | null>(null)
const isOpen = ref(props.openDropdown === parseInt(props.user.id))
const toast = useToast()

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

const isBanned = computed((): boolean => {
  return channelStore.isBanned(props.user.id, props.channel.id)
})

const isMember = computed((): boolean => {
  return channelStore.isMember(props.user.id, props.channel.id)
})

async function banMember(): Promise<void> {
  try {
    await channelStore.banMember(props.user.id, props.channel.id)
  } catch (err: any) {
    if (err instanceof ApiError) {
      if (err.code === 'ForbiddenException') {
        toast.error('You are not allowed to ban this member.')
      }
    }
  }
}

async function blockUser(): Promise<void> {
  try {
    await userStore.blockUser(props.user.id)
    toast.success(`${props.user.username} has been blocked.`)
  } catch (err: any) {
    if (err instanceof ApiError) {
      if (err.code === 'SameIdsError') {
        toast.error('You cannot block yourself.')
      } else if (err.code === 'FriendshipAlreadyBlocked') {
        toast.error('Friendship status is already blocked.')
      }
    }
  }
}

async function kickMember() {
  try {
    await channelStore.kickMember(props.user.id, props.channel.id)
  } catch (err: any) {
    if (err instanceof ApiError) {
      if (err.code === 'ForbiddenException') {
        toast.error('You are not allowed to kick this member.')
      }
    }
  }
}

async function makeAdmin() {
  try {
    await channelStore.makeAdmin(props.user.id, props.channel.id)
  } catch (err: any) {
    if (err instanceof ApiError) {
      if (err.code === 'ForbiddenException') {
        toast.error('You are not allowed to give admin right to this user.')
      }
    }
  }
}

async function muteMember() {
  try {
    await channelStore.muteMember(props.user.id, props.channel.id)
  } catch (err: any) {
    if (err instanceof ApiError) {
      if (err.code === 'ForbiddenException') {
        toast.error('You are not allowed to mute this member.')
      }
    }
  }
}

async function revokeAdmin() {
  try {
    await channelStore.revokeAdmin(props.user.id, props.channel.id)
  } catch (err: any) {
    if (err instanceof ApiError) {
      if (err.code === 'ForbiddenException') {
        toast.error(
          'You are not allowed to revoke the admin rights of this user.'
        )
      }
    }
  }
}

async function unbanMember(): Promise<void> {
  try {
    await channelStore.unbanMember(props.user.id, props.channel.id)
  } catch (err: any) {
    if (err instanceof ApiError) {
      if (err.code === 'ForbiddenException') {
        toast.error('You are not allowed to unban this member.')
      }
    }
  }
}

function showAdminActions(): boolean {
  if (!props.channel || !loggedUser.value) return false

  const isTargetAdmin = channelStore.isAdmin(props.user.id, props.channel.id)
  const isTargetOwner = channelStore.isOwner(props.user.id, props.channel.id)
  const isUserOwner = channelStore.isOwner(
    loggedUser.value.id,
    props.channel.id
  )
  const isUserAdmin = channelStore.isAdmin(
    loggedUser.value.id,
    props.channel.id
  )
  return isUserOwner || (isUserAdmin && !isTargetAdmin && !isTargetOwner)
}

function showMakeAdmin(): boolean {
  if (!props.channel || !loggedUser.value) return false

  const isTargetOwner = channelStore.isOwner(props.user.id, props.channel.id)
  const isTargetAdmin = channelStore.isAdmin(props.user.id, props.channel.id)
  const isUserOwner = channelStore.isOwner(
    loggedUser.value.id,
    props.channel.id
  )
  const isUserAdmin = channelStore.isAdmin(
    loggedUser.value.id,
    props.channel.id
  )
  return (isUserAdmin || isUserOwner) && !isTargetAdmin && !isTargetOwner
}

function showRevokeAdmin(): boolean {
  if (!props.channel || !loggedUser.value) return false

  const isTargetAdmin = channelStore.isAdmin(props.user.id, props.channel.id)
  const isUserOwner = channelStore.isOwner(
    loggedUser.value.id,
    props.channel.id
  )
  return isUserOwner && isTargetAdmin
}

const toggleDropdown = (): void => {
  isOpen.value = !isOpen.value
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(
  () => props.openDropdown,
  (newValue) => {
    isOpen.value = newValue === parseInt(props.user.id)
  }
)
</script>
