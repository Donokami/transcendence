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
          @click="changeUsernameModal?.showModal()">
          Change username
        </label>
      </div>
      <!-- USER AVATAR AND STATUS -->
      <div class="flex-col h-24">
        <div class="w-16 text-black">
          <user-avatar
            :user-props="user"
            :upload-mode="loggedUser?.id === user?.id"></user-avatar>
        </div>
        <div class="flex items-baseline">
          <div class="stat-title">Status:</div>
          <div v-if="user" class="" :class="getStatusColor(user)">
            {{ props.user.status }}
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
          class="mb-2 text-black bg-white border-2 border-black btn hover:bg-black hover:border-black hover:text-white"
          type="button"
          v-if="props.user.nFriends > 0"
          @click="friendListModal?.showModal()">
          See friend list
        </label>
      </div>
      <div class="flex items-center justify-between h-24">
        <div class="text-black stat-value">{{ props.user.nFriends }}</div>
        <label
          v-if="nFriendRequests > 0"
          class="items-center h-16 text-black bg-white border-2 border-black btn hover:bg-black hover:border-black hover:text-white no-animation"
          type="button"
          @click="friendRequestModal?.showModal()">
          <div class="indicator">
            <span
              class="text-xs text-white badge badge-secondary indicator-start indicator-item animation-pulse"
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
    @username-changed="handleUsernameChangedModal"
    ref="changeUsernameModal"></profile-change-username-modal>

  <!-- FRIEND LIST MODAL -->
  <profile-friend-list-modal ref="friendListModal"></profile-friend-list-modal>

  <!-- FRIEND REQUEST MODAL -->
  <profile-friend-request-modal
    @handle-request="handleFriendRequest"
    ref="friendRequestModal"></profile-friend-request-modal>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
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

const toast = useToast()

const iconBlockUser = ref('mdi:account-cancel-outline')
const iconRequestNotification = ref('mdi:account-alert-outline')
const iconSendRequest = ref('mdi:account-plus-outline')
const iconUnblockUser = ref('mdi:account-cancel')
const isFriend = ref(false)
const isProfileBlockedByUser = ref(false)
const isUserBlockedByProfile = ref(false)
const nFriendRequests = ref(0)
const userRank = ref<number | null>(null)
const userStore = useUserStore()
const friendRequestModal = ref<InstanceType<
  typeof ProfileFriendRequestModal
> | null>(null)
const friendListModal = ref<InstanceType<typeof ProfileFriendListModal> | null>(
  null
)
const changeUsernameModal = ref<InstanceType<
  typeof ProfileChangeUsernameModal
> | null>(null)
const { loggedUser, friendList } = storeToRefs(userStore)

const props = defineProps<{
  user: User
}>()

const emit = defineEmits(['updateUser'])

function getStatusColor(user: User): string | null {
  switch (user.status) {
    case 'online':
      return 'text-success'
    case 'ingame':
      return 'text-purple-500'
    default:
      return null
  }
}

const blockUser = async (): Promise<void> => {
  try {
    await userStore.blockUser(props.user.id)
    await checkBlockedStatus()
    isFriend.value = false
    toast.success(`${props.user.username} has been blocked.`)
    emit('updateUser')
  } catch (err: any) {
    if (err instanceof ApiError) {
      if (err.code === 'FriendshipAlreadyBlocked') {
        toast.error('Friendship status is already blocked.')
      } else if (err.code === 'SameIdsError') {
        toast.error('You cannot block yourself.')
      }
    } else {
      toast.error('Something went wrong')
    }
  }
}

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

const handleFriendRequest = (event: string): void => {
  if (event === 'accept' || event === 'reject' || event === 'block')
    nFriendRequests.value -= 1

  emit('updateUser')
}

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

const handleUsernameChangedModal = (): void => {
  location.reload()
}

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

const unblockUser = async (): Promise<void> => {
  try {
    await userStore.unblockUser(props.user.id)
    await checkBlockedStatus()
    isFriend.value = true
    toast.success(`${props.user.username} has been unblocked.`)
    emit('updateUser')
  } catch (err: any) {
    if (err instanceof ApiError) {
      if (err.code === 'FriendshipNotBlocked') {
        toast.error('Friendship status is not blocked')
      } else if (err.code === 'FriendshipNotFound') {
        toast.error('Friendship is not found')
      } else if (err.code === 'SameIdsError') {
        toast.error('You cannot unblock yourself')
      } else if (err.code === 'OnlyBlockerCanUnblock') {
        toast.error('Only the blocker can unblock the friendship')
      }
    } else {
      toast.error('Something went wrong')
    }
  }
}

socialSocket.on('social:new', () => {
  nFriendRequests.value += 1
  toast.success('Friend request received!')
})

socialSocket.on('social:accept', async (sender: User, receiver: User) => {
  if (!loggedUser.value) return

  if (loggedUser.value.id === sender.id) {
    friendList.value.push(receiver)
    toast.success(
      `Friend request sent to ${receiver.username} has been accepted!`
    )
  } else if (loggedUser.value.id === receiver.id) {
    friendList.value.push(sender)
    toast.success(`Friend request from ${sender.username} accepted!`)
  }
  isFriend.value = true
  emit('updateUser')
})

socialSocket.on('social:rejected', () => {
  emit('updateUser')
  toast.success('One of your friend request has been rejected!')
})

socialSocket.on(
  'social:block',
  async ({ blocker, toBlock }: { blocker: User; toBlock: User }) => {
    if (!loggedUser.value || !blocker) return

    userStore.removeFriend(blocker)

    if (loggedUser.value.id === toBlock.id) {
      toast.success(`You have been blocked by ${blocker.username}`)
    }
    emit('updateUser')
  }
)

socialSocket.on(
  'social:unblock',
  async ({ unblocker, toUnblock }: { unblocker: User; toUnblock: User }) => {
    if (!loggedUser.value || !unblocker || !toUnblock) return

    if (loggedUser.value.id === toUnblock.id) {
      toast.success(`You have been unblocked by ${unblocker.username}`)
    }
    emit('updateUser')
  }
)

async function fetchData(): Promise<void> {
  userRank.value = await userStore.fetchUserRank(props.user.id)
  if (loggedUser.value == null) return
  try {
    friendList.value = await userStore.refreshFriendList()
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

onBeforeUnmount(() => {
  socialSocket.off(`social:new`)
  socialSocket.off(`social:accept`)
  socialSocket.off(`social:rejected`)
  socialSocket.off(`social:block`)
  socialSocket.off(`social:unblock`)
})
</script>
