<template>
  <div class="rounded-none lg:-ml-4 stats stats-vertical lg:stats-horizontal">
    <div class="-ml-6 border-black lg:border-r-2 stat lg:-ml-2 h-52">
      <div class="flex justify-between items-top h-14">
        <!-- USERNAME -->
        <div
          v-if="user"
          class="flex items-center text-xl font-bold leading-4 text-black">
          {{ user.username }}
        </div>
        <label
          v-if="user && loggedUser && props.user.id === loggedUser?.id"
          for="my-modal-4"
          class="text-black bg-white border-2 border-black btn hover:bg-black hover:border-black hover:text-white"
          type="button"
          @click="showUsernameModal = true">
          Change username
        </label>
      </div>
      <!-- USER AVATAR AND STATUS -->
      <div class="flex-col h-24">
        <div class="w-16 text-black">
          <user-avatar
            :userProps="user as User"
            :uploadMode="loggedUser?.id === user?.id"></user-avatar>
        </div>
        <div class="flex items-baseline">
          <div class="stat-title">Status:</div>
          <div v-if="user" class="" :class="statusColor">
            {{
              props.user.id === loggedUser?.id ? 'online' : props.user.status
            }}
          </div>
        </div>
      </div>
    </div>
    <!-- USER RANK -->
    <div class="lg:border-none stat !border-t-2 !border-black -ml-6 lg:-ml-0">
      <div class="flex justify-between items-top h-14">
        <div class="text-xl stat-value">Rank</div>
        <iconify-icon
          class="w-8 h-8"
          icon="icon-park-outline:ranking"></iconify-icon>
      </div>
      <div class="flex items-center h-24">
        <div v-if="user" class="text-black stat-value">
          {{ userRank ?? '-' }}
        </div>
      </div>
    </div>
    <!-- USER WIN RATE -->
    <div
      class="stat border-black -ml-6 lg:-ml-0 !border-t-2 lg:!border-t-0 lg:!border-l-2">
      <div class="flex justify-between items-top h-14">
        <div class="text-xl stat-value">Win Rate</div>
        <iconify-icon class="w-8 h-8" icon="mdi:target-arrow"></iconify-icon>
      </div>
      <div class="flex items-center h-24">
        <div v-if="props.user" class="text-black stat-value">
          {{ Math.round(props.user.winRate * 10000) / 100 }} %
        </div>
      </div>
    </div>
    <!-- USER FRIENDS -->
    <div
      class="stat border-black -ml-6 lg:-ml-0 lg:!border-l-2"
      v-if="loggedUser && props.user.id !== loggedUser.id">
      <div class="text-xl stat-value h-14">Friends</div>
      <div class="flex items-center justify-between h-24">
        <!-- NUMBER OF FRIENDS -->
        <div class="text-black stat-value">{{ props.user.nFriends }}</div>
        <!-- SEND REQUEST -->
        <div class="flex flex-col gap-4">
          <button
            v-if="
              isFriend === false &&
              !isUserBlockedByProfile &&
              !isProfileBlockedByUser
            "
            class="items-center text-black bg-white border-2 border-black btn hover:bg-black hover:border-black hover:text-white h-14 no-animation"
            type="button"
            @click="sendFriendRequest">
            <iconify-icon
              class="w-8 h-8"
              :icon="iconSendRequest"></iconify-icon>
            <div>Add friend</div>
          </button>
          <!-- BLOCK USER -->
          <button
            v-if="!isProfileBlockedByUser && !isUserBlockedByProfile"
            class="items-center text-black bg-white border-2 border-black btn hover:bg-black hover:border-black hover:text-white h-14 no-animation"
            type="button"
            @click="blockUser">
            <iconify-icon class="w-8 h-8" :icon="iconBlockUser"></iconify-icon>
            <div>Block user</div>
          </button>
          <!-- UNBLOCK USER -->
          <button
            v-else-if="isProfileBlockedByUser"
            class="items-center text-black bg-white border-2 border-black btn hover:bg-black hover:border-black hover:text-white h-14 no-animation"
            type="button"
            @click="unblockUser">
            <iconify-icon
              class="w-8 h-8"
              :icon="iconUnblockUser"></iconify-icon>
            <div>Unblock user</div>
          </button>
        </div>
      </div>
    </div>
    <!-- FRIEND REQUEST NOTIFICATION -->
    <div
      class="stat border-black -ml-6 lg:-ml-0 !border-t-2 lg:!border-t-0 lg:!border-l-2"
      v-if="loggedUser && user && props.user.id === loggedUser.id">
      <div class="flex justify-between items-top h-14">
        <div class="text-xl stat-value">Friends</div>
        <label
          for="my-modal-3"
          class="mb-2 text-black bg-white border-2 border-black btn hover:bg-black hover:border-black hover:text-white"
          type="button"
          v-if="props.user.nFriends > 0"
          @click="showFriendListModal = true">
          See friend list
        </label>
      </div>
      <div class="flex items-center justify-between h-24">
        <div class="text-black stat-value">{{ props.user.nFriends }}</div>
        <label
          v-if="nFriendRequests > 0"
          for="my-modal-3"
          class="items-center h-16 text-black bg-white border-2 border-black btn hover:bg-black hover:border-black hover:text-white no-animation"
          type="button"
          @click="showFriendRequestModal = true">
          <div class="indicator">
            <span
              class="text-white text-xs badge badge-secondary indicator-start indicator-item animation-pulse"
              >{{ nFriendRequests }}</span
            >
            <iconify-icon
              class="w-8 h-8"
              :icon="iconRequestNotification"></iconify-icon>
          </div>
          <div>Handle requests</div>
        </label>
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

