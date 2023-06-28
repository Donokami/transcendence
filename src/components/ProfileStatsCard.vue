<template>
  <div class="stats rounded-none">
    <div class="stat border-black border-r-2">
      <div class="stat-figure text-secondary">
        <div class="avatar online">
          <div class="w-16 rounded-full">
            <img src="../assets/profile-picture.jpg" />
          </div>
        </div>
      </div>
      <div class="stat-value text-black text-xl">{{ observedUser.username }}</div>
      <div class="stat-title text-md">Status:</div>
      <div class="stat-desc" :class="statusColor">{{ observedUser.status }}</div>
    </div>

    <div class="stat border-none">
      <div class="stat-figure text-primary">
        <iconify-icon
          class="w-10 h-10"
          icon="icon-park-outline:ranking"
          style="color: #5d4df8"
        ></iconify-icon>
      </div>
      <div class="stat-value text-xl">Rank</div>
      <div class="stat-value text-primary">{{ observedUser.rank ?? '-' }}</div>
    </div>

    <div class="stat border-black !border-l-2">
      <div class="stat-figure text-primary">
        <iconify-icon
          class="w-10 h-10"
          icon="mdi:target-arrow"
          style="color: #5d4df8"
        ></iconify-icon>
      </div>
      <div class="stat-value text-xl">Win Rate</div>
      <div class="stat-value text-primary">{{ observedUser.winRate }} %</div>
    </div>

    <div 
      class="stat border-black !border-l-2"
      v-if="observedUser.id !== loggedUser.id"
    >
      <div class="stat-figure text-primary tooltip tooltip-top" data-tip="Add friend">
        <iconify-icon
          class="w-10 h-10"
          :icon="iconSendRequest"
          style="color: #5d4df8"
          @click="sendFriendRequest"
          @mouseover="iconSendRequest = 'mdi:account-plus'"
          @mouseout="iconSendRequest = 'mdi:account-plus-outline'"
        ></iconify-icon>
      </div>
      <div class="stat-value text-xl">Friends</div>
      <div class="stat-value text-primary">{{ observedUser.nFriends }}</div>
    </div>
    <div 
      class="stat border-black !border-l-2"
      v-else="observedUser.id === loggedUser.id"
    >
    <div class="stat-figure text-primary" v-if="nFriendRequests > 0">
    <div class="indicator">
      <span class="badge badge-secondary indicator-item text-white">{{ nFriendRequests }}</span>
        <iconify-icon
          class="w-10 h-10"
          :icon="iconSeeRequests"
          style="color: 5d4df8"
          @mouseover="iconSeeRequests = 'mdi:account-alert'"
          @mouseout="iconSeeRequests = 'mdi:account-alert-outline'"
        ></iconify-icon>
      </div>
    </div>
      <div class="stat-value text-xl">Friends</div>
      <div class="stat-value text-primary">{{ observedUser.nFriends }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">

// ******* //
// Imports //
// ******* //

import { computed, onBeforeMount, ref, type PropType} from 'vue';
import { storeToRefs } from 'pinia';

import type { User } from '@/types/User';

import { useUserStore } from '../stores/UserStore' 

// ******************** //
// Variable definitions //
// ******************** //

const userStore = useUserStore();

const {loggedUser} = storeToRefs(userStore);

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

const nFriendRequests = ref(0);

const iconSendRequest = ref('mdi:account-plus-outline');
const iconSeeRequests = ref('mdi:account-alert-outline');

// ******************** //
// Function definitions //
// ******************** //

// ***************** //
// sendFriendRequest //
// ***************** //

const sendFriendRequest = async () => {
  try {
    const response = await userStore.sendFriendRequest(observedUser.value.id);
    console.log('[ProfileStatsCard] - Friend request sent !');
  }
  catch(error) {
    console.error('[ProfileStatsCard] - Failed to send friend requests ! Error : ', error);
  }
}

// *********************** //
// getFriendRequestsNumber //
// *********************** //

const getFriendRequestsNumber = async () => {
  try {
    const response = await userStore.fetchFriendRequests(loggedUser.value.id);
    nFriendRequests.value = response.length;
    console.log('[ProfileStatsCard] - Number of friend requests : ', nFriendRequests.value);
  } catch (error) {
    console.error('[ProfileStatsCard] - Failed to fetch friend requests ! Error : ', error);
  }
};

// ********************* //
// VueJs Lifecycle Hooks //
// ********************* //

onBeforeMount(getFriendRequestsNumber);

</script>
