<template>
  <ul class="menu bg-base-100 w-full">
    <li v-if="loggedUser" v-for="dm in dmList" :key="dm.receiver.username">
      <router-link class="flex p-1"
        :class="{ active: selectedChannel && dm.receiver.username === selectedChannel.receiver.username }"
        :to="`/chat/${dm.id}`">
        <div class="mx-auto md:mx-0 w-16 flex justify-center items-center">
          <svg v-if="dm.receiver.profilePicture" :src="dm.receiver.profilePicture" class="h-[60px] w-12"></svg>
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

import { ref } from 'vue'
import { onBeforeRouteUpdate } from 'vue-router';

import { storeToRefs } from 'pinia';

import { useUserStore } from '@/stores/UserStore'
import { useChannelStore } from '@/stores/ChannelStore'

import type { User } from '@/types/user'
import type { Channel } from '@/types/Channel'

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

// const selectChannel = async (channel: Channel) => {
//   if (channel) {
//     selectedChannel.value = channel;
//     console.log(`[ChatDirectMessagesList] - selectedChannel : `, selectedChannel);
//   }
//   console.log(`[ChatDirectMessagesList] - No channel selected`);
// };

// const getOtherUser = async (channel: Channel) => {
//   if (!loggedUser.value)
//     return 0;
//   try {
//     otherUser.value = channel.members.filter((user: User) => user.id !== loggedUser.value.id)[0];
//     console.log(`[ChatDirectMessagesList] - otherUser : `, otherUser);
//   } catch (error) {
//     console.error(`[ChatDirectMessagesList] - Failed to getOtherUser ! Error : `, error);
//   }
// };

// ***************** //
// fetchSelectedChannel //
// ***************** //

const fetchSelectedChannel = async (id: string | undefined) => {
  if (id) {
    selectedChannel.value = await userStore.fetchUserById(id);
    console.log(`[ProfileView] - The current selected user is ${selectedChannel.value.username}`);
  }
  else {
    console.log(`[ProfileView] - No selected user.`);
  }
};

// ********************* //
// VueJs LIFECYCLE HOOKS //
// ********************* //

onBeforeRouteUpdate(async (to, from) => {
  const id = to.path.split("/").pop();
  console.log(`[ProfileView] - The current route is ${to.path}`);
  console.log(`[ProfileView] - The current id is ${id}`);
})

</script>