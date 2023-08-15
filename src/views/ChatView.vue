<template>
  <div class="mx-auto w-full max-w-7xl">
    <div
      class="flex flex-col sm:flex-row sm:max-h-[calc(100vh-164px)] text-black m-4">
      <!-- LEFT SIDEBAR -->
      <div
        class="border-2 border-black min-h-[calc(100vh-164px)] w-60 sm:w-[19rem] min-w-[12rem] sm:min-w-[19rem] max-w-[19rem] hidden sm:flex sm:flex-col">
        <chat-left-sidebar
          :list-state="listState"
          @list-state-changed="listState = $event">
        </chat-left-sidebar>
      </div>
      <!-- CHAT -->
      <div
        class="flex flex-col justify-between text-justify w-full overflow-auto min-h-[calc(100vh-164px)] sm:mx-3"
        v-if="selectedChannel && channelsList?.loading === false">
        <div
          class="flex gap-2 border-x-2 border-t-2 border-black items-center justify-between px-5 py-4 sm:px-5 sm:py-5">
          <div class="flex gap-2 items-center">
            <!-- CHANNEL MOBILE BUTTON -->
            <chat-left-drawer
              :list-state="listState"
              @list-state-changed="listState = $event">
            </chat-left-drawer>
            <label
              type="submit"
              for="my-drawer"
              class="my-auto sm:hidden flex self-end btn m-0 p-0 min-h-0 h-8 px-0 mx-0 w-0 relative bg-base-100 border-base-100 hover:bg-base-100 hover:border-base-100 hover:text-zinc-600 -ml-3">
              <iconify-icon
                icon="lucide:chevron-left"
                class="h-7 w-7 self-center text-black absolute">
              </iconify-icon>
            </label>
            <!-- CHANNEL PICTURE -->
            <router-link
              :to="`/profile/${
                channelStore.getChannel(selectedChannel)?.dmUser?.id
              }`"
              class="cursor-pointer"
              v-if="channelStore.getChannel(selectedChannel)?.isDm === true">
              <div class="flex">
                <div
                  v-if="channelStore.getChannel(selectedChannel)?.isDm"
                  class="w-10 h-10 sm:w-11 sm:h-11">
                  <user-avatar
                    :userProps="(channelStore.getChannel(selectedChannel)?.dmUser as User)"
                    :uploadMode="false"></user-avatar>
                </div>
                <img
                  v-else
                  :src="channelImageUrl"
                  class="object-cover rounded-full w-10 h-10 sm:h-11 sm:w-11" />
              </div>
            </router-link>
            <div v-else class="flex items-center mx-auto">
              <div
                class="avatar-group -space-x-6 -mx-1 sm:-mx-0"
                v-if="channelStore.getChannel(selectedChannel)?.isDm === false">
                <div
                  v-for="user in (
                    channelStore.getChannel(selectedChannel)?.members || []
                  ).slice(0, 2)"
                  :key="user.id">
                  <div class="w-11 h-11 sm:w-12 sm:h-12">
                    <user-avatar
                      :userProps="(user as User)"
                      :uploadMode="false"
                      :status-mode="false"></user-avatar>
                  </div>
                </div>
              </div>
            </div>
            <!-- CHANNEL NAME -->
            <h2
              class="text-lg sm:text-xl font-bold text-black truncate sm:w-fit">
              {{ channelStore.getChannel(selectedChannel)?.name }}
            </h2>
          </div>
          <!-- GAME INVITE BUTTON -->
          <button
            v-if="channelStore.getChannel(selectedChannel)?.isDm === true"
            @click="createGame"
            class="btn bg-white border-2 shrink border-black text-black hover:bg-black hover:border-black hover:text-white">
            <iconify-icon
              icon="material-symbols:mail-outline"
              class="hidden lg:block w-7 h-7"></iconify-icon>
            <span class="hidden lg:block">Send game invite</span>
            <span class="lg:hidden block">Invite</span>
          </button>
          <!-- MANAGE CHANNEL MOBILE BUTTON -->
          <chat-right-drawer />
          <label
            v-if="channelStore.getChannel(selectedChannel)?.isDm === false"
            for="my-drawer-4"
            type="submit"
            class="my-auto flex self-end btn m-0 p-0 min-h-0 h-8 px-0 mx-0 w-0 relative bg-base-100 border-base-100 hover:bg-base-100 hover:border-base-100 hover:text-zinc-600 -mr-1">
            <iconify-icon
              icon="lucide:settings"
              class="h-7 w-7 self-center text-black absolute">
            </iconify-icon>
          </label>
        </div>
        <!-- CHAT BOX -->
        <div
          ref="chatbox"
          class="border-black border-2 flex-auto overflow-auto">
          <chat-box @scroll-to-bottom="scrollToBottom"></chat-box>
        </div>
        <!-- MESSAGE INPUT -->
        <chat-input></chat-input>
      </div>
      <!-- RIGHT SIDEBAR -->
      <div
        v-if="
          selectedChannel &&
          channelStore.getChannel(selectedChannel)?.isDm === false
        "
        class="border-2 border-black min-h-[calc(100vh-164px)] flex-col lg:block hidden">
        <chat-right-sidebar />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// ******* //
// IMPORTS //
// ******* //

import { ref, onBeforeMount, onBeforeUnmount } from 'vue'
import {
  onBeforeRouteLeave,
  onBeforeRouteUpdate,
  useRoute,
  useRouter
} from 'vue-router'
import { useToast } from 'vue-toastification'

import { storeToRefs } from 'pinia'
// import InfiniteLoading from 'v3-infinite-loading'

import { chatSocket } from '@/includes/chatSocket'

import { useChannelStore } from '@/stores/ChannelStore.js'

import ChatLeftSidebar from '@/components/ChatLeftSidebar.vue'
import ChatRightSidebar from '@/components/ChatRightSidebar.vue'
import ChatBox from '@/components/ChatBox.vue'
import ChatInput from '@/components/ChatInput.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import ChatLeftDrawer from '@/components/ChatLeftDrawer.vue'
import ChatRightDrawer from '@/components/ChatRightDrawer.vue'

import type { Channel, Message, Room, User } from '@/types'
import { useFetcher, fetcher } from '@/utils/fetcher'
import { useUserStore } from '@/stores/UserStore'

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const channelImageUrl = (imagePath: string): string => {
  return `${import.meta.env.VITE_APP_BASE_URL}/${imagePath}`
}

const channelStore = useChannelStore()
const { loggedUser } = useUserStore()
const chatbox = ref<HTMLElement | null>(null)
const listState = ref('dms')
const router = useRouter()
const route = useRoute()
const toast = useToast()

const { selectedChannel, channelsList } = storeToRefs(channelStore)

// ********************* //
// FUNCTIONS DEFINITIONS //
// ********************* //

// ********** //
// createGame //
// ********** //

function createGame(): void {
  useFetcher({
    queryFn: fetcher.post('/games'),
    onSuccess: async (data: Room) => {
      await router.push(`/room/${data.id}`)
      await channelStore.sendMessage(
        `${import.meta.env.VITE_APP_URL + '/room/' + data.id}`
      )
    }
  })
}

// ************ //
// getChannelId //
// ************ //

const getChannelId = (observedRoute: any): string | null => {
  if (observedRoute.params.catchAll !== '') {
    return observedRoute.params.catchAll.slice(1)
  }
  return null
}

// ************** //
// scrollToBottom //
// ************** //

function scrollToBottom(): void {
  if (chatbox.value != null)
    chatbox.value.scrollTop = chatbox.value.scrollHeight
}

// ****** //
// SOCKET //
// ****** //

chatSocket.connect()

// *** //
// ban //
// *** //

chatSocket.on(
  'chat:ban',
  async ({ user, channelId }: { user: User; channelId: string }) => {
    console.log(
      `[ChatView] - ${user.username} banned from channel ${channelId}`
    )

    const channel = channelStore.getChannel(channelId)

    if (channel) {
      channelStore.addBannedMember(user, channelId)
      channelStore.removeMember(user.id, channelId)

      if (loggedUser && loggedUser.id === user.id) {
        channelStore.selectedChannel = null
        channelStore.removeFromChannelList(channelId)
        toast.success(`You have been banned from ${channel.name}`)
        return await router.push('/chat')
      }

      toast.success(`${user.username} have been banned from ${channel.name}`)
    }
  }
)

// ************** //
// channelCreated //
// ************** //

chatSocket.on('chat:channel-created', async (channel: Channel) => {
  if (loggedUser === null) return
  channelStore.setChannelInfos(loggedUser, channel)
  channelStore.channelsList?.data?.push(channel)
})

// ********** //
// disconnect //
// ********** //

chatSocket.on('disconnect', async () => {
  console.log('[ChatView] - Disconnected from the chat.')
})

// ***** //
// error //
// ***** //

chatSocket.on('error', (error) => {
  console.error('[ChatView] - Error : ', error)
})

// **** //
// join //
// **** //

chatSocket.on(
  'chat:join',
  async ({ user, channelId }: { user: User; channelId: string }) => {
    console.log(`[ChatView] - ${user.username} joined ${channelId}`)

    channelStore.addMember(user, channelId)

    if (loggedUser && loggedUser.id === user.id) {
      await channelStore.fetchChannel(channelId)
      channelStore.selectedChannel = channelId
      toast.success(`You joined the channel`)
      return await router.push(`/chat/${channelId}`)
    }

    toast.success(`${user.username} joined the channel`)
  }
)

// **** //
// kick //
// **** //

chatSocket.on(
  'chat:kick',
  async ({ user, channelId }: { user: User; channelId: string }) => {
    console.log(
      `[ChatView] - User ${user.username} kicked from channel ${channelId}`
    )

    const channel = channelStore.getChannel(channelId)

    if (channel) {
      channelStore.removeMember(user.id, channelId)

      if (loggedUser && loggedUser.id === user.id) {
        channelStore.selectedChannel = null
        channelStore.removeFromChannelList(channelId)
        toast.success(`You have been kicked from ${channel.name}`)
        return await router.push('/chat')
      }

      toast.success(`${user.username} successfully kicked from ${channel.name}`)
    }
  }
)

// ***** //
// leave //
// ***** //

chatSocket.on(
  'chat:leave',
  async ({ user, channelId }: { user: User; channelId: string }) => {
    console.log(`[ChatView] - ${user.username} left channel ${channelId}`)
    channelStore.removeMember(user.id, channelId)
    toast.success(`${user.username} left the channel`)
  }
)

// ******* //
// message //
// ******* //

chatSocket.on('chat:message', async (message: Message) => {
  await channelStore.addMessage(message, message.channel.id)
  if (chatbox.value != null) {
    scrollToBottom()
  }
})

// **** //
// mute //
// **** //

chatSocket.on(
  'chat:mute',
  async ({ user, channelId }: { user: User; channelId: string }) => {
    console.log(`[ChatView] - ${user.username} muted in channel ${channelId}`)

    const channel = channelStore.getChannel(channelId)

    if (channel) {
      if (loggedUser && loggedUser.id === user.id) {
        channel.isMuted = true
      }
    }
  }
)

chatSocket.on(
  'chat:unmute',
  async ({ user, channelId }: { user: User; channelId: string }) => {
    console.log(`[ChatView] - ${user.username} unmuted in channel ${channelId}`)

    const channel = channelStore.getChannel(channelId)

    if (channel) {
      if (loggedUser && loggedUser.id === user.id) {
        channel.isMuted = false
      }
    }
  }
)

// ******** //
// setAdmin //
// ******** //

chatSocket.on(
  'chat:set-admin',
  async ({ user, channelId }: { user: User; channelId: string }) => {
    console.log(
      `[ChatView] - ${user.username} promoted admin of channel ${channelId}`
    )

    const channel = channelStore.getChannel(channelId)

    if (channel) {
      await channelStore.addAdmin(user, channelId)

      if (loggedUser && loggedUser.id === user.id) {
        toast.success(`You have been promoted admin of ${channel.name}`)
      }

      toast.success(
        `${user.username} have been promoted admin of ${channel.name}`
      )
    }
  }
)

// ***** //
// unban //
// ***** //

chatSocket.on(
  'chat:unban',
  async ({ user, channelId }: { user: User; channelId: string }) => {
    console.log(
      `[ChatView] - ${user.username} unbanned from channel ${channelId}`
    )

    const channel = channelStore.getChannel(channelId)

    if (channel) {
      channelStore.removeBannedMember(user.id, channelId)

      if (loggedUser && loggedUser.id === user.id) {
        channelStore.addToChannelList(channel)
        toast.success(`You have been unbanned from ${channel.name}`)
      }

      toast.success(`${user.username} have been unbanned from ${channel.name}`)
    }
  }
)

// ********** //
// unsetAdmin //
// ********** //

chatSocket.on(
  'chat:unset-admin',
  async ({ user, channelId }: { user: User; channelId: string }) => {
    console.log(
      `[ChatView] - ${user.username} promoted admin of channel ${channelId}`
    )

    const channel = channelStore.getChannel(channelId)

    if (channel) {
      await channelStore.removeAdmin(user.id, channelId)

      if (loggedUser && loggedUser.id === user.id) {
        toast.success(`You are not admin of ${channel.name} anymore`)
      }

      toast.success(`${user.username} is not admin of ${channel.name} anymore`)
    }
  }
)

// ********************* //
// VueJs LIFECYCLE HOOKS //
// ********************* //

onBeforeMount(async () => {
  if (
    channelsList.value === undefined ||
    channelsList.value?.data?.length === 0
  ) {
    channelStore.fetchChannelList()
  }

  chatSocket.on('chat:connect', () => {
    console.log('[ChatView] - Connected to the chat.')
  })

  if (selectedChannel.value) {
    await router.push(`/chat/${selectedChannel.value}`)
  } else {
    await router.push(`/chat`)
  }

  channelStore.selectedChannel = getChannelId(route)
  const channel = channelStore.getChannel(
    channelStore.selectedChannel as string
  )
  if (!channel) return
  channel.unreadMessages = 0

  scrollToBottom()
})

onBeforeRouteUpdate((to, from) => {
  channelStore.selectedChannel = getChannelId(to)
  const channel = channelStore.getChannel(
    channelStore.selectedChannel as string
  )
  if (!channel) return
  channel.unreadMessages = 0
})

onBeforeRouteLeave(async () => {
  chatSocket.disconnect()
})

onBeforeUnmount(() => {
  chatSocket.off('connect')
  chatSocket.off('disconnect')
  chatSocket.off('error')
  chatSocket.off('message')
})
</script>
