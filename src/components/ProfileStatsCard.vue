<template>
  <div class="rounded-none stats">
    <!-- USER STATUS AND PROFILE PICTURE -->
    <div class="border-r-2 border-black stat">
      <div class="stat-figure text-secondary">
        <div class="avatar online">
          <input type="file" ref="fileInput" @change="onFileChange" style="display: none" />
          <div class="w-16 rounded-full cursor-pointer" @click="triggerFileInput">
            <img v-if="userStore.loggedUser && userStore.loggedUser.profilePicture && pictureSrc" :src="pictureSrc" />
            <iconify-icon v-else icon="ri:account-circle-line" class="h-16 w-16 text-black"></iconify-icon>
          </div>
        </div>
      </div>
      <div v-if="observedUser" class="stat-value text-black text-xl">{{ observedUser.username }}</div>
      <div class="stat-title text-md">Status:</div>
      <div v-if="observedUser" class="stat-desc" :class="statusColor">{{ observedUser.status }}</div>
    </div>
    <!-- USER RANK -->
    <div class="border-none stat">
      <div class="stat-figure text-primary">
        <iconify-icon class="w-10 h-10" icon="icon-park-outline:ranking" style="color: #5d4df8"></iconify-icon>
      </div>
      <div class="stat-value text-xl">Rank</div>
      <div v-if="observedUser" class="stat-value text-primary">{{ observedUser.rank ?? '-' }}</div>
    </div>
    <!-- USER WIN RATE -->
    <div class="stat border-black !border-l-2">
      <div class="stat-figure text-primary">
        <iconify-icon class="w-10 h-10" icon="mdi:target-arrow" style="color: #5d4df8"></iconify-icon>
      </div>
      <div class="stat-value text-xl">Win Rate</div>
      <div v-if="observedUser" class="stat-value text-primary">{{ observedUser.winRate }} %</div>
    </div>
    <!-- USER FRIENDS & FRIEND REQUESTS -->
    <div class="stat border-black !border-l-2" v-if="loggedUser && observedUser && (observedUser.id !== loggedUser.id)">
      <!-- SEND REQUEST -->
      <div class="stat-figure text-primary tooltip tooltip-top"
        v-if="isFriend === false && loggedUser.isBlockedBy == null && observedUser.isBlockedBy == null"
        data-tip="Add friend">
        <iconify-icon class="w-10 h-10" :icon="iconSendRequest" style="color: #5d4df8" @click="sendFriendRequest"
          @mouseover="iconSendRequest = 'mdi:account-plus'"
          @mouseout="iconSendRequest = 'mdi:account-plus-outline'"></iconify-icon>
      </div>
      <!-- BLOCK USER -->
      <div class="stat-figure text-primary tooltip tooltip-top"
        v-else-if="isFriend === true && loggedUser.isBlockedBy != true" data-tip="Block user">
        <iconify-icon class="w-10 h-10" :icon="iconBlockUser" style="color: #5d4df8" @click="blockUser"
          @mouseover="iconBlockUser = 'mdi:account-cancel'"
          @mouseout="iconBlockUser = 'mdi:account-cancel-outline'"></iconify-icon>
      </div>
      <!-- UNBLOCK USER -->
      <div class="stat-figure text-primary tooltip tooltip-top"
        v-else-if="isFriend === false && observedUser.isBlockedBy == true" data-tip="Unblock user">
        <iconify-icon class="w-10 h-10" :icon="iconUnblockUser" style="color: #5d4df8" @click="unblockUser"
          @mouseover="iconUnblockUser = 'mdi:account-cancel-outline'"
          @mouseout="iconUnblockUser = 'mdi:account-cancel'"></iconify-icon>
      </div>
      <!-- BLOCK USER -->
      <div class="stat-figure text-primary tooltip tooltip-top" v-else data-tip="Block user">
        <iconify-icon class="w-10 h-10" :icon="iconBlockUser" style="color: #5d4df8" @click="blockUser"
          @mouseover="iconBlockUser = 'mdi:account-cancel'"
          @mouseout="iconBlockUser = 'mdi:account-cancel-outline'"></iconify-icon>
      </div>
      <!-- NUMBER OF FRIENDS -->
      <div class="text-xl stat-value">Friends</div>
      <div class="stat-value text-primary">{{ observedUser.nFriends }}</div>
    </div>
    <!-- FRIEND REQUEST NOTIFICATION -->
    <div class="stat border-black !border-l-2" v-if="loggedUser && observedUser && (observedUser.id === loggedUser.id)">
      <div class="stat-figure text-primary" v-if="nFriendRequests > 0">
        <div class="indicator">
          <label for="my-modal-3" type="button" @click="showFriendRequestModal = true">
            <span class="badge badge-secondary indicator-item text-white">{{ nFriendRequests }}</span>
            <iconify-icon class="w-10 h-10" :icon="iconRequestNotification" style="color: 5d4df8"
              @mouseover="iconRequestNotification = 'mdi:account-alert'"
              @mouseout="iconRequestNotification = 'mdi:account-alert-outline'"></iconify-icon>
          </label>
        </div>
      </div>
      <div class="stat-value text-xl">Friends</div>
      <div class="stat-value text-primary">{{ observedUser.nFriends }}</div>
    </div>
  </div>

  <!-- FRIEND REQUEST MODAL -->
  <profile-friend-request-modal v-if="showFriendRequestModal" @close-modal="closeFriendRequestModal"
    @friend-request-accepted="fetchUser"></profile-friend-request-modal>
