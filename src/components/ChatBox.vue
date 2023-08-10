<template>
  <div v-if="loggedUser && channel" class="p-5">
    <div
      class="w-fit flex mb-4"
      :class="messageClass(message)"
      v-for="message in channel.messages"
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
          class="flex flex-col max-w-[10rem] sm:max-w-sm w-fit p-2 text-justify border-black border-2 h-fit mt-0.5">
          <div v-if="message.room && message.room.loading === false">
            <div class="text-sm" :class="textClass(message)">
              <h1 v-if="!message.room.data">Invite link expired</h1>
              <div v-if="!message.room.error" class="">
                <p>
                  <span>{{ message.user.username }}</span>
                  invited you to play!
                </p>
                <button
                  class="btn border-2 bg-white border-black text-black hover:bg-black hover:border-white hover:text-white mt-2 block w-full"
                  :class="{ invert: message.user.id === loggedUser.value?.id }">
                  <router-link
                    :to="`/room/${message.room.data.id}`"
                    class="flex gap-2 w-fit mx-auto">
                    <iconify-icon
                      icon="ri:ping-pong-line"
                      class="hidden sm:block w-7 h-7"></iconify-icon>
                    <div class="my-auto">Join the game</div>
                  </router-link>
                </button>
              </div>
            </div>
          </div>
          <p v-else class="text-sm break-words" :class="textClass(message)">
            {{ message.messageBody }}
          </p>
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
// ******* //
// IMPORTS //
// ******* //

import { computed, onBeforeMount, ref, watch } from 'vue'
import { onBeforeRouteUpdate } from 'vue-router'

import { storeToRefs } from 'pinia'

import { useChannelStore } from '@/stores/ChannelStore.js'
import { useUserStore } from '@/stores/UserStore.js'

import type { Message, Channel } from '@/types'

import ChatDropdown from '@/components/ChatDropdown.vue'

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const openDropdown = ref<number | null>(null)

const channelStore = useChannelStore()
const emit = defineEmits(['scroll-to-bottom'])
const userStore = useUserStore()

const { loggedUser } = storeToRefs(userStore)
const { selectedChannel } = storeToRefs(channelStore)
const channel = ref<Channel>()

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

// ******************** //
// FUNCTION DEFINITIONS //
// ******************** //

// *********** //
// initChannel //
// *********** //

async function initChannel(): Promise<void> {
  console.log('selectedChannel :', selectedChannel.value)

  if (selectedChannel.value !== null) {
    channel.value = channelStore.getChannel(selectedChannel.value)
  }

  if (selectedChannel.value !== null && channel.value?.messages.length === 0) {
    await channelStore.fetchChannelMessages(selectedChannel.value)
  }

  if (
    loggedUser.value != null &&
    selectedChannel.value != null &&
    channel.value?.bannedMembers.length === 0 &&
    channelStore.isAdmin(loggedUser.value.id, channel.value.id)
  ) {
    await channelStore.getBannedMembers(selectedChannel.value)
  }

  emit('scroll-to-bottom')
}

// ********************* //
// VueJs LIFECYCLE HOOKS //
// ********************* //

onBeforeMount(async () => {
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
