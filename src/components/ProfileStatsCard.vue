<template>
  <div class="lg:-ml-4 rounded-none stats stats-vertical lg:stats-horizontal">
    <div class="lg:border-r-2 border-black -ml-6 stat lg:-ml-2 h-52">
      <div class="flex items-top justify-between h-14">
        <!-- USERNAME -->
        <div v-if="observedUser" class="stat-value text-black text-xl">
          {{ observedUser.username }}
        </div>
        <label
          v-if="
            observedUser && loggedUser && observedUser.id === loggedUser?.id
          "
          for="my-modal-4"
          class="mb-2 text-black bg-white border-2 border-black btn hover:bg-black hover:border-black hover:text-white"
          type="button"
          @click="showUsernameModal = true">
          Change username
        </label>
      </div>
      <!-- USER AVATAR AND STATUS -->
      <div class="flex-col h-24">
        <div class="w-16 text-black">
          <user-avatar
            :userProps="(observedUser as User)"
            :uploadMode="loggedUser?.id === observedUser?.id"></user-avatar>
        </div>
        <div class="flex items-baseline">
          <div class="stat-title">Status:</div>
          <div v-if="observedUser" class="" :class="statusColor">
            {{
              observedUser.id === loggedUser?.id
                ? 'online'
                : observedUser.status
            }}
          </div>
        </div>
      </div>
    </div>
    <!-- USER RANK -->
    <div class="lg:border-none stat !border-t-2 !border-black -ml-6 lg:-ml-0">
      <div class="flex items-top justify-between h-14">
        <div class="stat-value text-xl">Rank</div>
        <iconify-icon
          class="w-10 h-10"
          icon="icon-park-outline:ranking"
          style="color: #5d4df8"></iconify-icon>
      </div>
      <div class="flex items-center h-24">
        <div v-if="observedUser" class="stat-value text-primary">
          {{ observedUser.rank ?? '-' }}
        </div>
      </div>
    </div>
    <!-- USER WIN RATE -->
    <div
      class="stat border-black -ml-6 lg:-ml-0 !border-t-2 lg:!border-t-0 lg:!border-l-2">
      <div class="flex items-top justify-between h-14">
        <div class="stat-value text-xl">Win Rate</div>
        <iconify-icon
          class="w-10 h-10"
          icon="mdi:target-arrow"
          style="color: #5d4df8"></iconify-icon>
      </div>
      <div class="flex items-center h-24">
        <div v-if="observedUser" class="stat-value text-primary">
          {{ observedUser.winRate }} %
        </div>
      </div>
    </div>
    <!-- USER FRIENDS -->
    <div
      class="stat border-black -ml-6 lg:-ml-0 lg:!border-l-2"
      v-if="loggedUser && observedUser && observedUser.id !== loggedUser.id">
      <div class="text-xl stat-value h-14">Friends</div>
      <div class="flex items-center justify-between h-24">
        <!-- NUMBER OF FRIENDS -->
        <div class="stat-value text-primary">{{ observedUser.nFriends }}</div>
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
      </div>
    </div>
    <!-- FRIEND REQUEST NOTIFICATION -->
    <div
      class="stat border-black -ml-6 lg:-ml-0 !border-t-2 lg:!border-t-0 lg:!border-l-2"
      v-if="loggedUser && observedUser && observedUser.id === loggedUser.id">
      <div class="flex items-top justify-between h-14">
        <div class="stat-value text-xl">Friends</div>
        <label
          for="my-modal-3"
          class="mb-2 text-black bg-white border-2 border-black btn hover:bg-black hover:border-black hover:text-white"
          type="button"
          @click="showFriendListModal = true">
          See friend list
        </label>
      </div>
      <div class="flex items-center justify-between h-24">
        <div class="stat-value text-primary">{{ observedUser.nFriends }}</div>
        <div class="stat-figure text-primary" v-if="nFriendRequests > 0">
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
      </div>
    </div>
  </div>

  <!-- CHANGE USERNAME MODAL -->
  <profile-change-username-modal
    v-if="showUsernameModal"
    @close-modal="handleCloseUsernameModal"></profile-change-username-modal>

  <!-- FRIEND LIST MODAL -->
  <profile-friend-list-modal
    v-if="showFriendListModal"></profile-friend-list-modal>

  <!-- FRIEND REQUEST MODAL -->
  <profile-friend-request-modal
    v-if="showFriendRequestModal"
    @close-modal="closeFriendRequestModal"></profile-friend-request-modal>