</template>

<script setup lang="ts">

// ******* //
// IMPORTS //
// ******* //

import { storeToRefs } from 'pinia';
import { computed, onBeforeMount, ref, type Ref } from 'vue';
import { onBeforeRouteUpdate, useRoute } from 'vue-router';

import ProfileFriendRequestModal from '@/components/ProfileFriendRequestModal.vue';
import { useUserStore } from '@/stores/UserStore'
import type { User } from '@/types/user';

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const fileInput = ref(null) as Ref<HTMLElement | null>;
const iconBlockUser = ref('mdi:account-cancel-outline');
const iconRequestNotification = ref('mdi:account-alert-outline');
const iconSendRequest = ref('mdi:account-plus-outline');
const iconUnblockUser = ref('mdi:account-cancel');
const isFriend = ref(false);
const nFriendRequests = ref(0);
const route = useRoute();
const showFriendRequestModal = ref(false);
const userStore = useUserStore();

const { loggedUser } = storeToRefs(userStore);
const { observedUser } = storeToRefs(userStore);

const pictureSrc = computed(() => {
  if (!userStore.loggedUser) return null;
  const profilePicture = userStore.loggedUser.profilePicture;
  if (!profilePicture) return null;

  if (profilePicture.includes('cdn.intra.42')) {
    return profilePicture;
  } else {
    return 'http://localhost:3000/' + profilePicture;
  }
});

const statusColor = computed(() => {
  if (observedUser.value && observedUser.value.status === 'online') return 'text-[#62D49A]';
  if (observedUser.value && observedUser.value.status === 'offline') return 'text-red-500';
  return 'text-gray-500';
});

// ******************** //
// FUNCTION DEFINITIONS //
// ******************** //

// ********* //
// blockUser //
// ********* //

const blockUser = async () => {
  if (!observedUser.value)
    return;
  try {
    await userStore.blockUser(observedUser.value.id);
    console.log(`[ProfileStatsCard] - User blocked !`);
  } catch (error) {
    console.log(`[ProfileStatsCard] - Failed to block user! Error : `, error);
  }
};

// ****************** //
// checkBlockedStatus //
// ****************** //

