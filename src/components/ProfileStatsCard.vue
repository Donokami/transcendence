<template>
  <div class="sm:-ml-4 rounded-none stats stats-vertical lg:stats-horizontal">
    <!-- USER STATUS AND PROFILE PICTURE -->
    <div class="sm:border-r-2 border-black -ml-6 stat sm:-ml-2">
      <div class="stat-figure text-secondary">
        <div class="avatar online">
          <input
            type="file"
            ref="fileInput"
            @change="onFileChange"
            style="display: none" />
          <div
            class="w-16 rounded-full cursor-pointer"
            @click="triggerFileInput">
            <img v-if="pictureSrc" :src="pictureSrc" />
            <iconify-icon
              v-else
              icon="ri:account-circle-line"
              class="h-16 w-16 text-black"></iconify-icon>
          </div>
        </div>
      </div>
      <div v-if="observedUser" class="stat-value text-black text-xl">
        {{ observedUser.username }}
      </div>
      <div class="stat-title text-md">Status:</div>
      <div v-if="observedUser" class="stat-desc" :class="statusColor">
        {{ observedUser.status }}
      </div>
    </div>
    <!-- USER RANK -->
    <div class="sm:border-none stat !border-t-2 !border-black -ml-6 sm:-ml-0">
      <div class="stat-figure text-primary">
        <iconify-icon
          class="w-10 h-10"
          icon="icon-park-outline:ranking"
          style="color: #5d4df8"></iconify-icon>
      </div>
      <div class="stat-value text-xl">Rank</div>
      <div v-if="observedUser" class="stat-value text-primary">
        {{ observedUser.rank ?? '-' }}
      </div>
    </div>
    <!-- USER WIN RATE -->
    <div class="stat border-black -ml-6 sm:-ml-0 !border-t-2 sm:!border-t-0 sm:!border-l-2">
      <div class="stat-figure text-primary">
        <iconify-icon
          class="w-10 h-10"
          icon="mdi:target-arrow"
          style="color: #5d4df8"></iconify-icon>
      </div>
      <div class="stat-value text-xl">Win Rate</div>
      <div v-if="observedUser" class="stat-value text-primary">
        {{ observedUser.winRate }} %
      </div>
    </div>
    <!-- USER FRIENDS & FRIEND REQUESTS -->
    <div
      class="stat border-black -ml-6 sm:-ml-0 sm:!border-l-2"
      v-if="loggedUser && observedUser && observedUser.id !== loggedUser.id">
      <!-- SEND REQUEST -->
      <div
        class="stat-figure text-primary tooltip tooltip-top"
        v-if="
          isFriend === false &&
          loggedUser.isBlockedBy == null &&
          observedUser.isBlockedBy == null
        "
        data-tip="Add friend">
        <iconify-icon
          class="w-10 h-10"
          :icon="iconSendRequest"
          style="color: #5d4df8"
          @click="sendFriendRequest"
          @mouseover="iconSendRequest = 'mdi:account-plus'"
          @mouseout="
            iconSendRequest = 'mdi:account-plus-outline'
          "></iconify-icon>
      </div>
      <!-- BLOCK USER -->
      <div
        class="stat-figure text-primary tooltip tooltip-top"
        v-else-if="isFriend === true && loggedUser.isBlockedBy != true"
        data-tip="Block user">
        <iconify-icon
          class="w-10 h-10"
          :icon="iconBlockUser"
          style="color: #5d4df8"
          @click="blockUser"
          @mouseover="iconBlockUser = 'mdi:account-cancel'"
          @mouseout="
            iconBlockUser = 'mdi:account-cancel-outline'
          "></iconify-icon>
      </div>
      <!-- UNBLOCK USER -->
      <div
        class="stat-figure text-primary tooltip tooltip-top"
        v-else-if="isFriend === false && observedUser.isBlockedBy == true"
        data-tip="Unblock user">
        <iconify-icon
          class="w-10 h-10"
          :icon="iconUnblockUser"
          style="color: #5d4df8"
          @click="unblockUser"
          @mouseover="iconUnblockUser = 'mdi:account-cancel-outline'"
          @mouseout="iconUnblockUser = 'mdi:account-cancel'"></iconify-icon>
      </div>
      <!-- BLOCK USER -->
      <div
        class="stat-figure text-primary tooltip tooltip-top"
        v-else
        data-tip="Block user">
        <iconify-icon
          class="w-10 h-10"
          :icon="iconBlockUser"
          style="color: #5d4df8"
          @click="blockUser"
          @mouseover="iconBlockUser = 'mdi:account-cancel'"
          @mouseout="
            iconBlockUser = 'mdi:account-cancel-outline'
          "></iconify-icon>
      </div>
      <!-- NUMBER OF FRIENDS -->
      <div class="text-xl stat-value">Friends</div>
      <div class="stat-value text-primary">{{ observedUser.nFriends }}</div>
    </div>
    <!-- FRIEND REQUEST NOTIFICATION -->
    <div
      class="stat border-black -ml-6 sm:-ml-0 !border-t-2 sm:!border-t-0 sm:!border-l-2 "
      v-if="loggedUser && observedUser && observedUser.id === loggedUser.id">
      <div class="stat-figure text-primary " v-if="nFriendRequests > 0">
        <div class="indicator">
          <label
            for="my-modal-3"
            type="button"
            @click="showFriendRequestModal = true">
            <span class="badge badge-secondary indicator-item text-white">{{
              nFriendRequests
            }}</span>
            <iconify-icon
              class="w-10 h-10"
              :icon="iconRequestNotification"
              style="color: 5d4df8"
              @mouseover="iconRequestNotification = 'mdi:account-alert'"
              @mouseout="
                iconRequestNotification = 'mdi:account-alert-outline'
              "></iconify-icon>
          </label>
        </div>
      </div>
      <div class="stat-value text-xl">Friends</div>
      <div class="stat-value text-primary">{{ observedUser.nFriends }}</div>
    </div>
  </div>

  <!-- FRIEND REQUEST MODAL -->
  <profile-friend-request-modal
    v-if="showFriendRequestModal"
    @close-modal="closeFriendRequestModal"></profile-friend-request-modal>
