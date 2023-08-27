<template>
  <dialog class="modal" ref="dialog">
    <div class="border-2 border-black rounded-none modal-box">
      <!-- TITLE -->
      <div class="flex justify-between text-xl">
        <h1>Friend request list</h1>
        <form method="dialog" class="relative">
          <button
            class="relative border-2 border-black btn btn-square hover:border-2 hover:border-black btn-sm">
            <iconify-icon
              icon="material-symbols:close"
              class="absolute w-6 h-6">
            </iconify-icon>
          </button>
        </form>
      </div>
      <!-- FRIENDS REQUEST LIST -->
      <div
        class="mt-6 border-2 border-black rounded-none collapse collapse-arrow">
        <input type="checkbox" />
        <div class="text-base collapse-title">Handle a request</div>
        <div class="text-base collapse-content">
          <ul class="w-full p-0 menu bg-base-100">
            <li v-for="request in friendRequests" :key="request.id">
              <div class="flex p-0 rounded-none hover:bg-base-100">
                <span class="block text-base"
                  >{{ request.sender.username }}
                </span>
                <button
                  class="px-2 border-2 border-black hover:bg-black hover:text-white"
                  @click="acceptRequest(request.sender.id)">
                  Accept
                </button>
                <button
                  class="px-2 border-2 border-black hover:bg-black hover:text-white"
                  @click="rejectRequest(request.sender.id)">
                  Reject
                </button>
                <button
                  class="px-2 border-2 border-black hover:bg-black hover:text-white"
                  @click="blockUser(request.sender.id)">
                  Block
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { onBeforeMount, onMounted, ref, type Ref } from 'vue'

import { storeToRefs } from 'pinia'

import type { Friendship } from '@/types'

import { useUserStore } from '@/stores/UserStore.js'

import { useToast } from 'vue-toastification'

const toast = useToast()

const userStore = useUserStore()

const { loggedUser } = storeToRefs(userStore)

const friendRequests = ref<Friendship[]>([])

const dialog: Ref<HTMLDialogElement | null> = ref(null)

const emit = defineEmits(['handle-request'])

async function showModal(): Promise<void> {
  if (dialog.value) dialog.value.showModal()
  friendRequests.value = await getFriendRequests()
}

defineExpose({ showModal })

const getFriendRequests = async (): Promise<Friendship[]> => {
  if (loggedUser.value === null) return null as unknown as Friendship[]
  try {
    const friendRequests = await userStore.fetchFriendRequests()
    return friendRequests
  } catch (error) {
    toast.error('Failed to fetch friend requests!')
    return null as unknown as Friendship[]
  }
}

const acceptRequest = async (requestId: string): Promise<void> => {
  try {
    await userStore.acceptFriendRequest(requestId)
    friendRequests.value = await getFriendRequests()
    toast.success('Friend request accepted!')
    dialog.value?.close()
    emit('handle-request', 'accept')
  } catch (error) {
    toast.error('Failed to accept friend request!')
  }
}

const rejectRequest = async (requestId: string): Promise<void> => {
  try {
    await userStore.rejectFriendRequest(requestId)
    friendRequests.value = await getFriendRequests()
    toast.success('Friend request rejected!')
    dialog.value?.close()
    emit('handle-request', 'reject')
  } catch (error) {
    toast.error('Failed to reject friend request!')
  }
}

const blockUser = async (userToBlockId: string): Promise<void> => {
  try {
    await userStore.blockUser(userToBlockId)
    friendRequests.value = await getFriendRequests()
    toast.success('User blocked!')
    dialog.value?.close()
    emit('handle-request', 'block')
  } catch (error) {
    toast.error('Failed to block user!')
  }
}

onBeforeMount(async () => {
  friendRequests.value = await getFriendRequests()
})

onMounted(async () => {
  friendRequests.value = await getFriendRequests()
})
</script>
