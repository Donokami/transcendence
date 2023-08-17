<template>
  <div class="flex-auto overflow-auto w-fit h-full bg-white">
    <!-- LOADER FOR CHANNEL LIST -->
    <div v-if="channelsList && channelsList.length === 0">
      <div class="flex justify-center items-center h-fit">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
    </div>

    <!-- USER LIST -->
    <ul
      v-else-if="loggedUser && channelsList && channelsList.length > 0"
      class="bg-base-100 w-full">
      <li v-for="user in channel?.members" :key="user.id">
        <div class="dropdown dropdown-bottom">
          <label
            tabindex="0"
            class="flex rounded-none hover:bg-base-300 cursor-pointer">
            <div class="py-3">
              <div class="flex items-center mx-auto px-4 w-18">
                <div class="w-10 h-10">
                  <user-avatar :userProps="(user as User)" :uploadMode="false">
                  </user-avatar>
                </div>
                <span class="pl-3 truncate w-28 text-sm">{{
                  user.username
                }}</span>
              </div>
            </div>
          </label>
          <ul
            tabindex="0"
            class="dropdown-content menu shadow bg-base-100 z-[1000] p-0 border-2 border-black rounded-none mx-2 w-max">
            <li class="rounded-none">
              <router-link
                :to="`/profile/${user.id}`"
                class="flex gap-3 rounded-none">
                <iconify-icon icon="lucide:user" class="h-4 w-4 shrink-0">
                </iconify-icon>
                <span>Profile</span>
              </router-link>
            </li>
            <div v-if="user.id !== loggedUser?.id">
              <li
                class="rounded-none"
                v-if="showMakeAdmin(user)"
                @click="makeAdmin(user)">
                <div class="flex gap-3 rounded-none">
                  <iconify-icon
                    icon="lucide:crown"
                    class="h-4 w-4 shrink-0 self-start mt-0.5">
                  </iconify-icon>
                  <span class="w-full">Make Admin</span>
                </div>
              </li>
              <li class="rounded-none">
                <div class="flex gap-3 rounded-none">
                  <iconify-icon icon="lucide:ban" class="h-4 w-4 shrink-0">
                  </iconify-icon>
                  <span>Block</span>
                </div>
              </li>
              <div v-if="showAdminActions(user)">
                <div class="divider p-0 m-0 h-[6px]"></div>
                <li
                  class="rounded-none"
                  v-if="showRevokeAdmin(user)"
                  @click="revokeAdmin(user)">
                  <div
                    class="flex gap-3 rounded-none text-red-500 hover:text-red-500">
                    <iconify-icon
                      icon="lucide:x"
                      class="h-4 w-4 shrink-0 self-start mt-0.5">
                    </iconify-icon>
                    <span class="w-full">Revoke Admin</span>
                  </div>
                </li>
                <li class="rounded-none">
                  <div
                    class="flex gap-3 rounded-none text-red-500 hover:text-red-500">
                    <iconify-icon
                      icon="lucide:volume-x"
                      class="h-4 w-4 shrink-0">
                    </iconify-icon>
                    <span>Mute</span>
                  </div>
                </li>
                <li class="rounded-none" @click="kickMember(user)">
                  <div
                    class="flex gap-3 rounded-none text-red-500 hover:text-red-500">
                    <iconify-icon
                      icon="lucide:door-open"
                      class="h-4 w-4 shrink-0">
                    </iconify-icon>
                    <span>Kick</span>
                  </div>
                </li>
                <li class="rounded-none" @click="banMember(user)">
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
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
// ******* //
// IMPORTS //
// ******* //

import { storeToRefs } from 'pinia'
import { onBeforeMount, ref } from 'vue'
import { onBeforeRouteUpdate } from 'vue-router'
import { useToast } from 'vue-toastification'

import UserAvatar from '@/components/UserAvatar.vue'
import { useChannelStore } from '@/stores/ChannelStore.js'
import { useUserStore } from '@/stores/UserStore.js'
import type { Channel, User } from '@/types'
import { ApiError } from '@/utils/fetcher'

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const channelStore = useChannelStore()

const userStore = useUserStore()

const { loggedUser } = storeToRefs(userStore)
const { selectedChannel, channelsList } = storeToRefs(channelStore)
const channel = ref<Channel | null>(null)
const toast = useToast()

// ********************* //
// FUNCTIONS DEFINITIONS //
// ********************* //

function showRevokeAdmin(target: User): boolean {
  if (!channel.value || !loggedUser.value) return false

  const isTargetAdmin = channelStore.isAdmin(target.id, channel.value.id)
  const isUserOwner = channelStore.isOwner(
    loggedUser.value.id,
    channel.value.id
  )
  return isUserOwner && isTargetAdmin
}

function showAdminActions(target: User): boolean {
  if (!channel.value || !loggedUser.value) return false

  const isTargetAdmin = channelStore.isAdmin(target.id, channel.value.id)
  const isTargetOwner = channelStore.isOwner(target.id, channel.value.id)
  const isUserOwner = channelStore.isOwner(
    loggedUser.value.id,
    channel.value.id
  )
  const isUserAdmin = channelStore.isAdmin(
    loggedUser.value.id,
    channel.value.id
  )
  return isUserOwner || (isUserAdmin && !isTargetAdmin && !isTargetOwner)
}

function showMakeAdmin(target: User): boolean {
  if (!channel.value || !loggedUser.value) return false

  const isTargetOwner = channelStore.isOwner(target.id, channel.value.id)
  const isTargetAdmin = channelStore.isAdmin(target.id, channel.value.id)
  const isUserOwner = channelStore.isOwner(
    loggedUser.value.id,
    channel.value.id
  )
  const isUserAdmin = channelStore.isAdmin(
    loggedUser.value.id,
    channel.value.id
  )
  return (isUserAdmin || isUserOwner) && !isTargetAdmin && !isTargetOwner
}

async function getChannel(): Promise<void> {
  if (selectedChannel.value !== null) {
    channel.value = channelStore.getChannel(selectedChannel.value)
  }
}

const revokeAdmin = async (target: User): Promise<void> => {
  if (!channel.value) return
  try {
    await channelStore.revokeAdmin(target.id, channel.value.id)
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

const makeAdmin = async (target: User): Promise<void> => {
  if (!channel.value) return
  try {
    await channelStore.makeAdmin(target.id, channel.value.id)
  } catch (err: any) {
    if (err instanceof ApiError) {
      if (err.code === 'ForbiddenException') {
        toast.error('You are not allowed to give admin right to this user.')
      }
    }
  }
}

async function kickMember(target: User): Promise<void> {
  if (!channel.value) return
  await channelStore.kickMember(target.id, channel.value.id)
}

async function banMember(target: User): Promise<void> {
  if (!channel.value) return
  await channelStore.banMember(target.id, channel.value.id)
}

// ********************* //
// VueJs LIFECYCLE HOOKS //
// ********************* //

onBeforeMount(async () => {
  await getChannel()
})

onBeforeRouteUpdate(async (to, from) => {
  await getChannel()
})
</script>
