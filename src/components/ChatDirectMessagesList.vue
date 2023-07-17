<template>
  <ul class="menu bg-base-100 w-full">
    <li v-if="loggedUser" v-for="dm in dmList" :key="dm.receiver.username">
      <router-link class="flex p-1"
        :class="{ active: selectedChannel && dm.receiver.username === selectedChannel.receiver.username }"
        :to="`/chat/${dm.id}`">
        <div class="mx-auto md:mx-0 w-16 flex justify-center items-center">
          <img v-if="dm.receiver.profilePicture" :src="dm.receiver.profilePicture" class="rounded-full h-12 w-12">
          <iconify-icon v-else icon="ri:account-circle-line" class="h-16 w-12"></iconify-icon>
        </div>
        <span class="hidden md:block">{{ dm.receiver.username }}</span>
      </router-link>
    </li>
  </ul>
</template>

<script setup lang="ts">

// ******* //
// IMPORTS //
// ******* //

import { onBeforeRouteUpdate } from 'vue-router';

import { storeToRefs } from 'pinia';

import { useUserStore } from '@/stores/UserStore'
import { useChannelStore } from '@/stores/ChannelStore'

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const userStore = useUserStore()
const channelStore = useChannelStore()

// **************************** //
// loggedUser RELATED VARIABLES //
// **************************** //

const { loggedUser } = storeToRefs(userStore);
const { dmList } = storeToRefs(userStore);

// ********************************* //
// selectedChannel RELATED VARIABLES //
// ********************************* //

const { selectedChannel } = storeToRefs(channelStore);

// ******************** //
// FUNCTION DEFINITIONS //
// ******************** //

// ********************* //
// VueJs LIFECYCLE HOOKS //
// ********************* //

onBeforeRouteUpdate(async (to, from) => {
  const id = to.path.split("/").pop();
  console.log(`[ChatDirectMessagesList] - The current route is ${to.path}`);
  console.log(`[ChatDirectMessagesList] - The current id is ${id}`);

  const selectedDM = dmList.value.find(dm => dm.id === id);

  if (selectedDM) {
    channelStore.selectedChannel = selectedDM;
  }
})

</script>