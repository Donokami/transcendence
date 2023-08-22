<template>
  <div class="w-full mx-auto max-w-7xl">
    <div
      class="flex flex-col sm:flex-row sm:max-h-[calc(100vh-164px)] text-black m-4">
      <!-- LEFT SIDEBAR -->
      <div class="bg-white" :class="sidebarClasses">
        <chat-left-sidebar
          :list-state="listState"
          @list-state-changed="listState = $event">
        </chat-left-sidebar>
      </div>
      <!-- CHAT -->
      <div
        class="flex flex-col justify-between text-justify bg-white w-full overflow-auto min-h-[calc(100vh-164px)] sm:mx-3"
        v-if="selectedChannel && channelsList">
        <div
          class="flex items-center justify-between gap-2 px-5 py-4 border-t-2 border-black border-x-2 sm:px-5 sm:py-5">
          <div class="flex items-center gap-2">
            <!-- CHANNEL MOBILE BUTTON -->
            <chat-left-drawer
              :list-state="listState"
              @list-state-changed="listState = $event">
            </chat-left-drawer>
            <label
              type="submit"
              for="my-drawer"
              class="relative flex self-end w-0 h-8 min-h-0 p-0 px-0 m-0 mx-0 my-auto -ml-3 sm:hidden btn bg-base-100 border-base-100 hover:bg-base-100 hover:border-base-100 hover:text-zinc-600">
              <iconify-icon
                icon="lucide:chevron-left"
                class="absolute self-center text-black h-7 w-7">
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
                    :user-props="
                      channelStore.getChannel(selectedChannel)?.dmUser
                    "
                    :upload-mode="false"></user-avatar>
                </div>
                <img
                  v-else
                  :src="channelImageUrl"
                  class="object-cover w-10 h-10 rounded-full sm:h-11 sm:w-11" />
              </div>
            </router-link>
            <div v-else class="flex items-center mx-auto">
              <div
                class="-mx-1 -space-x-6 avatar-group sm:-mx-0"
                v-if="channelStore.getChannel(selectedChannel)?.isDm === false">
                <div
                  v-for="user in (
                    channelStore.getChannel(selectedChannel)?.members || []
                  ).slice(0, 2)"
                  :key="user.id">
                  <div class="w-11 h-11 sm:w-12 sm:h-12">
                    <user-avatar
                      :user-props="user"
                      :upload-mode="false"
                      :status-mode="false"></user-avatar>
                  </div>
                </div>
              </div>
            </div>
            <h2
              class="text-lg font-bold text-black truncate sm:text-xl sm:w-fit">
              {{ channelStore.getChannel(selectedChannel)?.name }}
            </h2>
          </div>
          <button
            v-if="channelStore.getChannel(selectedChannel)?.isDm === true"
            @click="createGame"
            class="text-black bg-white border-2 border-black btn shrink hover:bg-black hover:border-black hover:text-white">
            <iconify-icon
              icon="material-symbols:mail-outline"
              class="hidden lg:block w-7 h-7"></iconify-icon>
            <span class="hidden lg:block">Send game invite</span>
            <span class="block lg:hidden">Invite</span>
          </button>
          <chat-right-drawer />
          <label
            v-if="channelStore.getChannel(selectedChannel)?.isDm === false"
            for="my-drawer-4"
            type="submit"
            class="relative flex self-end w-0 h-8 min-h-0 p-0 px-0 m-0 mx-0 my-auto -mr-1 btn bg-base-100 border-base-100 hover:bg-base-100 hover:border-base-100 hover:text-zinc-600">
            <iconify-icon
              icon="lucide:settings"
              class="absolute self-center text-black h-7 w-7">
            </iconify-icon>
          </label>
        </div>
        <div
          ref="chatbox"
          class="flex-auto overflow-auto border-2 border-black">
          <chat-box @scroll-to-bottom="scrollToBottom"></chat-box>
        </div>
        <chat-input></chat-input>
      </div>
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
import { storeToRefs } from 'pinia'

