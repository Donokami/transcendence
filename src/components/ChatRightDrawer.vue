<template>
  <div class="drawer drawer-end w-0 z-[1000]">
    <input
      ref="drawerToggle"
      id="my-drawer-4"
      type="checkbox"
      class="drawer-toggle" />
    <div class="drawer-content"></div>
    <div class="drawer-side">
      <label for="my-drawer-4" class="drawer-overlay"></label>
      <div
        class="flex flex-col min-h-full p-0 border-2 border-black w-72 bg-base-100 text-base-content">
        <div class="flex-auto w-full overflow-auto">
          <!-- LOADER FOR CHANNEL LIST -->
          <div v-if="channelsList === null">
            <div class="flex items-center justify-center h-fit">
              <span class="loading loading-spinner loading-lg"></span>
            </div>
          </div>

          <!-- USER LIST -->
          <ul
            v-else-if="loggedUser && loggedUser && channelsList.length > 0"
            class="w-full bg-base-100">
            <li v-for="user in channel?.members" :key="user.id">
              <div class="w-full rounded-none dropdown dropdown-bottom">
                <label
                  tabindex="0"
                  class="flex rounded-none cursor-pointer hover:bg-base-300">
                  <div class="py-3">
                    <div class="flex items-center px-4 mx-auto">
                      <div class="w-10 h-10">
                        <user-avatar
                          :userProps="(user as User)"
                          :uploadMode="false">
                        </user-avatar>
                      </div>
                      <span class="pl-3 text-sm truncate w-28">{{
                        user.username
                      }}</span>
                    </div>
                  </div>
                </label>
                <ul
                  tabindex="0"
                  class="dropdown-content menu shadow bg-base-100 z-[1000] p-0 border-2 border-black rounded-none mx-2 w-40 top-100">
                  <li class="rounded-none">
                    <router-link
                      :to="`/profile/${user.id}`"
                      class="flex gap-3 rounded-none">
                      <iconify-icon icon="lucide:user" class="w-4 h-4 shrink-0">
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
                        <iconify-icon
                          icon="lucide:volume-x"
                          class="w-4 h-4 shrink-0">
                        </iconify-icon>
                        <span>Mute</span>
                      </div>
                    </li>
                    <li class="rounded-none">
                      <div class="flex gap-3 rounded-none">
                        <iconify-icon
                          icon="lucide:ban"
                          class="w-4 h-4 shrink-0">
                        </iconify-icon>
                        <span>Block</span>
                      </div>
                    </li>
                    <div v-if="showAdminActions(user)">
                      <div class="divider p-0 m-0 h-[6px]"></div>
                      <li class="rounded-none" @click="kickMember(user)">
                        <div
                          class="flex gap-3 text-red-500 rounded-none hover:text-red-500">
                          <iconify-icon
                            icon="lucide:door-open"
                            class="w-4 h-4 shrink-0">
                          </iconify-icon>
                          <span>Kick</span>
                        </div>
                      </li>
                      <li class="rounded-none" @click="banMember(user)">
                        <div
                          class="flex gap-3 text-red-500 rounded-none hover:text-red-500">
                          <iconify-icon
                            icon="lucide:gavel"
                            class="w-4 h-4 shrink-0">
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
        <!-- MANAGE PASSWORD BUTTON -->
        <div>
          <label
            for="my-modal-13"
            class="relative w-full text-black bg-white border-t-2 border-b-0 border-black btn border-x-0 hover:bg-black hover:border-black hover:text-white"
            type="button">
            <iconify-icon
              icon="lucide:key-round"
              class="absolute w-6 h-6 left-5">
            </iconify-icon>
            <div class="w-full text-center">Manage Password</div>
          </label>
        </div>
        <div>
          <label
            class="relative w-full text-black bg-white border-t-2 border-b-0 border-black btn border-x-0 hover:bg-black hover:border-black hover:text-white"
            type="button"
            @click="leaveGroup">
            <iconify-icon
              icon="lucide:door-open"
              class="absolute w-6 h-6 left-5">
            </iconify-icon>
            <div class="w-full text-center">Leave channel</div>
          </label>
        </div>
      </div>
    </div>
    <!-- MANAGE PASSWORD MODAL -->
    <chat-manage-password-modal
      :showModal="showModal"
      @update:showModal="showModal = $event">
    </chat-manage-password-modal>
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
import ChatManagePasswordModal from '@/components/ChatManagePasswordModal.vue'
import { useChannelStore } from '@/stores/ChannelStore.js'
import { useUserStore } from '@/stores/UserStore.js'
import type { Channel, User } from '@/types'
import { ApiError } from '@/utils/fetcher'

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const channelStore = useChannelStore()

const userStore = useUserStore()

const showModal = ref(false)

const { loggedUser } = storeToRefs(userStore)
const { selectedChannel, channelsList } = storeToRefs(channelStore)
const channel = ref<Channel | null>(null)
const toast = useToast()

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

const kickMember = async (target: User): Promise<void> => {
  if (!channel.value) return
  await channelStore.kickMember(target.id, channel.value.id)
}

const banMember = async (target: User): Promise<void> => {
  if (!channel.value) return
  await channelStore.banMember(target.id, channel.value.id)
}

const leaveGroup = async (): Promise<void> => {
  if (!loggedUser.value || !channel.value) return
  await channelStore.leaveGroup(loggedUser.value.id, channel.value.id)
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
