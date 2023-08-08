<template>
  <div class="flex-auto overflow-y-scroll py-[2px]">
    <!-- LOADER FOR CHANNEL LIST -->
    <div v-if="channelStore.channelsList?.loading === true">
      <div class="flex justify-center items-center h-fit">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
    </div>

    <!-- CHANNELS LIST -->
    <ul
      v-else-if="loggedUser && channelStore.channelsList?.loading === false"
      class="bg-base-100 w-full p-0">
      <li v-for="user in channel?.members" :key="user.id">
        <div class="flex p-0 rounded-none hover:bg-base-300 cursor-pointer">
          <div class="py-3">
            <div class="flex items-center mx-auto px-4 w-18">
              <div
                class="avatar w-8 h-8"
                :class="[user.status === 'online' ? 'online' : 'offline']">
                <img
                  v-if="user.profilePicture"
                  :src="`http://localhost:3000/${user.profilePicture}`"
                  class="object-cover rounded-full h-8 w-8" />
                <iconify-icon
                  v-else
                  icon="ri:account-circle-line"
                  class="h-full w-full">
                </iconify-icon>
              </div>
              <span class="pl-3 capitalize truncate w-28 text-sm">{{
                user.username
              }}</span>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
// ******* //
// IMPORTS //
// ******* //

import { storeToRefs } from 'pinia'
import { onBeforeMount, ref } from 'vue'
import { onBeforeRouteUpdate } from 'vue-router'

import { useChannelStore } from '@/stores/ChannelStore.js'
import { useUserStore } from '@/stores/UserStore.js'
import type { Channel } from '@/types'

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const channelStore = useChannelStore()

const userStore = useUserStore()

const { loggedUser } = storeToRefs(userStore)
const { selectedChannel } = storeToRefs(channelStore)
const channel = ref<Channel>()

async function getChannel(): Promise<void> {
  if (selectedChannel.value !== null) {
    channel.value = channelStore.getChannel(selectedChannel.value)
  }
}

// ********************* //
// VueJs LIFECYCLE HOOKS //
// ********************* //

onBeforeMount(async () => {
  await getChannel()
})

onBeforeRouteUpdate(async (to, from) => {
  await getChannel()
})
</script>
