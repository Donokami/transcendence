<template>
  <div class="lg:-ml-4 rounded-none stats stats-vertical lg:stats-horizontal">
    <div class="lg:border-r-2 border-black -ml-6 stat lg:-ml-2 h-52">
      <div class="flex items-top justify-between h-14">
        <!-- USERNAME -->
        <div v-if="user" class="stat-value text-black text-xl">
          {{ user.username }}
        </div>
        <label
          v-if="user && loggedUser && props.user.id === loggedUser?.id"
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
            :userProps="(user as User)"
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
      <div class="flex items-top justify-between h-14">
        <div class="stat-value text-xl">Rank</div>
        <iconify-icon
          class="w-8 h-8"
          icon="icon-park-outline:ranking"
          style="color: #5d4df8"></iconify-icon>
      </div>
      <div class="flex items-center h-24">
        <div v-if="user" class="stat-value text-primary">
          {{ props.user.rank ?? '-' }}
        </div>
      </div>
    </div>
    <!-- USER WIN RATE -->
    <div
      class="stat border-black -ml-6 lg:-ml-0 !border-t-2 lg:!border-t-0 lg:!border-l-2">
      <div class="flex items-top justify-between h-14">
        <div class="stat-value text-xl">Win Rate</div>
        <iconify-icon
          class="w-8 h-8"
          icon="mdi:target-arrow"
          style="color: #5d4df8"></iconify-icon>
      </div>
      <div class="flex items-center h-24">
        <div v-if="props.user" class="stat-value text-primary">
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
        <div class="stat-value text-primary">{{ props.user.nFriends }}</div>
        <!-- SEND REQUEST -->
        <button
          v-if="
            isFriend === false &&
            !isUserBlockedByProfile &&
            !isProfileBlockedByUser
          "
          class="btn bg-white border-2 border-black text-black hover:bg-black hover:border-black hover:text-white h-14 items-center no-animation"
          type="button"
          @click="sendFriendRequest">
          <div>Add friend</div>
          <iconify-icon class="w-8 h-8" :icon="iconSendRequest"></iconify-icon>
        </button>
        <!-- BLOCK USER -->
        <button
          v-else-if="isFriend === true && !isUserBlockedByProfile"
          class="btn bg-white border-2 border-black text-black hover:bg-black hover:border-black hover:text-white h-14 items-center no-animation"
          type="button"
          @click="blockUser">
          <div>Block user</div>
          <iconify-icon class="w-8 h-8" :icon="iconBlockUser"></iconify-icon>
        </button>
        <!-- UNBLOCK USER -->
        <button
          v-else-if="isFriend === false && isProfileBlockedByUser"
          class="btn bg-white border-2 border-black text-black hover:bg-black hover:border-black hover:text-white h-14 items-center no-animation"
          type="button"
          @click="unblockUser">
          <div>Unblock user</div>
          <iconify-icon class="w-8 h-8" :icon="iconUnblockUser"></iconify-icon>
        </button>
      </div>
    </div>
    <!-- FRIEND REQUEST NOTIFICATION -->
    <div
      class="stat border-black -ml-6 lg:-ml-0 !border-t-2 lg:!border-t-0 lg:!border-l-2"
      v-if="loggedUser && user && props.user.id === loggedUser.id">
      <div class="flex items-top justify-between h-14">
        <div class="stat-value text-xl">Friends</div>
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
        <div class="stat-value text-primary">{{ props.user.nFriends }}</div>
        <label
          v-if="nFriendRequests > 0"
          for="my-modal-3"
          class="btn bg-white border-2 border-black text-black hover:bg-black hover:border-black hover:text-white h-16 items-center no-animation"
          type="button"
          @click="showFriendRequestModal = true">
          <div>Handle requests</div>
          <div class="indicator">
            <span class="badge badge-secondary indicator-item text-white">{{
              nFriendRequests
            }}</span>
            <iconify-icon
              class="w-8 h-8"
              :icon="iconRequestNotification"></iconify-icon>
          </div>
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

// ******************** //
// FUNCTION DEFINITIONS //
// ******************** //

// ********* //
// blockUser //
// ********* //

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
    }
  } catch (error) {
    toast.error('Failed to fetch blocked user and check friendship!')
  }
}

// ******************** //
// closeFriendListModal //
// ******************** //

// const closeFriendListModal = (): void => {
//   showFriendListModal.value = false
// }

// *********************** //
// closeFriendRequestModal //
// *********************** //

const closeFriendRequestModal = (event: string): void => {
  showFriendRequestModal.value = false

  if (event === 'accept') {
    nFriendRequests.value -= 1
    emit('updateUser')
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
    // todo: check if the blocker and userToUnblock are already friend or not
    isFriend.value = true
    emit('updateUser')
    toast.success('User unblocked !')
  } catch (error) {
    toast.error('Failed to unblock user !')
  }
}

socialSocket.on('social:new', () => {
  nFriendRequests.value += 1
})

socialSocket.on('social:accept', (user: Ref<User>) => {
  emit('updateUser')
  isFriend.value = true
})

// ********************* //
// VueJs LIFECYCLE HOOKS //
// ********************* //

onMounted(async () => {
  if (loggedUser.value == null) return
  try {
    await userStore.refreshFriendList()
    await searchInFriendList(props.user)
    await checkBlockedStatus()
    nFriendRequests.value = await getFriendRequestsNumber()
  } catch (error: any) {
    toast.error('Something went wrong !')
  }
})

// onBeforeMount(async () => {
//   let id = route.params.id
//   if (Array.isArray(id)) {
//     id = id[0]
//   }
//   try {
//     await fetchUser(id)

//     await userStore.refreshFriendList()

//     if (
//       loggedUser.value != null &&
//       user !== null &&
//       props.user.id !== loggedUser.value.id
//     ) {
//       await searchInFriendList(user)
//       await checkBlockedStatus()
//     }

//     await getFriendRequestsNumber()
//   } catch (error: any) {
//     toast.error('Something went wrong !')
//   }
// })

// onBeforeRouteUpdate(async (to, from) => {
//   const id = to.path.split('/').pop()
//   try {
//     await fetchUser(id)

//     await userStore.refreshFriendList()

//     if (
//       loggedUser.value &&
//       user &&
//       props.user.id !== loggedUser.value.id
//     ) {
//       await searchInFriendList(user)
//       await checkBlockedStatus()
//     }

//     await getFriendRequestsNumber()
//   } catch (error: any) {
//     toast.error('Something went wrong !')
//   }
// })
</script>
