<template>
  <div class="z-50 text-black">
    <div class="drawer drawer-end">
      <input id="my-drawer-4" type="checkbox" class="drawer-toggle" />
      <!-- DRAWER BUTTON  -->
      <div class="drawer-content">
        <div class="neobrutalist-box p-2">
          <label for="my-drawer-4" class="drawer-button">Handle channel</label>
        </div>
      </div>
      <!-- DRAWER CONTENT -->
      <div class="drawer-side">
        <label for="my-drawer-4" class="drawer-overlay"></label>
        <ul class="menu h-full p-4 w-120 bg-base-200">
          <li>
            <!-- <div
              class="collapse collapse-arrow p-0 m-0 border-2 border-black rounded-none hover:bg-base-200"> -->
            <!-- <input class="p-0 m-0" type="checkbox" /> -->
            <!-- <div class="collapse-title text-sm">Handle channel members</div>
              <div class="collapse-content flex m-0 p-0 text-sm"> -->
            <ul
              v-if="filteredChannelMembersList.length > 0"
              class="menu m-0 justify-items-start w-full">
              <li v-for="member in channelMembers" :key="member.id">
                <a class="flex p-1 rounded-none hover:bg-base-200">
                  <span class="px-2 block text-sm"
                    >{{ member.username }} :
                  </span>
                  <button
                    v-if="isOwner"
                    class="px-2 border-2 border-black hover:bg-black hover:text-white"
                    @click="giveAdminRights(member.id)">
                    Give admin rights
                  </button>
                  <button
                    v-if="isAdmin"
                    class="px-2 border-2 border-black hover:bg-black hover:text-white"
                    @click="kickMember(member.id)">
                    Kick
                  </button>
                  <button
                    v-if="isAdmin"
                    class="px-2 border-2 border-black hover:bg-black hover:text-white"
                    @click="banMember(member.id)">
                    Ban
                  </button>
                  <button
                    v-if="isAdmin"
                    class="px-2 border-2 border-black hover:bg-black hover:text-white"
                    @click="muteMember(member.id)">
                    Mute
                  </button>
                </a>
              </li>
            </ul>
            <!-- ALONE IN CHANNEL -->
            <div v-else class="px-4">
              <p>You are alone in this channel.</p>
            </div>
            <!-- </div> -->
            <!-- </div> -->
          </li>
        </ul>
        <!-- CHANNEL MEMBERS LIST -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// ******* //
// IMPORTS //
// ******* //

import { computed, onBeforeMount, ref, watch } from 'vue'
import { useToast } from 'vue-toastification'

import { storeToRefs } from 'pinia'

import { useChannelStore } from '@/stores/ChannelStore.js'
import { useUserStore } from '@/stores/UserStore.js'
import type { Channel, User } from '@/types'

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const channel = ref<Channel>()
const channelMembers = ref<User[]>([])
const channelStore = useChannelStore()
const userStore = useUserStore()
const toast = useToast()

const { loggedUser } = storeToRefs(userStore)
const { selectedChannel } = storeToRefs(channelStore)

const filteredChannelMembersList = computed(() => {
  return channelMembers.value.filter(
    (member) => loggedUser.value && member.id !== loggedUser.value.id
  )
})

const isAdmin = computed(() => {
  if (selectedChannel.value === null) {
    return
  }

  channel.value = channelStore.getChannel(selectedChannel.value)
  if (!channel.value) {
    return
  }

  if (Array.isArray(channel.value.admins)) {
    return channel.value.admins.some(
      (admin) => admin.id === loggedUser.value.id
    )
  }
  return false
})

const isOwner = computed(() => {
  if (selectedChannel.value === null) {
    return
  }
  channel.value = channelStore.getChannel(selectedChannel.value)
  if (!channel.value) {
    return
  }

  if (
    loggedUser.value !== null &&
    channel.value.owner.id === loggedUser.value.id
  ) {
    return true
  }

  return false
})

// ******************** //
// FUNCTION DEFINITIONS //
// ******************** //

// ********* //
// banMember //
// ********* //

const banMember = async (userId: string): Promise<void> => {
  try {
    if (selectedChannel.value === null) {
      return
    }
    await channelStore.banMember(userId, selectedChannel.value)
    toast.success('User has been banned successfully !')
    await getChannelMembers()
  } catch (error) {
    toast.error('Failed to ban user !')
  }
}

// ***************** //
// getChannelMembers //
// ***************** //

async function getChannelMembers(): Promise<User[]> {
  if (loggedUser.value === null) {
    return []
  }
  if (selectedChannel.value !== null) {
    channel.value = channelStore.getChannel(selectedChannel.value)
  }
  if (channel.value === undefined) {
    return []
  }
  channelMembers.value = channel.value.members
  return channelMembers.value
}

// *************** //
// giveAdminRights //
// *************** //

const giveAdminRights = async (userId: string): Promise<void> => {
  try {
    if (selectedChannel.value === null) {
      return
    }
    await channelStore.giveAdminRights(userId, selectedChannel.value)
    toast.success('User is now admin of the channel!')
    await getChannelMembers()
  } catch (error) {
    toast.error('Failed to give the user admin rights !')
  }
}

// ********** //
// kickMember //
// ********** //

const kickMember = async (userId: string): Promise<void> => {
  try {
    if (selectedChannel.value === null) {
      return
    }
    await channelStore.kickMember(userId, selectedChannel.value)
    toast.success('User has been kicked successfully !')
    await getChannelMembers()
  } catch (error) {
    toast.error('Failed to kick user !')
  }
}

// ********** //
// muteMember //
// ********** //

const muteMember = async (userId: string): Promise<void> => {
  try {
    if (selectedChannel.value === null) {
      return
    }
    await channelStore.muteMember(userId, selectedChannel.value)
    toast.success('User has been muted successfully !')
    await getChannelMembers()
  } catch (error) {
    toast.error('Failed to mute user !')
  }
}

// ********************* //
// VueJs LIFECYCLE HOOKS //
// ********************* //

onBeforeMount(async () => {
  await getChannelMembers()
})

watch(
  () => selectedChannel.value,
  async () => {
    await getChannelMembers()
  }
)
</script>
