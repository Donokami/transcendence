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
        class="flex flex-col w-72 bg-base-100 text-base-content p-0 border-2 border-black min-h-full">
        <div class="overflow-auto w-full flex-auto">
          <!-- LOADER FOR CHANNEL LIST -->
          <div v-if="channelStore.channelsList?.loading === true">
            <div class="flex justify-center items-center h-fit">
              <span class="loading loading-spinner loading-lg"></span>
            </div>
          </div>

          <!-- USER LIST -->
          <ul
            v-else-if="
              loggedUser && channelStore.channelsList?.loading === false
            "
            class="bg-base-100 w-full">
            <li v-for="user in channel?.members" :key="user.id">
              <div class="dropdown dropdown-bottom rounded-none w-full">
                <label
                  tabindex="0"
                  class="flex rounded-none hover:bg-base-300 cursor-pointer">
                  <div class="py-3">
                    <div class="flex items-center mx-auto px-4">
                      <div class="w-10 h-10">
                        <user-avatar
                          :userProps="(user as User)"
                          :uploadMode="false">
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
                  class="dropdown-content menu shadow bg-base-100 z-[1000] p-0 border-2 border-black rounded-none mx-2 w-40 top-100">
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
                      @click="giveAdminRights(user)">
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
                          class="h-4 w-4 shrink-0">
                        </iconify-icon>
                        <span>Mute</span>
                      </div>
                    </li>
                    <li class="rounded-none">
                      <div class="flex gap-3 rounded-none">
                        <iconify-icon
                          icon="lucide:ban"
                          class="h-4 w-4 shrink-0">
                        </iconify-icon>
                        <span>Block</span>
                      </div>
                    </li>
                    <div v-if="showAdminActions(user)">
                      <div class="divider p-0 m-0 h-[6px]"></div>
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
                          <iconify-icon
                            icon="lucide:gavel"
                            class="h-4 w-4 shrink-0">
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
            class="btn bg-white border-t-2 border-x-0 border-b-0 border-black text-black hover:bg-black hover:border-black hover:text-white w-full relative"
            type="button">
            <iconify-icon
              icon="lucide:key-round"
              class="absolute left-5 w-6 h-6">
            </iconify-icon>
            <div class="text-center w-full">Manage Password</div>
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

import UserAvatar from './UserAvatar.vue'
import ChatManagePasswordModal from '@/components/ChatManagePasswordModal.vue'

import { useChannelStore } from '@/stores/ChannelStore.js'
import { useUserStore } from '@/stores/UserStore.js'
import type { Channel, User } from '@/types'

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const channelStore = useChannelStore()

const userStore = useUserStore()

const showModal = ref(false)

const { loggedUser } = storeToRefs(userStore)
const { selectedChannel } = storeToRefs(channelStore)
const channel = ref<Channel>()

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

const giveAdminRights = (target: User): void => {
  if (!channel.value) return
  channelStore.addAdmin(target, channel.value.id)
}

const kickMember = async (target: User): Promise<void> => {
  if (!channel.value) return
  await channelStore.kickMember(target.id, channel.value.id)
}

const banMember = async (target: User): Promise<void> => {
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
