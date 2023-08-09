<template>
  <div class="flex-auto overflow-auto w-fit">
    <!-- LOADER FOR CHANNEL LIST -->
    <div v-if="channelStore.channelsList?.loading === true">
      <div class="flex justify-center items-center h-fit">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
    </div>

    <!-- USER LIST -->
    <ul
      v-else-if="loggedUser && channelStore.channelsList?.loading === false"
      class="bg-base-100 w-full">
      <li v-for="user in channel?.members" :key="user.id">
        <div class="flex rounded-none hover:bg-base-300 cursor-pointer">
          <div class="py-3">
            <div class="flex items-center mx-auto px-4 w-18">
              <div class="w-10 h-10">
                <user-avatar
                  :userProps="(user as User)"
                  :uploadMode="false"></user-avatar>
              </div>
              <span class="pl-3 truncate w-28 text-sm">{{
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

import UserAvatar from './UserAvatar.vue'

import { useChannelStore } from '@/stores/ChannelStore.js'
import { useUserStore } from '@/stores/UserStore.js'
import type { Channel, User } from '@/types'

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