const checkBlockedStatus = async () => {
  if (!loggedUser.value || !observedUser.value)
    return;
  try {
    const response = await userStore.fetchBlockerId(loggedUser.value.id, observedUser.value.id);
    console.log(`[ProfileStatsCard] - fetchBlockerId response : ${response}`);
    if (!response) {
      console.log(`[ProfileStatsCard] - No blocker found !`);
      return;
    }
    else if (response === loggedUser.value.id) {
      observedUser.value.isBlockedBy = true;
      console.log(`[ProfileStatsCard] - ${observedUser.value.id} isBlockedBy : ${loggedUser.value.id}`);
    }
    else if (response === observedUser.value.id) {
      loggedUser.value.isBlockedBy = true;
      console.log(`[ProfileStatsCard] - ${loggedUser.value.id} isBlockedBy : ${observedUser.value.id}`);
    }
  }
  catch (error) {
    console.error(`[ProfileStatsCard] - Failed to fetch blocked user and check friendship! Error: `, error);
  }
}

// ********* //
// fetchUser //
// ********* //

const fetchUser = async (id: string | undefined) => {
  if (id) {
    observedUser.value = await userStore.fetchUserByIdWithStats(id);
    console.log(`[ProfileView] - The current observed user is ${observedUser.value.username}`);
  }
  else if (loggedUser.value) {
    observedUser.value = loggedUser.value;
    console.log(`[ProfileView] - The current observed user is ${observedUser.value.username}`);
  }
  else {
    console.log(`[ProfileView] - The current observed user is not defined`);
  }
};

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

// *********************** //
// closeFriendRequestModal //
// *********************** //

const closeFriendRequestModal = () => {
  showFriendRequestModal.value = false;
  location.reload();
};

// ************ //
// onFileChange //
// ************ //

const onFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    const file = target.files[0];
    try {
      if (!userStore.loggedUser) return;
      await userStore.uploadProfilePicture(userStore.loggedUser.id, file);
      location.reload();
    } catch (error) {
      console.error('Error updating profile picture:', error);
    }
  }
};

// ****************** //
// searchInFriendList //
// ****************** //

const searchInFriendList = async (user: User) => {
  if (!user)
    return;
  try {
    const friend = userStore.friendList.find((friend: User) => friend.id === user.id);
    isFriend.value = !!friend;
    console.log(`[ProfileStatsCard] - isFriend : `, isFriend.value);
  } catch (error) {
    console.error(`[ProfileStatsCard] - Failed to fetch friends and check friendship! Error: `, error);
  }
};

// ***************** //
// sendFriendRequest //
// ***************** //

const sendFriendRequest = async () => {
  if (!observedUser.value)
    return;
  try {
    await userStore.sendFriendRequest(observedUser.value.id);
    console.log(`[ProfileStatsCard] - Friend request sent !`);
  }
  catch (error) {
    console.error(`[ProfileStatsCard] - Failed to send friend requests ! Error : `, error);
  }
}

// **************** //
// triggerFileInput //
// **************** //

const triggerFileInput = () => {
  fileInput.value?.click();
};

// *********** //
// unblockUser //
// *********** //

const unblockUser = async () => {
  if (!observedUser.value)
    return;
  try {
    await userStore.unblockUser(observedUser.value.id);
    console.log(`[ProfileStatsCard] - User unblocked !`);
  } catch (error) {
    console.log(`[ProfileStatsCard] - Failed to unblock user! Error : `, error);
  }
};

// ********************* //
// VueJs LIFECYCLE HOOKS //
// ********************* //

onBeforeMount(async () => {
  let id = route.params.id;
  if (Array.isArray(id)) {
    id = id[0];
  }

  await fetchUser(id);

  await userStore.refreshFriendList();

  if (loggedUser.value && observedUser.value && (observedUser.value.id !== loggedUser.value.id)) {
    await searchInFriendList(observedUser.value);
    await checkBlockedStatus();
  }

  await getFriendRequestsNumber();
});

onBeforeRouteUpdate(async (to, from) => {
  const id = to.path.split("/").pop();
  await fetchUser(id);

  await userStore.refreshFriendList();

  if (loggedUser.value && observedUser.value && (observedUser.value.id !== loggedUser.value.id)) {
    await searchInFriendList(observedUser.value);
    await checkBlockedStatus();
  }

  await getFriendRequestsNumber();
});

</script>