</template>

<script setup lang="ts">
// ******* //
// IMPORTS //
// ******* //

import { storeToRefs } from 'pinia'
import { computed, onBeforeMount, ref, type Ref } from 'vue'
import { onBeforeRouteUpdate, useRoute } from 'vue-router'

import { useUserStore } from '@/stores/UserStore'
import ProfileFriendRequestModal from '@/components/ProfileFriendRequestModal.vue'

import { useToast } from 'vue-toastification'

import type { User } from '@/types'

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //
const toast = useToast()

const fileInput = ref(null) as Ref<HTMLElement | null>
const iconBlockUser = ref('mdi:account-cancel-outline')
const iconRequestNotification = ref('mdi:account-alert-outline')
const iconSendRequest = ref('mdi:account-plus-outline')
const iconUnblockUser = ref('mdi:account-cancel')
const isFriend = ref(false)
const nFriendRequests = ref(0)
const route = useRoute()
const showFriendRequestModal = ref(false)
const userStore = useUserStore()

const { loggedUser } = storeToRefs(userStore)
const { observedUser } = storeToRefs(userStore)

const pictureSrc = computed(() => {
  if (!loggedUser.value || !observedUser.value) {
    return null
  }
  let profilePicture = ''
  if (observedUser.value.id === loggedUser.value.id) {
    profilePicture = loggedUser.value.profilePicture
  } else if (observedUser.value.id !== loggedUser.value.id) {
    profilePicture = observedUser.value.profilePicture
  }

  if (!profilePicture) {
    return null
  }

  if (profilePicture.includes('cdn.intra.42')) {
    return profilePicture
  } else {
    return 'http://localhost:3000/' + profilePicture
  }
})

const statusColor = computed(() => {
  if (observedUser.value !== null && observedUser.value.status === 'online')
    return 'text-[#62D49A]'
  if (observedUser.value !== null && observedUser.value.status === 'offline')
    return 'text-red-500'
  return 'text-gray-500'
})

// ******************** //
// FUNCTION DEFINITIONS //
// ******************** //

// ********* //
// blockUser //
// ********* //

const blockUser = async (): Promise<void> => {
  if (observedUser.value === null) return
  try {
    await userStore.blockUser(observedUser.value.id)
    toast.success('User blocked !')
  } catch (error) {
    console.log(`[ProfileStatsCard] - Failed to block user! Error : `, error)
  }
}

// ****************** //
// checkBlockedStatus //
// ****************** //

const checkBlockedStatus = async (): Promise<void> => {
  if (!loggedUser.value || !observedUser.value) return
  try {
    const response = await userStore.fetchBlockerId(
      loggedUser.value.id,
      observedUser.value.id
    )
    console.log(`[ProfileStatsCard] - fetchBlockerId response : ${response}`)
    if (response === loggedUser.value.id) {
      observedUser.value.isBlockedBy = true
      console.log(
        `[ProfileStatsCard] - ${observedUser.value.id} isBlockedBy : ${loggedUser.value.id}`
      )
    } else if (response === observedUser.value.id) {
      loggedUser.value.isBlockedBy = true
      console.log(
        `[ProfileStatsCard] - ${loggedUser.value.id} isBlockedBy : ${observedUser.value.id}`
      )
    }
  } catch (error) {
    toast.error('Failed to fetch blocked user and check friendship !')
  }
}

