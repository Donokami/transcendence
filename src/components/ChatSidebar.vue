<template>
  <div>
    <div class="tabs">
      <a
        class="tab tab-bordered text-2xl font-bold mb-8"
        :class="{ 'tab-active': listState === 'dms' }"
        @click="emit('list-state-changed', 'dms')"
        >DMs</a
      >
      <a
        class="tab tab-bordered text-2xl font-bold mb-8"
        :class="{ 'tab-active': listState === 'channels' }"
        @click="emit('list-state-changed', 'channels')"
        >Channels</a
      >
    </div>
    <div>
      <button
        for="my-modal-3"
        class="btn bg-white border-2 border-black mb-2 text-black hover:bg-black hover:border-black hover:text-white"
        type="button"
        @click="toggleModal">
        {{ listState === 'dms' ? 'Send a new dm' : 'Create a new channel' }}
      </button>
      <chat-direct-messages-modal
        v-if="listState === 'dms'"
        :showModal="showModal"
        @update:showModal="showModal = $event">
      </chat-direct-messages-modal>
      <chat-group-channels-modal v-else-if="listState === 'channels'">
      </chat-group-channels-modal>
      <div v-if="channelStore.channelsList?.loading === true">
        <div class="flex justify-center items-center h-fit">
          <span class="loading loading-spinner loading-lg"></span>
        </div>
      </div>
      <ul
        v-else-if="loggedUser && channelStore.channelsList?.loading === false"
        class="menu bg-base-100 w-full">
        <li v-for="channel in getChannels()" :key="channel.id">
          <router-link
            class="flex p-1 rounded-none"
            :class="{
              active:
                channelStore.selectedChannel &&
                channel.name === channelStore.selectedChannel.name
            }"
            :to="`/chat/${channel.id}`">
            <div class="mx-auto md:mx-0 w-16 flex justify-center items-center">
              <img
                v-if="channel.image"
                :src="channel.image"
                class="rounded-full h-12 w-12" />
              <iconify-icon
                v-else
                icon="ri:account-circle-line"
                class="h-16 w-12"></iconify-icon>
            </div>
            <span class="hidden md:block">{{ channel.name }}</span>
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onBeforeMount, ref } from 'vue'
import { onBeforeRouteUpdate } from 'vue-router'

import ChatDirectMessagesModal from '@/components/ChatDirectMessagesModal.vue'
import ChatGroupChannelsModal from '@/components/ChatGroupChannelsModal.vue'
import { useChannelStore } from '@/stores/ChannelStore.js'
import { useUserStore } from '@/stores/UserStore.js'
import type { Channel } from '@/types'

const props = defineProps({
  listState: String
})

console.log('list-state', props.listState)

const channelStore = useChannelStore()
const emit = defineEmits(['list-state-changed'])
const showModal = ref(false)
const userStore = useUserStore()

const { loggedUser } = storeToRefs(userStore)
const channels = ref<Channel[]>([])

function toggleModal(): void {
  showModal.value = !showModal.value
  console.log(`[ChatMessages] - showModal : `, showModal.value)
}

const getChannels = (): Channel[] => {
  return props.listState === 'dms'
    ? channelStore.getDms()
    : channelStore.getGroupChannels()
}

onBeforeMount(() => {
  channels.value = getChannels()
  console.log(
    `[ChatMessages] - selectedChannel : `,
    channelStore.selectedChannel
  )
})

onBeforeRouteUpdate((to, from) => {
  channels.value = getChannels()
})
</script>
