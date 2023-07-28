<template>
  <div class="text-black z-50">
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
        <ul class="menu p-4 w-80 h-full bg-base-200 text-base-content">
          <!-- Sidebar content here -->
          <li><a>Sidebar Item 1</a></li>
          <li><a>Sidebar Item 2</a></li>
        </ul>
        <!-- CHANNEL MEMBERS LIST -->
        <div class="collapse collapse-arrow border-2 border-black rounded-none">
          <input type="checkbox" />
          <div class="collapse-title text-base">Handle channel members</div>
          <div class="collapse-content text-base">
            <ul class="menu bg-base-100 w-full">
              <li v-for="member in channelMembers" :key="member.id">
                <a class="flex p-1 rounded-none">
                  <span class="px-2 block text-lg"
                    >{{ member.username }} :
                  </span>
                  <button
                    class="px-2 border-2 border-black hover:bg-black hover:text-white"
                    @click="kickMember(member.id)">
                    Accept
                  </button>
                  <button
                    class="px-2 border-2 border-black hover:bg-black hover:text-white"
                    @click="banMember(member.id)">
                    Reject
                  </button>
                  <button
                    class="px-2 border-2 border-black hover:bg-black hover:text-white"
                    @click="muteMember(member.id)">
                    Block User
                  </button>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// ******* //
// IMPORTS //
// ******* //

import { onBeforeMount, ref, watch } from 'vue'
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

// ******************** //
// FUNCTION DEFINITIONS //
// ******************** //

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

// ************* //
// acceptRequest //
// ************* //

const acceptRequest = async (requestId: string): Promise<void> => {
  try {
    await userStore.acceptFriendRequest(requestId)
    console.log(
      `[ProfileFriendRequestListModal] - Friend request accepted successfully`
    )
    toast.success('Friend request accepted !')
    await getFriendRequests()
    emit('closeModal')
  } catch (error) {
    toast.error('Failed to accept friend request !')
  }
}

// ************* //
// rejectRequest //
// ************* //

const rejectRequest = async (requestId: string): Promise<void> => {
  try {
    await userStore.rejectFriendRequest(requestId)
    toast.success('Friend request rejected !')
    await getFriendRequests()
    emit('closeModal')
  } catch (error) {
    toast.error('Failed to reject friend request !')
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
