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
      <div class="stat-value text-primary">{{ observedUser.win_rate ?? '-' }} %</div>
    </div>

    <div 
      class="stat border-black !border-l-2"
      v-if="observedUser.id !== loggedUser.id"
    >
      <div class="stat-figure text-primary tooltip tooltip-top" data-tip="Add friend">
        <iconify-icon
          class="w-10 h-10"
          :icon="hoverIconAdd"
          style="color: #5d4df8"
          @mouseover="hoverIconAdd = 'mdi:account-plus'"
          @mouseout="hoverIconAdd = 'mdi:account-plus-outline'"
        ></iconify-icon>
      </div>
      <div class="stat-value text-xl">Friends</div>
      <div class="stat-value text-primary">{{ nFriends }}</div>
    </div>
    <div 
      class="stat border-black !border-l-2"
      v-else="observedUser.id === loggedUser.id"
    >
    <div class="stat-figure text-primary">
    <div class="indicator">
      <span class="badge badge-secondary indicator-item text-white">{{ nFriendRequests }}</span>
        <iconify-icon
          class="w-10 h-10"
          :icon="hoverIconRequest"
          style="color: 5d4df8"
          @mouseover="hoverIconRequest = 'mdi:account-alert'"
          @mouseout="hoverIconRequest = 'mdi:account-alert-outline'"
        ></iconify-icon>
      </div>
    </div>
      <div class="stat-value text-xl">Friends</div>
      <div class="stat-value text-primary">{{ nFriends }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, type PropType} from 'vue';
import type { User } from '@/types/User';
import { useUserStore } from '../stores/UserStore' 
import { storeToRefs } from 'pinia';

const hoverIconAdd = ref('mdi:account-plus-outline');
const hoverIconRequest = ref('mdi:account-alert-outline');

const userStore = useUserStore();
const {loggedUser} = storeToRefs(userStore);
const props = defineProps({
  observedUser: {
    type: Object as PropType<User>,
    required: true,
    default: () => ({}),
  }
});
let observedUser = props.observedUser;
const nFriends = computed(() => observedUser.n_friends ?? 0);

const statusColor = computed(() => {
  if (observedUser.status === 'online') return 'text-[#62D49A]';
  if (observedUser.status === 'offline') return 'text-red-500';
  return 'text-gray-500';
});

const nFriendRequests = ref(0);
const getFriendRequestsNumber = async () => {
  try {
    const response = await userStore.fetchFriendRequests(loggedUser.value.id);
    nFriendRequests.value = response.length;
  } catch (error) {
    console.error('Failed to fetch friend requests:', error);
  }
};
onMounted(getFriendRequestsNumber);


</script>
