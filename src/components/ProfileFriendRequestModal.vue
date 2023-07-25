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

import type { Friendship } from '@/types/Friendship'

import { useUserStore } from '@/stores/UserStore.js'

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const userStore = useUserStore()

const { loggedUser } = storeToRefs(userStore);

const friendRequests = ref<Friendship[]>([]);

const emit = defineEmits(['friendRequestAccepted', 'closeModal'])

// ******************** //
// FUNCTION DEFINITIONS //
// ******************** //

// ***************** //
// getFriendRequests //
// ***************** //

const getFriendRequests = async () => {
  if (!loggedUser.value)
    return 0
  try {
    const response = await userStore.fetchFriendRequests(loggedUser.value.id);
    friendRequests.value = response;
    console.log(`[ProfileFriendRequestListModal] - Friend request fetched successfully`);
  }
  catch (error) {
    console.error(`[ProfileStatsCard] - Failed to fetch friend requests ! Error : `, error);
  }
};

// ************* //
// acceptRequest //
// ************* //

const acceptRequest = async (requestId: string) => {
  try {
    await userStore.acceptFriendRequest(requestId);
    console.log(`[ProfileFriendRequestListModal] - Friend request accepted successfully`);
    getFriendRequests();
    emit('friendRequestAccepted', 'closeModal');
  }
  catch (error) {
    console.error(`[ProfileFriendRequestListModal] - Failed to accept friend request. Error: `, error);
  }
};

// ************* //
// rejectRequest //
// ************* //

const rejectRequest = async (requestId: string) => {
  try {
    await userStore.rejectFriendRequest(requestId);
    console.log(`[ProfileFriendRequestListModal] - Friend request rejected successfully`);
    getFriendRequests();
    emit('closeModal');
  }
  catch (error) {
    console.error(`[ProfileFriendRequestListModal] - Failed to reject friend request. Error: `, error);
  }
};

// ********* //
// blockUser //
// ********* //

const blockUser = async (userToBlockId: string) => {
  try {
    await userStore.blockUser(userToBlockId);
    console.log(`[ProfileFriendRequestListModal] - Friend request rejected successfully`);
    getFriendRequests();
    emit('closeModal');
  }
  catch (error) {
    console.error(`[ProfileFriendRequestListModal] - Failed to reject friend request. Error: `, error);
  }
};

// ********************* //
// VueJs LIFECYCLE HOOKS //
// ********************* //

onBeforeMount(getFriendRequests);

</script>
  