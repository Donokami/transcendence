<template>
  <div class="rounded-none stats">

    <div class="border-r-2 border-black stat">
      <div class="stat-figure text-secondary">
        <div class="avatar online">
          <input type="file" ref="fileInput" @change="onFileChange" style="display: none" />
          <div class="w-16 rounded-full cursor-pointer">
            <img :src="userStore.loggedUser.profilePicture" @click="triggerFileInput" />
          </div>
        </div>
      </div>
      <div class="text-xl text-black stat-value">{{ observedUser.username }}</div>
      <div class="stat-title text-md">Status:</div>
      <div class="stat-desc" :class="statusColor">{{ observedUser.status }}</div>
    </div>

    <div class="border-none stat">
      <div class="stat-figure text-primary">
        <iconify-icon class="w-10 h-10" icon="icon-park-outline:ranking" style="color: #5d4df8"></iconify-icon>
      </div>
      <div class="text-xl stat-value">Rank</div>
      <div class="stat-value text-primary">{{ observedUser.rank ?? '-' }}</div>
    </div>

    <div class="stat border-black !border-l-2">
      <div class="stat-figure text-primary">
        <iconify-icon class="w-10 h-10" icon="mdi:target-arrow" style="color: #5d4df8"></iconify-icon>
      </div>
      <div class="text-xl stat-value">Win Rate</div>
      <div class="stat-value text-primary">{{ observedUser.winRate }} %</div>
    </div>

    <div class="stat border-black !border-l-2" v-if="loggedUser && (observedUser.id !== loggedUser.id)">
      <div class="stat-figure text-primary tooltip tooltip-top" v-if="isFriend === false" data-tip="Add friend">
        <iconify-icon class="w-10 h-10" :icon="iconSendRequest" style="color: #5d4df8" @click="sendFriendRequest"
          @mouseover="iconSendRequest = 'mdi:account-plus'"
          @mouseout="iconSendRequest = 'mdi:account-plus-outline'"></iconify-icon>
      </div>

      <div class="stat-figure text-primary tooltip tooltip-top" v-else data-tip="Block user">
        <iconify-icon class="w-10 h-10" :icon="iconBlockUser" style="color: #5d4df8" @click="blockUser"
          @mouseover="iconBlockUser = 'mdi:account-cancel'"
          @mouseout="iconBlockUser = 'mdi:account-cancel-outline'"></iconify-icon>
      </div>

      <div class="text-xl stat-value">Friends</div>
      <div class="stat-value text-primary">{{ observedUser.nFriends }}</div>

    </div>

    <div class="stat border-black !border-l-2" v-if="loggedUser && (observedUser.id === loggedUser.id)">
      <div class="stat-figure text-primary" v-if="nFriendRequests > 0">
        <div class="indicator">
          <label for="my-modal-3">
            <span class="text-white badge badge-secondary indicator-item">{{ nFriendRequests }}</span>
            <iconify-icon class="w-10 h-10" :icon="iconSeeRequests" style="color: 5d4df8"
              @mouseover="iconSeeRequests = 'mdi:account-alert'"
              @mouseout="iconSeeRequests = 'mdi:account-alert-outline'"></iconify-icon>
          </label>
        </div>
      </div>
      <div class="text-xl stat-value">Friends</div>
      <div class="stat-value text-primary">{{ observedUser.nFriends }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">

// ******* //
// IMPORTS //
// ******* //

import { computed, onBeforeMount, ref, type PropType } from 'vue';
import { onBeforeRouteUpdate } from 'vue-router';

import { storeToRefs } from 'pinia';

import type { User } from '@/types/User';

import { useUserStore } from '../stores/UserStore'

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const userStore = useUserStore();

const fileInput = ref(null);

const triggerFileInput = () => {
  fileInput.value.click();
};

const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const onFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    const file = target.files[0];
    try {
      const base64Picture = await convertToBase64(file);
      await userStore.updateUser(userStore.loggedUser.id, { profilePicture: base64Picture });
      location.reload();
    } catch (error) {
      console.error('Error updating profile picture:', error);
    }
  }
};



// **************************** //
// loggedUser RELATED VARIABLES //
// **************************** //

const { loggedUser } = storeToRefs(userStore);
const nFriendRequests = ref(0);
const isFriend = ref(false);

// ****************************** //
// observedUser RELATED VARIABLES //
// ****************************** //

const props = defineProps({
  observedUser: {
    type: Object as PropType<User>,
    required: true,
    default: () => ({}),
  }
});

const observedUser = computed(() => props.observedUser);

const statusColor = computed(() => {
  if (observedUser.value.status === 'online') return 'text-[#62D49A]';
  if (observedUser.value.status === 'offline') return 'text-red-500';
  return 'text-gray-500';
});

// *************** //
// OTHER VARIABLES //
// *************** //

const iconSendRequest = ref('mdi:account-plus-outline');
const iconSeeRequests = ref('mdi:account-alert-outline');
const iconBlockUser = ref('mdi:account-cancel-outline');

// ******************** //
// FUNCTION DEFINITIONS //
// ******************** //

// ***************** //
// sendFriendRequest //
// ***************** //

const sendFriendRequest = async () => {
  try {
    await userStore.sendFriendRequest(observedUser.value.id);
    console.log(`[ProfileStatsCard] - Friend request sent !`);
  }
  catch (error) {
    console.error(`[ProfileStatsCard] - Failed to send friend requests ! Error : `, error);
  }
}

// *********************** //
// getFriendRequestsNumber //
// *********************** //

const getFriendRequestsNumber = async () => {
  if (!loggedUser.value)
    return 0;
  try {
    const response = await userStore.fetchFriendRequests(loggedUser.value.id);
    nFriendRequests.value = response.length;
    console.log(`[ProfileStatsCard] - Number of friend requests : `, nFriendRequests.value);
  } catch (error) {
    console.error(`[ProfileStatsCard] - Failed to fetch friend requests ! Error : `, error);
  }
};

// ************* //
// checkIsFriend //
// ************* //

const checkIsFriend = async () => {
  try {
    const friend = userStore.friendList.find((friend: User) => friend.id === observedUser.value.id);
    isFriend.value = !!friend;
    console.log(`[ProfileStatsCard] - isFriend : `, isFriend.value);
  } catch (error) {
    console.error(`[ProfileStatsCard] - Failed to fetch friends and check friendship! Error: `, error);
  }
};

// ********* //
// blockUser //
// ********* //

const blockUser = async () => {
  try {
    await userStore.blockUser(observedUser.value.id);
    console.log(`[ProfileStatsCard] - User blocked !`);
  } catch (error) {
    console.log(`[ProfileStatsCard] - Failed to block user! Error : `, error);
  }
};

// ********************* //
// VueJs LIFECYCLE HOOKS //
// ********************* //

onBeforeMount(getFriendRequestsNumber);
onBeforeMount(checkIsFriend);

onBeforeRouteUpdate(async (to, from) => {
  await getFriendRequestsNumber();
  await userStore.refreshFriendList();
  await checkIsFriend();
});


</script>
