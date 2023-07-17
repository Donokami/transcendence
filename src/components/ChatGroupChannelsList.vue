<template>
  <ul class="menu bg-base-100 w-full">
    <li v-if="loggedUser" v-for="groupChannel in groupChannelsList" :key="groupChannel.name">
      <router-link class="flex p-1" :class="{
        active: selectedChannel && groupChannel.name === selectedChannel.name
      }" :to="`/chat/${groupChannel.id}`">
        <span class="flex justify-center items-center h-[60px]">{{ groupChannel.name }}</span>
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
const { groupChannelsList } = storeToRefs(userStore);

// ********************************* //
// selectedChannel RELATED VARIABLES //
// ********************************* //

const { selectedChannel } = storeToRefs(channelStore);

// ********************* //
// VueJs LIFECYCLE HOOKS //
// ********************* //

onBeforeRouteUpdate(async (to, from) => {
  const id = to.path.split("/").pop();
  console.log(`[ChatGroupChannelsList] - The current route is ${to.path}`);
  console.log(`[ChatGroupChannelsList] - The current id is ${id}`);
})

</script>