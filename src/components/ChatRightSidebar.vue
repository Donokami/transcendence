<template>
  <div class="flex-auto h-full overflow-auto bg-white w-fit">
    <!-- LOADER FOR CHANNEL LIST -->
    <div v-if="channelsList && channelsList.length === 0">
      <div class="flex items-center justify-center h-fit">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
    </div>

    <!-- USER LIST -->
    <ul
      v-else-if="loggedUser && channelsList && channelsList.length > 0"
      class="w-full bg-base-100">
      <li v-for="user in channel?.members" :key="user.id">
        <div class="dropdown dropdown-bottom">
          <!-- AVATAR DROPDOWN BUTTON -->
          <label
            tabindex="0"
            class="flex rounded-none cursor-pointer hover:bg-base-300">
            <div class="py-3">
              <div class="flex items-center px-4 mx-auto w-18">
                <div class="w-10 h-10">
                  <user-avatar :user-props="user" :upload-mode="false">
                  </user-avatar>
                </div>
                <span class="pl-3 text-sm truncate w-28">{{
                  user.username
                }}</span>
              </div>
            </div>
          </label>
          <!-- DROPDOWN CONTENT -->
          <ul
            tabindex="0"
            class="dropdown-content menu shadow bg-base-100 z-[1000] p-0 border-2 border-black rounded-none mx-2 w-max">
            <!-- GO TO PROFILE -->
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
              <!-- MAKE ADMIN -->
              <li
                class="rounded-none"
                v-if="isMember(user) && showMakeAdmin(user)"
                @click="makeAdmin(user)">
                <div class="flex gap-3 rounded-none">
                  <iconify-icon
                    icon="lucide:user-cog"
                    class="h-4 w-4 shrink-0 self-start mt-0.5">
                  </iconify-icon>
                  <span class="w-full">Make Admin</span>
                </div>
              </li>
              <!-- BLOCK -->
              <li
                class="rounded-none"
                v-if="isBlocked(user) === false"
                @click="blockUser(user)">
                <div class="flex gap-3 rounded-none">
                  <iconify-icon icon="lucide:ban" class="w-4 h-4 shrink-0">
                  </iconify-icon>
                  <span>Block</span>
                </div>
              </li>
              <!-- UNBLOCK -->
              <li
                class="rounded-none"
                v-if="isBlocked(user) === true"
                @click="unblockUser(user)">
                <div class="flex gap-3 rounded-none">
                  <iconify-icon icon="lucide:ban" class="w-4 h-4 shrink-0">
                  </iconify-icon>
                  <span>Unblock</span>
                </div>
              </li>
              <!-- ADMIN ACTIONS -->
              <div v-if="showAdminActions(user)">
                <div class="divider p-0 m-0 h-[6px]"></div>
                <!-- REVOKE ADMIN -->
                <li
                  class="rounded-none"
                  v-if="isMember(user) && showRevokeAdmin(user)"
                  @click="revokeAdmin(user)">
                  <div
                    class="flex gap-3 text-red-500 rounded-none hover:text-red-500">
                    <iconify-icon
                      icon="lucide:x"
                      class="h-4 w-4 shrink-0 self-start mt-0.5">
                    </iconify-icon>
                    <span class="w-full">Revoke Admin</span>
                  </div>
                </li>
                <!-- MUTE -->
                <li
                  class="rounded-none"
                  v-if="isMember(user)"
                  @click="muteMember(user)">
                  <div
                    class="flex gap-3 text-red-500 rounded-none hover:text-red-500">
                    <iconify-icon
                      icon="lucide:volume-x"
                      class="w-4 h-4 shrink-0">
                    </iconify-icon>
                    <span>Mute</span>
                  </div>
                </li>
                <!-- KICK -->
                <li
                  class="rounded-none"
                  v-if="isMember(user)"
                  @click="kickMember(user)">
                  <div
                    class="flex gap-3 text-red-500 rounded-none hover:text-red-500">
                    <iconify-icon
                      icon="lucide:door-open"
                      class="w-4 h-4 shrink-0">
                    </iconify-icon>
                    <span>Kick</span>
                  </div>
                </li>
                <!-- BAN -->
                <li
                  class="rounded-none"
                  v-if="isMember(user)"
                  @click="banMember(user)">
                  <div
                    class="flex gap-3 text-red-500 rounded-none hover:text-red-500">
                    <iconify-icon icon="lucide:gavel" class="w-4 h-4 shrink-0">
                    </iconify-icon>
                    <span>Ban</span>
                  </div>
                </li>
                <!-- UNBAN -->
                <li
                  class="rounded-none"
                  v-if="isBanned(user)"
                  @click="unbanMember(user)">
                  <div
                    class="flex gap-3 text-green-500 rounded-none hover:text-green-500">
                    <iconify-icon icon="lucide:gavel" class="w-4 h-4 shrink-0">
                    </iconify-icon>
                    <span>Unban</span>
                  </div>
                </li>
              </div>
            </div>
          </ul>
        </div>
      </li>
    </ul>
    <div>
      <!-- MANAGE PASSWORD BUTTON -->
      <div>
        <label
          for="my-modal-13"
          v-if="channel?.owner.id === loggedUser?.id"
          class="relative w-full text-black bg-white border-t-2 border-b-0 border-black btn border-x-0 hover:bg-black hover:border-black hover:text-white"
          type="button">
          <iconify-icon icon="lucide:key-round" class="absolute w-6 h-6 left-5">
          </iconify-icon>
          <div class="w-full text-center">Manage Password</div>
        </label>
      </div>
      <!-- LEAVE CHANNEL BUTTON -->
      <div>
        <label
          class="relative w-full text-black bg-white border-t-2 border-b-0 border-black btn border-x-0 hover:bg-black hover:border-black hover:text-white"
          type="button"
          @click="leaveGroup">
          <iconify-icon icon="lucide:door-open" class="absolute w-6 h-6 left-5">
          </iconify-icon>
          <div class="w-full text-center">Leave channel</div>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onBeforeMount, ref } from 'vue'