</template>

<script setup lang="ts">
// ******* //
// IMPORTS //
// ******* //

import { computed, onBeforeMount, ref } from 'vue'
import { onBeforeRouteUpdate, useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'

import { storeToRefs } from 'pinia'

import ProfileChangeUsernameModal from '@/components/ProfileChangeUsernameModal.vue'
import ProfileFriendListModal from '@/components/ProfileFriendListModal.vue'
import ProfileFriendRequestModal from '@/components/ProfileFriendRequestModal.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { appSocket } from '@/includes/appSocket'
import { useUserStore } from '@/stores/UserStore'
import type { User } from '@/types'

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //
const toast = useToast()

const iconBlockUser = ref('mdi:account-cancel-outline')
const iconRequestNotification = ref('mdi:account-alert-outline')
const iconSendRequest = ref('mdi:account-plus-outline')
const iconUnblockUser = ref('mdi:account-cancel')
const isFriend = ref(false)
const nFriendRequests = ref(0)
const route = useRoute()
const showFriendListModal = ref(false)
const showFriendRequestModal = ref(false)
const showUsernameModal = ref(false)
const userStore = useUserStore()

const { loggedUser, observedUser } = storeToRefs(userStore)

const statusColor = computed(() => {
  if (observedUser.value === null || loggedUser.value === null)
    return 'text-gray-500'
  if (
    observedUser.value.status === 'online' ||
    observedUser.value.id === loggedUser.value.id
  )
    return 'text-[#62D49A]'
  if (observedUser.value.status === 'offline') return 'text-red-500'
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
    await checkBlockedStatus()
    isFriend.value = false
    if (observedUser.value.nFriends > 0) {
      observedUser.value.nFriends -= 1
    }
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
    const response = await userStore.fetchBlockerId(observedUser.value.id)
    console.log(`[ProfileStatsCard] - fetchBlockerId : ${response}`)
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
    const response = await userStore.fetchFriendRequests()
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

// ******************** //
// closeFriendListModal //
// ******************** //

const closeFriendListModal = (): void => {
  showFriendListModal.value = false
}

// *********************** //
// closeFriendRequestModal //
// *********************** //

const closeFriendRequestModal = (event: string): void => {
  showFriendRequestModal.value = false

  if (observedUser.value && event === 'accept') {
    nFriendRequests.value -= 1
    observedUser.value.nFriends += 1
  }
}

// ************************ //
// handleCloseUsernameModal //
// ************************ //

const handleCloseUsernameModal = (): void => {
  showUsernameModal.value = false
  location.reload()
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

// *********** //
// unblockUser //
// *********** //

const unblockUser = async (): Promise<void> => {
  if (observedUser.value === null) return
  try {
    await userStore.unblockUser(observedUser.value.id)
    await checkBlockedStatus()
    // todo: check if the blocker and userToUnblock are already friend or not
    isFriend.value = true
    observedUser.value.nFriends += 1
    toast.success('User unblocked !')
  } catch (error) {
    toast.error('Failed to unblock user !')
  }
}

appSocket.on('social:new', () => {
  nFriendRequests.value += 1
})

appSocket.on('social:accept', (user: User) => {
  console.log('friend request accepted', user)
  console.log('observedUser', observedUser.value?.id)
  if (observedUser.value?.id === user.id) {
    observedUser.value.nFriends += 1
    isFriend.value = true
    console.log('isFriend', isFriend.value)
  }
})

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
