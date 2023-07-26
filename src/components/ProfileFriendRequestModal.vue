<template>
  <input type="checkbox" id="my-modal-3" class="modal-toggle" />
  <div class="modal">
    <div class="modal-box rounded-none">
      <div class="flex items-center justify-end">
        <label for="my-modal-3"
          class="btn bg-white border-black border-2 text-black hover:bg-black hover:border-black hover:text-white">X</label>
      </div>
      <div class="py-4">
        <h3 class="font-bold text-lg">Friend request list</h3>
      </div>
      <div class="collapse collapse-arrow border-2 border-black rounded-none">
        <input type="checkbox" />
        <div class="collapse-title text-base">Select a request</div>
        <div class="collapse-content text-base">
          <ul class="menu bg-base-100 w-full">
            <li v-for="request in friendRequests" :key="request.id">
              <a class="flex p-1">
                <span class="block">{{ request.sender.username }}</span>
                <button class="hover:bg-black hover:text-white" @click="acceptRequest(request.sender.id)">Accept</button>
                <button class="hover:bg-black hover:text-white" @click="rejectRequest(request.sender.id)">Reject</button>
                <button class="hover:bg-black hover:text-white" @click="blockUser(request.sender.id)">Block User</button>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

// ******* //
// IMPORTS //
// ******* //

import { onBeforeMount, ref } from 'vue';

import { storeToRefs } from 'pinia'

import type { Friendship } from '@/types'

import { useUserStore } from '@/stores/UserStore.js'

import { useToast } from "vue-toastification";

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const toast = useToast()

const userStore = useUserStore()

const { loggedUser } = storeToRefs(userStore);

const friendRequests = ref<Friendship[]>([]);

const emit = defineEmits(['closeModal'])

// ******************** //
// FUNCTION DEFINITIONS //
// ******************** //

// ***************** //
// getFriendRequests //
// ***************** //

const getFriendRequests = async (): Promise<number> => {
  if (loggedUser.value === null)
    return 0
  try {
    const response = await userStore.fetchFriendRequests(loggedUser.value.id);
    friendRequests.value = response;
    console.log(`[ProfileFriendRequestListModal] - Friend request fetched successfully`);
    return response.length;
  }
  catch (error) {
    toast.error("Failed to fetch friend requests !");
    return 0
  }
};

// ************* //
// acceptRequest //
// ************* //

const acceptRequest = async (requestId: string): Promise<void> => {
  try {
    await userStore.acceptFriendRequest(requestId);
    console.log(`[ProfileFriendRequestListModal] - Friend request accepted successfully`);
    toast.success("Friend request accepted !");
    await getFriendRequests();
    emit('closeModal');
  }
  catch (error) {
    toast.error("Failed to accept friend request !");
  }
};

// ************* //
// rejectRequest //
// ************* //

const rejectRequest = async (requestId: string): Promise<void> => {
  try {
    await userStore.rejectFriendRequest(requestId);
    toast.success("Friend request rejected !");
    await getFriendRequests();
    emit('closeModal');
  }
  catch (error) {
    toast.error("Failed to reject friend request !");
  }
};

// ********* //
// blockUser //
// ********* //

const blockUser = async (userToBlockId: string): Promise<void> => {
  try {
    await userStore.blockUser(userToBlockId);
    toast.success("User blocked !");
    await getFriendRequests();
    emit('closeModal');
  }
  catch (error) {
    toast.error("Failed to block user !");
  }
};

// ********************* //
// VueJs LIFECYCLE HOOKS //
// ********************* //

onBeforeMount(getFriendRequests);

</script>
