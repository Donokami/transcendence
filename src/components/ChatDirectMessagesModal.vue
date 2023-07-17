<template>
  <input type="checkbox" id="my-modal-3" class="modal-toggle" />
  <div class="modal">
    <div class="modal-box rounded-none">
      <div class="flex items-center justify-end">
        <label for="my-modal-3"
          class="btn bg-white border-black border-2 text-black hover:bg-black hover:border-black hover:text-white">X</label>
      </div>
      <div class="py-4">
        <h3 class="font-bold text-lg">Who do you want to a send a DM to ?</h3>
      </div>
      <div class="collapse collapse-arrow border-2 border-black rounded-none">
        <input type="checkbox" />
        <div class="collapse-title text-base">Select a friend</div>
        <div class="collapse-content text-base">
          <ul class="menu bg-base-100 w-full">
            <li v-for="friend in friendList" :key="friend.username">
              <a class="flex p-1">
                <span class="block" @click="createDmChannel(friend)">{{ friend.username }}</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

// ******* //
// IMPORTS //
// ******* //

import { onBeforeMount } from 'vue';
import { onBeforeRouteUpdate } from 'vue-router';

import { storeToRefs } from 'pinia';

import { useChannelStore } from '@/stores/ChannelStore';
import { useUserStore } from '@/stores/UserStore.js'

import type { Channel } from '@/types/Channel';
import type { User } from '@/types/user';

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const userStore = useUserStore()
const channelStore = useChannelStore()

// **************************** //
// loggedUser RELATED VARIABLES //
// **************************** //

const { loggedUser } = storeToRefs(userStore)
const { friendList } = storeToRefs(userStore);

// ******************** //
// FUNCTION DEFINITIONS //
// ******************** //

const createDmChannel = async (friend: User): Promise<Channel | null> => {
  if (!loggedUser.value || !friend) {
    return null;
  }
  try {
    const dmChannel = await channelStore.createDmChannel(loggedUser.value.id, friend.id);
    console.log(`[ChatDirectMessagesModal] - DM channel created successfully !`)
    return dmChannel;
  }
  catch (error) {
    console.error(`[ChatDirectMessagesModal] - Failed to create DM channel ! Error: `, error);
    return null;
  }
}

// ********************* //
// VueJs LIFECYCLE HOOKS //
// ********************* //

onBeforeMount(async () => {
  await userStore.refreshFriendList();
})

onBeforeRouteUpdate(async (to, from) => {
  await userStore.refreshFriendList();
})


</script>