import { ref, computed, onBeforeUnmount, onMounted } from 'vue'
import {
  onBeforeRouteLeave,
  onBeforeRouteUpdate,
  useRoute,
  useRouter
} from 'vue-router'
import { useToast } from 'vue-toastification'

// import InfiniteLoading from 'v3-infinite-loading'

import ChatBox from '@/components/ChatBox.vue'
import ChatInput from '@/components/ChatInput.vue'
import ChatLeftDrawer from '@/components/ChatLeftDrawer.vue'
import ChatLeftSidebar from '@/components/ChatLeftSidebar.vue'
import ChatRightDrawer from '@/components/ChatRightDrawer.vue'
import ChatRightSidebar from '@/components/ChatRightSidebar.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { chatSocket } from '@/includes/chatSocket'
import { useChannelStore } from '@/stores/ChannelStore.js'
import { useUserStore } from '@/stores/UserStore'
import type { Channel, Message, Room, User } from '@/types'
import { fetcher } from '@/utils/fetcher'

const channelStore = useChannelStore()
const { channelsList, selectedChannel } = storeToRefs(channelStore)

const { loggedUser } = useUserStore()

const chatbox = ref<HTMLElement | null>(null)
const listState = ref('dms')
const router = useRouter()
const route = useRoute()
const toast = useToast()

const channelImageUrl = (imagePath: string): string => {
  return `${import.meta.env.VITE_APP_BASE_URL}/${imagePath}`
}

const sidebarClasses = computed(() => {
  const baseClasses =
    'border-2 border-black min-h-[calc(100vh-164px)] w-60 sm:w-[19rem] min-w-[12rem] sm:min-w-[19rem] max-w-[19rem] flex flex-col'

  if (route.path === '/chat/') {
    return `${baseClasses} mx-auto`
  } else if (route.path.startsWith('/chat/') && route.path !== '/chat/') {
    return `${baseClasses} hidden sm:flex`
  }

  return baseClasses
})

async function createGame(): Promise<void> {
  const room: Room = await fetcher.post('/games')
  await router.push(`/room/${room.id}`)
  await channelStore.sendMessage(
    `${import.meta.env.VITE_APP_URL + '/room/' + room.id}`
  )
}

function getChannelId(observedRoute: any): string | null {
  if (observedRoute.params.catchAll !== '') {
    return observedRoute.params.catchAll.slice(1)
  }
  return null
}

function scrollToBottom(): void {
  if (chatbox.value != null)
    chatbox.value.scrollTop = chatbox.value.scrollHeight
}

chatSocket.connect()

chatSocket.on(
  'chat:ban',
  async ({ user, channelId }: { user: User; channelId: string }) => {
    const channel = channelStore.getChannel(channelId)
    if (!channel) return

    channelStore.addBannedMember(user, channelId)
    channelStore.removeMember(user.id, channelId)

    if (loggedUser && loggedUser.id === user.id) {
      channelStore.selectedChannel = null
      channelsList.value = await channelStore.fetchChannels()

      toast.success(`You have been banned from ${channel.name}`)

      return await router.push('/chat')
    } else {
      toast.success(`${user.username} have been banned from ${channel.name}`)
    }
  }
)

chatSocket.on('chat:channel-created', async (channel: Channel) => {
  if (loggedUser === null) return

  channelStore.setChannelInfos(loggedUser, channel)
  channelStore.addToChannelList(channel)

  if (channel.isDm && channel.dmUser) {
    toast.success(`DM created with ${channel.dmUser.username}`)
  } else {
    toast.success(`You joined the ${channel.name} group`)
  }
})

chatSocket.on('disconnect', async () => {
  console.log('[ChatView] - Disconnected from the /chat socket')
})

chatSocket.on('error', (error) => {
  console.error('[ChatView] - Socket error : ', error)
})

chatSocket.on(
  'chat:join',
  async ({ user, channelId }: { user: User; channelId: string }) => {
    const channel = channelStore.getChannel(channelId)
    if (!channel) return

    channelStore.addMember(user, channelId)

    toast.success(`${user.username} joined ${channel.name} channel`)
  }
)

