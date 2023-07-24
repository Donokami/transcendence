<template>
  <ul class="menu bg-base-100 w-full">
    <li v-if="loggedUser" v-for="dm in dmList" :key="dm.name">
      <router-link
        class="flex p-1"
        :class="{ active: selectedChannel && dm.name === selectedChannel.name }"
        :to="`/chat/${dm.id}`">
        <div class="mx-auto md:mx-0 w-16 flex justify-center items-center">
          <img v-if="dm.image" :src="dm.image" class="rounded-full h-12 w-12" />
          <iconify-icon
            v-else
            icon="ri:account-circle-line"
            class="h-16 w-12"></iconify-icon>
        </div>
        <span class="hidden md:block">{{ dm.name }}</span>
      </router-link>
    </li>
  </ul>
</template>

<script setup lang="ts">
// ******* //
// IMPORTS //
// ******* //

import type { Channel } from '@/types/Channel'

import { storeToRefs } from 'pinia'
import { onBeforeMount, ref } from 'vue'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'

import { useUserStore } from '@/stores/UserStore'
import { useChannelStore } from '@/stores/ChannelStore'

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const channelStore = useChannelStore()
const dmList = ref([] as Channel[])
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const { loggedUser } = storeToRefs(userStore)
const { selectedChannel } = storeToRefs(channelStore)

// ******************** //
// FUNCTION DEFINITIONS //
// ******************** //

// ********************* //
// VueJs LIFECYCLE HOOKS //
// ********************* //

function updateSelectedDm(path: string) {
  const id = path.split('/').pop()
  console.log(`[ChatDirectMessagesList] - The current id is ${id}`)

  if (!id) {
    router.push('/chat')
  }

  const selectedDM = dmList.value.find((dm) => dm.id === id)

  if (selectedDM != null) {
    channelStore.selectedChannel = selectedDM
  }
}

onBeforeRouteUpdate(async (to, from) => {
  dmList.value = await channelStore.getDms()
  updateSelectedDm(to.path)
})

onBeforeMount(async () => {
  dmList.value = await channelStore.getDms()
  updateSelectedDm(route.path)
})
</script>