import { onBeforeRouteUpdate } from 'vue-router'
import { useToast } from 'vue-toastification'

import UserAvatar from '@/components/UserAvatar.vue'
import { useChannelStore } from '@/stores/ChannelStore.js'
import { useUserStore } from '@/stores/UserStore.js'
import type { Channel, User } from '@/types'
import { ApiError } from '@/utils/fetcher'

const channel = ref<Channel | null>(null)
const channelStore = useChannelStore()
const toast = useToast()
const userStore = useUserStore()
const { loggedUser } = storeToRefs(userStore)
const { selectedChannel, channelsList } = storeToRefs(channelStore)

async function banMember(target: User): Promise<void> {
  if (!channel.value) return
  try {
    await channelStore.banMember(target.id, channel.value.id)
  } catch (err: any) {
    if (err instanceof ApiError) {
      if (err.code === 'ForbiddenException') {
        toast.error('You are not allowed to ban this member.')
      }
    }
  }
}

async function blockUser(target: User): Promise<void> {
  try {
    await userStore.blockUser(target.id)
    toast.success(`${target.username} has been blocked.`)
  } catch (err: any) {
    if (err instanceof ApiError) {
      if (err.code === 'FriendshipAlreadyBlocked') {
        toast.error('Friendship status is already blocked.')
      } else if (err.code === 'SameIdsError') {
        toast.error('You cannot block yourself.')
      }
    } else {
      toast.error('Something went wrong')
    }
  }
}

async function getChannel(): Promise<void> {
  if (selectedChannel.value !== null) {
    channel.value = channelStore.getChannel(selectedChannel.value)
  }
}

async function kickMember(target: User): Promise<void> {
  if (!channel.value) return
  await channelStore.kickMember(target.id, channel.value.id)
}

async function leaveGroup(): Promise<void> {
  if (!loggedUser.value || !channel.value) return
  await channelStore.leaveGroup(loggedUser.value.id, channel.value.id)
}

async function makeAdmin(target: User): Promise<void> {
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

async function muteMember(target: User): Promise<void> {
  if (!channel.value) return

  try {
    await channelStore.muteMember(target.id, channel.value.id)
  } catch (err: any) {
    if (err instanceof ApiError) {
      if (err.code === 'ForbiddenException') {
        toast.error('You are not allowed to mute this member.')
      } else if (err.code === 'UserAlreadyMuted') {
        toast.error('Member is already muted.')
      }
    }
  }
}

async function revokeAdmin(target: User): Promise<void> {
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

async function unbanMember(target: User): Promise<void> {
  if (!channel.value) return
  try {
    await channelStore.unbanMember(target.id, channel.value.id)
  } catch (err: any) {
    if (err instanceof ApiError) {
      if (err.code === 'ForbiddenException') {
        toast.error('You are not allowed to unban this member.')
      }
    }
  }
}

async function unblockUser(target: User): Promise<void> {
  try {
    await userStore.unblockUser(target.id)
    toast.success(`${target.username} has been unblocked.`)
  } catch (err: any) {
    if (err instanceof ApiError) {
      if (err.code === 'FriendshipNotBlocked') {
        toast.error('Friendship status is not blocked')
      } else if (err.code === 'FriendshipNotFound') {
        toast.error('Friendship is not found')
      } else if (err.code === 'SameIdsError') {
        toast.error('You cannot unblock yourself')
      } else if (err.code === 'OnlyBlockerCanUnblock') {
        toast.error('Only the blocker can unblock the friendship')
      }
    } else {
      toast.error('Something went wrong')
    }
  }
}

function isBanned(target: User): boolean {
  if (!channel.value || !loggedUser.value) return false

  return channelStore.isBanned(target.id, channel.value.id)
}

function isBlocked(target: User): boolean {
  if (!channel.value || !loggedUser.value || !loggedUser.value.blockedUsers)
    return false

  return loggedUser.value.blockedUsers.some((user) => user.id === target.id)
}

function isMember(target: User): boolean {
  if (!channel.value || !loggedUser.value) return false

  return channelStore.isMember(target.id, channel.value.id)
}

function showAdminActions(target: User): boolean {
  if (!channel.value || !loggedUser.value) return false

  const isTargetMember = channelStore.isMember(target.id, channel.value.id)
  if (!isTargetMember) return false

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

function showRevokeAdmin(target: User): boolean {
  if (!channel.value || !loggedUser.value) return false

  const isTargetMember = channelStore.isMember(target.id, channel.value.id)
  if (!isTargetMember) return false

  const isTargetAdmin = channelStore.isAdmin(target.id, channel.value.id)
  const isUserOwner = channelStore.isOwner(
    loggedUser.value.id,
    channel.value.id
  )
  return isUserOwner && isTargetAdmin
}

onBeforeMount(async () => {
  await getChannel()
})

onBeforeRouteUpdate(async (to, from) => {
  await getChannel()
})
</script>
