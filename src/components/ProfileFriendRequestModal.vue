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
// ******* //
// IMPORTS //
// ******* //

import { onBeforeMount, ref, type Ref } from 'vue'

import { storeToRefs } from 'pinia'

import type { Friendship } from '@/types'

import { useUserStore } from '@/stores/UserStore.js'

import { useToast } from 'vue-toastification'

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const toast = useToast()

const userStore = useUserStore()

const { loggedUser } = storeToRefs(userStore)

const friendRequests = ref<Friendship[]>([])

const dialog: Ref<HTMLDialogElement | null> = ref(null)

const emit = defineEmits(['requestHandled'])

function showModal(): void {
  if (dialog.value) dialog.value.showModal()
}

defineExpose({ showModal })

// ******************** //
// FUNCTION DEFINITIONS //
// ******************** //

// ***************** //
// getFriendRequests //
// ***************** //

const getFriendRequests = async (): Promise<number> => {
  if (loggedUser.value === null) return 0
  try {
    const response = await userStore.fetchFriendRequests()
    friendRequests.value = response
    return response.length
  } catch (error) {
    toast.error('Failed to fetch friend requests !')
    return 0
  }
}

// ************* //
// acceptRequest //
// ************* //

const acceptRequest = async (requestId: string): Promise<void> => {
  try {
    await userStore.acceptFriendRequest(requestId)
    toast.success('Friend request accepted !')
    await getFriendRequests()
    emit('requestHandled', 'accept')
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
    emit('requestHandled', 'reject')
  } catch (error) {
    toast.error('Failed to reject friend request !')
  }
}

// ********* //
// blockUser //
// ********* //

const blockUser = async (userToBlockId: string): Promise<void> => {
  try {
    await userStore.blockUser(userToBlockId)
    await getFriendRequests()
    toast.success('User blocked !')
    emit('requestHandled', 'block')
  } catch (error) {
    toast.error('Failed to block user !')
  }
}

// ********************* //
// VueJs LIFECYCLE HOOKS //
// ********************* //

onBeforeMount(getFriendRequests)
</script>