chatSocket.on(
  'chat:kick',
  async ({ user, channelId }: { user: User; channelId: string }) => {
    const channel = channelStore.getChannel(channelId)
    if (!channel) return

    channelStore.removeMember(user.id, channelId)

    if (loggedUser && loggedUser.id === user.id) {
      channelStore.selectedChannel = null
      channelsList.value = await channelStore.fetchChannels()

      toast.success(`You have been kicked from ${channel.name}`)

      return await router.push('/chat')
    } else {
      toast.success(`${user.username} successfully kicked from ${channel.name}`)
    }
  }
)

chatSocket.on(
  'chat:leave',
  async ({ user, channelId }: { user: User; channelId: string }) => {
    const channel = channelStore.getChannel(channelId)
    if (!channel) return

    channelStore.removeMember(user.id, channelId)

    toast.success(`${user.username} left ${channel.name} channel`)
  }
)

chatSocket.on('chat:message', async (message: Message) => {
  await channelStore.addMessage(message, message.channel.id)
  if (chatbox.value != null) {
    scrollToBottom()
  }
})

chatSocket.on(
  'chat:mute',
  async ({ user, channelId }: { user: User; channelId: string }) => {
    const channel = channelStore.getChannel(channelId)
    if (!channel) return

    if (loggedUser && loggedUser.id === user.id) {
      channel.isMuted = true
      toast.success(`You have been muted in ${channel.name}`)
    } else {
      toast.success(`${user.username} successfully muted`)
    }
  }
)

chatSocket.on(
  'chat:unmute',
  async ({ user, channelId }: { user: User; channelId: string }) => {
    const channel = channelStore.getChannel(channelId)
    if (!channel) return

    if (loggedUser && loggedUser.id === user.id) {
      channel.isMuted = false
      toast.success(`You are unmuted in ${channel.name}`)
    }
  }
)

chatSocket.on(
  'chat:set-admin',
  async ({ user, channelId }: { user: User; channelId: string }) => {
    const channel = channelStore.getChannel(channelId)
    if (!channel) return

    channelStore.addAdmin(user, channelId)

    if (loggedUser && loggedUser.id === user.id) {
      toast.success(`You have been promoted admin of ${channel.name}`)
    } else {
      toast.success(
        `${user.username} have been promoted admin of ${channel.name}`
      )
    }
  }
)

chatSocket.on(
  'chat:unban',
  async ({ user, channelId }: { user: User; channelId: string }) => {
    const channel = channelStore.getChannel(channelId)
    if (!channel) return

    channelStore.removeBannedMember(user.id, channelId)

    if (loggedUser && loggedUser.id === user.id) {
      channelStore.addToChannelList(channel)
      toast.success(`You have been unbanned from ${channel.name}`)
    } else {
      toast.success(`${user.username} have been unbanned from ${channel.name}`)
    }
  }
)

chatSocket.on(
  'chat:unset-admin',
  async ({ user, channelId }: { user: User; channelId: string }) => {
    const channel = channelStore.getChannel(channelId)
    if (!channel) return

    channelStore.removeAdmin(user.id, channelId)

    if (loggedUser && loggedUser.id === user.id) {
      toast.success(`You are not admin of ${channel.name} anymore`)
    } else {
      toast.success(`${user.username} is not admin of ${channel.name} anymore`)
    }
  }
)

onMounted(async () => {
  if (channelsList.value === null) {
    channelsList.value = await channelStore.fetchChannels()
  }

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
  chatSocket.off(`chat:ban`)
  chatSocket.off(`chat:channel-created`)
  chatSocket.off(`chat:join`)
  chatSocket.off(`chat:kick`)
  chatSocket.off(`chat:leave`)
  chatSocket.off(`chat:message`)
  chatSocket.off(`chat:mute`)
  chatSocket.off(`chat:unmute`)
  chatSocket.off(`chat:set-admin`)
  chatSocket.off(`chat:unban`)
  chatSocket.off(`chat:unset-admin`)
  chatSocket.off(`disconnect`)
  chatSocket.off(`error`)
})
</script>