// ********* //
// fetchUser //
// ********* //

const fetchUser = async (id: string | undefined): Promise<void> => {
  try {
    if (id) {
      observedUser.value = await userStore.fetchUserByIdWithStats(id)
      console.log(
        `[ProfileView] - The current observed user is ${observedUser.value.username}`
      )
    } else if (loggedUser.value != null) {
      observedUser.value = loggedUser.value
      console.log(
        `[ProfileView] - The current observed user is ${observedUser.value.username}`
      )
    } else {
      console.log(`[ProfileView] - The current observed user is not defined`)
    }
  } catch (error) {
    toast.error('Failed to fetch user !')
  }
}

// *********************** //
// getFriendRequestsNumber //
// *********************** //

const getFriendRequestsNumber = async (): Promise<number> => {
  if (loggedUser.value == null) return 0
  try {
    const response = await userStore.fetchFriendRequests(loggedUser.value.id)
    nFriendRequests.value = response.length
    console.log(
      `[ProfileStatsCard] - Number of friend requests : `,
      nFriendRequests.value
    )
    return response.length
  } catch (error) {
    toast.error('Failed to get friend requests number !')
    return 0
  }
}

// *********************** //
// closeFriendRequestModal //
// *********************** //

const closeFriendRequestModal = (): void => {
  showFriendRequestModal.value = false
  location.reload()
}

// ************ //
// onFileChange //
// ************ //

const onFileChange = async (event: Event): Promise<void> => {
  const target = event.target as HTMLInputElement
  if (target.files != null) {
    const file = target.files[0]
    try {
      if (userStore.loggedUser == null) return
      await userStore.uploadProfilePicture(userStore.loggedUser.id, file)
      location.reload()
    } catch (error) {
      toast.error('Failed to upload profile picture !')
    }
  }
}

// ****************** //
// searchInFriendList //
// ****************** //

const searchInFriendList = async (user: User): Promise<boolean> => {
  if (!user) return false
  try {
    const friend = userStore.friendList.find(
      (friend: User) => friend.id === user.id
    )
    isFriend.value = !(friend == null)
    console.log(`[ProfileStatsCard] - isFriend : `, isFriend.value)
    return true
  } catch (error) {
    toast.error('Failed to get friend requests number !')
    return false
  }
}

// ***************** //
// sendFriendRequest //
// ***************** //

const sendFriendRequest = async (): Promise<void> => {
  if (observedUser.value === null) return
  try {
    await userStore.sendFriendRequest(observedUser.value.id)
    toast.success('Friend request sent !')
  } catch (error) {
    toast.error('Failed to send friend request !')
  }
}

// **************** //
// triggerFileInput //
// **************** //

const triggerFileInput = (): void => {
  fileInput.value?.click()
}

// *********** //
// unblockUser //
// *********** //

const unblockUser = async (): Promise<void> => {
  if (observedUser.value === null) return
  try {
    await userStore.unblockUser(observedUser.value.id)
    toast.success('User unblocked !')
  } catch (error) {
    toast.error('Failed to unblock user !')
  }
}

// ********************* //
// VueJs LIFECYCLE HOOKS //
// ********************* //

onBeforeMount(async () => {
  let id = route.params.id
  if (Array.isArray(id)) {
    id = id[0]
  }
  try {
    await fetchUser(id)

    await userStore.refreshFriendList()

    if (
      loggedUser.value != null &&
      observedUser.value !== null &&
      observedUser.value.id !== loggedUser.value.id
    ) {
      await searchInFriendList(observedUser.value)
      await checkBlockedStatus()
    }

    await getFriendRequestsNumber()
  } catch (error: any) {
    toast.error('Something went wrong !')
  }
})

onBeforeRouteUpdate(async (to, from) => {
  const id = to.path.split('/').pop()
  try {
    await fetchUser(id)

    await userStore.refreshFriendList()

    if (
      loggedUser.value &&
      observedUser.value &&
      observedUser.value.id !== loggedUser.value.id
    ) {
      await searchInFriendList(observedUser.value)
      await checkBlockedStatus()
    }

    await getFriendRequestsNumber()
  } catch (error: any) {
    toast.error('Something went wrong !')
  }
})
</script>