import { computed, ref, type Ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'

import { storeToRefs } from 'pinia'

import ProfileChangeUsernameModal from '@/components/ProfileChangeUsernameModal.vue'
import ProfileFriendListModal from '@/components/ProfileFriendListModal.vue'
import ProfileFriendRequestModal from '@/components/ProfileFriendRequestModal.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { socialSocket } from '@/includes/socialSocket'
import { useUserStore } from '@/stores/UserStore'
import type { User } from '@/types'
import { ApiError } from '@/utils/fetcher'
import { watch } from 'vue'

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //
const toast = useToast()

const iconBlockUser = ref('mdi:account-cancel-outline')
const iconRequestNotification = ref('mdi:account-alert-outline')
const iconSendRequest = ref('mdi:account-plus-outline')
const iconUnblockUser = ref('mdi:account-cancel')
const isFriend = ref(false)
const isProfileBlockedByUser = ref(false)
const isUserBlockedByProfile = ref(false)
const nFriendRequests = ref(0)
const showFriendListModal = ref(false)
const showFriendRequestModal = ref(false)
const showUsernameModal = ref(false)
const userRank = ref<number | null>(null)
const userStore = useUserStore()

const { loggedUser } = storeToRefs(userStore)

const props = defineProps<{
  user: User
}>()

const emit = defineEmits(['updateUser'])

const statusColor = computed(() => {
  if (loggedUser.value === null) return 'text-gray-500'
  if (props.user.status === 'online' || props.user.id === loggedUser.value.id)
    return 'text-[#62D49A]'
  if (props.user.status === 'offline') return 'text-red-500'
  return 'text-gray-500'
})

const blockUser = async (): Promise<void> => {
  try {
    await userStore.blockUser(props.user.id)
    await checkBlockedStatus()
    isFriend.value = false
    emit('updateUser')
    toast.success(`${props.user.username} has been blocked.`)
  } catch (error) {
    toast.error('An error occured while blocking user.')
  }
}

// ****************** //
// checkBlockedStatus //
// ****************** //

const checkBlockedStatus = async (): Promise<void> => {
  if (!loggedUser.value) return
  try {
    const response = await userStore.fetchBlockerId(props.user.id)
    if (response === loggedUser.value.id) {
      isProfileBlockedByUser.value = true
    } else if (response === props.user.id) {
      isUserBlockedByProfile.value = true
    } else {
      isProfileBlockedByUser.value = false
      isUserBlockedByProfile.value = false
    }
  } catch (error) {
    toast.error('Failed to fetch blocked user and check friendship!')
  }
}

// *********************** //
// closeFriendRequestModal //
// *********************** //

const closeFriendRequestModal = (event: string): void => {
  showFriendRequestModal.value = false

  if (event === 'accept' || event === 'reject') nFriendRequests.value -= 1

  emit('updateUser')
}

// *********************** //
// getFriendRequestsNumber //
// *********************** //

const getFriendRequestsNumber = async (): Promise<number> => {
  if (loggedUser.value == null) return 0
  try {
    const response = await userStore.fetchFriendRequests()
    nFriendRequests.value = response.length
    return response.length
  } catch (error) {
    toast.error('Failed to get friend requests number !')
    return 0
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
      (friend: User) => friend.id === props.user.id
    )
    isFriend.value = !(friend == null)
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
  if (props.user === null) return
  try {
    await userStore.sendFriendRequest(props.user.id)
    toast.success('Friend request sent!')
  } catch (error: any) {
    if (error instanceof ApiError) {
      if (error.code === 'FriendshipAlreadyPending') {
        toast.error('A friendship request is already pending!')
      } else if (error.code === 'FriendshipAlreadyAccepted') {
        toast.error('You are already friend with this user!')
      }
    } else toast.error('Failed to send friend request!')
  }
}

// *********** //
// unblockUser //
// *********** //

const unblockUser = async (): Promise<void> => {
  try {
    await userStore.unblockUser(props.user.id)
    await checkBlockedStatus()
    isFriend.value = true
    emit('updateUser')
    toast.success(`${props.user.username} has been unblocked!`)
  } catch (error) {
    toast.error('Failed to unblock user!')
  }
}

socialSocket.on('social:new', () => {
  nFriendRequests.value += 1
  toast.success('Friend request received!')
})

socialSocket.on('social:accept', () => {
  emit('updateUser')
  isFriend.value = true
  toast.success('One of your friend request has been accepted!')
})

socialSocket.on('social:rejected', () => {
  emit('updateUser')
  toast.success('One of your friend request has been rejected!')
})

async function fetchData(): Promise<void> {
  userRank.value = await userStore.fetchUserRank(props.user.id)
  if (loggedUser.value == null) return
  try {
    await userStore.refreshFriendList()
    await searchInFriendList(props.user)
    await checkBlockedStatus()
    nFriendRequests.value = await getFriendRequestsNumber()
  } catch (error: any) {
    toast.error('Something went wrong!')
  }
}

onMounted(async () => {
  await fetchData()
})

watch(
  () => props.user,
  async () => {
    await fetchData()
  }
)
</script>
