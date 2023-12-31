<template>
  <div class="p-5">
    <div class="flex">
      <iconify-icon
        icon="lucide:crown"
        class="h-4 w-4 shrink-0 self-start mt-0.5">
      </iconify-icon>
      <span class="px-2 text-sm">
        {{ channel?.owner.username }}
      </span>
    </div>
    <div class="flex" v-if="channel?.isDm === false">
      <iconify-icon
        icon="lucide:user-cog"
        class="h-4 w-4 shrink-0 self-start mt-0.5">
      </iconify-icon>
      <span
        class="px-2 text-sm"
        v-for="(admin, index) in channel?.admins"
        :key="admin.id">
        {{ admin.username
        }}<span v-if="channel?.admins && index !== channel?.admins.length - 1"
          >,
        </span>
      </span>
    </div>
  </div>
  <div v-if="loggedUser && channel" class="p-5">
    <div
      class="flex mb-4 w-fit"
      :class="messageClass(message)"
      v-for="message in channel.messages.filter(
        (message) =>
          !loggedUser?.blockedUsers?.some(
            (blockedUser) => blockedUser.id === message.user.id
          )
      )"
      :key="message.id">
      <chat-dropdown
        v-if="message.user.id !== loggedUser?.id && !channel.isDm"
        :user="message.user"
        :channel="channel"
        :isSender="message.user.id === loggedUser?.id && !channel.isDm"
        :openDropdown="openDropdown">
      </chat-dropdown>
      <div>
        <div
          :class="bubbleClass(message)"
          class="text-xs w-fit !bg-base-100"
          v-if="!channel.isDm">
          {{ message.user.username }}
        </div>
        <div
          :class="bubbleClass(message)"
          class="flex flex-col max-w-[10rem] md:max-w-sm w-fit p-2 text-justify border-black border-2 h-fit mt-0.5">
          <div v-if="message.isInvite">
            <div class="text-sm" :class="textClass(message)">
              <h1 v-if="!message.room">Invite link expired</h1>
              <div v-else>
                <p>
                  <span>{{ message.user.username }}</span>
                  invited you to play!
                </p>
                <button
                  class="block w-full mt-2 text-black bg-white border-2 border-black btn hover:bg-black hover:border-white hover:text-white"
                  :class="{ invert: message.user.id === loggedUser.id }">
                  <router-link
                    :to="`/room/${message.room.id}`"
                    class="flex gap-2 mx-auto w-fit">
                    <iconify-icon
                      icon="ri:ping-pong-line"
                      class="hidden sm:block w-7 h-7"></iconify-icon>
                    <div class="my-auto">Join the game</div>
                  </router-link>
                </button>
              </div>
            </div>
          </div>
          <div v-else class="text-sm break-words" :class="textClass(message)">
            {{ message.messageBody }}
          </div>
        </div>
      </div>

      <chat-dropdown
        v-if="message.user.id === loggedUser?.id && !channel.isDm"
        :user="message.user"
        :channel="channel"
        :isSender="message.user.id === loggedUser?.id && !channel.isDm"
        :openDropdown="openDropdown">
      </chat-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, onMounted, ref, watch } from 'vue'
import { onBeforeRouteUpdate } from 'vue-router'

import { storeToRefs } from 'pinia'

import { useChannelStore } from '@/stores/ChannelStore.js'
import { useUserStore } from '@/stores/UserStore.js'

import type { Message, Channel } from '@/types'

import ChatDropdown from '@/components/ChatDropdown.vue'

const openDropdown = ref<number | null>(null)

const channelStore = useChannelStore()
const emit = defineEmits(['scroll-to-bottom'])
const userStore = useUserStore()

const { loggedUser } = storeToRefs(userStore)
const { selectedChannel } = storeToRefs(channelStore)
const channel = ref<Channel | null>(null)

const messageClass = computed(() => (message: Message) => {
  if (message.user.id === loggedUser.value?.id) {
    return 'ml-auto'
  } else {
    return ''
  }
})

const bubbleClass = computed(() => (message: Message) => {
  if (message.user.id === loggedUser.value?.id) {
    return 'ml-auto bg-black'
  } else {
    return 'mr-auto'
  }
})

const textClass = computed(() => (message: Message) => {
  if (message.user.id === loggedUser.value?.id) {
    return 'text-white'
  } else {
    return 'text-black'
  }
})

async function initChannel(): Promise<void> {
  if (!loggedUser.value || !selectedChannel.value) {
    return
  }

  channel.value = channelStore.getChannel(selectedChannel.value)
  if (!channel.value) return

  await channelStore.fetchChannelMessages(selectedChannel.value)

  // channel.value.members = await channelStore.fetchMembers(selectedChannel.value)
  if (channel.value.isDm === false) {
    channel.value.owner = await channelStore.fetchOwner(selectedChannel.value)
    channel.value.admins = await channelStore.fetchAdmins(selectedChannel.value)
    if (channelStore.isAdmin(loggedUser.value.id, channel.value.id)) {
      channel.value.bannedMembers = await channelStore.fetchBannedMembers(
        selectedChannel.value
      )
    }
  }

  emit('scroll-to-bottom')
}

onMounted(async () => {
  await initChannel()
})

onBeforeRouteUpdate(async () => {
  emit('scroll-to-bottom')
})

watch(
  () => selectedChannel.value,
  async () => {
    await initChannel()
  }
)
</script>
